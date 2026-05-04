/**
 * Centralized cached query functions for public pages.
 *
 * Each query is wrapped with `unstable_cache` and tagged so admin mutations
 * can invalidate via `revalidateTag(<resource>)`. The cache lives at the
 * Next.js layer — Supabase is hit only when the cache is cold or after
 * a tag/path is revalidated.
 *
 * All queries use the cookieless `createPublicClient()` so pages that call
 * them remain prerenderable.
 *
 * Cache tags (kept in one place to avoid typos):
 *   articles, events, pages, teachers, testimonials,
 *   partners, subjects, courses, lessons, gallery_albums, gallery_photos
 */
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Subject, Course, Article, Page, Teacher, Testimonial, Partner,
  Event as EventModel, Lesson, GalleryAlbum, GalleryPhoto,
} from "@/types/database";

const HOUR = 3600;
const DAY  = 86400;

/* -------------------- Pages -------------------- */
export const getPageBySlug = unstable_cache(
  async (slug: string): Promise<Page | null> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Page) ?? null;
  },
  ["page-by-slug"],
  { tags: ["pages"], revalidate: HOUR }
);

export const getAllPublishedPageSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const sb = createPublicClient();
    const { data } = await sb.from("pages").select("slug").eq("is_published", true);
    return (data ?? []).map((p) => p.slug);
  },
  ["page-slugs"],
  { tags: ["pages"], revalidate: HOUR }
);

/* -------------------- Articles -------------------- */
export const getPublishedArticles = unstable_cache(
  async (limit?: number): Promise<Article[]> => {
    const sb = createPublicClient();
    let q = sb
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Article[]) ?? [];
  },
  ["articles-list"],
  { tags: ["articles"], revalidate: HOUR }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Article) ?? null;
  },
  ["article-by-slug"],
  { tags: ["articles"], revalidate: HOUR }
);

export const getAllPublishedArticleSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const sb = createPublicClient();
    const { data } = await sb.from("articles").select("slug").eq("is_published", true);
    return (data ?? []).map((a) => a.slug);
  },
  ["article-slugs"],
  { tags: ["articles"], revalidate: HOUR }
);

/* -------------------- Events -------------------- */
export const getPublishedEvents = unstable_cache(
  async (): Promise<EventModel[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("starts_at", { ascending: true, nullsFirst: false });
    return (data as EventModel[]) ?? [];
  },
  ["events-list"],
  { tags: ["events"], revalidate: 600 } // 10 min — more time-sensitive
);

export const getEventBySlug = unstable_cache(
  async (slug: string): Promise<EventModel | null> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as EventModel) ?? null;
  },
  ["event-by-slug"],
  { tags: ["events"], revalidate: 600 }
);

/* -------------------- Teachers -------------------- */
export const getPublishedTeachers = unstable_cache(
  async (limit?: number): Promise<Teacher[]> => {
    const sb = createPublicClient();
    let q = sb
      .from("teachers")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Teacher[]) ?? [];
  },
  ["teachers-list"],
  { tags: ["teachers"], revalidate: DAY }
);

/* -------------------- Subjects + Courses + Lessons -------------------- */
export const getSubjects = unstable_cache(
  async (): Promise<Subject[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("subjects")
      .select("id, name, slug, icon, order, created_at")
      .order("order", { ascending: true });
    return (data as Subject[]) ?? [];
  },
  ["subjects-list"],
  { tags: ["subjects"], revalidate: DAY }
);

export const getSubjectById = unstable_cache(
  async (id: string): Promise<Subject | null> => {
    const sb = createPublicClient();
    const { data } = await sb.from("subjects").select("*").eq("id", id).maybeSingle();
    return (data as Subject) ?? null;
  },
  ["subject-by-id"],
  { tags: ["subjects"], revalidate: DAY }
);

export const getCourses = unstable_cache(
  async (limit?: number): Promise<Course[]> => {
    const sb = createPublicClient();
    let q = sb.from("courses").select("*").order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Course[]) ?? [];
  },
  ["courses-list"],
  { tags: ["courses"], revalidate: HOUR }
);

/**
 * Courses that already have at least one lesson published — i.e., have actual
 * material the student can study. Used on the homepage so we don't promote
 * empty placeholders.
 */
export const getCoursesWithLessons = unstable_cache(
  async (limit?: number): Promise<Course[]> => {
    const sb = createPublicClient();
    // Inner-join trick: select courses where at least one lesson exists.
    // PostgREST: `lessons!inner(id)` requires at least one matching row.
    let q = sb
      .from("courses")
      .select("*, lessons!inner(id)")
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    if (!data) return [];
    // Strip the joined `lessons` array — we only needed it for filtering.
    return data.map(({ lessons: _l, ...rest }) => rest as Course);
  },
  ["courses-with-lessons"],
  { tags: ["courses", "lessons"], revalidate: HOUR }
);

export const getCourseBySlug = unstable_cache(
  async (slug: string): Promise<Course | null> => {
    const sb = createPublicClient();
    const { data } = await sb.from("courses").select("*").eq("slug", slug).maybeSingle();
    return (data as Course) ?? null;
  },
  ["course-by-slug"],
  { tags: ["courses"], revalidate: HOUR }
);

export const getCourseById = unstable_cache(
  async (id: string): Promise<Course | null> => {
    const sb = createPublicClient();
    const { data } = await sb.from("courses").select("*").eq("id", id).maybeSingle();
    return (data as Course) ?? null;
  },
  ["course-by-id"],
  { tags: ["courses"], revalidate: HOUR }
);

export const getLessonsByCourse = unstable_cache(
  async (courseId: string): Promise<Lesson[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order", { ascending: true });
    return (data as Lesson[]) ?? [];
  },
  ["lessons-by-course"],
  { tags: ["lessons"], revalidate: HOUR }
);

export const getLessonById = unstable_cache(
  async (id: string): Promise<Lesson | null> => {
    const sb = createPublicClient();
    const { data } = await sb.from("lessons").select("*").eq("id", id).maybeSingle();
    return (data as Lesson) ?? null;
  },
  ["lesson-by-id"],
  { tags: ["lessons"], revalidate: HOUR }
);

/* -------------------- Testimonials + Partners -------------------- */
export const getPublishedTestimonials = unstable_cache(
  async (limit?: number): Promise<Testimonial[]> => {
    const sb = createPublicClient();
    let q = sb
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Testimonial[]) ?? [];
  },
  ["testimonials-list"],
  { tags: ["testimonials"], revalidate: DAY }
);

export const getPublishedPartners = unstable_cache(
  async (): Promise<Partner[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("partners")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return (data as Partner[]) ?? [];
  },
  ["partners-list"],
  { tags: ["partners"], revalidate: DAY }
);

/* -------------------- Gallery -------------------- */
export const getPublishedAlbums = unstable_cache(
  async (): Promise<GalleryAlbum[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("gallery_albums")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: false, nullsFirst: false });
    return (data as GalleryAlbum[]) ?? [];
  },
  ["albums-list"],
  { tags: ["gallery_albums"], revalidate: HOUR }
);

export const getPhotoCountsByAlbum = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const sb = createPublicClient();
    const { data } = await sb.from("gallery_photos").select("album_id");
    const counts: Record<string, number> = {};
    for (const p of data ?? []) {
      const id = (p as { album_id: string }).album_id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  },
  ["photo-counts"],
  { tags: ["gallery_photos"], revalidate: HOUR }
);

export const getAlbumBySlug = unstable_cache(
  async (slug: string): Promise<GalleryAlbum | null> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("gallery_albums")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as GalleryAlbum) ?? null;
  },
  ["album-by-slug"],
  { tags: ["gallery_albums"], revalidate: HOUR }
);

export const getPhotosByAlbum = unstable_cache(
  async (albumId: string): Promise<GalleryPhoto[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("gallery_photos")
      .select("*")
      .eq("album_id", albumId)
      .order("sort_order", { ascending: true });
    return (data as GalleryPhoto[]) ?? [];
  },
  ["photos-by-album"],
  { tags: ["gallery_photos"], revalidate: HOUR }
);
