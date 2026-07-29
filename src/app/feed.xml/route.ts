import { getPublishedArticles } from "@/lib/queries";

/**
 * RSS 2.0 feed για τα άρθρα του blog.
 *
 * Προαιρετικά query parameters για date range (φίλτρο στο published_at):
 *   /feed.xml?from=2026-07-01           — άρθρα από 1/7/2026 και μετά
 *   /feed.xml?to=2026-07-31             — άρθρα έως 31/7/2026 (inclusive)
 *   /feed.xml?from=2026-01-01&to=2026-06-30
 * Άκυρες ημερομηνίες αγνοούνται σιωπηλά (το feed επιστρέφει χωρίς το φίλτρο).
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseDate(v: string | null, endOfDay = false): Date | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  if (endOfDay && DATE_ONLY.test(v)) d.setUTCHours(23, 59, 59, 999);
  return d;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"), true);

  const articles = await getPublishedArticles();
  const filtered = articles.filter((a) => {
    if (!a.published_at) return false;
    const d = new Date(a.published_at);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

  const items = filtered
    .map((a) => {
      const url = `${BASE_URL}/blog/${a.slug}`;
      return [
        "    <item>",
        `      <title>${esc(a.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        a.excerpt ? `      <description>${esc(a.excerpt)}</description>` : null,
        a.author_name ? `      <dc:creator>${esc(a.author_name)}</dc:creator>` : null,
        `      <pubDate>${new Date(a.published_at!).toUTCString()}</pubDate>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuild = filtered.length
    ? new Date(filtered[0].published_at!).toUTCString()
    : undefined;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Φροντιστήριο Κορυφή — Blog</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Νέα, άρθρα και οδηγοί για μαθητές και γονείς από το Φροντιστήριο Κορυφή — Καλλονή Λέσβου.</description>
    <language>el</language>${lastBuild ? `\n    <lastBuildDate>${lastBuild}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
