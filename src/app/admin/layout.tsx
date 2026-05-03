import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export const metadata = { title: "Διαχείριση" };

const NAV: { href: string; label: string; group?: string }[] = [
  { href: "/admin",              label: "Πίνακας",   group: "Επισκόπηση" },
  { href: "/admin/pages",        label: "Σελίδες",   group: "Περιεχόμενο" },
  { href: "/admin/articles",     label: "Άρθρα" },
  { href: "/admin/teachers",     label: "Καθηγητές" },
  { href: "/admin/events",       label: "Εκδηλώσεις" },
  { href: "/admin/testimonials", label: "Μαρτυρίες" },
  { href: "/admin/partners",     label: "Συνεργάτες" },
  { href: "/admin/subjects",     label: "Τάξεις",      group: "Μαθήματα" },
  { href: "/admin/courses",      label: "Courses" },
  { href: "/admin/lessons",      label: "Lessons" },
  { href: "/admin/users",        label: "Χρήστες",     group: "Σύστημα" },
  { href: "/admin/storage",      label: "Αρχεία" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const grouped = groupBy(NAV, (n) => n.group ?? "");

  return (
    <div className="flex min-h-[calc(100vh-4rem-1px)]">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-slate-50/60 lg:block">
        <nav className="sticky top-16 px-3 py-6">
          <p className="px-3 text-xs uppercase tracking-wider text-slate-500">Διαχείριση</p>
          <p className="mt-1 px-3 text-sm text-slate-600">{profile.full_name ?? user.email}</p>
          <div className="mt-6 space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {group && (
                  <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{group}</p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:text-brand-700"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <form action={signOut} className="mt-8 px-3">
            <button type="submit" className="text-xs text-slate-500 hover:text-red-700">
              Αποσύνδεση
            </button>
          </form>
        </nav>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
