"""Migrate broken korifi-edu.gr/wp-content file links inside `articles.content_md`
→ Supabase Storage `pdfs/articles/` bucket.

Same story as `migrate_lesson_pdfs.py`, but for blog articles. After the custom
domain swap (korifi-edu.gr → Vercel) the legacy WordPress upload URLs embedded
in article markdown (e.g. the βιολογία Γ' διαγώνισμα .docx) 403 / 404. This
script scans every article's `content_md`, resolves each `wp-content` link
against the local WordPress backup, re-uploads it to
`pdfs/articles/<slug>[-N].<ext>`, rewrites the link in `content_md`, and busts
the cache.

Idempotent — links already pointing at Supabase Storage are skipped. Run:
    python scripts/scrape/migrate_article_files.py
"""
from __future__ import annotations
import sys, json, re, urllib.parse, urllib.request, urllib.error, mimetypes
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT  = Path(__file__).resolve().parents[2]
LOCAL = ROOT.parent / "_korifi-edu.gr" / "public_html"

# Any href that points at the old WordPress uploads (optionally via the wp.com CDN).
WP_LINK_RE = re.compile(
    r"https?://(?:i0\.wp\.com/)?korifi-edu\.gr/wp-content/[^\s)\"'<>\]]+",
    re.IGNORECASE,
)
PREFIXES = ("https://korifi-edu.gr/", "https://i0.wp.com/korifi-edu.gr/")


def load_env(p: Path) -> dict:
    env: dict[str, str] = {}
    for ln in p.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln:
            continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


env     = load_env(ROOT / ".env.local")
URL     = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]
STORAGE_PREFIX = f"{URL}/storage/v1/object/public/pdfs/"


def resolve_local(remote_url: str) -> Path | None:
    base = remote_url.split("?")[0]
    for p in PREFIXES:
        if base.startswith(p):
            rel = urllib.parse.unquote(base[len(p):])
            local = LOCAL / rel
            return local if local.exists() else None
    return None


def supa(method: str, path: str, *, headers=None, body=None):
    req_headers = {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", **(headers or {})}
    req = urllib.request.Request(f"{URL}{path}", data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def content_type_for(local: Path) -> str:
    guessed, _ = mimetypes.guess_type(local.name)
    return guessed or "application/octet-stream"


def upload(local: Path, storage_path: str) -> str | None:
    encoded = urllib.parse.quote(storage_path, safe="/")
    code, _ = supa(
        "POST", f"/storage/v1/object/pdfs/{encoded}",
        headers={"Content-Type": content_type_for(local), "x-upsert": "true"},
        body=local.read_bytes(),
    )
    return f"{STORAGE_PREFIX}{encoded}" if code in (200, 201) else None


# Main
print(f"Target: {URL}")
print(f"Local backup: {LOCAL}\n")
if not LOCAL.exists():
    sys.exit(f"✗ Local WordPress backup not found at {LOCAL} — run this on the machine that holds it.")

code, body = supa("GET", "/rest/v1/articles?select=id,slug,title,content_md")
articles = json.loads(body)
print(f"Articles: {len(articles)}\n")

ok = skipped = failed = 0
revalidate_paths: list[str] = []

for a in articles:
    md = a.get("content_md") or ""
    links = [m.group(0) for m in WP_LINK_RE.finditer(md)]
    if not links:
        continue

    new_md = md
    changed = False
    # Stable per-article counter so multiple files don't collide.
    used = 0
    for link in dict.fromkeys(links):  # de-dupe, keep order
        local = resolve_local(link)
        if not local:
            print(f"  ✗ {a['title'][:40]:<42s} no local file for {link[-50:]}")
            failed += 1
            continue
        suffix = local.suffix.lower()
        name = a["slug"] if used == 0 else f"{a['slug']}-{used}"
        used += 1
        storage_path = f"articles/{name}{suffix}"
        new_url = upload(local, storage_path)
        if not new_url:
            print(f"  ✗ {a['title'][:40]:<42s} upload failed → {storage_path}")
            failed += 1
            continue
        new_md = new_md.replace(link, new_url)
        changed = True
        print(f"  ✓ {a['title'][:40]:<42s} → {storage_path}")
        ok += 1

    if changed:
        code, _ = supa(
            "PATCH", f"/rest/v1/articles?id=eq.{a['id']}",
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
            body=json.dumps({"content_md": new_md}, ensure_ascii=False).encode("utf-8"),
        )
        if 200 <= code < 300:
            revalidate_paths.append(f"/blog/{a['slug']}")
        else:
            print(f"  ✗ {a['title'][:40]:<42s} PATCH HTTP {code}")
            failed += 1

print(f"\nDone. uploaded={ok}, skipped={skipped}, failed={failed}")

# Bust caches so the new URLs flow through
if revalidate_paths:
    print("\n→ Invalidating cache...")
    revreq = urllib.request.Request(
        "https://korifi-edu.gr/api/internal/revalidate",
        data=json.dumps({"tags": ["articles"], "paths": revalidate_paths}).encode("utf-8"),
        method="POST",
        headers={"Authorization": f"Bearer {SERVICE}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(revreq, timeout=15) as r:
            print(f"  {r.status} {r.read()[:150].decode()!r}")
    except Exception as e:
        print(f"  invalidate failed: {e}")
