import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "../EventForm";
import type { Event as EventType } from "@/types/database";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? `Επεξεργασία: ${data.title}` : "Εκδήλωση" };
}

export default async function EditEvent({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as EventType).title}</h1>
      <EventForm event={data as EventType} />
    </div>
  );
}
