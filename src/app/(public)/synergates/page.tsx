import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import type { Page, Partner } from "@/types/database";

export const metadata = {
  title: "Συνεργάτες",
  description: "Οι φορείς και οι ομάδες με τις οποίες συνεργάζεται η Κορυφή.",
};

export default async function SynergatesPage() {
  const supabase = await createClient();
  const [{ data: page }, { data: partners }] = await Promise.all([
    supabase.from("pages").select("*").eq("slug", "synergates").eq("is_published", true).maybeSingle(),
    supabase.from("partners").select("*").eq("is_published", true).order("sort_order"),
  ]);

  if (!page) notFound();
  const p  = page as Page;
  const ps = (partners ?? []) as Partner[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">Φροντιστήριο Κορυφή</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{p.title}</h1>
      </header>

      <Markdown>{p.content_md}</Markdown>

      {ps.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Οι συνεργάτες μας</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ps.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="mx-auto h-20 object-contain" />
                ) : (
                  <div className="mx-auto h-20 w-32 rounded bg-slate-100" />
                )}
                <p className="mt-4 font-medium text-slate-900">{p.name}</p>
                {p.website_url && (
                  <a href={p.website_url} target="_blank" rel="noopener" className="mt-1 inline-block text-sm text-brand-700 hover:text-brand-900">
                    Επίσκεψη →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
