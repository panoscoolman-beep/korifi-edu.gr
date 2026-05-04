import type { MetadataRoute } from "next";
import {
  getAllPublishedPageSlugs, getAllPublishedArticleSlugs,
  getPublishedEvents, getCourses, getPublishedAlbums,
} from "@/lib/queries";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

// Reserved by dedicated route files — exclude from /[slug] expansion.
const RESERVED_SLUGS = new Set([
  "gia-emas", "courses", "lessons",
  "blog", "events", "synergates", "gallery",
  "login", "register", "dashboard", "admin",
]);

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Top-level static routes (high priority)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/gia-emas`,                       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/epikoinonia`,                    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/online-mathimata`,               lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/epaggelmatikos-prosanatolismos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/courses`,                        lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/blog`,                           lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/events`,                         lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/gallery`,                        lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/synergates`,                     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // Grade pages (served via [slug])
    { url: `${BASE_URL}/gimnasio`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/alikeiou`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blikeiou`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/glikeiou`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/epal`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const [pageSlugs, articleSlugs, events, courses, albums] = await Promise.all([
    getAllPublishedPageSlugs(),
    getAllPublishedArticleSlugs(),
    getPublishedEvents(),
    getCourses(),
    getPublishedAlbums(),
  ]);

  // Avoid duplicating slugs already in staticRoutes (gimnasio, alikeiou, etc.)
  const staticSlugSet = new Set(staticRoutes.map((r) => r.url.replace(`${BASE_URL}/`, "")));

  const dynamicPages: MetadataRoute.Sitemap = pageSlugs
    .filter((s) => !RESERVED_SLUGS.has(s) && !staticSlugSet.has(s))
    .map((slug) => ({
      url: `${BASE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const articles: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.slug}`,
    lastModified: e.starts_at ? new Date(e.starts_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const albumPages: MetadataRoute.Sitemap = albums.map((a) => ({
    url: `${BASE_URL}/gallery/${a.slug}`,
    lastModified: a.event_date ? new Date(a.event_date) : now,
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...dynamicPages,
    ...articles,
    ...eventPages,
    ...coursePages,
    ...albumPages,
  ];
}
