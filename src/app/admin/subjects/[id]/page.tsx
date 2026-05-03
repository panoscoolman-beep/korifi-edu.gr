import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubjectForm } from "../SubjectForm";
import type { Subject } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία τάξης" };

export default async function EditSubject({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Subject).name}</h1>
      <SubjectForm item={data as Subject} />
    </div>
  );
}
