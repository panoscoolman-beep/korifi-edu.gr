import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { TeacherGrid } from "@/components/TeacherGrid";
import type { Page, Teacher } from "@/types/database";

export const metadata = {
  title: "Για εμάς",
  description: "Η φιλοσοφία και η ομάδα του Φροντιστηρίου Κορυφή.",
};

export default async function GiaEmasPage() {
  const supabase = await createClient();

  const [{ data: page }, { data: teachers }] = await Promise.all([
    supabase
      .from("pages")
      .select("*")
      .eq("slug", "gia-emas")
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("teachers")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!page) notFound();

  const team = (teachers ?? []) as Teacher[];
  const p = page as Page;

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
          {team.length} καθηγητές, εξειδικευμένοι ανά αντικείμενο. Πάτα κάποιον για να δεις το βιογραφικό.
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
