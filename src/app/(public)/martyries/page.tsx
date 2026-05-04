import Image from "next/image";
import Link from "next/link";
import { getPublishedTestimonials } from "@/lib/queries";
import type { Testimonial } from "@/types/database";

export const metadata = {
  title: "Μαρτυρίες",
  description: "Τι λένε οι μαθητές και οι γονείς για το φροντιστήριο Κορυφή.",
};

export const revalidate = 3600;

export default async function MartyriesPage() {
  const items = await getPublishedTestimonials();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-12 border-b-2 border-amber-300 pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Φροντιστήριο Κορυφή
        </p>
        <h1 className="mt-3 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          Μαρτυρίες
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
          Τι λένε για εμάς οι μαθητές και οι γονείς που μας εμπιστεύτηκαν στις σπουδές τους.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => <TestimonialCard key={t.id} item={t} />)}
        </ul>
      )}

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-brand-50 via-amber-50 to-brand-50 p-8 text-center">
        <p className="text-lg font-medium text-slate-800">Θέλεις κι εσύ να ανήκεις στην ομάδα μας;</p>
        <p className="mt-1 text-sm text-slate-600">
          Έλα να μας γνωρίσεις από κοντά ή να συζητήσουμε τις ανάγκες σου.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/epikoinonia"
            className="rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg"
          >
            Επικοινωνία
          </Link>
          <Link
            href="/courses"
            className="rounded-full border-2 border-brand-600 px-7 py-3.5 text-base font-semibold text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
          >
            Δες τα μαθήματα
          </Link>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <li className="group flex h-full flex-col rounded-xl border border-brand-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <svg
        className="h-8 w-8 text-amber-400"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M7.17 6c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17zm9.66 0c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17z" />
      </svg>

      <p className="mt-4 flex-1 text-base italic leading-relaxed text-slate-700">
        {item.quote}
      </p>

      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.author_name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700 ring-2 ring-brand-50">
            {item.author_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.author_name}</p>
          {item.author_role && <p className="text-xs text-slate-500">{item.author_role}</p>}
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <p className="text-base font-medium text-slate-700">Δεν έχουν δημοσιευθεί μαρτυρίες ακόμα.</p>
      <p className="mt-2 text-sm text-slate-500">
        Σύντομα θα προστεθούν εδώ μαρτυρίες από μαθητές και γονείς.
      </p>
    </div>
  );
}
