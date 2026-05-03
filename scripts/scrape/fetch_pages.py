"""Fetch all relevant Greek pages from korifi-edu.gr live site."""
import os, sys, urllib.request, urllib.parse, re
sys.stdout.reconfigure(encoding="utf-8")

BASE = "https://korifi-edu.gr/"
OUT = os.path.join(os.path.dirname(__file__), "raw")
os.makedirs(OUT, exist_ok=True)

# (slug-on-disk, url-path) — url-path may contain UTF-8 Greek
PAGES = [
    ("home",                          ""),
    ("gimnasio",                      "gimnasio/"),
    ("alikeiou",                      "alikeiou/"),
    ("blikeiou",                      "blikeiou/"),
    ("glikeiou",                      "glikeiou/"),
    ("epal",                          "epal/"),
    ("online-mathimata",              "online-mathimata/"),
    ("courses",                       "courses/"),
    ("epaggelmatikos-prosanatolismos","%ce%b5%cf%80%ce%b1%ce%b3%ce%b3%ce%b5%ce%bb%ce%bc%ce%b1%cf%84%ce%b9%ce%ba%cf%8c%cf%82-%cf%80%cf%81%ce%bf%cf%83%ce%b1%ce%bd%ce%b1%cf%84%ce%bf%ce%bb%ce%b9%cf%83%ce%bc%cf%8c%cf%82/"),
    ("blog",                          "%ce%ba%ce%bf%cf%81%cf%85%cf%86%ce%ae-blog/"),
    ("gia-emas",                      "gia-emas/"),
    ("synergates",                    "%cf%83%cf%85%ce%bd%ce%b5%cf%81%ce%b3%ce%ac%cf%84%ce%b5%cf%82/"),
    ("epikoinonia",                   "epikoinonia/"),
]

def fetch(url):
    # url already percent-encoded if Greek; quote() with safe='%' to avoid double-encoding
    encoded = urllib.parse.quote(url, safe=":/?&=%")
    req = urllib.request.Request(encoded, headers={"User-Agent": "Mozilla/5.0 (compatible; korifi-migrator/1.0)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    except Exception as e:
        return f"ERROR: {e}".encode()

results = []
for slug, path in PAGES:
    full = BASE + path
    body = fetch(full)
    out = os.path.join(OUT, f"{slug}.html")
    with open(out, "wb") as f:
        f.write(body)
    results.append((slug, full, len(body)))
    print(f"  {slug:35s}  {len(body):>9d}  {full}")

print()
print(f"Saved {len(results)} pages to {OUT}")
