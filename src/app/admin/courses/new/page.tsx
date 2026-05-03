import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../CourseForm";
import type { Subject } from "@/types/database";

export const metadata = { title: "Νέο course" };

export default async function NewCourse() {
  const supabase = await createClient();
  const { data: subjects } = await supabase.from("subjects").select("*").order("order");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέο course</h1>
      <CourseForm course={null} subjects={(subjects ?? []) as Subject[]} />
    </div>
  );
}
