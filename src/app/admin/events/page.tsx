import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Event as EventType } from "@/types/database";

export const metadata = { title: "Εκδηλώσεις" };

export default async function EventsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false, nullsFirst: false });
  const rows = (data ?? []) as EventType[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Εκδηλώσεις" newHref="/admin/events/new" description={`${rows.length} εγγραφές.`} />
      <AdminTable
        rows={rows}
        rowHref={(r) => `/admin/events/${r.id}`}
        columns={[
          { header: "Τίτλος",    cell: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
          { header: "Ημερομηνία",cell: (r) => r.starts_at ? new Date(r.starts_at).toLocaleString("el-GR") : "—" },
          { header: "Online",    cell: (r) => r.is_online ? "✓" : "—" },
          { header: "Κατάσταση", cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]}
      />
    </div>
  );
}
