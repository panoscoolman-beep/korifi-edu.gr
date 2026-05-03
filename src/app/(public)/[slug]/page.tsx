import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import type { Page } from "@/types/database";

type Params = Promise<{ slug: string }>;

// Reserve slugs that have their own dedicated route file.
const RESERVED = new Set([
  "gia-emas", "courses", "lessons",
  "blog", "events", "synergates", "gallery",
  "login", "register", "dashboard", "admin",
]);

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("title, meta_description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) return {};
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function DynamicPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) notFound();
  const p = page as Page;

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">
          Φροντιστήριο Κορυφή
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {p.title}
        </h1>
        {p.meta_description && (
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{p.meta_description}</p>
        )}
      </header>

      <Markdown>{p.content_md}</Markdown>
    </article>
  );
}
