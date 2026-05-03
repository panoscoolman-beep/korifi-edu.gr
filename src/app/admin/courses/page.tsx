import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable } from "@/components/admin/AdminList";
import type { Course, Subject } from "@/types/database";

export const metadata = { title: "Courses" };

export default async function CoursesAdmin() {
  const supabase = await createClient();
  const [{ data: courses }, { data: subjects }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("subjects").select("id, name"),
  ]);
  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]));
  const rows = (courses ?? []) as Course[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Courses" newHref="/admin/courses/new" description={`${rows.length} εγγραφές.`} />
      <AdminTable rows={rows} rowHref={(r) => `/admin/courses/${r.id}`}
        columns={[
          { header: "Τίτλος",  cell: (r) => (
            <div>
              <div className="font-medium text-slate-900">{r.title}</div>
              <div className="text-xs text-slate-500">{r.slug}</div>
            </div>
          )},
          { header: "Τάξη",    cell: (r) => subjectMap.get(r.subject_id) ?? "—" },
          { header: "Δωρεάν",  cell: (r) => r.is_free ? "✓" : "—" },
        ]} />
    </div>
  );
}
