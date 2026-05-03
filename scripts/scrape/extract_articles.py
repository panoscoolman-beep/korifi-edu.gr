"""Extract published WordPress posts from a SQL dump and convert to Supabase-ready JSON.

Reads the mysqldump at C:/Users/panos/Desktop/projects/_korifi-edu.gr/itinacn_db1.sql,
walks INSERT statements for tables 5yajF_users, 5yajF_postmeta, 5yajF_posts using a
streaming line-by-line scan, parses each row with a custom MySQL VALUES tokenizer
(quote/backslash-aware), filters posts to post_type='post' AND post_status='publish'
with non-empty content, converts post HTML to clean Markdown, and writes
articles.json next to this script.
"""

from __future__ import annotations

import html
import io
import json
import re
import sys
import unicodedata
import urllib.parse
from pathlib import Path
from typing import Iterator, List, Optional

from bs4 import BeautifulSoup, NavigableString, Tag

DUMP_PATH = Path(r"C:/Users/panos/Desktop/projects/_korifi-edu.gr/itinacn_db1.sql")
OUT_PATH = Path(r"C:/Users/panos/Desktop/projects/korifi-edu.gr/scripts/scrape/articles.json")

PREFIX = "5yajF_"
POSTS_INSERT = f"INSERT INTO `{PREFIX}posts`"
USERS_INSERT = f"INSERT INTO `{PREFIX}users`"
POSTMETA_INSERT = f"INSERT INTO `{PREFIX}postmeta`"

# Column order from CREATE TABLE statements.
POSTS_COLS = [
    "ID", "post_author", "post_date", "post_date_gmt", "post_content", "post_title",
    "post_excerpt", "post_status", "comment_status", "ping_status", "post_password",
    "post_name", "to_ping", "pinged", "post_modified", "post_modified_gmt",
    "post_content_filtered", "post_parent", "guid", "menu_order", "post_type",
    "post_mime_type", "comment_count",
]
USERS_COLS = [
    "ID", "user_login", "user_pass", "user_nicename", "user_email", "user_url",
    "user_registered", "user_activation_key", "user_status", "display_name",
]
POSTMETA_COLS = ["meta_id", "post_id", "meta_key", "meta_value"]


# ---------------------------------------------------------------------------
# SQL VALUES tokenizer
# ---------------------------------------------------------------------------

def parse_values_tuples(values_text: str) -> Iterator[List]:
    """Yield each (...) tuple from the VALUES portion of a mysqldump INSERT.

    Handles MySQL string escaping: \\\\, \\', \\", \\n, \\r, \\t, \\0, \\Z, \\b.
    Returns Python None for SQL NULL, str for quoted strings, int/float for numerics.
    """
    i = 0
    n = len(values_text)
    while i < n:
        # Find the next opening paren of a tuple.
        while i < n and values_text[i] != "(":
            i += 1
        if i >= n:
            return
        i += 1  # past '('
        row: List = []
        while True:
            # skip whitespace
            while i < n and values_text[i] in " \t\r\n":
                i += 1
            if i >= n:
                return
            ch = values_text[i]
            if ch == "'":
                # quoted string
                i += 1
                buf: List[str] = []
                while i < n:
                    c = values_text[i]
                    if c == "\\" and i + 1 < n:
                        nxt = values_text[i + 1]
                        if nxt == "n":
                            buf.append("\n")
                        elif nxt == "r":
                            buf.append("\r")
                        elif nxt == "t":
                            buf.append("\t")
                        elif nxt == "0":
                            buf.append("\x00")
                        elif nxt == "Z":
                            buf.append("\x1a")
                        elif nxt == "b":
                            buf.append("\b")
                        elif nxt == "\\":
                            buf.append("\\")
                        elif nxt == "'":
                            buf.append("'")
                        elif nxt == '"':
                            buf.append('"')
                        else:
                            buf.append(nxt)
                        i += 2
                        continue
                    if c == "'":
                        # Could be doubled '' (rare in mysqldump but supported).
                        if i + 1 < n and values_text[i + 1] == "'":
                            buf.append("'")
                            i += 2
                            continue
                        i += 1
                        break
                    buf.append(c)
                    i += 1
                row.append("".join(buf))
            else:
                # NULL or numeric literal — read until ',' or ')'
                start = i
                while i < n and values_text[i] not in ",)":
                    i += 1
                tok = values_text[start:i].strip()
                if tok.upper() == "NULL" or tok == "":
                    row.append(None)
                else:
                    try:
                        if "." in tok or "e" in tok.lower():
                            row.append(float(tok))
                        else:
                            row.append(int(tok))
                    except ValueError:
                        row.append(tok)
            # skip whitespace
            while i < n and values_text[i] in " \t\r\n":
                i += 1
            if i >= n:
                return
            if values_text[i] == ",":
                i += 1
                continue
            if values_text[i] == ")":
                i += 1
                yield row
                # find separator after tuple: ',' or ';' (terminator)
                while i < n and values_text[i] in " \t\r\n":
                    i += 1
                if i < n and values_text[i] == ",":
                    i += 1
                break


def stream_inserts(path: Path, prefix: str) -> Iterator[str]:
    """Yield each INSERT statement that begins with `prefix` as a single string.

    Statements may span many lines; this accumulates until the terminating ';\n'.
    """
    with io.open(path, "r", encoding="utf-8", errors="replace") as f:
        buf: List[str] = []
        in_stmt = False
        for line in f:
            if not in_stmt:
                if line.startswith(prefix):
                    in_stmt = True
                    buf = [line]
                    if line.rstrip().endswith(";"):
                        yield "".join(buf)
                        buf = []
                        in_stmt = False
            else:
                buf.append(line)
                if line.rstrip().endswith(";"):
                    yield "".join(buf)
                    buf = []
                    in_stmt = False


def extract_values_section(stmt: str) -> str:
    """Return everything after the first 'VALUES' keyword, trimming trailing ';'."""
    idx = stmt.find("VALUES")
    if idx < 0:
        return ""
    body = stmt[idx + len("VALUES"):]
    body = body.rstrip()
    if body.endswith(";"):
        body = body[:-1]
    return body


def rows_for(table_prefix_insert: str, columns: List[str]) -> Iterator[dict]:
    for stmt in stream_inserts(DUMP_PATH, table_prefix_insert):
        body = extract_values_section(stmt)
        for tup in parse_values_tuples(body):
            if len(tup) != len(columns):
                # Defensive: skip malformed rows.
                continue
            yield dict(zip(columns, tup))


# ---------------------------------------------------------------------------
# HTML -> Markdown conversion
# ---------------------------------------------------------------------------

# Strip WordPress / page-builder shortcodes.
SHORTCODE_PATTERNS = [
    re.compile(r"\[/?caption[^\]]*\]", re.I),
    re.compile(r"\[gallery[^\]]*\]", re.I),
    re.compile(r"\[/?embed[^\]]*\]", re.I),
    re.compile(r"\[/?vc_[^\]]*\]", re.I),
    re.compile(r"\[/?et_pb_[^\]]*\]", re.I),
]


def strip_shortcodes(s: str) -> str:
    for p in SHORTCODE_PATTERNS:
        s = p.sub("", s)
    return s


def url_encode_path(url: str) -> str:
    """Replace test.itin.gr -> korifi-edu.gr and percent-encode non-ASCII path/query."""
    if not url:
        return url
    url = url.replace("test.itin.gr", "korifi-edu.gr")
    # Encode non-ASCII characters (Greek) safely while keeping URL structure.
    try:
        parts = urllib.parse.urlsplit(url)
        # quote path with safe URL chars
        path = urllib.parse.quote(parts.path, safe="/-._~%!$&'()*+,;=:@")
        query = urllib.parse.quote(parts.query, safe="=&%-._~!$'()*+,;:@/?")
        return urllib.parse.urlunsplit((parts.scheme, parts.netloc, path, query, parts.fragment))
    except Exception:
        return url


def _emit_inline(node) -> str:
    """Render inline content (text + simple inline tags) for headings/list items."""
    if isinstance(node, NavigableString):
        return str(node)
    if not isinstance(node, Tag):
        return ""
    name = node.name.lower()
    inner = "".join(_emit_inline(c) for c in node.children).strip()
    if name in ("strong", "b"):
        return f"**{inner}**" if inner else ""
    if name in ("em", "i"):
        return f"*{inner}*" if inner else ""
    if name == "a":
        href = url_encode_path(node.get("href", "") or "")
        return f"[{inner}]({href})" if href else inner
    if name == "br":
        return "  \n"
    if name == "img":
        src = url_encode_path(node.get("src", "") or "")
        alt = (node.get("alt") or "").strip()
        return f"![{alt}]({src})" if src else ""
    if name == "code":
        return f"`{inner}`" if inner else ""
    return inner


def _emit_block(node, out: List[str]) -> None:
    if isinstance(node, NavigableString):
        text = str(node)
        if text.strip():
            out.append(text.strip())
        return
    if not isinstance(node, Tag):
        return
    name = node.name.lower()

    if name in ("script", "style", "noscript", "iframe"):
        return
    if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
        level = int(name[1])
        text = "".join(_emit_inline(c) for c in node.children).strip()
        if text:
            out.append(f"{'#' * level} {text}")
        return
    if name == "p":
        text = "".join(_emit_inline(c) for c in node.children).strip()
        if text:
            out.append(text)
        return
    if name == "br":
        return
    if name == "blockquote":
        inner_lines: List[str] = []
        for c in node.children:
            _emit_block(c, inner_lines)
        block_text = "\n\n".join(inner_lines).strip()
        if block_text:
            quoted = "\n".join(f"> {ln}" if ln else ">" for ln in block_text.splitlines())
            out.append(quoted)
        return
    if name == "ul":
        lines = []
        for li in node.find_all("li", recursive=False):
            text = "".join(_emit_inline(c) for c in li.children).strip()
            if text:
                lines.append(f"- {text}")
        if lines:
            out.append("\n".join(lines))
        return
    if name == "ol":
        lines = []
        idx = 1
        for li in node.find_all("li", recursive=False):
            text = "".join(_emit_inline(c) for c in li.children).strip()
            if text:
                lines.append(f"{idx}. {text}")
                idx += 1
        if lines:
            out.append("\n".join(lines))
        return
    if name == "img":
        src = url_encode_path(node.get("src", "") or "")
        alt = (node.get("alt") or "").strip()
        if src:
            out.append(f"![{alt}]({src})")
        return
    if name == "a":
        # Standalone anchor at block level.
        text = "".join(_emit_inline(c) for c in node.children).strip()
        href = url_encode_path(node.get("href", "") or "")
        if href and text:
            out.append(f"[{text}]({href})")
        elif text:
            out.append(text)
        return
    if name == "hr":
        out.append("---")
        return
    if name == "figure":
        # Render any child img + figcaption.
        for c in node.children:
            _emit_block(c, out)
        return
    if name == "figcaption":
        text = "".join(_emit_inline(c) for c in node.children).strip()
        if text:
            out.append(f"*{text}*")
        return

    # Generic container (div, span, section, article, figure-like wrappers).
    # If the container has any block-level children, recurse into each.
    block_children = [c for c in node.children if isinstance(c, Tag) and c.name.lower() in (
        "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote",
        "div", "section", "article", "figure", "img", "hr", "table",
    )]
    if block_children:
        for c in node.children:
            _emit_block(c, out)
        return
    # Otherwise treat as a paragraph.
    text = "".join(_emit_inline(c) for c in node.children).strip()
    if text:
        out.append(text)


def html_to_markdown(raw_html: str) -> str:
    s = strip_shortcodes(raw_html or "")
    # WP often uses bare newlines as paragraph separators ("autop"). Convert
    # double-newlines to <p>...</p> so BeautifulSoup parses paragraphs cleanly.
    if "<p" not in s and "<div" not in s:
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", s) if p.strip()]
        s = "\n".join(f"<p>{p}</p>" for p in paragraphs)
    soup = BeautifulSoup(s, "html.parser")
    blocks: List[str] = []
    root = soup.body or soup
    for child in root.children:
        _emit_block(child, blocks)
    md = "\n\n".join(b for b in blocks if b and b.strip())
    md = html.unescape(md)
    # Collapse 3+ blank lines.
    md = re.sub(r"\n{3,}", "\n\n", md)
    # Normalize odd unicode whitespace.
    md = md.replace("\xa0", " ")
    return md.strip()


# ---------------------------------------------------------------------------
# Slug utilities
# ---------------------------------------------------------------------------

GREEK_TRANSLIT = {
    "α": "a", "ά": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "έ": "e",
    "ζ": "z", "η": "i", "ή": "i", "θ": "th", "ι": "i", "ί": "i", "ϊ": "i", "ΐ": "i",
    "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o", "ό": "o",
    "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "y", "ύ": "y",
    "ϋ": "y", "ΰ": "y", "φ": "f", "χ": "ch", "ψ": "ps", "ω": "o", "ώ": "o",
}


def transliterate_greek(text: str) -> str:
    out = []
    for ch in text:
        lower = ch.lower()
        if lower in GREEK_TRANSLIT:
            mapped = GREEK_TRANSLIT[lower]
            out.append(mapped.upper() if ch.isupper() else mapped)
        else:
            out.append(ch)
    # Drop remaining diacritics on latin chars.
    out_str = unicodedata.normalize("NFKD", "".join(out))
    out_str = "".join(c for c in out_str if not unicodedata.combining(c))
    return out_str


def to_ascii_slug(s: str) -> str:
    s = transliterate_greek(s)
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def has_non_ascii(s: str) -> bool:
    try:
        s.encode("ascii")
        return False
    except UnicodeEncodeError:
        return True


def html_to_plain_text(raw_html: str) -> str:
    soup = BeautifulSoup(strip_shortcodes(raw_html or ""), "html.parser")
    text = soup.get_text(separator=" ")
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]

    # 1. Users -> id -> display_name
    print("Reading users...", flush=True)
    users: dict[int, str] = {}
    for row in rows_for(USERS_INSERT, USERS_COLS):
        users[int(row["ID"])] = row["display_name"] or row["user_login"] or ""
    print(f"  {len(users)} users", flush=True)

    # Author overrides per spec.
    AUTHOR_OVERRIDE = {
        1: "Παναγιώτης Κουλμανδάς",
        3: "Παναγιώτης Κουλμανδάς",
        8: "Ιωάννα Μ. Κεφάλα",
    }

    # 2. Postmeta -> _thumbnail_id by post_id, and attachment guids by post_id.
    # We also need attachment URLs: attachments live in 5yajF_posts with
    # post_type='attachment' and their URL is in the `guid` column.
    print("Reading postmeta (_thumbnail_id only)...", flush=True)
    thumbnail_for: dict[int, int] = {}
    attached_file_for: dict[int, str] = {}
    for row in rows_for(POSTMETA_INSERT, POSTMETA_COLS):
        key = row.get("meta_key")
        if key == "_thumbnail_id":
            try:
                thumbnail_for[int(row["post_id"])] = int(row["meta_value"])
            except (TypeError, ValueError):
                pass
        elif key == "_wp_attached_file":
            try:
                attached_file_for[int(row["post_id"])] = str(row["meta_value"])
            except (TypeError, ValueError):
                pass
    print(f"  {len(thumbnail_for)} thumbnail mappings, "
          f"{len(attached_file_for)} attachment paths", flush=True)

    # 3. Read posts in two passes:
    #    pass A: gather attachment guids so we can resolve cover images.
    #    pass B: gather actual published 'post' rows.
    print("Reading posts (pass 1: attachments)...", flush=True)
    attachment_guid: dict[int, str] = {}
    candidates: list[dict] = []
    for row in rows_for(POSTS_INSERT, POSTS_COLS):
        try:
            pid = int(row["ID"])
        except (TypeError, ValueError):
            continue
        ptype = row.get("post_type")
        if ptype == "attachment":
            guid = row.get("guid") or ""
            if guid:
                attachment_guid[pid] = guid
        elif ptype == "post" and row.get("post_status") == "publish":
            candidates.append(row)
    print(f"  {len(attachment_guid)} attachments, "
          f"{len(candidates)} candidate published posts", flush=True)

    # 4. Build article objects.
    articles: list[dict] = []
    skipped: list[tuple[int, str, str]] = []
    for row in candidates:
        pid = int(row["ID"])
        raw_html = row.get("post_content") or ""
        # Skip empty (after shortcodes removed and whitespace trimmed).
        plain_check = html_to_plain_text(raw_html)
        if not plain_check:
            skipped.append((pid, row.get("post_title") or "", "empty content"))
            continue

        title = html.unescape(row.get("post_title") or "").strip()
        post_name = row.get("post_name") or ""
        slug_original = urllib.parse.unquote(post_name)
        slug_ascii = to_ascii_slug(slug_original) if slug_original else ""
        if has_non_ascii(slug_original) and not slug_ascii:
            slug_ascii = to_ascii_slug(title)
        # If slug_original is already pure ASCII slug, mirror it.
        if not has_non_ascii(slug_original) and slug_original:
            slug_ascii = slug_ascii or slug_original

        # Excerpt
        excerpt_raw = (row.get("post_excerpt") or "").strip()
        if excerpt_raw:
            excerpt = html.unescape(excerpt_raw)
        else:
            plain = html_to_plain_text(raw_html)
            excerpt = plain[:200].rstrip()
            if len(plain) > 200:
                excerpt += "..."

        content_md = html_to_markdown(raw_html)

        # Cover image lookup.
        cover_image: Optional[str] = None
        thumb_id = thumbnail_for.get(pid)
        if thumb_id:
            guid = attachment_guid.get(thumb_id)
            if guid:
                cover_image = url_encode_path(guid)
            else:
                # Fall back to _wp_attached_file (relative path).
                rel = attached_file_for.get(thumb_id)
                if rel:
                    cover_image = url_encode_path(
                        f"https://korifi-edu.gr/wp-content/uploads/{rel}"
                    )

        try:
            author_id = int(row.get("post_author") or 0)
        except (TypeError, ValueError):
            author_id = 0
        author_name = AUTHOR_OVERRIDE.get(author_id) or users.get(author_id) or "Unknown"

        post_date = row.get("post_date") or ""
        # Convert "YYYY-MM-DD HH:MM:SS" to ISO 8601.
        if post_date and " " in post_date:
            published_at = post_date.replace(" ", "T")
        else:
            published_at = post_date

        articles.append({
            "slug_original": slug_original,
            "slug_ascii": slug_ascii,
            "title": title,
            "excerpt": excerpt,
            "content_md": content_md,
            "cover_image": cover_image,
            "author_name": author_name,
            "author_id": author_id,
            "published_at": published_at,
            "is_published": True,
        })

    # Sort by published_at desc for readability.
    articles.sort(key=lambda a: a.get("published_at") or "", reverse=True)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    size = OUT_PATH.stat().st_size
    print(f"\nWrote {len(articles)} articles to {OUT_PATH} ({size} bytes)", flush=True)
    print(f"Skipped {len(skipped)} candidates", flush=True)

    # Stats for reporting.
    if articles:
        lengths = sorted(len(a["content_md"]) for a in articles)
        n = len(lengths)
        median = lengths[n // 2]
        print(f"\ncontent_md char count: min={lengths[0]} median={median} max={lengths[-1]}",
              flush=True)
        print("\nSample titles + dates:", flush=True)
        for a in articles[:5]:
            print(f"  {a['published_at']} - {a['title'][:80]}", flush=True)
        print("\nSample 200 chars of first article content_md:", flush=True)
        print(articles[0]["content_md"][:200], flush=True)
        print("\nAuthor breakdown:", flush=True)
        from collections import Counter
        for name, count in Counter(a["author_name"] for a in articles).most_common():
            print(f"  {count:3d}  {name}", flush=True)

    if skipped:
        print(f"\nFirst skipped ({min(10, len(skipped))} of {len(skipped)}):", flush=True)
        for pid, t, reason in skipped[:10]:
            print(f"  id={pid} reason={reason} title={t[:60]!r}", flush=True)


if __name__ == "__main__":
    main()
