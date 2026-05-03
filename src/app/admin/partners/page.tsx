import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Partner } from "@/types/database";

export const metadata = { title: "Συνεργάτες" };

export default async function PartnersAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("sort_order");
  const rows = (data ?? []) as Partner[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Συνεργάτες" newHref="/admin/partners/new" description={`${rows.length} εγγραφές.`} />
      <AdminTable rows={rows} rowHref={(r) => `/admin/partners/${r.id}`}
        columns={[
          { header: "Λογότυπο", className: "w-16", cell: (r) => r.logo_url
            ? <img src={r.logo_url} alt={r.name} className="h-10 w-10 object-contain" />
            : <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-400">—</div>
          },
          { header: "Όνομα",     cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          { header: "Website",   cell: (r) => r.website_url
            ? <a href={r.website_url} target="_blank" rel="noopener" className="text-brand-700 hover:underline">{new URL(r.website_url).hostname}</a>
            : "—"
          },
          { header: "Σειρά",     cell: (r) => r.sort_order, className: "text-right" },
          { header: "Κατάσταση", cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]} />
    </div>
  );
}
