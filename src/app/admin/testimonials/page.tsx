import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { Testimonial } from "@/types/database";

export const metadata = { title: "Μαρτυρίες" };

export default async function TestimonialsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  const rows = (data ?? []) as Testimonial[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Μαρτυρίες" newHref="/admin/testimonials/new" description={`${rows.length} εγγραφές.`} />
      <AdminTable rows={rows} rowHref={(r) => `/admin/testimonials/${r.id}`}
        columns={[
          { header: "Συντάκτης", cell: (r) => <span className="font-medium text-slate-900">{r.author_name}</span> },
          { header: "Ιδιότητα",  cell: (r) => r.author_role ?? "—" },
          { header: "Σειρά",     cell: (r) => r.sort_order, className: "text-right" },
          { header: "Κατάσταση", cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]} />
    </div>
  );
}
