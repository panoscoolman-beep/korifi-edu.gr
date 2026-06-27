import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { TeacherGrid } from "@/components/TeacherGrid";
import { getPageBySlug, getPublishedTeachers } from "@/lib/queries";

export const metadata = {
  title: "Για εμάς",
  description: "Η φιλοσοφία και η ομάδα του Φροντιστηρίου Κορυφή.",
  alternates: { canonical: "/gia-emas" },
};

export const revalidate = 3600;

export default async function GiaEmasPage() {
  const [p, team] = await Promise.all([
    getPageBySlug("gia-emas"),
    getPublishedTeachers(),
  ]);

  if (!p) notFound();

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">
          Φροντιστήριο Κορυφή
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {p.title}
        </h1>
      </header>

      <Markdown>{p.content_md}</Markdown>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Η ομάδα μας
        </h2>
        <p className="mt-2 text-slate-600">
          Καθηγητές εξειδικευμένοι ανά αντικείμενο. Πάτα κάποιον για να δεις το βιογραφικό.
        </p>

        {team.length === 0 ? (
          <p className="mt-6 text-slate-500">Δεν έχουν δημοσιευθεί καθηγητές ακόμα.</p>
        ) : (
          <TeacherGrid teachers={team} />
        )}
      </section>
    </article>
  );
}
