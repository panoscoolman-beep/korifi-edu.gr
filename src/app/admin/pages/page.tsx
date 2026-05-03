import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Page } from "@/types/database";

export const metadata = { title: "Σελίδες" };

export default async function PagesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").order("sort_order");
  const rows = (data ?? []) as Page[];

  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Σελίδες" description="Στατικές σελίδες που σερβίρονται από το /[slug]." newHref="/admin/pages/new" />
      <AdminTable
        rows={rows}
        rowHref={(r) => `/admin/pages/${r.id}`}
        columns={[
          { header: "Τίτλος", className: "w-2/5", cell: (r) => (
            <div>
              <div className="font-medium text-slate-900">{r.title}</div>
              <div className="text-xs text-slate-500">/{r.slug}</div>
            </div>
          )},
          { header: "Σειρά",     cell: (r) => r.sort_order, className: "text-right" },
          { header: "Μέγεθος",   cell: (r) => `${r.content_md.length} chars`, className: "text-right" },
          { header: "Κατάσταση", cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]}
      />
    </div>
  );
}
