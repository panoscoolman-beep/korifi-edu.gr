"""Migrate broken korifi-edu.gr/wp-content lesson PDFs → Supabase Storage `pdfs` bucket.

After the custom domain swap (korifi-edu.gr → Vercel), the legacy WordPress
URLs in `lessons.pdf_url` 403'd. This script resolves each broken URL against
the local backup and re-uploads to `pdfs/lessons/<flat-name>`.

Idempotent. Run:
    python scripts/scrape/migrate_lesson_pdfs.py
"""
from __future__ import annotations
import sys, json, re, urllib.parse, urllib.request, urllib.error, mimetypes, hashlib
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT  = Path(__file__).resolve().parents[2]
LOCAL = ROOT.parent / "_korifi-edu.gr" / "public_html"

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
    """`uploads/2021/03/foo.pdf` → `lessons/2021-03_foo.pdf`. ASCII-safe."""
    parts = local.parts
    try:
        idx = parts.index("uploads")
        sub = parts[idx + 1:]
    except ValueError:
        sub = (local.name,)
    flat = "_".join(sub).replace(" ", "_")
    try:
        flat.encode("ascii")
    except UnicodeEncodeError:
        digest = hashlib.sha1(flat.encode("utf-8")).hexdigest()[:12]
        flat = f"pdf_{digest}{local.suffix.lower()}"
    return f"lessons/{flat}"

def supa(method: str, path: str, *, headers=None, body=None):
    req_headers = {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", **(headers or {})}
    req = urllib.request.Request(f"{URL}{path}", data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def upload_pdf(local: Path) -> str | None:
    storage_path = storage_path_for(local)
    encoded = urllib.parse.quote(storage_path, safe="/")
    code, _ = supa(
        "POST", f"/storage/v1/object/pdfs/{encoded}",
        headers={"Content-Type": "application/pdf", "x-upsert": "true"},
        body=local.read_bytes(),
    )
    if code in (200, 201):
        return f"{STORAGE_PREFIX}{encoded}"
    return None

# Main
print(f"Target: {URL}\n")
code, body = supa("GET", "/rest/v1/lessons?select=id,title,pdf_url&content_type=eq.pdf&pdf_url=not.is.null")
lessons = json.loads(body)
print(f"PDF lessons: {len(lessons)}\n")

ok = skipped = failed = 0
for l in lessons:
    pdf = l.get("pdf_url") or ""
    if pdf.startswith(STORAGE_PREFIX):
        skipped += 1
        continue
    local = resolve_local(pdf)
    if not local:
        print(f"  ✗ {l['title'][:40]:<42s} no local file")
        failed += 1
        continue
    new_url = upload_pdf(local)
    if not new_url:
        print(f"  ✗ {l['title'][:40]:<42s} upload failed")
        failed += 1
        continue
    code, _ = supa(
        "PATCH", f"/rest/v1/lessons?id=eq.{l['id']}",
        headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        body=json.dumps({"pdf_url": new_url}, ensure_ascii=False).encode("utf-8"),
    )
    if 200 <= code < 300:
        print(f"  ✓ {l['title'][:40]:<42s} → {storage_path_for(local)}")
        ok += 1
    else:
        print(f"  ✗ {l['title'][:40]:<42s} PATCH HTTP {code}")
        failed += 1

print(f"\nDone. ok={ok}, skipped={skipped}, failed={failed}")

# Bust caches so the new URLs flow through
print("\n→ Invalidating cache...")
revreq = urllib.request.Request(
    "https://korifi-edu.gr/api/internal/revalidate",
    data=json.dumps({"tags": ["lessons", "courses"], "paths": []}).encode("utf-8"),
    method="POST",
    headers={"Authorization": f"Bearer {SERVICE}", "Content-Type": "application/json"},
)
try:
    with urllib.request.urlopen(revreq, timeout=15) as r:
        print(f"  {r.status} {r.read()[:150].decode()!r}")
except Exception as e:
    print(f"  invalidate failed: {e}")
