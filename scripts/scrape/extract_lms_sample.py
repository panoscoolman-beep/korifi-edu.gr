"""
Extract structured LMS data for specific courses from a WordPress + LearnPress 4 SQL dump.

Reads:  C:/Users/panos/Desktop/projects/_korifi-edu.gr/itinacn_db1.sql
Writes: C:/Users/panos/Desktop/projects/korifi-edu.gr/scripts/scrape/lms_sample.json
"""

import json
import re
import sys
from pathlib import Path

# Force UTF-8 stdout/stderr for Windows consoles (default cp1252 chokes on Greek text).
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

DUMP_PATH = Path(r"C:/Users/panos/Desktop/projects/_korifi-edu.gr/itinacn_db1.sql")
OUTPUT_PATH = Path(
    r"C:/Users/panos/Desktop/projects/korifi-edu.gr/scripts/scrape/lms_sample.json"
)
PREFIX = "5yajF_"

COURSE_IDS = [10447, 10550, 10595, 10597, 10599]
COURSE_NAMES_HINT = {
    10447: "Άλγεβρα Α Λυκείου",
    10550: "Άλγεβρα Β Λυκείου",
    10595: "Μαθηματικά Γ Γενικού Λυκείου",
    10597: "Μαθηματικά Κατεύθυνσης Β λυκείου",
    10599: "Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ) Γ Λυκείου",
}


# ---------------------------------------------------------------------------
# SQL VALUES tuple parser
# ---------------------------------------------------------------------------
def parse_values_tuples(values_blob: str):
    """
    Parse a string like "(1,'a','b'),(2,'c','d')" into a list of lists of values.
    Properly handles:
      - single-quoted strings with backslash escapes (\\', \\\\, \\n, \\r, \\0)
      - NULL literals
      - numeric values
      - parens/commas inside string content
    """
    rows = []
    i = 0
    n = len(values_blob)

    while i < n:
        # Skip whitespace and commas between tuples
        while i < n and values_blob[i] in " \t\n\r,":
            i += 1
        if i >= n:
            break
        if values_blob[i] != "(":
            # Not at a tuple start — bail
            break

        i += 1  # consume '('
        row = []
        cur = []
        in_str = False

        while i < n:
            ch = values_blob[i]

            if in_str:
                if ch == "\\" and i + 1 < n:
                    # escape sequence: keep both chars (we'll un-escape later)
                    cur.append(ch)
                    cur.append(values_blob[i + 1])
                    i += 2
                    continue
                if ch == "'":
                    # end of string — append closing quote so token brackets match
                    cur.append(ch)
                    in_str = False
                    i += 1
                    continue
                cur.append(ch)
                i += 1
                continue

            # not in string
            if ch == "'":
                in_str = True
                cur.append(ch)
                i += 1
                continue
            if ch == ",":
                row.append("".join(cur).strip())
                cur = []
                i += 1
                continue
            if ch == ")":
                row.append("".join(cur).strip())
                cur = []
                i += 1
                rows.append(row)
                break
            cur.append(ch)
            i += 1

    # Convert each token: 'string' → unescape, NULL → None, numeric → str (we keep str for safety)
    out = []
    for row in rows:
        parsed = []
        for tok in row:
            if tok == "NULL":
                parsed.append(None)
            elif len(tok) >= 2 and tok.startswith("'") and tok.endswith("'"):
                inner = tok[1:-1]
                inner = _unescape_sql_string(inner)
                parsed.append(inner)
            else:
                parsed.append(tok)
        out.append(parsed)
    return out


def _unescape_sql_string(s: str) -> str:
    """Decode MySQL-style backslash escapes in a string literal body."""
    out = []
    i = 0
    n = len(s)
    while i < n:
        ch = s[i]
        if ch == "\\" and i + 1 < n:
            nxt = s[i + 1]
            if nxt == "n":
                out.append("\n")
            elif nxt == "r":
                out.append("\r")
            elif nxt == "t":
                out.append("\t")
            elif nxt == "0":
                out.append("\0")
            elif nxt == "Z":
                out.append("\x1a")
            elif nxt == "b":
                out.append("\b")
            elif nxt in ("'", '"', "\\", "%", "_"):
                out.append(nxt)
            else:
                out.append(nxt)
            i += 2
        else:
            out.append(ch)
            i += 1
    return "".join(out)


# ---------------------------------------------------------------------------
# Streaming extraction of INSERT INTO statements
# ---------------------------------------------------------------------------
INSERT_RE = re.compile(
    rb"INSERT INTO `([^`]+)` \(([^)]+)\) VALUES",
    re.IGNORECASE,
)


def stream_inserts_for_table(dump_path: Path, table_name: str):
    """
    Yield (columns_list, values_blob_str) tuples for every INSERT INTO `table_name` ... VALUES (...);
    statement encountered in the dump.

    Tracks in-string state across lines so an embedded `);` inside HTML content
    doesn't end the statement prematurely.
    """
    target = f"INSERT INTO `{table_name}` ".encode("utf-8")

    with open(dump_path, "rb") as f:
        buffer = b""
        capturing = False
        in_string = False  # tracks whether current position is inside a 'single-quoted string'

        for line in f:
            if not capturing:
                if line.startswith(target):
                    capturing = True
                    buffer = b""
                    in_string = False
                else:
                    continue

            buffer += line

            # Update in_string by walking the new line's bytes (skip the INSERT prologue
            # the very first iteration — but it has no quotes until VALUES, so it's safe
            # to walk the whole appended line).
            j = len(buffer) - len(line)
            while j < len(buffer):
                b = buffer[j : j + 1]
                if in_string:
                    if b == b"\\" and j + 1 < len(buffer):
                        j += 2
                        continue
                    if b == b"'":
                        in_string = False
                    j += 1
                else:
                    if b == b"'":
                        in_string = True
                    j += 1

            # If we're outside of any string and the buffer ends with `;` (after stripping
            # whitespace), the INSERT statement is complete.
            if not in_string:
                stripped = buffer.rstrip(b"\r\n \t")
                if stripped.endswith(b";"):
                    try:
                        text = buffer.decode("utf-8", errors="replace")
                    except Exception:
                        text = buffer.decode("latin-1", errors="replace")

                    m = re.match(
                        r"INSERT INTO `[^`]+` \(([^)]+)\) VALUES\s*",
                        text,
                        re.IGNORECASE,
                    )
                    if m:
                        cols_str = m.group(1)
                        cols = [c.strip().strip("`") for c in cols_str.split(",")]
                        values_blob = text[m.end() :]
                        values_blob = values_blob.rstrip().rstrip(";").rstrip()
                        yield cols, values_blob

                    buffer = b""
                    capturing = False
                    in_string = False


# ---------------------------------------------------------------------------
# Domain-specific helpers
# ---------------------------------------------------------------------------
def derive_subject_slug(title: str) -> str:
    t = title or ""
    if "Γ Λυκείου" in t or "Γενικού Λυκείου" in t or "Γ' Λυκείου" in t:
        return "glikeiou"
    if "Β Λυκείου" in t or "Β λυκείου" in t or "Β' Λυκείου" in t:
        return "blikeiou"
    if "Α Λυκείου" in t or "Α' Λυκείου" in t:
        return "alikeiou"
    if "Γυμνάσιο" in t or "Γυμνασίου" in t:
        return "gimnasio"
    if "ΕΠΑΛ" in t:
        return "epal"
    return ""


PDF_HREF_RE = re.compile(r'<a[^>]*href="([^"]+\.pdf)"', re.IGNORECASE)


def extract_pdf_url(html: str):
    if not html:
        return None
    m = PDF_HREF_RE.search(html)
    return m.group(1) if m else None


# ---------------------------------------------------------------------------
# Pass 1: collect interesting post IDs
# ---------------------------------------------------------------------------
def collect_data():
    course_ids_set = set(COURSE_IDS)

    # ----- 1. Sections for each course -----
    print(f"Pass 1: scanning {PREFIX}learnpress_sections...", file=sys.stderr)
    sections_by_course = {cid: [] for cid in COURSE_IDS}
    for cols, blob in stream_inserts_for_table(
        DUMP_PATH, f"{PREFIX}learnpress_sections"
    ):
        idx = {c: i for i, c in enumerate(cols)}
        for row in parse_values_tuples(blob):
            try:
                sec_course_id = int(row[idx["section_course_id"]])
            except (TypeError, ValueError):
                continue
            if sec_course_id in course_ids_set:
                sections_by_course[sec_course_id].append(
                    {
                        "section_id": int(row[idx["section_id"]]),
                        "section_name": row[idx["section_name"]] or "",
                        "section_order": int(row[idx["section_order"]] or 0),
                    }
                )

    section_ids_set = {
        s["section_id"] for secs in sections_by_course.values() for s in secs
    }
    print(
        f"  → found {sum(len(v) for v in sections_by_course.values())} sections "
        f"({len(section_ids_set)} unique IDs)",
        file=sys.stderr,
    )

    # ----- 2. Section items for those sections -----
    print(f"Pass 2: scanning {PREFIX}learnpress_section_items...", file=sys.stderr)
    items_by_section = {sid: [] for sid in section_ids_set}
    for cols, blob in stream_inserts_for_table(
        DUMP_PATH, f"{PREFIX}learnpress_section_items"
    ):
        idx = {c: i for i, c in enumerate(cols)}
        for row in parse_values_tuples(blob):
            try:
                sid = int(row[idx["section_id"]])
            except (TypeError, ValueError):
                continue
            if sid not in section_ids_set:
                continue
            item_type = row[idx["item_type"]]
            if item_type != "lp_lesson":
                continue
            items_by_section[sid].append(
                {
                    "item_id": int(row[idx["item_id"]]),
                    "item_order": int(row[idx["item_order"]] or 0),
                }
            )

    lesson_post_ids = {
        it["item_id"] for items in items_by_section.values() for it in items
    }
    print(
        f"  → found {sum(len(v) for v in items_by_section.values())} lesson items "
        f"({len(lesson_post_ids)} unique post IDs)",
        file=sys.stderr,
    )

    # ----- 3. Postmeta for course thumbnails -----
    print(
        f"Pass 3: scanning {PREFIX}postmeta for _thumbnail_id of courses...",
        file=sys.stderr,
    )
    course_thumbnail_attachment_id = {}
    for cols, blob in stream_inserts_for_table(DUMP_PATH, f"{PREFIX}postmeta"):
        idx = {c: i for i, c in enumerate(cols)}
        for row in parse_values_tuples(blob):
            try:
                pid = int(row[idx["post_id"]])
            except (TypeError, ValueError):
                continue
            if pid not in course_ids_set:
                continue
            if row[idx["meta_key"]] == "_thumbnail_id":
                try:
                    course_thumbnail_attachment_id[pid] = int(row[idx["meta_value"]])
                except (TypeError, ValueError):
                    pass

    attachment_ids = set(course_thumbnail_attachment_id.values())
    print(
        f"  → found thumbnails for {len(course_thumbnail_attachment_id)} courses "
        f"(attachments: {sorted(attachment_ids)})",
        file=sys.stderr,
    )

    # ----- 4. Posts for courses, lessons, and attachments -----
    needed_post_ids = course_ids_set | lesson_post_ids | attachment_ids
    print(
        f"Pass 4: scanning {PREFIX}posts for {len(needed_post_ids)} post IDs...",
        file=sys.stderr,
    )
    posts = {}
    for cols, blob in stream_inserts_for_table(DUMP_PATH, f"{PREFIX}posts"):
        idx = {c: i for i, c in enumerate(cols)}
        for row in parse_values_tuples(blob):
            try:
                pid = int(row[idx["ID"]])
            except (TypeError, ValueError):
                continue
            if pid not in needed_post_ids:
                continue
            posts[pid] = {
                "ID": pid,
                "post_title": row[idx["post_title"]] or "",
                "post_name": row[idx["post_name"]] or "",
                "post_content": row[idx["post_content"]] or "",
                "guid": row[idx["guid"]] or "",
                "post_type": row[idx["post_type"]] or "",
            }
    print(f"  → resolved {len(posts)}/{len(needed_post_ids)} posts", file=sys.stderr)

    return {
        "sections_by_course": sections_by_course,
        "items_by_section": items_by_section,
        "course_thumbnail_attachment_id": course_thumbnail_attachment_id,
        "posts": posts,
    }


# ---------------------------------------------------------------------------
# Build output
# ---------------------------------------------------------------------------
def build_output(data):
    sections_by_course = data["sections_by_course"]
    items_by_section = data["items_by_section"]
    course_thumb = data["course_thumbnail_attachment_id"]
    posts = data["posts"]

    courses_out = []
    summary_lines = []

    found_courses = 0
    total_lessons = 0
    sample_pdfs = []

    for cid in COURSE_IDS:
        course_post = posts.get(cid)
        if not course_post:
            summary_lines.append(f"Course {cid}: MISSING from posts table — skipped")
            continue
        found_courses += 1

        title = course_post["post_title"]
        slug = course_post["post_name"]
        description = course_post["post_content"]
        subject_slug = derive_subject_slug(title)

        cover_image = None
        att_id = course_thumb.get(cid)
        if att_id and att_id in posts:
            cover_image = posts[att_id]["guid"] or None

        # Build lessons
        secs = sorted(
            sections_by_course.get(cid, []),
            key=lambda s: (s["section_order"], s["section_id"]),
        )

        lesson_entries = []
        for sec in secs:
            items = sorted(
                items_by_section.get(sec["section_id"], []),
                key=lambda it: (it["item_order"], it["item_id"]),
            )
            for it in items:
                lesson_post = posts.get(it["item_id"])
                if not lesson_post:
                    continue
                content_html = lesson_post["post_content"] or ""
                pdf_url = extract_pdf_url(content_html)

                if pdf_url:
                    content_type = "pdf"
                    content_field = None
                    if len(sample_pdfs) < 3:
                        sample_pdfs.append(pdf_url)
                else:
                    content_type = "text"
                    content_field = content_html

                lesson_entries.append(
                    {
                        "wp_id": it["item_id"],
                        "section_name": sec["section_name"],
                        "title": lesson_post["post_title"],
                        "content_type": content_type,
                        "pdf_url": pdf_url,
                        "content": content_field,
                    }
                )

        # Assign global order
        for i, lesson in enumerate(lesson_entries, start=1):
            lesson["order"] = i
            # reorder keys for output
        lesson_entries = [
            {
                "wp_id": le["wp_id"],
                "order": le["order"],
                "section_name": le["section_name"],
                "title": le["title"],
                "content_type": le["content_type"],
                "pdf_url": le["pdf_url"],
                "content": le["content"],
            }
            for le in lesson_entries
        ]

        pdf_count = sum(1 for le in lesson_entries if le["content_type"] == "pdf")
        text_count = len(lesson_entries) - pdf_count
        total_lessons += len(lesson_entries)

        summary_lines.append(
            f"Course {cid} ({title}): {len(secs)} sections, "
            f"{len(lesson_entries)} lessons ({pdf_count} PDF, {text_count} text)"
        )

        courses_out.append(
            {
                "wp_id": cid,
                "title": title,
                "slug": slug,
                "subject_slug": subject_slug,
                "description_html": description,
                "cover_image": cover_image,
                "is_free": True,
                "lessons": [{**le, "is_free": True} for le in lesson_entries],
            }
        )

    return courses_out, summary_lines, found_courses, total_lessons, sample_pdfs


def main():
    if not DUMP_PATH.exists():
        print(f"ERROR: dump not found: {DUMP_PATH}", file=sys.stderr)
        sys.exit(1)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    data = collect_data()
    courses_out, summary_lines, found_courses, total_lessons, sample_pdfs = (
        build_output(data)
    )

    payload = {"courses": courses_out}
    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Found {found_courses}/{len(COURSE_IDS)} courses")
    for line in summary_lines:
        print(line)
    print(f"Total lessons: {total_lessons}")
    if sample_pdfs:
        print("Sample PDF URLs:")
        for u in sample_pdfs:
            print(f"  - {u}")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
