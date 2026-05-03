"""Update teacher bio_md from extracted grade-page bios. Uses service_role."""
import os, sys, json, urllib.parse, urllib.request, unicodedata
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2]

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

def supa(method, path, headers=None, body=None, params=None):
    url = f"{URL}{path}" + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, data=body, method=method, headers={
        "apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", **(headers or {}),
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def normalize_name(name: str) -> str:
    """Strip accents + uppercase + collapse spaces, for matching."""
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return " ".join(s.upper().split())

# Load bios
bios = json.load(open(Path(__file__).parent / "bios.json", encoding="utf-8"))

# Fetch teachers
code, body = supa("GET", "/rest/v1/teachers", params={"select": "id,slug,full_name"})
teachers = json.loads(body)
print(f"Teachers in DB: {len(teachers)}, bios extracted: {len(bios)}")

bios_normalized = {normalize_name(n): (n, bio) for n, bio in bios.items()}

updated = matched = 0
for t in teachers:
    norm = normalize_name(t["full_name"])
    # Try exact + partial match (e.g. ΒΑΓΙΑΝΝΗ ΔΕΣΠΟΙΝΑ vs ΒΑΓΙΑΝΝΗ ΔΕΣΠΟΙΝΑ-ΜΙΧΑΕΛΛΑ)
    match = None
    for bnorm, (orig_name, bio) in bios_normalized.items():
        if bnorm == norm or norm in bnorm or bnorm in norm:
            match = (orig_name, bio); break
    if match:
        matched += 1
        body = json.dumps({"bio_md": match[1]}, ensure_ascii=False).encode("utf-8")
        code, _ = supa("PATCH", "/rest/v1/teachers",
                       headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
                       body=body, params={"id": f"eq.{t['id']}"})
        if 200 <= code < 300:
            updated += 1
            print(f"  ✓ {t['slug']:<28s} ← {match[0]}")
        else:
            print(f"  ✗ {t['slug']:<28s} HTTP {code}")
    else:
        print(f"  - {t['slug']:<28s} (no bio)")

print(f"\nMatched: {matched}, Updated: {updated}")
