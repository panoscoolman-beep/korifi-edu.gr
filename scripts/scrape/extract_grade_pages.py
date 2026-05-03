"""
Extract clean Markdown content from the 5 grade-level pages of korifi-edu.gr
and emit a single JSON file ready for insertion into the Supabase `pages` table.

Input:  raw/{slug}.html   (already downloaded)
Output: grade_pages.json
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag
import html2text

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

HERE = Path(__file__).resolve().parent
RAW_DIR = HERE / "raw"
OUTPUT = HERE / "grade_pages.json"

PAGES: list[dict[str, Any]] = [
    {"slug": "gimnasio",  "title": "Γυμνάσιο",                    "sort_order": 10},
    {"slug": "alikeiou",  "title": "Α' Λυκείου",                  "sort_order": 20},
    {"slug": "blikeiou",  "title": "Β' Λυκείου",                  "sort_order": 30},
    {"slug": "glikeiou",  "title": "Γ' Λυκείου & Πανελλήνιες",   "sort_order": 40},
    {"slug": "epal",      "title": "ΕΠΑΛ",                         "sort_order": 50},
]

# CSS class fragments that mark non-content regions (headers, footers, popups,
# teacher-card grids, cookie banners, etc.). Any element whose class list
# contains one of these substrings is dropped before conversion.
NOISE_CLASS_FRAGMENTS = (
    "elementor-location-header",
    "elementor-location-footer",
    "elementor-location-popup",
    "wp-admin-bar",
    "cookie",
    "back-to-top",
    "share",
    "social",
    "sidebar",
    "screen-reader-text",
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def find_main_content(soup: BeautifulSoup) -> Tag | None:
    """The grade pages are built with Elementor. The page body has several
    top-level `<div class="elementor ...">` siblings: header, main content,
    footer, and a stack of popups. The main content is the only one whose
    class list does NOT contain `elementor-location-...`.
    """
    for div in soup.body.find_all(
        "div", class_=lambda c: c and "elementor" in c,
        recursive=False,
    ):
        classes = " ".join(div.get("class", []))
        if "elementor-location-" in classes:
            continue
        return div
    return None


def strip_noise(root: Tag) -> None:
    """Remove obvious non-content tags + classes from the subtree in-place."""
    # Tags that are never editorial content.
    for tag in root.find_all(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()

    # Class-based filtering.
    for el in root.find_all(class_=True):
        classes = " ".join(el.get("class", []))
        if any(frag in classes for frag in NOISE_CLASS_FRAGMENTS):
            el.decompose()


def looks_like_paragraph_misused_as_heading(tag: Tag) -> bool:
    """The Elementor pages put body paragraphs inside `<h2>` tags. A real
    heading is short; if the text is long, treat it as a paragraph."""
    if tag.name not in ("h2", "h3", "h4"):
        return False
    text = tag.get_text(" ", strip=True)
    return len(text) > 120 or text.count(".") >= 2


def downgrade_misused_headings(root: Tag) -> None:
    for h in list(root.find_all(["h2", "h3", "h4"])):
        if looks_like_paragraph_misused_as_heading(h):
            h.name = "p"


def collect_images(root: Tag, base_url: str = "https://korifi-edu.gr") -> list[dict[str, str]]:
    images: list[dict[str, str]] = []
    seen: set[str] = set()
    for img in root.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src or src.startswith("data:"):
            continue
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            src = base_url.rstrip("/") + src
        if src in seen:
            continue
        seen.add(src)
        images.append({"url": src, "alt": img.get("alt", "") or ""})
    return images


def html_to_markdown(root: Tag) -> str:
    converter = html2text.HTML2Text()
    converter.body_width = 0          # disable hard wrapping
    converter.ignore_links = False
    converter.ignore_images = False
    converter.protect_links = True
    converter.unicode_snob = True
    converter.single_line_break = False
    converter.skip_internal_links = True
    converter.escape_snob = False     # don't escape every special char
    md = converter.handle(str(root))
    return md


def cleanup_markdown(md: str) -> str:
    # Decode any leftover HTML entities (html2text usually does this, but be safe)
    md = html.unescape(md)

    # Replace non-breaking spaces with regular spaces.
    md = md.replace(" ", " ").replace(" ", " ")

    # Collapse runs of 3+ blank lines into a single blank line.
    md = re.sub(r"\n{3,}", "\n\n", md)

    # Strip trailing whitespace per line.
    md = "\n".join(line.rstrip() for line in md.splitlines())

    # Drop leading/trailing blank lines.
    md = md.strip()

    # Drop lines that are JUST decorative dashes/underscores.
    md = "\n".join(
        ln for ln in md.splitlines()
        if not re.fullmatch(r"[\s_\-*]{2,}", ln)
    )

    # Re-collapse blank lines after the previous filter.
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def extract_meta_description(soup: BeautifulSoup, fallback_text: str) -> str:
    md = soup.find("meta", attrs={"name": "description"})
    if md and md.get("content"):
        return md["content"].strip()
    # Fallback: first 150 chars of plain text.
    text = re.sub(r"\s+", " ", fallback_text).strip()
    return text[:150]


def pick_cover_image(images: list[dict[str, str]]) -> str | None:
    """The grade pages have no explicit hero image in the main column; fall
    back to None when nothing in the content area looks like a cover."""
    for img in images:
        url = img["url"].lower()
        if any(skip in url for skip in ("logo", "icon", "favicon")):
            continue
        return img["url"]
    return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def process_page(meta: dict[str, Any]) -> dict[str, Any]:
    slug: str = meta["slug"]
    src_path = RAW_DIR / f"{slug}.html"
    with src_path.open(encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    main = find_main_content(soup)
    if main is None:
        raise RuntimeError(f"{slug}: could not locate main content container")

    strip_noise(main)
    downgrade_misused_headings(main)

    images = collect_images(main)
    cover = pick_cover_image(images)

    md = html_to_markdown(main)
    md = cleanup_markdown(md)

    meta_desc = extract_meta_description(soup, fallback_text=md)

    return {
        "slug": slug,
        "title": meta["title"],
        "content_md": md,
        "cover_image": cover,
        "meta_description": meta_desc,
        "sort_order": meta["sort_order"],
        "is_published": True,
        "images": images,
    }


def main() -> int:
    results = []
    for meta in PAGES:
        page = process_page(meta)
        results.append(page)
        print(
            f"{page['slug']:>10}: md={len(page['content_md']):>5} chars, "
            f"images={len(page['images'])}, cover={'yes' if page['cover_image'] else 'no'}"
        )

    OUTPUT.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nWrote {OUTPUT} ({len(results)} pages)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
