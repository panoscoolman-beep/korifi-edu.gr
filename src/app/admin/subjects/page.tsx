import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable } from "@/components/admin/AdminList";
import type { Subject } from "@/types/database";

export const metadata = { title: "Τάξεις / Subjects" };

export default async function SubjectsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*").order("order");
  const rows = (data ?? []) as Subject[];
  return (
    <div className="mx-auto max-w-4xl">
      <AdminListHeader title="Τάξεις" newHref="/admin/subjects/new" description="Γυμνάσιο, Λύκειο, ΕΠΑΛ — οι κατηγορίες για τα Courses." />
      <AdminTable rows={rows} rowHref={(r) => `/admin/subjects/${r.id}`}
        columns={[
          { header: "Όνομα", cell: (r) => <span className="font-medium text-slate-900"><span className="mr-2">{r.icon}</span>{r.name}</span> },
          { header: "Slug",  cell: (r) => <code className="text-xs text-slate-500">{r.slug}</code> },
          { header: "Σειρά",cell: (r) => r.order, className: "text-right" },
        ]} />
    </div>
  );
}
