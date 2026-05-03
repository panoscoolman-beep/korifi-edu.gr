import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "../LessonForm";
import type { Course } from "@/types/database";

export const metadata = { title: "Νέο lesson" };

export default async function NewLesson() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("*").order("title");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέο lesson</h1>
      <LessonForm lesson={null} courses={(courses ?? []) as Course[]} />
    </div>
  );
}
