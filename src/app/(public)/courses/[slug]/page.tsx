import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, Subject } from "@/types/database";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, description").eq("slug", slug).maybeSingle();
  if (!data) return {};
  return { title: data.title, description: data.description ?? undefined };
}

export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (!course) notFound();
  const c = course as Course;

  const [{ data: subject }, { data: lessons }] = await Promise.all([
    supabase.from("subjects").select("*").eq("id", c.subject_id).maybeSingle(),
    supabase.from("lessons").select("*").eq("course_id", c.id).order("order", { ascending: true }),
  ]);

  const sub = subject as Subject | null;
  const ls  = (lessons ?? []) as Lesson[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/courses" className="text-sm font-medium text-brand-700 hover:text-brand-900">← Όλα τα μαθήματα</Link>

      <header className="mt-6">
        <div className="flex items-center gap-2">
          {sub && (
            <Link href={`/courses?subject=${sub.slug}`} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-200">
              {sub.icon} {sub.name}
            </Link>
          )}
          {c.is_free && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Δωρεάν</span>
          )}
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{c.title}</h1>
        {c.description && <p className="mt-4 text-lg text-slate-600">{c.description}</p>}
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">
          Περιεχόμενα <span className="text-slate-400">({ls.length} {ls.length === 1 ? "ενότητα" : "ενότητες"})</span>
        </h2>

        {ls.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">Δεν έχουν προστεθεί ενότητες ακόμα.</p>
          </div>
        ) : (
          <ol className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {ls.map((l, i) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-50/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{l.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {l.content_type === "pdf"     && "📄 PDF"}
                      {l.content_type === "article" && "📝 Άρθρο"}
                      {l.content_type === "text"    && "📃 Κείμενο"}
                    </p>
                  </div>
                  {l.is_free && <span className="text-xs text-emerald-600">Δωρεάν</span>}
                  <span className="text-slate-400">→</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
