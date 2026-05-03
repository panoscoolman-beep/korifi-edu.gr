import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Πίνακας διαχείρισης" };

const STAT_ITEMS = [
  { table: "pages",        label: "Σελίδες",     href: "/admin/pages" },
  { table: "articles",     label: "Άρθρα",       href: "/admin/articles" },
  { table: "teachers",     label: "Καθηγητές",   href: "/admin/teachers" },
  { table: "events",       label: "Εκδηλώσεις",  href: "/admin/events" },
  { table: "testimonials", label: "Μαρτυρίες",   href: "/admin/testimonials" },
  { table: "partners",     label: "Συνεργάτες",  href: "/admin/partners" },
  { table: "courses",      label: "Courses",     href: "/admin/courses" },
  { table: "lessons",      label: "Lessons",     href: "/admin/lessons" },
] as const;

export default async function AdminHome() {
  const supabase = await createClient();
  const counts: Record<string, number> = {};
  await Promise.all(STAT_ITEMS.map(async (s) => {
    const { count } = await supabase.from(s.table).select("*", { count: "exact", head: true });
    counts[s.table] = count ?? 0;
  }));

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Πίνακας διαχείρισης</h1>
        <p className="mt-1 text-sm text-slate-600">
          Από εδώ διαχειρίζεσαι όλο το περιεχόμενο του site.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Επισκόπηση</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_ITEMS.map((s) => (
            <li key={s.table}>
              <Link
                href={s.href}
                className="block rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{counts[s.table]}</p>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/admin/users"
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">Χρήστες</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{usersCount ?? 0}</p>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Γρήγορες ενέργειες</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickAction href="/admin/teachers/new">+ Νέος καθηγητής</QuickAction>
          <QuickAction href="/admin/articles/new">+ Νέο άρθρο</QuickAction>
          <QuickAction href="/admin/pages/new">+ Νέα σελίδα</QuickAction>
          <QuickAction href="/admin/events/new">+ Νέα εκδήλωση</QuickAction>
        </div>
      </section>
    </div>
  );
}

function QuickAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}
