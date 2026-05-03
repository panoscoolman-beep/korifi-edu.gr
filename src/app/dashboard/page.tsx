import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export const metadata = { title: "Ο λογαριασμός μου" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, enrolled_at, courses(*)")
    .eq("user_id", user.id);

  const courses = (enrollments ?? [])
    .flatMap((e) => (Array.isArray(e.courses) ? e.courses : e.courses ? [e.courses] : []))
    .filter(Boolean) as Course[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">
          {profile?.role === "admin"  && "Διαχειριστής"}
          {profile?.role === "teacher"&& "Καθηγητής"}
          {(!profile?.role || profile?.role === "student") && "Μαθητής"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Καλωσήρθες{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-2 text-slate-600">{user.email}</p>
      </header>

      {profile?.role === "admin" && (
        <div className="mb-8 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-sm text-brand-900">
            <strong>Διαχειριστής:</strong>{" "}
            <Link href="/admin" className="font-medium underline decoration-brand-400 hover:text-brand-700">
              Πίνακας ελέγχου διαχείρισης →
            </Link>
          </p>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Τα μαθήματά μου</h2>
        {courses.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-base font-medium text-slate-700">Δεν έχεις εγγραφεί σε μαθήματα ακόμα.</p>
            <p className="mt-2 text-sm text-slate-500">
              Περιήγησε{" "}
              <Link href="/courses" className="font-medium text-brand-700 hover:text-brand-900">
                τα διαθέσιμα μαθήματα
              </Link>{" "}
              και εγγράψου σε αυτά που σε ενδιαφέρουν.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{c.description}</p>
                )}
                <Link
                  href={`/courses/${c.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-900"
                >
                  Συνέχισε →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
