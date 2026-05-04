"""Auto-sync student testimonials from Google Drive → Supabase /martyries.

How it works:
  1. Lists every date-prefixed folder inside the configured Drive folder.
     Naming convention: ``YYYY-MM-DD-<type>-<name>`` (e.g.
     ``2026-05-03-post-testimonial-stratis``).
  2. Filters to folders that:
       - Contain the keyword ``testimonial`` in their name
       - Have a date <= today (skips upcoming/scheduled posts)
       - Have not already been imported (checked via ``testimonials.source_ref``).
  3. For each remaining folder, downloads ``caption.txt``, parses out the
     pull-quote + author name + role, and inserts a row in ``testimonials``
     with ``source_ref`` = folder name (so re-runs are idempotent).

Configure once:
    .env.local must already contain
      NEXT_PUBLIC_SUPABASE_URL
      SUPABASE_SERVICE_ROLE_KEY
    Hard-coded in this script:
      DRIVE_FOLDER_ID = "1Zy1T3NKuLTZ0n1Ei2KQVfHVlgyX-gFc5"

Run manually:
    python scripts/sync_testimonials_from_drive.py

Schedule (suggested): Windows Task Scheduler — every Monday 09:00, after the
weekly Sunday post is up. See scripts/backup/install_scheduled_task.ps1 for
the pattern; mirror it for this script.
"""
from __future__ import annotations
import sys, os, json, re, datetime, subprocess, urllib.request, urllib.error, urllib.parse, tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

# ---------------------------------------------------------------------------
ROOT             = Path(__file__).resolve().parents[1]
RCLONE           = ROOT / "scripts" / "backup" / "rclone.exe"
DRIVE_FOLDER_ID  = "1Zy1T3NKuLTZ0n1Ei2KQVfHVlgyX-gFc5"
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
    # Only download caption.txt — image graphics are text-based assets we don't
    # need on the website (the testimonial card has its own design).
    subprocess.check_call([
        str(RCLONE), "copy",
        DRIVE_REMOTE,
        str(dest),
        "--drive-root-folder-id", DRIVE_FOLDER_ID,
        "--include", f"{folder_name}/caption.txt",
    ])

# ---------------------------------------------------------------------------
# Caption parser
# ---------------------------------------------------------------------------
DATE_RE     = re.compile(r"^(\d{4}-\d{2}-\d{2})")
QUOTE_RE    = re.compile(r"PULL QUOTE[^\n]*\n[─\-=]+\n+([«\"][\s\S]*?[»\"])")
SIG_RE      = re.compile(r"^\s*[—–-]\s*([^,\n]+?)\s*(?:,\s*(.+?))?\s*$", re.M)
# Long-form caption between "CAPTION (copy-paste):" and "HASHTAGS:"
FULL_CAP_RE = re.compile(
    r"CAPTION[^\n]*\n[─\-=]+\n+([\s\S]*?)\n[─\-=]*\n*HASHTAGS",
    re.IGNORECASE,
)

def parse_caption(text: str) -> dict | None:
    quote_match = QUOTE_RE.search(text)
    if not quote_match:
        return None
    raw_quote = quote_match.group(1)
    # Normalize whitespace + strip surrounding quotes
    quote = re.sub(r"\s+", " ", raw_quote).strip()
    quote = quote.strip("«»\"' ").strip()

    # Look for signature line in the CAPTION block (not the header / hashtags)
    # The signature is usually inside the long caption: "— Στρατής Μ., απόφοιτος 2023"
    name = None
    role = None
    for m in SIG_RE.finditer(text):
        candidate_name = m.group(1).strip()
        # Skip lines that are clearly not signatures (e.g. the header "ΚΟΡΥΦΗ · Testimonial")
        if "korifi" in candidate_name.lower() or "κορυφη" in candidate_name.lower():
            continue
        if len(candidate_name) > 60:
            continue
        name = candidate_name
        role = (m.group(2) or "").strip() or None
        break

    if not name:
        return None

    # Long-form caption — what's shown in the popup. Strip CTA boilerplate (📞/📩/🌐/✦)
    # and the registration line so only the actual testimonial body remains.
    full_match = FULL_CAP_RE.search(text)
    full_quote: str | None = None
    if full_match:
        body = full_match.group(1).strip()
        # Drop everything from the first emoji-bullet (✦/📞/📩/🌐) onward
        cut = re.search(r"\n+(?:✦|📞|📩|🌐|Εγγραφές\s)", body)
        if cut:
            body = body[: cut.start()].rstrip()
        # Collapse 3+ blank lines into 2
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        full_quote = body or None

    return {"quote": quote, "name": name, "role": role, "full_quote": full_quote}

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

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for d, f in new_ones:
            print(f"\n→ {f}")
            try:
                rclone_download(f, tmp_path)
            except subprocess.CalledProcessError as e:
                print(f"  ✗ rclone failed: {e}")
                continue

            cap = tmp_path / f / "caption.txt"
            if not cap.exists():
                print(f"  ✗ caption.txt missing")
                continue
            text = cap.read_text(encoding="utf-8", errors="replace")
            parsed = parse_caption(text)
            if not parsed:
                print(f"  ✗ couldn't parse caption (no pull-quote or signature)")
                continue

            payload = {
                "author_name": parsed["name"],
                "author_role": parsed["role"],
                "quote":       parsed["quote"],
                "full_quote":  parsed["full_quote"],
                "is_published": True,
                "source_ref":  f,
                "sort_order":  0,
            }
            code, msg = insert_testimonial(payload)
            if 200 <= code < 300:
                print(f"  ✓ {parsed['name']} — {parsed['quote'][:60]}…")
            else:
                print(f"  ✗ insert HTTP {code}: {msg}")

    # Bust live cache so the new testimonial is visible immediately on /martyries
    revalidate_site(tags=["testimonials"], paths=["/martyries", "/"])
    print("\nDone.")

if __name__ == "__main__":
    main()
