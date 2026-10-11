"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES } from "@/lib/leads";
import type { LeadStatus } from "@/types/database";

/** Αλλαγή κατάστασης ενός lead. Το RLS επιτρέπει update μόνο σε admin. */
export async function setLeadStatus(id: string, status: LeadStatus) {
  if (!LEAD_STATUSES.includes(status)) throw new Error("Άγνωστη κατάσταση");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error, count } = await supabase
    .from("leads")
    .update({ status }, { count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Admin only");

  revalidatePath("/admin/leads", "page");
}

/** Σημειώσεις admin για ένα lead (π.χ. «κάλεσα 5/10, θέλει Τρίτη»). */
export async function setLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error, count } = await supabase
    .from("leads")
    .update({ notes: notes.trim().slice(0, 1000) || null }, { count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Admin only");

  revalidatePath("/admin/leads", "page");
}
