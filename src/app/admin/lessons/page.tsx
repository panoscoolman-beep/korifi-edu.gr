import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable } from "@/components/admin/AdminList";
import type { Lesson, Course } from "@/types/database";

export const metadata = { title: "Lessons" };

export default async function LessonsAdmin() {
  const supabase = await createClient();
  const [{ data: lessons }, { data: courses }] = await Promise.all([
    supabase.from("lessons").select("*").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, title"),
  ]);
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c.title]));
  const rows = (lessons ?? []) as Lesson[];
  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Lessons" newHref="/admin/lessons/new" description={`${rows.length} εγγραφές.`} />
      <AdminTable rows={rows} rowHref={(r) => `/admin/lessons/${r.id}`}
        columns={[
          { header: "Τίτλος", cell: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
          { header: "Course", cell: (r) => courseMap.get(r.course_id) ?? "—" },
          { header: "Τύπος", cell: (r) => r.content_type.toUpperCase() },
          { header: "Σειρά", cell: (r) => r.order, className: "text-right" },
          { header: "Δωρεάν",cell: (r) => r.is_free ? "✓" : "—" },
        ]} />
    </div>
  );
}
