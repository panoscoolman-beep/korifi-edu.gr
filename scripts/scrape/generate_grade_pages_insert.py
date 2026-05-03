"""Generate SQL UPSERT for grade pages from grade_pages.json."""
import os, sys, json
sys.stdout.reconfigure(encoding="utf-8")

PATH = os.path.join(os.path.dirname(__file__), "grade_pages.json")
pages = json.load(open(PATH, encoding="utf-8"))

def sql_str(s):
    if s is None: return "NULL"
    return "E'" + s.replace("\\", "\\\\").replace("'", "''").replace("\n", "\\n").replace("\r", "") + "'"

rows = []
for p in pages:
    rows.append(
        f"({sql_str(p['slug'])}, {sql_str(p['title'])}, {sql_str(p['content_md'])}, "
        f"{sql_str(p.get('cover_image'))}, {sql_str(p.get('meta_description'))}, "
        f"{p['sort_order']}, {str(p['is_published']).lower()})"
    )

sql = """insert into public.pages
  (slug, title, content_md, cover_image, meta_description, sort_order, is_published)
values
  """ + ",\n  ".join(rows) + """
on conflict (slug) do update set
  title            = excluded.title,
  content_md       = excluded.content_md,
  cover_image      = excluded.cover_image,
  meta_description = excluded.meta_description,
  sort_order       = excluded.sort_order,
  is_published     = excluded.is_published,
  updated_at       = now();"""

OUT = os.path.join(os.path.dirname(__file__), "grade_pages_insert.sql")
with open(OUT, "w", encoding="utf-8") as f:
    f.write(sql)
print(f"Wrote {OUT} ({len(sql)} chars)")
