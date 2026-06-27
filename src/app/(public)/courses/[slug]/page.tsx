import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getSubjectById, getLessonsByCourse, getCourses } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { JsonLd, courseLd, breadcrumbsLd } from "@/components/JsonLd";
import { RedeemCodeForm } from "./RedeemCodeForm";

type Params = Promise<{ slug: string }>;

// Page is dynamic — auth check decides whether the lesson list shows.
// Cached queries keep the DB load low.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const c = await getCourseBySlug(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description ?? undefined,
    alternates: { canonical: `/courses/${c.slug}` },
    openGraph: {
      type: "article",
      title: c.title,
      description: c.description ?? undefined,
      url: `/courses/${c.slug}`,
      images: ["/og-default.png"],
    },
  };
}

export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params;
  const c = await getCourseBySlug(slug);
  if (!c) notFound();

  const [sub, ls] = await Promise.all([
    getSubjectById(c.subject_id),
    getLessonsByCourse(c.id),
  ]);

  // Auth + enrollment check (dynamic — uses cookies)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let enrolled = false;
  if (user) {
    const { data: e } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", c.id)
      .maybeSingle();
    enrolled = !!e;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <JsonLd data={courseLd({ ...c, subjectName: sub?.name ?? null })} />
      <JsonLd
        data={breadcrumbsLd([
          { name: "Μαθήματα", url: "/courses" },
          ...(sub ? [{ name: sub.name, url: `/courses?subject=${sub.slug}` }] : []),
          { name: c.title, url: `/courses/${c.slug}` },
        ])}
      />
      <Link href="/courses" className="text-sm font-medium text-brand-700 hover:text-brand-900">← Όλα τα μαθήματα</Link>

      <header className="mt-6 flex items-start gap-5">
        {c.icon && (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 via-brand-50 to-amber-50/40 text-5xl shadow-sm ring-1 ring-brand-100 sm:h-24 sm:w-24 sm:text-6xl">
            <span aria-hidden>{c.icon}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {sub && (
              <Link href={`/courses?subject=${sub.slug}`} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-200">
                {sub.icon} {sub.name}
              </Link>
            )}
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{c.title}</h1>
          {c.description && <p className="mt-4 text-lg text-slate-600">{c.description}</p>}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">
          Περιεχόμενα <span className="text-slate-400">({ls.length} {ls.length === 1 ? "ενότητα" : "ενότητες"})</span>
        </h2>

        {!user ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-700">Για να δεις το υλικό του μαθήματος χρειάζεται να συνδεθείς.</p>
            <Link
              href={`/login?next=/courses/${slug}`}
              className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Σύνδεση
            </Link>
          </div>
        ) : !enrolled ? (
          <RedeemCodeForm courseId={c.id} />
        ) : ls.length === 0 ? (
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
