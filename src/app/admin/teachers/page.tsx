import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Teacher } from "@/types/database";

export const metadata = { title: "Καθηγητές" };

export default async function TeachersAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("teachers").select("*").order("sort_order", { ascending: true });
  const rows = (data ?? []) as Teacher[];

  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader
        title="Καθηγητές"
        description={`${rows.length} εγγραφές. Κλικ πάνω σε καθηγητή για επεξεργασία.`}
        newHref="/admin/teachers/new"
      />
      <AdminTable
        rows={rows}
        rowHref={(r) => `/admin/teachers/${r.id}`}
        emptyMessage="Δεν υπάρχουν καθηγητές ακόμα."
        columns={[
          {
            header: "Όνομα", className: "w-2/5",
            cell: (r) => (
              <div className="flex items-center gap-3">
                <Avatar src={r.photo_url} alt={r.full_name} />
                <div>
                  <div className="font-medium text-slate-900">{r.full_name}</div>
                  <div className="text-xs text-slate-500">{r.slug}</div>
                </div>
              </div>
            ),
          },
          { header: "Ειδικότητα", cell: (r) => r.role ?? "—" },
          { header: "Σειρά",      cell: (r) => r.sort_order, className: "text-right" },
          { header: "Κατάσταση",  cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]}
      />
    </div>
  );
}

function Avatar({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-400">👤</div>;
  return <img src={src} alt={alt} className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200" />;
}
