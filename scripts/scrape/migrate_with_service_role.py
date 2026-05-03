"""One-shot migration: articles JSON → DB, teacher photos local → Supabase Storage.

Requires `SUPABASE_SERVICE_ROLE_KEY` in .env.local. Idempotent.

Run:
    python scripts/scrape/migrate_with_service_role.py
"""
from __future__ import annotations
import os, sys, json, re, urllib.parse, urllib.request, mimetypes, ssl
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT  = Path(__file__).resolve().parents[2]
LOCAL_UPLOADS = ROOT.parent / "_korifi-edu.gr" / "public_html" / "wp-content" / "uploads"

# ---- env -----------------------------------------------------------
def load_env(p: Path) -> dict:
    env = {}
    if not p.exists(): return env
    for ln in p.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln: continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env = load_env(ROOT / ".env.local")
URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
ANON = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
SERVICE = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not URL or not SERVICE:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY missing in .env.local")
    sys.exit(1)

# ---- helpers -------------------------------------------------------
def supa_request(method: str, path: str, *, headers=None, body=None, params=None) -> tuple[int, bytes]:
    url = f"{URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req_headers = {
        "apikey": SERVICE,
        "Authorization": f"Bearer {SERVICE}",
        **(headers or {}),
    }
    req = urllib.request.Request(url, data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def upload_file_to_storage(bucket: str, path: str, file_bytes: bytes, content_type: str) -> str | None:
    """Upload binary file to Supabase Storage. Returns public URL or None on error."""
    encoded_path = urllib.parse.quote(path, safe="/")
    code, body = supa_request(
        "POST", f"/storage/v1/object/{bucket}/{encoded_path}",
        headers={"Content-Type": content_type, "x-upsert": "true"},
        body=file_bytes,
    )
    if code in (200, 201):
        return f"{URL}/storage/v1/object/public/{bucket}/{encoded_path}"
    print(f"    upload failed [{code}]: {body[:200]}")
    return None

def db_upsert(table: str, rows: list[dict], on_conflict: str | None = None) -> tuple[int, int]:
    """PostgREST upsert via Prefer header. Returns (status, count)."""
    headers = {"Content-Type": "application/json", "Prefer": "return=minimal,resolution=merge-duplicates"}
    params = {}
    if on_conflict:
        params["on_conflict"] = on_conflict
    body = json.dumps(rows, ensure_ascii=False).encode("utf-8")
    code, _ = supa_request("POST", f"/rest/v1/{table}", headers=headers, body=body, params=params or None)
    return code, len(rows) if 200 <= code < 300 else 0

def db_update(table: str, eq_col: str, eq_val: str, patch: dict) -> int:
    headers = {"Content-Type": "application/json", "Prefer": "return=minimal"}
    body = json.dumps(patch, ensure_ascii=False).encode("utf-8")
    code, _ = supa_request("PATCH", f"/rest/v1/{table}", headers=headers, body=body, params={eq_col: f"eq.{eq_val}"})
    return code

# ---- 1) Articles ---------------------------------------------------
def migrate_articles():
    src = ROOT / "scripts" / "scrape" / "articles.json"
    if not src.exists():
        print("→ Articles: articles.json not found, skipping")
        return
    raw = json.load(open(src, encoding="utf-8"))
    rows = []
    for a in raw:
        slug = a.get("slug_ascii") or a.get("slug_original") or "untitled"
        rows.append({
            "slug":         slug,
            "title":        a.get("title", ""),
            "excerpt":      a.get("excerpt"),
            "content_md":   a.get("content_md", ""),
            "cover_image":  a.get("cover_image"),
            "author_name":  a.get("author_name"),
            "published_at": a.get("published_at"),
            "is_published": True,
        })
    print(f"→ Articles: upserting {len(rows)}…")
    code, n = db_upsert("articles", rows, on_conflict="slug")
    print(f"  HTTP {code} — {n} rows" if 200 <= code < 300 else f"  ✗ HTTP {code}")

# ---- 2) Teacher photos ---------------------------------------------
PUBLIC_HTML_PREFIX = "https://i0.wp.com/korifi-edu.gr"
DIRECT_PREFIX      = "https://korifi-edu.gr"

def url_to_local_path(remote_url: str) -> Path | None:
    """Map a korifi-edu.gr photo URL back to its local file under _korifi-edu.gr/public_html/."""
    if not remote_url:
        return None
    # strip query string
    u = remote_url.split("?")[0]
    for prefix in (PUBLIC_HTML_PREFIX, DIRECT_PREFIX):
        if u.startswith(prefix):
            rel = u[len(prefix):].lstrip("/")
            # rel is like "wp-content/uploads/2021/01/koulmandas.jpg"
            local = LOCAL_UPLOADS.parent.parent / rel
            return local if local.exists() else None
    return None

def migrate_teacher_photos():
    print("→ Teacher photos: fetching current rows…")
    code, body = supa_request("GET", "/rest/v1/teachers", params={"select": "id,slug,full_name,photo_url"})
    if code != 200:
        print(f"  ✗ GET teachers failed: {code}"); return
    teachers = json.loads(body)

    print(f"  Found {len(teachers)} teachers. Migrating photos…")
    fixed, skipped, failed = 0, 0, 0
    for t in teachers:
        photo = t.get("photo_url")
        local = url_to_local_path(photo)
        if not local:
            print(f"    - {t['slug']:<28s} no local file (URL: {photo[:50] if photo else 'NULL'})")
            skipped += 1
            continue

        ext  = local.suffix.lower().lstrip(".")
        ctype = mimetypes.guess_type(str(local))[0] or "image/jpeg"
        storage_path = f"teachers/{t['slug']}.{ext}"
        print(f"    ↑ {t['slug']:<28s} → images/{storage_path}", end=" ")

        try:
            data = local.read_bytes()
            new_url = upload_file_to_storage("images", storage_path, data, ctype)
            if new_url and db_update("teachers", "id", t["id"], {"photo_url": new_url}) in (200, 204):
                print("✓")
                fixed += 1
            else:
                print("✗ (db update or upload failed)")
                failed += 1
        except Exception as e:
            print(f"✗ {e}")
            failed += 1

    print(f"  Summary: fixed={fixed}, skipped={skipped}, failed={failed}")

# ---- 3) Course cover images ----------------------------------------
def migrate_course_covers():
    print("→ Course cover images…")
    code, body = supa_request("GET", "/rest/v1/courses", params={"select": "id,slug,cover_image"})
    if code != 200:
        print(f"  ✗ GET courses failed: {code}"); return
    courses = json.loads(body)
    fixed = skipped = failed = 0
    for c in courses:
        local = url_to_local_path(c.get("cover_image"))
        if not local:
            skipped += 1; continue
        ext  = local.suffix.lower().lstrip(".")
        ctype = mimetypes.guess_type(str(local))[0] or "image/jpeg"
        storage_path = f"courses/{c['slug']}.{ext}"
        try:
            data = local.read_bytes()
            new_url = upload_file_to_storage("images", storage_path, data, ctype)
            if new_url and db_update("courses", "id", c["id"], {"cover_image": new_url}) in (200, 204):
                print(f"  ✓ {c['slug']:<35s} → {storage_path}")
                fixed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  ✗ {c['slug']}: {e}")
            failed += 1
    print(f"  Summary: fixed={fixed}, skipped={skipped}, failed={failed}")

# ---- run -----------------------------------------------------------
if __name__ == "__main__":
    print(f"Target: {URL}\n")
    migrate_articles()
    print()
    migrate_teacher_photos()
    print()
    migrate_course_covers()
    print("\nDone.")
