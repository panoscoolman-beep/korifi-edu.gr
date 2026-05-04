import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "../LessonForm";
import type { Course, Lesson } from "@/types/database";

type SearchParams = Promise<{ course?: string }>;

export const metadata = { title: "Νέα ενότητα" };

export default async function NewLesson({ searchParams }: { searchParams: SearchParams }) {
  const { course: courseId } = await searchParams;
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("*").order("title");

  // Pre-fill course + suggest next `order` when arriving from a course's lessons panel
  let prefill: Partial<Lesson> | null = null;
  let courseTitle: string | null = null;
  if (courseId) {
    const course = (courses ?? []).find((c) => c.id === courseId);
    if (course) {
      courseTitle = course.title;
      const { data: existing } = await supabase
        .from("lessons")
        .select("order")
        .eq("course_id", courseId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder = (existing?.order ?? 0) + 1;
      prefill = { course_id: courseId, order: nextOrder, content_type: "pdf" } as Partial<Lesson>;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Νέα ενότητα</h1>
      {courseTitle && (
        <p className="mb-6 text-sm text-slate-600">
          Στο μάθημα: <span className="font-semibold text-brand-700">{courseTitle}</span>
        </p>
      )}
      <LessonForm
        lesson={(prefill ?? null) as Lesson | null}
        courses={(courses ?? []) as Course[]}
        returnTo={courseId ? `/admin/courses/${courseId}` : undefined}
      />
    </div>
  );
}
