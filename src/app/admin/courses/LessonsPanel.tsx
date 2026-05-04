import Link from "next/link";
import type { Lesson } from "@/types/database";

/**
 * Lessons (ενότητες) panel rendered inside /admin/courses/[id]. Shows the
 * course's lessons in order with quick edit links + an "Add new" button that
 * jumps to /admin/lessons/new with the course preselected.
 *
 * Server component — no interactivity needed beyond Next links.
 */
export function LessonsPanel({
  courseId, courseSlug, lessons,
}: {
  courseId: string;
  courseSlug: string;
  lessons: Lesson[];
}) {
  return (
    <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Ενότητες <span className="font-normal text-slate-400">({lessons.length})</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Το υλικό του μαθήματος (PDF, άρθρα, κείμενο). Οι μαθητές το βλέπουν μόνο αν είναι εγγεγραμμένοι.
          </p>
        </div>
        <Link
          href={`/admin/lessons/new?course=${courseId}`}
          className="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          + Νέα ενότητα
        </Link>
      </header>

      {lessons.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">Δεν έχει προστεθεί ενότητα ακόμα.</p>
          <p className="mt-1 text-xs text-slate-500">
            Πρόσθεσε την πρώτη με το κουμπί επάνω για να αρχίσεις να ανεβάζεις υλικό.
          </p>
        </div>
      ) : (
        <ol className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-4 bg-white px-4 py-3 transition-colors hover:bg-slate-50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {l.order ?? i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{l.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <TypeBadge type={l.content_type} />
                  {l.is_free && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Ξεκλείδωτο</span>}
                </div>
              </div>
              <Link
                href={`/admin/lessons/${l.id}`}
                className="shrink-0 text-sm font-medium text-brand-700 hover:text-brand-900"
              >
                Επεξεργασία →
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Public preview στο{" "}
        <Link href={`/courses/${courseSlug}`} target="_blank" className="font-medium text-brand-700 hover:text-brand-900">
          /courses/{courseSlug} ↗
        </Link>
      </p>
    </section>
  );
}

function TypeBadge({ type }: { type: "pdf" | "article" | "text" }) {
  const map = {
    pdf:     { label: "📄 PDF",    cls: "bg-rose-50 text-rose-700" },
    article: { label: "📝 Άρθρο",  cls: "bg-blue-50 text-blue-700" },
    text:    { label: "📃 Κείμενο", cls: "bg-slate-100 text-slate-700" },
  } as const;
  const m = map[type] ?? map.text;
  return <span className={`rounded-full px-2 py-0.5 ${m.cls}`}>{m.label}</span>;
}
