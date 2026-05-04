"""Migrate broken korifi-edu.gr/wp-content image URLs in articles to Supabase Storage.

For each cover_image and inline image in content_md:
1. Resolve the local file under _korifi-edu.gr/public_html/.
2. Upload to images/articles/<flat-name> in Storage.
3. Replace the URL in cover_image and content_md.

Idempotent: skips already-migrated URLs (those starting with the Supabase
public bucket prefix).

Run:
    python scripts/scrape/migrate_article_images.py
"""
from __future__ import annotations
import sys, json, re, urllib.parse, urllib.request, urllib.error, mimetypes, hashlib
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT  = Path(__file__).resolve().parents[2]
LOCAL = ROOT.parent / "_korifi-edu.gr" / "public_html"

def load_env(p: Path) -> dict:
    env = {}
    for ln in p.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln: continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env     = load_env(ROOT / ".env.local")
URL     = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]
STORAGE_PREFIX = f"{URL}/storage/v1/object/public/images/"

PREFIXES = ("https://korifi-edu.gr/", "https://i0.wp.com/korifi-edu.gr/")

def resolve_local(remote_url: str) -> Path | None:
    base = remote_url.split("?")[0]
    for p in PREFIXES:
        if base.startswith(p):
            rel = urllib.parse.unquote(base[len(p):])
            local = LOCAL / rel
            return local if local.exists() else None
    return None

def storage_path_for(local: Path) -> str:
    """Flatten 'wp-content/uploads/2023/03/foo.jpg' to 'articles/2023-03_foo.jpg'.
    ASCII-only — non-ASCII filenames get a stable hash prefix to keep the path safe
    for Supabase Storage which rejects some Unicode characters."""
    parts = local.parts
    try:
        idx = parts.index("uploads")
        sub = parts[idx + 1:]
    except ValueError:
        sub = (local.name,)
    flat = "_".join(sub).replace(" ", "_")
    # If non-ASCII, replace with a hash + extension to keep it predictable + safe
    try:
        flat.encode("ascii")
    except UnicodeEncodeError:
        suffix = local.suffix.lower()
        digest = hashlib.sha1(flat.encode("utf-8")).hexdigest()[:12]
        flat = f"img_{digest}{suffix}"
    return f"articles/{flat}"

def supa(method: str, path: str, *, headers=None, body=None):
    req_headers = {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", **(headers or {})}
    req = urllib.request.Request(f"{URL}{path}", data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

# Cache: remote URL -> new storage URL (so we upload once per unique URL)
_url_cache: dict[str, str] = {}

def migrate_url(remote_url: str) -> str | None:
    if remote_url in _url_cache:
        return _url_cache[remote_url]
    if remote_url.startswith(STORAGE_PREFIX):
        return remote_url  # already migrated

    local = resolve_local(remote_url)
    if not local:
        return None

    storage_path = storage_path_for(local)
    encoded      = urllib.parse.quote(storage_path, safe="/")
    ctype        = mimetypes.guess_type(str(local))[0] or "application/octet-stream"
    code, _ = supa("POST", f"/storage/v1/object/images/{encoded}",
                   headers={"Content-Type": ctype, "x-upsert": "true"},
                   body=local.read_bytes())
    if code in (200, 201):
        new_url = f"{STORAGE_PREFIX}{encoded}"
        _url_cache[remote_url] = new_url
        return new_url
    print(f"    upload [{code}] failed for {remote_url[:80]}")
    return None

def replace_in_text(text: str) -> tuple[str, int, int]:
    """Replace all broken URLs in text. Returns (new_text, replaced, missing)."""
    replaced = missing = 0
    out = text
    for m in re.finditer(r'https?://[^\s\)\"\']+\.(?:jpg|jpeg|png|gif|webp|svg)', text, re.I):
        u = m.group(0)
        if not any(u.startswith(p) for p in PREFIXES):
            continue
        new = migrate_url(u)
        if new:
            out = out.replace(u, new)
            replaced += 1
        else:
            missing += 1
    return out, replaced, missing

# ---- main ----
print(f"Target: {URL}\n")
code, body = supa("GET", "/rest/v1/articles?select=id,slug,cover_image,content_md")
articles = json.loads(body)
print(f"Loaded {len(articles)} articles\n")

total_repl = total_miss = 0
patches: list[dict] = []
for a in articles:
    aid    = a["id"]
    slug   = a["slug"]
    cover  = a.get("cover_image")
    body_md = a.get("content_md") or ""

    patch = {}
    if cover:
        new_cover = migrate_url(cover)
        if new_cover and new_cover != cover:
            patch["cover_image"] = new_cover
        elif not new_cover and cover.startswith(PREFIXES):
            # broken + can't resolve → null it
            patch["cover_image"] = None
            total_miss += 1

    if body_md:
        new_body, r, m = replace_in_text(body_md)
        total_repl += r
        total_miss += m
        if new_body != body_md:
            patch["content_md"] = new_body

    if patch:
        patches.append({"id": aid, "slug": slug, **patch})

print(f"\nReady to patch {len(patches)} articles")
print(f"  replaced URLs: {total_repl}")
print(f"  missing (left as-is or nulled cover): {total_miss}")

# Apply patches via PATCH
ok = 0
for p in patches:
    aid = p.pop("id")
    slug = p.pop("slug")
    code, _ = supa("PATCH", f"/rest/v1/articles?id=eq.{aid}",
                   headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
                   body=json.dumps(p, ensure_ascii=False).encode("utf-8"))
    if code in (200, 204):
        ok += 1
        print(f"  ✓ {slug}")
    else:
        print(f"  ✗ {slug} ({code})")

print(f"\nPatched {ok}/{len(patches)}.")
