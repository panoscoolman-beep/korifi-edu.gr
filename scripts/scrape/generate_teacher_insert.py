"""Generate SQL INSERT for the teachers table from teachers.json."""
import os, sys, json
sys.stdout.reconfigure(encoding="utf-8")

PATH = os.path.join(os.path.dirname(__file__), "teachers.json")
teachers = json.load(open(PATH, encoding="utf-8"))

def sql_str(s):
    if s is None: return "NULL"
    return "'" + s.replace("'", "''") + "'"

rows = []
for i, t in enumerate(teachers, 1):
    rows.append(f"({sql_str(t['slug'])}, {sql_str(t['full_name'])}, {sql_str(t['role'])}, {sql_str(t['photo_url'])}, {i}, true)")

sql = """insert into public.teachers
  (slug, full_name, role, photo_url, sort_order, is_published)
values
  """ + ",\n  ".join(rows) + """
on conflict (slug) do update set
  full_name    = excluded.full_name,
  role         = excluded.role,
  photo_url    = excluded.photo_url,
  sort_order   = excluded.sort_order,
  is_published = true;"""

OUT = os.path.join(os.path.dirname(__file__), "teachers_insert.sql")
with open(OUT, "w", encoding="utf-8") as f:
    f.write(sql)
print(f"Wrote {OUT} ({len(sql)} chars)")
print(sql[:1500] + "\n...")
