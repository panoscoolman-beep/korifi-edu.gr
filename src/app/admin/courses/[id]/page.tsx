import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../CourseForm";
import type { Course, Subject } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία course" };

export default async function EditCourse({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: subjects }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("*").order("order"),
  ]);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Course).title}</h1>
      <CourseForm course={data as Course} subjects={(subjects ?? []) as Subject[]} />
    </div>
  );
}
