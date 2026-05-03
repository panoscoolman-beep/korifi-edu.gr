import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeacherForm } from "../TeacherForm";
import type { Teacher } from "@/types/database";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("teachers").select("full_name").eq("id", id).maybeSingle();
  return { title: data?.full_name ? `Επεξεργασία: ${data.full_name}` : "Καθηγητής" };
}

export default async function EditTeacher({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Teacher).full_name}</h1>
      <TeacherForm teacher={data as Teacher} />
    </div>
  );
}
