"""Auto-sync student testimonials from Google Drive → Supabase /martyries.

How it works:
  1. Lists every date-prefixed folder inside the configured Drive folder.
     Naming convention: ``YYYY-MM-DD-<type>-<name>`` (e.g.
     ``2026-05-03-post-testimonial-stratis``).
  2. Filters to folders that:
       - Contain the keyword ``testimonial`` in their name
       - Have a date <= today (skips upcoming/scheduled posts)
       - Have not already been imported (checked via ``testimonials.source_ref``).
  3. For each remaining folder, downloads ``caption.txt`` + optional
     ``testimonial.txt`` and inserts a row in ``testimonials`` with
     ``source_ref`` = folder name (so re-runs are idempotent — existing rows are
     never touched).

Where the full testimonial comes from:
    The student's full testimonial lives in the ``story-<name>-FULL-*.png``
    image, NOT in caption.txt (which only carries the Instagram caption). So:
      • If a folder has a ``testimonial.txt`` (structured: NAME/ROLE/PULL/FULL —
        see parse_testimonial_txt), it is used and the row is PUBLISHED.
      • If not, the row is inserted as an UNPUBLISHED DRAFT from caption.txt for
        manual review in /admin — never a wrong guess going live.
    Author workflow: when you create the FULL graphic, copy its text into a
    ``testimonial.txt`` in the same Drive folder. That's the only manual step.

Configure once:
    .env.local must already contain
      NEXT_PUBLIC_SUPABASE_URL
      SUPABASE_SERVICE_ROLE_KEY
    Hard-coded in this script:
      DRIVE_FOLDER_ID = "1TIrOlcMd9K9ufbA2hc0SDN-1tkwWfwkA"   # "instagram-assets"

Run manually:
    python scripts/sync_testimonials_from_drive.py

Schedule: GitHub Actions cron (.github/workflows/sync-testimonials.yml),
every Monday 06:00 UTC (09:00 Athens summer). Runs unattended on a hosted runner.
"""
from __future__ import annotations
import sys, os, json, re, datetime, subprocess, urllib.request, urllib.error, urllib.parse, tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

# ---------------------------------------------------------------------------
ROOT             = Path(__file__).resolve().parents[1]
RCLONE           = ROOT / "scripts" / "backup" / "rclone.exe"
DRIVE_FOLDER_ID  = "1TIrOlcMd9K9ufbA2hc0SDN-1tkwWfwkA"
DRIVE_REMOTE     = "gdrive:"
TESTIMONIAL_KEY  = "testimonial"     # case-insensitive substring in folder name

def load_env() -> dict:
    env: dict[str, str] = {}
    for ln in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln: continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env     = load_env()
SB_URL  = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SB_KEY  = env["SUPABASE_SERVICE_ROLE_KEY"]

# ---------------------------------------------------------------------------
# Drive helpers (delegate to rclone)
# ---------------------------------------------------------------------------
def rclone_lsd_root() -> list[str]:
    out = subprocess.check_output(
        [str(RCLONE), "lsf", DRIVE_REMOTE, "--dirs-only",
         "--drive-root-folder-id", DRIVE_FOLDER_ID],
        text=True, encoding="utf-8",
    )
    return [line.rstrip("/").strip() for line in out.splitlines() if line.strip()]

def rclone_download(folder_name: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    # Pull both text sources: caption.txt (name/role/pull-quote) and the optional
    # testimonial.txt (structured override with the full testimonial). We skip the
    # image graphics — they're not needed for the website card.
    subprocess.check_call([
        str(RCLONE), "copy",
        DRIVE_REMOTE,
        str(dest),
        "--drive-root-folder-id", DRIVE_FOLDER_ID,
        "--include", f"{folder_name}/caption.txt",
        "--include", f"{folder_name}/testimonial.txt",
    ])

# ---------------------------------------------------------------------------
# Caption parser
# ---------------------------------------------------------------------------
DATE_RE      = re.compile(r"^(\d{4}-\d{2}-\d{2})")
# Pull quote — earlier captions had an explicit "PULL QUOTE" header section
# above the post body; newer ones inline the quote directly inside CAPTION.
# Both separator styles (light ─ and heavy ═) appear in the wild.
PULL_HDR_RE  = re.compile(r"PULL QUOTE[^\n]*\n[─═\-=]+\n+([«\"][\s\S]*?[»\"])")
INLINE_Q_RE  = re.compile(r"[«\"][\s\S]*?[»\"]")
SIG_RE       = re.compile(r"^\s*[—–-]\s*([^,\n]+?)\s*(?:,\s*(.+?))?\s*$", re.M)
# Long-form caption between "CAPTION (copy-paste):" and "HASHTAGS:"
FULL_CAP_RE  = re.compile(
    r"CAPTION[^\n]*\n[─═\-=]+\n+([\s\S]*?)\n[─═\-=]*\n*HASHTAGS",
    re.IGNORECASE,
)
# Header line, present in every template: "... Testimonial #4 — Άσπα Π. (απόφοιτη 2025)"
# Most reliable source of name + role across all caption variants.
HEADER_RE    = re.compile(
    r"Testimonial\s*#?\s*\d*\s*[—–-]\s*([^(\n]+?)\s*(?:\(\s*([^)\n]+?)\s*\))?\s*$",
    re.IGNORECASE | re.MULTILINE,
)

def parse_caption(text: str) -> dict | None:
    # Pull quote: prefer the explicit "PULL QUOTE" section; fall back to the
    # first « ... » block inside the CAPTION section (new format from 2026-05-24
    # onwards dropped the standalone header).
    pull = PULL_HDR_RE.search(text)
    if pull:
        raw_quote = pull.group(1)
    else:
        cap = FULL_CAP_RE.search(text)
        scope = cap.group(1) if cap else text
        inline = INLINE_Q_RE.search(scope)
        if not inline:
            return None
        raw_quote = inline.group(0)
    # Normalize whitespace + strip surrounding quotes
    quote = re.sub(r"\s+", " ", raw_quote).strip()
    quote = quote.strip("«»\"' ").strip()

    # Name + role: prefer the header line "Testimonial #N — Name (role)", which is
    # consistent across every template variant. Fall back to a signature line
    # ("— Name, Role") searched ONLY inside the CAPTION body, so we never pick up an
    # ASSETS bullet like "- post-aspa-FULL-navy.png ..." (that bug shipped once).
    name = role = None
    hdr = HEADER_RE.search(text)
    if hdr:
        name = hdr.group(1).strip() or None
        role = (hdr.group(2) or "").strip() or None
    # Older headers ("Testimonial #1 — Στρατής Μ.") carry no role; fill missing
    # name/role from a signature line inside the CAPTION body.
    if not name or not role:
        cap_m = FULL_CAP_RE.search(text)
        sig_scope = cap_m.group(1) if cap_m else text
        for m in SIG_RE.finditer(sig_scope):
            cand = m.group(1).strip()
            if "korifi" in cand.lower() or "κορυφη" in cand.lower():
                continue
            if len(cand) > 60 or any(ext in cand.lower() for ext in (".png", ".jpg", ".jpeg")):
                continue
            name = name or cand
            role = role or ((m.group(2) or "").strip() or None)
            break

    if not name:
        return None

    # Long-form caption — what's shown in the popup. Strip CTA boilerplate
    # (✦ separator, 📞/📩/🌐 contact lines, registration line, and the
    # ────/════ continuation separators that mark "rest of post" sections in
    # the newer template) so only the student's testimonial body + signature remain.
    full_match = FULL_CAP_RE.search(text)
    full_quote: str | None = None
    if full_match:
        body = full_match.group(1).strip()
        cut = re.search(r"\n+(?:✦|📞|📩|🌐|────|════|Εγγραφές\s|Ευχαριστούμε\s)", body)
        if cut:
            body = body[: cut.start()].rstrip()
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        full_quote = body or None

    return {"quote": quote, "name": name, "role": role, "full_quote": full_quote}

# ---------------------------------------------------------------------------
# testimonial.txt — optional structured override (the reliable path)
# ---------------------------------------------------------------------------
# The full testimonial lives in the story-<name>-FULL-*.png image, NOT in
# caption.txt (which only carries the Instagram caption). Rather than OCR a
# styled graphic in CI, the author drops a plain testimonial.txt in the folder:
#
#     NAME: Άσπα Π.            (optional — falls back to caption header)
#     ROLE: απόφοιτη 2025      (optional — falls back to caption header)
#     PULL: Δεν είχα απλά καθηγητές — είχα ανθρώπους που στάθηκαν δίπλα μου.
#     FULL:
#     <the full testimonial text, one or more paragraphs, copied from the image>
#
# PULL + FULL are required for a clean auto-publish. If testimonial.txt is
# absent, main() falls back to caption.txt parsing and inserts as an UNPUBLISHED
# draft for manual review — so a missing/ambiguous source never goes live wrong.
TX_FIELD_RE = re.compile(r"^(NAME|ROLE|PULL|FULL)\s*:\s*(.*)$", re.IGNORECASE)

def parse_testimonial_txt(text: str) -> dict | None:
    name = role = pull = None
    full_lines: list[str] = []
    in_full = False
    for line in text.splitlines():
        if in_full:
            full_lines.append(line)
            continue
        m = TX_FIELD_RE.match(line.strip())
        if not m:
            continue
        key, val = m.group(1).upper(), m.group(2).strip()
        if   key == "NAME": name = val or None
        elif key == "ROLE": role = val or None
        elif key == "PULL": pull = val or None
        elif key == "FULL":
            in_full = True
            if val: full_lines.append(val)
    full = re.sub(r"\n{3,}", "\n\n", "\n".join(full_lines)).strip() or None
    if not pull or not full:
        return None
    return {"name": name, "role": role, "quote": pull, "full_quote": full}

# ---------------------------------------------------------------------------
# Supabase REST
# ---------------------------------------------------------------------------
def sb_request(method: str, path: str, *, params=None, body=None, headers=None):
    url = f"{SB_URL}{path}"
    if params: url += "?" + urllib.parse.urlencode(params, doseq=True)
    req_headers = {
        "apikey":        SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        **(headers or {}),
    }
    req = urllib.request.Request(url, data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def existing_source_refs() -> set[str]:
    code, body = sb_request("GET", "/rest/v1/testimonials",
                             params={"select": "source_ref", "source_ref": "not.is.null"})
    if code != 200: raise RuntimeError(f"GET testimonials failed: {code} {body[:200]!r}")
    return {row["source_ref"] for row in json.loads(body) if row.get("source_ref")}

def insert_testimonial(payload: dict) -> tuple[int, str]:
    code, body = sb_request(
        "POST", "/rest/v1/testimonials",
        headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        body=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    )
    return code, body.decode("utf-8", errors="replace")[:200]

def revalidate_site(tags: list[str], paths: list[str] | None = None) -> None:
    """Tell the live site to bust its unstable_cache + CDN entries for these tags.
    Best-effort — script doesn't fail if the site is down."""
    site = env.get("NEXT_PUBLIC_SITE_URL", "https://korifi-edu.gr").rstrip("/")
    body = json.dumps({"tags": tags, "paths": paths or []}).encode("utf-8")
    req = urllib.request.Request(
        f"{site}/api/internal/revalidate", data=body, method="POST",
        headers={"Authorization": f"Bearer {SB_KEY}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            print(f"  cache invalidated: {r.status} {r.read()[:120].decode()!r}")
    except Exception as e:
        print(f"  cache invalidate failed (non-fatal): {e}")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    today      = datetime.date.today()
    folders    = rclone_lsd_root()
    if not folders:
        # Silent-failure guard: if the Drive folder was moved/deleted or rclone
        # auth expired, rclone returns 0 folders with exit code 0. Without this
        # check, Task Scheduler would mark the task "successful" while nothing
        # gets imported — a bug we shipped through for ~1 week before noticing.
        raise RuntimeError(
            f"rclone returned 0 folders for DRIVE_FOLDER_ID={DRIVE_FOLDER_ID!r}. "
            "Folder may have been moved/deleted, or rclone auth expired. "
            "Verify the ID in Google Drive and re-run `rclone config` if needed."
        )
    candidates = []
    for f in folders:
        if TESTIMONIAL_KEY not in f.lower(): continue
        m = DATE_RE.match(f)
        if not m: continue
        try:
            d = datetime.date.fromisoformat(m.group(1))
        except ValueError:
            continue
        if d > today: continue   # skip future / scheduled
        candidates.append((d, f))
    candidates.sort()

    print(f"Found {len(candidates)} past testimonial folder(s) on Drive\n")

    already = existing_source_refs()
    new_ones = [(d, f) for d, f in candidates if f not in already]
    print(f"  already synced: {len(already)}")
    print(f"  new to import:  {len(new_ones)}")
    if not new_ones:
        print("\nNothing to do.")
        return

    published_count = 0
    draft_count = 0
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for d, f in new_ones:
            print(f"\n→ {f}")
            try:
                rclone_download(f, tmp_path)
            except subprocess.CalledProcessError as e:
                print(f"  ✗ rclone failed: {e}")
                continue

            cap_file = tmp_path / f / "caption.txt"
            tx_file  = tmp_path / f / "testimonial.txt"
            cap_parsed = parse_caption(cap_file.read_text(encoding="utf-8", errors="replace")) if cap_file.exists() else None
            tx_parsed  = parse_testimonial_txt(tx_file.read_text(encoding="utf-8", errors="replace")) if tx_file.exists() else None

            if tx_parsed:
                # Reliable path: structured testimonial.txt → auto-publish.
                name  = tx_parsed["name"] or (cap_parsed or {}).get("name")
                role  = tx_parsed["role"] or (cap_parsed or {}).get("role")
                quote = tx_parsed["quote"]
                full  = tx_parsed["full_quote"]
                published = True
                src = "testimonial.txt"
            elif cap_parsed:
                # Fallback: caption only. caption.txt rarely holds the student's
                # full testimonial verbatim (that's in the FULL image), so insert
                # as an UNPUBLISHED draft for manual review instead of guessing.
                name  = cap_parsed["name"]
                role  = cap_parsed["role"]
                quote = cap_parsed["quote"]
                full  = cap_parsed["full_quote"]
                published = False
                src = "caption.txt (DRAFT)"
            else:
                print("  ✗ no usable testimonial.txt or caption.txt — skipped")
                continue

            if not name or not quote:
                print("  ✗ missing name or pull-quote — skipped")
                continue

            payload = {
                "author_name":  name,
                "author_role":  role,
                "quote":        quote,
                "full_quote":   full,
                "is_published": published,
                "source_ref":   f,
                "sort_order":   0,
            }
            code, msg = insert_testimonial(payload)
            if 200 <= code < 300:
                flag = "✓ published" if published else "⚠ DRAFT (review in admin)"
                print(f"  {flag} [{src}] {name} — {quote[:55]}…")
                if published: published_count += 1
                else:         draft_count += 1
            else:
                print(f"  ✗ insert HTTP {code}: {msg}")

    print(f"\nImported: {published_count} published, {draft_count} draft(s).")
    if draft_count:
        print("  ⚠ Draft(s) are hidden until reviewed. Add a testimonial.txt with")
        print("    the full text (from the *-FULL-*.png image) and publish from /admin.")
    # Only bust the live cache if something actually went public.
    if published_count:
        revalidate_site(tags=["testimonials"], paths=["/martyries", "/"])
    print("\nDone.")

if __name__ == "__main__":
    main()
