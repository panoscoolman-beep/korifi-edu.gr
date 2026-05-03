import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerForm } from "../PartnerForm";
import type { Partner } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία συνεργάτη" };

export default async function EditPartner({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Partner).name}</h1>
      <PartnerForm item={data as Partner} />
    </div>
  );
}
