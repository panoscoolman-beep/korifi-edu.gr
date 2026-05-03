import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageForm } from "../PageForm";
import type { Page } from "@/types/database";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? `Επεξεργασία: ${data.title}` : "Σελίδα" };
}

export default async function EditPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Page).title}</h1>
      <PageForm page={data as Page} />
    </div>
  );
}
