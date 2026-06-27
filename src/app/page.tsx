import Link from "next/link";
import {
  getSubjects, getCoursesWithLessons,
  getArticlesWithCovers, getPublishedTestimonials,
} from "@/lib/queries";
import type { Metadata } from "next";
import { JsonLd, KORIFI_LOCAL_BUSINESS_LD, KORIFI_WEBSITE_LD } from "@/components/JsonLd";
import { SeasonalHero } from "@/components/SeasonalHero";
import { TestimonialsClient } from "@/components/TestimonialsClient";
import type { Subject, Course, Testimonial } from "@/types/database";
import LatestArticles from "@/components/LatestArticles";

// Self-canonical for the homepage (root layout no longer sets a global one).
export const metadata: Metadata = { alternates: { canonical: "/" } };

// ISR: revalidate every hour. Admin mutations bust this via updateTag.
export const revalidate = 3600;

export default async function HomePage() {
  const [subjects, featured, articles, testimonials] = await Promise.all([
    getSubjects(),
    getCoursesWithLessons(6),
    getArticlesWithCovers(3),
    getPublishedTestimonials(6),
  ]);

  return (
    <>
      <JsonLd data={KORIFI_LOCAL_BUSINESS_LD} />
      <JsonLd data={KORIFI_WEBSITE_LD} />
      <SeasonalHero />
      <SubjectsSection subjects={subjects} />
      <FeaturedCoursesSection courses={featured} />
      <TestimonialsSection items={testimonials} />
      <LatestArticles items={articles} />
    </>
  );
}

function TestimonialsSection({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Τι λένε για εμάς
          </h2>
          <Link href="/martyries" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Όλες οι μαρτυρίες →
          </Link>
        </div>
        <TestimonialsClient items={items} />
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
  if (courses.length === 0) return null;
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Διαθέσιμα μαθήματα
          </h2>
          <Link href="/courses" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Όλα τα μαθήματα →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-amber-50/40 text-7xl transition-transform group-hover:scale-105">
        <span aria-hidden>{course.icon ?? "📘"}</span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.description}</p>
        )}
      </div>
    </Link>
  );
}
