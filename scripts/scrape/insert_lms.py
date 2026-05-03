"""Generate SQL INSERT for LMS courses + lessons from lms_sample.json.

URL handling:
- Replace legacy test.itin.gr with korifi-edu.gr
- URL-encode Greek characters in PDF paths (live server requires this)
- HEAD-check each URL, mark broken ones (will be re-uploaded later via service-role photo migration)
"""
import os, sys, json, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(__file__)
SRC  = os.path.join(HERE, "lms_sample.json")
OUT  = os.path.join(HERE, "lms_insert.sql")

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

def fix_url(url: str) -> str | None:
    if not url: return None
    url = url.replace("test.itin.gr", "korifi-edu.gr")
    # The path may contain Greek characters that need URL-encoding
    parsed = urllib.parse.urlparse(url)
    encoded_path = urllib.parse.quote(parsed.path, safe="/")
    return parsed._replace(path=encoded_path).geturl()

def head_ok(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status == 200
    except Exception:
        return False

def sql(s):
    if s is None: return "NULL"
    return "E'" + str(s).replace("\\", "\\\\").replace("'", "''").replace("\n", "\\n").replace("\r", "") + "'"

def slug_decode(s: str) -> str:
    """Decode WP-style %xx escapes in slugs to UTF-8 characters; sanitise."""
    decoded = urllib.parse.unquote(s)
    return decoded.lower().replace(" ", "-")[:80]

print(f"Processing {len(data['courses'])} courses…\n")

course_inserts = []
lesson_inserts_by_course_slug = {}  # course_slug -> list of lesson tuples

stats = {"courses": 0, "lessons": 0, "pdf_ok": 0, "pdf_404": 0, "text": 0}

for c in data["courses"]:
    slug = slug_decode(c["slug"])
    cover = fix_url(c.get("cover_image"))
    course_inserts.append(
        f"insert into public.courses (title, slug, description, subject_id, is_free, cover_image)\n"
        f"  select {sql(c['title'])}, {sql(slug)}, NULL, s.id, {str(c['is_free']).lower()}, {sql(cover)}\n"
        f"  from public.subjects s where s.slug = {sql(c['subject_slug'])}\n"
        f"  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id\n"
        f"  returning id, slug;"
    )
    stats["courses"] += 1

    lesson_rows = []
    for l in c["lessons"]:
        pdf_url = None
        content = None
        if l["content_type"] == "pdf":
            url = fix_url(l["pdf_url"])
            if url and head_ok(url):
                pdf_url = url
                stats["pdf_ok"] += 1
                print(f"  ✓ PDF ok: {l['title'][:50]}")
            else:
                # Fall back to text content with note + original URL for traceability
                content = f"_PDF αρχείο σε migration. Αρχικό URL: {l['pdf_url']}_"
                pdf_url = url  # still store the URL even if 404 — we'll re-upload via Storage soon
                stats["pdf_404"] += 1
                print(f"  ✗ PDF 404: {l['title'][:50]}")
        else:
            content = l.get("content") or "_(κενό)_"
            stats["text"] += 1

        # Build INSERT — depends on content_type
        if l["content_type"] == "pdf" and pdf_url:
            lesson_rows.append(
                f"  ({sql(l['title'])}, {l['order']}, 'pdf', {sql(pdf_url)}, NULL, {str(l['is_free']).lower()})"
            )
        else:
            # Use 'text' since 'article' content needs to be Markdown body, ours is HTML legacy
            lesson_rows.append(
                f"  ({sql(l['title'])}, {l['order']}, 'text', NULL, {sql(content or '_(κενό)_')}, {str(l['is_free']).lower()})"
            )
        stats["lessons"] += 1

    lesson_inserts_by_course_slug[slug] = lesson_rows

# Build full SQL
sql_parts = []
sql_parts.append("-- LMS sample migration: 5 courses + lessons\n")

for ci in course_inserts:
    sql_parts.append(ci + "\n")

for course_slug, rows in lesson_inserts_by_course_slug.items():
    if not rows: continue
    sql_parts.append(
        f"\ninsert into public.lessons (title, \"order\", content_type, pdf_url, content, is_free, course_id)\n"
        f"select t.*, c.id from (values\n  "
        + ",\n  ".join(f"{r}" for r in rows)
        + f"\n) as t(title, \"order\", content_type, pdf_url, content, is_free)\n"
        f"cross join (select id from public.courses where slug = {sql(course_slug)}) c\n"
        f"on conflict do nothing;\n"
    )

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_parts))

print()
print(f"Wrote {OUT} ({len(open(OUT, encoding='utf-8').read())} chars)")
print(f"Stats: {stats}")
