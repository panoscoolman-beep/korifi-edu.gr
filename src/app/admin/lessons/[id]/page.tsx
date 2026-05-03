import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "../LessonForm";
import type { Lesson, Course } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία lesson" };

export default async function EditLesson({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: courses }] = await Promise.all([
    supabase.from("lessons").select("*").eq("id", id).maybeSingle(),
    supabase.from("courses").select("*").order("title"),
  ]);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Lesson).title}</h1>
      <LessonForm lesson={data as Lesson} courses={(courses ?? []) as Course[]} />
    </div>
  );
}
