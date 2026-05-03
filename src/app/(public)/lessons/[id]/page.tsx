import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import type { Lesson, Course } from "@/types/database";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? data.title : "Lesson" };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (!lesson) notFound();
  const l = lesson as Lesson;

  // Premium-only check: if lesson is not free and user is not enrolled, redirect
  if (!l.is_free) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/login?next=/lessons/${id}`);
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", l.course_id)
      .maybeSingle();
    if (!enrollment) {
      // not enrolled — show upgrade prompt
      return <PremiumGate lessonTitle={l.title} courseId={l.course_id} />;
    }
  }

  // Fetch course + sibling lessons for navigation
  const [{ data: course }, { data: siblings }] = await Promise.all([
    supabase.from("courses").select("title, slug").eq("id", l.course_id).maybeSingle(),
    supabase.from("lessons").select("id, title, order").eq("course_id", l.course_id).order("order"),
  ]);

  const c = course as { title: string; slug: string } | null;
  const sibs = (siblings ?? []) as { id: string; title: string; order: number }[];
  const idx  = sibs.findIndex((s) => s.id === l.id);
  const prev = idx > 0 ? sibs[idx - 1] : null;
  const next = idx >= 0 && idx < sibs.length - 1 ? sibs[idx + 1] : null;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {c && (
        <Link href={`/courses/${c.slug}`} className="text-sm font-medium text-brand-700 hover:text-brand-900">
          ← {c.title}
        </Link>
      )}

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{l.title}</h1>
      </header>

      <div className="mt-8">
        {l.content_type === "pdf" && l.pdf_url ? (
          <PdfEmbed url={l.pdf_url} title={l.title} />
        ) : l.content ? (
          <Markdown>{l.content}</Markdown>
        ) : (
          <p className="text-slate-500">Κενό περιεχόμενο.</p>
        )}
      </div>

      <nav className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
        {prev ? (
          <Link href={`/lessons/${prev.id}`} className="text-sm text-brand-700 hover:text-brand-900">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/lessons/${next.id}`} className="text-sm text-brand-700 hover:text-brand-900">
            {next.title} →
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
}

function PdfEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden" style={{ height: "85vh" }}>
        <iframe src={url} title={title} className="w-full h-full" />
      </div>
      <a
        href={url} target="_blank" rel="noopener"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900"
      >
        ⤓ Κατέβασμα PDF
      </a>
    </div>
  );
}

function PremiumGate({ lessonTitle, courseId }: { lessonTitle: string; courseId: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent-600">Premium περιεχόμενο</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{lessonTitle}</h1>
      <p className="mt-4 text-slate-600">
        Αυτή η ενότητα είναι διαθέσιμη μόνο σε εγγεγραμμένους μαθητές.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 text-base font-medium text-white hover:bg-brand-700"
      >
        Πήγαινε στον λογαριασμό μου
      </Link>
    </div>
  );
}
