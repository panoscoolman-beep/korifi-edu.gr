import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Article } from "@/types/database";

export const metadata = { title: "Άρθρα" };

export default async function ArticlesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("published_at", { ascending: false, nullsFirst: false });
  const rows = (data ?? []) as Article[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Άρθρα (blog)" description={`${rows.length} εγγραφές.`} newHref="/admin/articles/new" />
      <AdminTable
        rows={rows}
        rowHref={(r) => `/admin/articles/${r.id}`}
        columns={[
          { header: "Τίτλος", className: "w-2/5", cell: (r) => (
            <div>
              <div className="font-medium text-slate-900">{r.title}</div>
              <div className="text-xs text-slate-500">/{r.slug}</div>
            </div>
          )},
          { header: "Συγγραφέας", cell: (r) => r.author_name ?? "—" },
          { header: "Δημοσιεύθηκε", cell: (r) => r.published_at ? new Date(r.published_at).toLocaleDateString("el-GR") : "—" },
          { header: "Κατάσταση",  cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]}
      />
    </div>
  );
}
