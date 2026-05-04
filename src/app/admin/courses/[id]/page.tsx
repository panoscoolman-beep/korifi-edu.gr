import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../CourseForm";
import { AccessCodesPanel } from "../AccessCodesPanel";
import type { Course, Subject, CourseAccessCode } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία course" };

export default async function EditCourse({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: subjects }, { data: codes }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("*").order("order"),
    supabase.from("course_access_codes").select("*").eq("course_id", id).order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Course).title}</h1>
      <CourseForm course={data as Course} subjects={(subjects ?? []) as Subject[]} />
      <AccessCodesPanel courseId={id} codes={(codes ?? []) as CourseAccessCode[]} />
    </div>
  );
}
