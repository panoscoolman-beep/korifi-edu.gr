import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../CourseForm";
import { AccessCodesPanel } from "../AccessCodesPanel";
import { LessonsPanel } from "../LessonsPanel";
import type { Course, Subject, CourseAccessCode, Lesson } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία course" };

export default async function EditCourse({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: subjects }, { data: codes }, { data: lessons }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("*").order("order"),
    supabase.from("course_access_codes").select("*").eq("course_id", id).order("created_at", { ascending: false }),
    supabase.from("lessons").select("*").eq("course_id", id).order("order", { ascending: true }),
  ]);
  if (!data) notFound();
  const course = data as Course;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
      <CourseForm course={course} subjects={(subjects ?? []) as Subject[]} />
      <LessonsPanel courseId={id} courseSlug={course.slug} lessons={(lessons ?? []) as Lesson[]} />
      <AccessCodesPanel courseId={id} codes={(codes ?? []) as CourseAccessCode[]} />
    </div>
  );
}
