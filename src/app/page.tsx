import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Subject, Course, Teacher, Article, Testimonial } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: subjects },
    { data: featured },
    { data: teachers },
    { data: articles },
    { data: testimonials },
  ] = await Promise.all([
    supabase.from("subjects").select("id, name, slug, icon, order, created_at").order("order", { ascending: true }),
    supabase.from("courses").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("teachers").select("*").eq("is_published", true).order("sort_order", { ascending: true }).limit(8),
    supabase.from("articles").select("*").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(3),
    supabase.from("testimonials").select("*").eq("is_published", true).order("sort_order", { ascending: true }).limit(6),
  ]);

  return (
    <>
      <Hero />
      <SubjectsSection subjects={(subjects ?? []) as Subject[]} />
      <FeaturedCoursesSection courses={(featured ?? []) as Course[]} />
      <TeamPreview teachers={(teachers ?? []) as Teacher[]} />
      <TestimonialsSection items={(testimonials ?? []) as Testimonial[]} />
      <LatestArticles items={(articles ?? []) as Article[]} />
    </>
  );
}

function TestimonialsSection({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Τι λένε για εμάς
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <li key={t.id} className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
              <p className="text-sm italic leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {t.photo_url && (
                  <Image src={t.photo_url} alt={t.author_name} width={36} height={36} className="rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.author_name}</p>
                  {t.author_role && <p className="text-xs text-slate-500">{t.author_role}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LatestArticles({ items }: { items: Article[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Από το blog</h2>
        <Link href="/blog" className="text-sm font-medium text-brand-700 hover:text-brand-900">Όλα τα άρθρα →</Link>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-3">
        {items.map((a) => {
          const date = a.published_at ? new Date(a.published_at).toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" }) : null;
          return (
            <li key={a.id}>
              <Link href={`/blog/${a.slug}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
                <div className="relative aspect-video bg-gradient-to-br from-brand-100 to-brand-50">
                  {a.cover_image && <Image src={a.cover_image} alt={a.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />}
                </div>
                <div className="p-5">
                  {date && <p className="text-xs uppercase tracking-wider text-slate-500">{date}</p>}
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-700">{a.title}</h3>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TeamPreview({ teachers }: { teachers: Teacher[] }) {
  if (teachers.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Η ομάδα μας
          </h2>
          <p className="mt-2 text-slate-600">Έμπειροι καθηγητές, εξειδικευμένοι ανά αντικείμενο.</p>
        </div>
        <Link href="/gia-emas" className="text-sm font-medium text-brand-700 hover:text-brand-900">
          Όλοι οι καθηγητές →
        </Link>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {teachers.map((t) => (
          <li key={t.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative aspect-square w-full bg-slate-100">
              {t.photo_url && (
                <Image
                  src={t.photo_url}
                  alt={t.full_name}
                  fill
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-medium text-slate-900">{t.full_name}</p>
              {t.role && <p className="mt-0.5 text-xs text-brand-700">{t.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-brand-700">
          Φροντιστήριο Μέσης Εκπαίδευσης
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Φτάσε στην <span className="text-brand-600">κορυφή</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Online μαθήματα, σημειώσεις και υλικό για γυμνάσιο και λύκειο — με τους
          δασκάλους που εμπιστεύεσαι.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/courses"
            className="rounded-full bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Δες τα μαθήματα
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Δημιουργία λογαριασμού
          </Link>
        </div>
      </div>
    </section>
  );
}

function SubjectsSection({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Κατηγορίες μαθημάτων
      </h2>
      {subjects.length === 0 ? (
        <p className="mt-6 text-slate-500">Δεν έχουν δημοσιευθεί κατηγορίες ακόμα.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/courses?subject=${s.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-500 hover:bg-brand-50/40"
            >
              <span className="text-3xl" aria-hidden>
                {s.icon ?? "📚"}
              </span>
              <span className="text-base font-medium text-slate-900 group-hover:text-brand-700">
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturedCoursesSection({ courses }: { courses: Course[] }) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Νέα μαθήματα
          </h2>
          <Link href="/courses" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Όλα τα μαθήματα →
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="mt-6 text-slate-500">Δεν έχουν δημοσιευθεί μαθήματα ακόμα.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50" />
      <div className="p-5">
        <div className="flex items-center gap-2">
          {course.is_free ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Δωρεάν
            </span>
          ) : (
            <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-600">
              Premium
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.description}</p>
        )}
      </div>
    </Link>
  );
}
