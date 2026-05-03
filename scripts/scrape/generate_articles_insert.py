"""Generate SQL INSERT for articles from articles.json — uses ASCII slugs."""
import os, sys, json
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(__file__)
data = json.load(open(os.path.join(HERE, "articles.json"), encoding="utf-8"))

def sql(s):
    if s is None: return "NULL"
    return "E'" + str(s).replace("\\", "\\\\").replace("'", "''").replace("\n", "\\n").replace("\r", "") + "'"

rows = []
for a in data:
    slug = a.get("slug_ascii") or a.get("slug_original") or "untitled"
    rows.append(
        f"  ({sql(slug)}, {sql(a['title'])}, {sql(a.get('excerpt'))}, {sql(a['content_md'])}, "
        f"{sql(a.get('cover_image'))}, {sql(a.get('author_name'))}, {sql(a.get('published_at'))}, true)"
    )

out = """insert into public.articles
  (slug, title, excerpt, content_md, cover_image, author_name, published_at, is_published)
values
""" + ",\n".join(rows) + """
on conflict (slug) do update set
  title=excluded.title, excerpt=excluded.excerpt, content_md=excluded.content_md,
  cover_image=excluded.cover_image, author_name=excluded.author_name,
  published_at=excluded.published_at, is_published=true, updated_at=now()
returning slug, title;"""

OUT = os.path.join(HERE, "articles_insert.sql")
with open(OUT, "w", encoding="utf-8") as f:
    f.write(out)
print(f"Wrote {OUT} ({len(out)} chars, {len(rows)} rows)")
