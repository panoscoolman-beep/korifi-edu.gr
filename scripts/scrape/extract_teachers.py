"""Extract teachers (name, role, photo) from gia-emas.html."""
import os, sys, json, re, unicodedata
sys.stdout.reconfigure(encoding="utf-8")

PATH = os.path.join(os.path.dirname(__file__), "raw", "gia-emas.html")
html = open(PATH, encoding="utf-8").read()

def strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", s).strip()

def slugify_greek(s: str) -> str:
    # Naive transliteration — strip diacritics, romanize core greek letters
    table = str.maketrans({
        "Α": "a", "Β": "v", "Γ": "g", "Δ": "d", "Ε": "e", "Ζ": "z", "Η": "i",
        "Θ": "th", "Ι": "i", "Κ": "k", "Λ": "l", "Μ": "m", "Ν": "n", "Ξ": "x",
        "Ο": "o", "Π": "p", "Ρ": "r", "Σ": "s", "Τ": "t", "Υ": "y", "Φ": "f",
        "Χ": "ch", "Ψ": "ps", "Ω": "o",
    })
    s = unicodedata.normalize("NFD", s.upper())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.translate(table)
    s = re.sub(r"[^a-zA-Z0-9\s\-]", "", s)
    s = re.sub(r"\s+", "-", s.strip().lower())
    return s

def clean_url(url: str) -> str:
    if not url: return url
    url = url.replace("&amp;", "&").split("?", 1)[0]
    return url

# 1) Find every (anchor-or-elementor-action wrapping an img) — give us photos in DOM order
photo_pat = re.compile(
    r'<a[^>]*(?:href="([^"]+)"[^>]*)?(?:data-elementor-action[^>]*)?>\s*<img[^>]*src="([^"]+/wp-content/uploads/[^"]+)"',
    re.IGNORECASE | re.DOTALL,
)
photos = [(href, src, m.start()) for m in photo_pat.finditer(html)
          for href, src in [(m.group(1) or "", m.group(2))]]

# 2) Find all H3 elements (potential teacher names)
h3_pat = re.compile(r"<h3[^>]*>(.*?)</h3>", re.IGNORECASE | re.DOTALL)
h3s = [(strip_tags(m.group(1)), m.start(), m.end()) for m in h3_pat.finditer(html)]
h3s = [(t, s, e) for t, s, e in h3s
       if t and len(t) > 4 and not re.search(r"Φιλοσοφία|ΚΟΡΥΦΗ|ομάδα", t)]

# 3) For each h3, the role is the next plain-text block of all-caps Greek
role_pat = re.compile(
    r"<(?:p|span|div|h4|h5)[^>]*>([^<]*?[Α-Ω][Α-Ω\s\-]{2,40}[Α-Ω])",
    re.IGNORECASE,
)

teachers = []
for name_raw, h3_start, h3_end in h3s:
    # role: search forward after h3 until next h3 or 4kb
    next_h3 = next((s for _, s, _ in h3s if s > h3_end), h3_end + 4000)
    snippet = html[h3_end: min(next_h3, h3_end + 4000)]
    rm = role_pat.search(snippet)
    role = strip_tags(rm.group(1)) if rm else None
    # photo: nearest preceding img/a (within ~2kb)
    photo = None
    href_for_slug = None
    for href, src, pos in reversed(photos):
        if pos < h3_start and h3_start - pos < 4000:
            photo = src
            href_for_slug = href
            break
    # slug: prefer URL fragment; else slugify the name
    slug = None
    if href_for_slug and href_for_slug.startswith("#"):
        candidate = href_for_slug.lstrip("#")
        if re.match(r"^[a-z][a-z0-9\-]+$", candidate, re.I):
            slug = candidate.lower()
    if not slug:
        slug = slugify_greek(name_raw)
    teachers.append({
        "slug": slug,
        "full_name": name_raw,  # keep all-caps as on source site
        "role": role,
        "photo_url": clean_url(photo),
    })

# Dedupe by slug, keep first occurrence
seen = set(); deduped = []
for t in teachers:
    if t["slug"] in seen: continue
    seen.add(t["slug"]); deduped.append(t)

print(f"Found {len(deduped)} teachers")
for i, t in enumerate(deduped, 1):
    photo_short = (t["photo_url"] or "").rsplit("/", 1)[-1] or "-"
    print(f"  {i:>2}. {t['slug']:<22} {t['full_name']:<30} {t['role'] or '?':<22} {photo_short}")

OUT = os.path.join(os.path.dirname(__file__), "teachers.json")
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)
print(f"\nWrote {OUT}")
