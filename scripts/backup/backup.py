"""Daily backup of Supabase Postgres data + Storage files → Google Drive via rclone.

Run:
    python scripts/backup/backup.py

Required env (read from .env.local):
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY        (read-only — fine for public + RLS-published data)
    SUPABASE_SERVICE_ROLE_KEY            (optional — needed if you want to dump RLS-protected rows)

Optional:
    BACKUP_RCLONE_REMOTE   default "gdrive:supabase backup/korifi-edu"
    BACKUP_KEEP_LOCAL_DAYS default 7

Behaviour:
    1. Snapshots every public table as JSON (one file per table)
    2. Downloads every file from every Storage bucket
    3. Bundles into _backups/YYYY-MM-DD/ + a single .zip
    4. rclone copy → Google Drive folder
    5. Prunes local backups older than BACKUP_KEEP_LOCAL_DAYS (default 7)
"""
from __future__ import annotations
import os, sys, json, time, shutil, zipfile, datetime, subprocess, urllib.request, urllib.parse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT     = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT / ".env.local"
RCLONE   = ROOT / "scripts" / "backup" / "rclone.exe"
BACKUPS  = ROOT / "_backups"

# -----------------------------------------------------------------------------
# Env loading (no python-dotenv dependency)
# -----------------------------------------------------------------------------
def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env = {**load_env(ENV_FILE), **os.environ}
SUPA_URL  = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SUPA_ANON = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
SUPA_SVC  = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
KEY = SUPA_SVC or SUPA_ANON  # service role > anon
REMOTE  = env.get("BACKUP_RCLONE_REMOTE", "gdrive:supabase backup/korifi-edu")
KEEP    = int(env.get("BACKUP_KEEP_LOCAL_DAYS", "7"))

if not SUPA_URL or not KEY:
    print("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or *_SUPABASE_ANON_KEY in .env.local")
    sys.exit(1)

# -----------------------------------------------------------------------------
# Tables to dump (kept explicit so we know what we're protecting)
# -----------------------------------------------------------------------------
TABLES = [
    "subjects", "courses", "lessons", "enrollments", "profiles",
    "articles", "pages", "page_sections",
    "teachers", "events", "testimonials", "partners",
]
BUCKETS = ["images", "pdfs"]

# -----------------------------------------------------------------------------
# HTTP helpers (urllib only)
# -----------------------------------------------------------------------------
def supa_get(path: str, headers: dict | None = None, params: dict | None = None) -> bytes:
    url = f"{SUPA_URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}",
        **(headers or {}),
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def fetch_table_rows(table: str) -> list:
    """Fetch ALL rows of a table via PostgREST pagination."""
    rows = []
    page_size = 1000
    offset = 0
    while True:
        chunk = json.loads(supa_get(
            f"/rest/v1/{table}",
            headers={"Range-Unit": "items", "Range": f"{offset}-{offset+page_size-1}", "Prefer": "count=exact"},
            params={"select": "*", "order": "id.asc"},
        ).decode("utf-8"))
        rows.extend(chunk)
        if len(chunk) < page_size:
            break
        offset += page_size
    return rows

def list_bucket_files(bucket: str) -> list[dict]:
    body = supa_get(f"/storage/v1/object/list/{bucket}",
                    headers={"Content-Type": "application/json"})
    # Storage list endpoint expects POST with prefix; some Supabase versions use GET — try POST
    return json.loads(body.decode("utf-8")) if body else []

def list_bucket_files_post(bucket: str, prefix: str = "") -> list[dict]:
    payload = json.dumps({"prefix": prefix, "limit": 1000, "offset": 0,
                          "sortBy": {"column": "name", "order": "asc"}}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPA_URL}/storage/v1/object/list/{bucket}",
        data=payload,
        method="POST",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def download_file(bucket: str, name: str, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        f"{SUPA_URL}/storage/v1/object/{bucket}/{urllib.parse.quote(name)}",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, out.open("wb") as f:
        shutil.copyfileobj(r, f)

# -----------------------------------------------------------------------------
# Backup pipeline
# -----------------------------------------------------------------------------
def main():
    today = datetime.date.today().isoformat()
    target = BACKUPS / today
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True, exist_ok=True)

    manifest = {
        "date": today, "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "supabase_url": SUPA_URL, "tables": {}, "buckets": {},
    }

    print(f"\n→ Backup target: {target}\n")
    print("Tables:")
    db_dir = target / "db"; db_dir.mkdir(exist_ok=True)
    for t in TABLES:
        try:
            rows = fetch_table_rows(t)
            (db_dir / f"{t}.json").write_text(
                json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            manifest["tables"][t] = len(rows)
            print(f"  ✓ {t:<14} {len(rows):>4} rows")
        except Exception as e:
            manifest["tables"][t] = f"ERROR: {e}"
            print(f"  ✗ {t:<14} ERROR: {e}")

    print("\nStorage buckets:")
    storage_dir = target / "storage"
    for b in BUCKETS:
        bdir = storage_dir / b
        try:
            files = list_bucket_files_post(b)
            count = 0
            for f in files:
                if f.get("name"):  # skip folder entries
                    download_file(b, f["name"], bdir / f["name"])
                    count += 1
            manifest["buckets"][b] = count
            print(f"  ✓ {b:<8} {count} file(s)")
        except Exception as e:
            manifest["buckets"][b] = f"ERROR: {e}"
            print(f"  ✗ {b:<8} ERROR: {e}")

    manifest["finished_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (target / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Bundle into a single zip
    zip_path = BACKUPS / f"korifi-edu-backup-{today}.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in target.rglob("*"):
            if p.is_file():
                zf.write(p, p.relative_to(target))
    print(f"\n→ Bundled → {zip_path.name} ({zip_path.stat().st_size//1024} KB)")

    # rclone push → Google Drive
    if RCLONE.exists():
        print(f"\n→ rclone copy → {REMOTE}")
        result = subprocess.run(
            [str(RCLONE), "copy", str(zip_path), REMOTE, "--progress"],
            cwd=ROOT,
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            print("  ✓ uploaded to Google Drive")
        else:
            print(f"  ✗ rclone failed (exit {result.returncode}):")
            print("   ", (result.stderr or result.stdout)[:500])
            print("  → Run 'scripts/backup/rclone.exe config' to set up the 'gdrive' remote first.")
    else:
        print(f"\n  ⚠ rclone.exe not found at {RCLONE}. Skipping upload.")

    # Prune old local backups
    cutoff = datetime.date.today() - datetime.timedelta(days=KEEP)
    for p in BACKUPS.glob("*"):
        if p.is_dir() and p.name < cutoff.isoformat():
            shutil.rmtree(p, ignore_errors=True)
        if p.is_file() and p.name.startswith("korifi-edu-backup-"):
            try:
                d = datetime.date.fromisoformat(p.stem.split("-backup-")[-1])
                if d < cutoff:
                    p.unlink(missing_ok=True)
            except ValueError:
                pass

    print(f"\n✅ Backup complete: {today}")

if __name__ == "__main__":
    main()
