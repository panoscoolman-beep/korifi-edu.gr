import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "../LessonForm";
import type { Lesson, Course } from "@/types/database";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ from?: string }>;

export const metadata = { title: "Επεξεργασία ενότητας" };

export default async function EditLesson({
  params, searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: courses }] = await Promise.all([
    supabase.from("lessons").select("*").eq("id", id).maybeSingle(),
    supabase.from("courses").select("*").order("title"),
  ]);
  if (!data) notFound();
  const lesson = data as Lesson;

  // Default return-to is the parent course edit page so admins flow naturally.
  // Override via ?from=/admin/lessons (used when arriving from the global list).
  const returnTo = from && from.startsWith("/admin/")
    ? from
    : `/admin/courses/${lesson.course_id}`;
  const parentCourse = (courses ?? []).find((c) => c.id === lesson.course_id);

  return (
    <div className="mx-auto max-w-3xl">
      {parentCourse && (
        <Link
          href={`/admin/courses/${lesson.course_id}`}
          className="mb-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          ← {parentCourse.title}
        </Link>
      )}
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{lesson.title}</h1>
      <LessonForm lesson={lesson} courses={(courses ?? []) as Course[]} returnTo={returnTo} />
    </div>
  );
}
