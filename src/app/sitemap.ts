import type { MetadataRoute } from "next";
import {
  getSitemapPages, getSitemapArticles,
  getPublishedEvents, getCourses, getPublishedAlbums,
} from "@/lib/queries";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

// Reserved by dedicated route files — exclude from /[slug] expansion.
const RESERVED_SLUGS = new Set([
  "gia-emas", "courses", "lessons",
  "blog", "events", "synergates", "gallery", "martyries", "ergaleia",
  "login", "register", "dashboard", "admin",
]);

/**
 * Σταθερό lastmod για τις ΣΤΑΤΙΚΕΣ (code-defined) σελίδες.
 * ΜΗΝ το κάνεις `new Date()` — αν το lastmod «φρεσκάρεται» σε κάθε deploy χωρίς
 * πραγματική αλλαγή περιεχομένου, η Google μαθαίνει να αγνοεί το σήμα.
 * Bump ΧΕΙΡΟΚΙΝΗΤΑ μόνο όταν αλλάζει ουσιαστικά κάποια στατική σελίδα.
 * (Τελευταίο bump: 2026-07-29 — νέο hero «Εγγραφές 2026-27» + nav link Λέσβου.)
 */
const STATIC_LASTMOD = new Date("2026-07-29");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Top-level static routes (high priority)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                              lastModified: STATIC_LASTMOD, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/gia-emas`,                       lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/epikoinonia`,                    lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/online-mathimata`,               lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/epaggelmatikos-prosanatolismos`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/courses`,                        lastModified: STATIC_LASTMOD, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/ergaleia`,                       lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`,                           lastModified: STATIC_LASTMOD, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/events`,                         lastModified: STATIC_LASTMOD, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/gallery`,                        lastModified: STATIC_LASTMOD, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/martyries`,                      lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/synergates`,                     lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    // Grade pages (served via [slug])
    { url: `${BASE_URL}/gimnasio`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/alikeiou`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blikeiou`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/glikeiou`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/epal`,     lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
  ];

  const [pages, articles, events, courses, albums] = await Promise.all([
    getSitemapPages(),
    getSitemapArticles(),
    getPublishedEvents(),
    getCourses(),
    getPublishedAlbums(),
  ]);

  // Avoid duplicating slugs already in staticRoutes (gimnasio, alikeiou, etc.)
  const staticSlugSet = new Set(staticRoutes.map((r) => r.url.replace(`${BASE_URL}/`, "")));

  // CMS pages — πραγματικό updated_at από τη βάση.
  const dynamicPages: MetadataRoute.Sitemap = pages
    .filter((p) => !RESERVED_SLUGS.has(p.slug) && !staticSlugSet.has(p.slug))
    .map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Blog — πραγματικό updated_at από τη βάση.
  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : STATIC_LASTMOD,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.slug}`,
    lastModified: e.starts_at ? new Date(e.starts_at) : STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.slug}`,
    lastModified: c.created_at ? new Date(c.created_at) : STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const albumPages: MetadataRoute.Sitemap = albums.map((a) => ({
    url: `${BASE_URL}/gallery/${a.slug}`,
    lastModified: a.event_date ? new Date(a.event_date) : STATIC_LASTMOD,
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...dynamicPages,
    ...articlePages,
    ...eventPages,
    ...coursePages,
    ...albumPages,
  ];
}
