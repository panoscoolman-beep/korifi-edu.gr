"""Upload hero/seasonal photos to Supabase Storage `images/hero/`."""
from __future__ import annotations
import sys, urllib.parse, urllib.request, urllib.error, mimetypes
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2]
LOCAL_BASE = ROOT.parent / "_korifi-edu.gr" / "public_html" / "wp-content" / "uploads"

def load_env(p: Path) -> dict:
    env = {}
    for ln in p.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln: continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env = load_env(ROOT / ".env.local")
URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]

# (local-relative-path, storage-path-under-images-bucket)
UPLOADS = [
    ("2026/05/hero_slide_1_kalloni.png",   "hero/kalloni.png"),
    ("2026/05/hero_slide_2_hybrid.png",    "hero/hybrid.png"),
    ("2023/06/SUMMER1022-01.jpg",          "hero/summer.jpg"),
]

def upload(local: Path, dest: str) -> str | None:
    encoded = urllib.parse.quote(dest, safe="/")
    body = local.read_bytes()
    ctype = mimetypes.guess_type(str(local))[0] or "image/png"
    req = urllib.request.Request(
        f"{URL}/storage/v1/object/{encoded}".replace("/object/", "/object/images/"),
        data=body, method="POST",
        headers={
            "apikey": SERVICE,
            "Authorization": f"Bearer {SERVICE}",
            "Content-Type": ctype,
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            if r.status in (200, 201):
                return f"{URL}/storage/v1/object/public/images/{encoded}"
    except urllib.error.HTTPError as e:
        print(f"    upload failed [{e.code}]: {e.read()[:200].decode('utf-8', errors='replace')}")
    return None

if __name__ == "__main__":
    print(f"Target: {URL}\n")
    for src_rel, dest in UPLOADS:
        local = LOCAL_BASE / src_rel
        print(f"→ {src_rel} → images/{dest}")
        if not local.exists():
            print(f"   ✗ not found: {local}")
            continue
        u = upload(local, dest)
        if u:
            print(f"   ✓ {u}")
        else:
            print(f"   ✗ failed")
