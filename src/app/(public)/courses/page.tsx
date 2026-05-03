import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Subject, Course } from "@/types/database";

export const metadata = {
  title: "Μαθήματα",
  description: "Όλα τα μαθήματα του φροντιστηρίου Κορυφή — γυμνάσιο, λύκειο, ΕΠΑΛ.",
};

type SearchParams = Promise<{ subject?: string }>;

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const { subject: subjectFilter } = await searchParams;
  const supabase = await createClient();

  const [{ data: subjects }, { data: courses }] = await Promise.all([
    supabase
      .from("subjects")
      .select("*")
      .order("order", { ascending: true }),
    (async () => {
      let q = supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (subjectFilter) {
        const { data: s } = await supabase.from("subjects").select("id").eq("slug", subjectFilter).maybeSingle();
        if (s) q = q.eq("subject_id", s.id);
      }
      return q;
    })(),
  ]);

  const subjectList = (subjects ?? []) as Subject[];
  const courseList = (courses ?? []) as Course[];
  const activeSubject = subjectList.find((s) => s.slug === subjectFilter) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Μαθήματα
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          {activeSubject
            ? `Μαθήματα για ${activeSubject.name}.`
            : "Επιλέξτε κατηγορία ή δείτε όλα τα διαθέσιμα μαθήματα."}
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2">
        <FilterChip href="/courses" active={!subjectFilter}>Όλα</FilterChip>
        {subjectList.map((s) => (
          <FilterChip key={s.id} href={`/courses?subject=${s.slug}`} active={subjectFilter === s.slug}>
            <span className="mr-1">{s.icon}</span>{s.name}
          </FilterChip>
        ))}
      </nav>

      {courseList.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courseList.map((c) => <CourseCard key={c.id} course={c} />)}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-700"
      }
    >
      {children}
    </Link>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <li className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/courses/${course.slug}`} className="block">
        <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50" />
        <div className="p-5">
          <div className="flex items-center gap-2">
            {course.is_free ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Δωρεάν</span>
            ) : (
              <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-600">Premium</span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{course.title}</h3>
          {course.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.description}</p>}
        </div>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <p className="text-base font-medium text-slate-700">Δεν έχουν δημοσιευθεί μαθήματα ακόμα.</p>
      <p className="mt-2 text-sm text-slate-500">
        Σύντομα θα μεταφερθεί όλο το υλικό από το παλιό site (98 μαθήματα + 419 PDFs).
      </p>
    </div>
  );
}
