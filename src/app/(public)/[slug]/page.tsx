import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { getPageBySlug, getAllPublishedPageSlugs } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

// Reserve slugs that have their own dedicated route file.
const RESERVED = new Set([
  "gia-emas", "courses", "lessons",
  "blog", "events", "synergates", "gallery",
  "login", "register", "dashboard", "admin",
]);

// ISR + prerender all known slugs at build time.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedPageSlugs();
  return slugs.filter((s) => !RESERVED.has(s)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};

  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function DynamicPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const p = await getPageBySlug(slug);
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-12 border-b-2 border-amber-300 pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Φροντιστήριο Κορυφή
        </p>
        <h1 className="mt-3 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {p.title}
        </h1>
        {p.meta_description && (
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{p.meta_description}</p>
        )}
      </header>

      <Markdown>{p.content_md}</Markdown>
    </article>
  );
}
