"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { validateLead, type LeadRecord } from "@/lib/leads";
import { CONTACT } from "@/lib/site";

export type LeadState = { ok?: true; error?: string } | null;

const FALLBACK = `Πάρε μας τηλέφωνο στο ${CONTACT.phone}.`;

/**
 * Υποβολή της φόρμας «Κλείσε δωρεάν διαγνωστικό».
 * Αποθηκεύει στο `leads` (service role — ο anon δεν γράφει στον πίνακα) και
 * ειδοποιεί με email αν έχει ρυθμιστεί το Resend. Η ειδοποίηση δεν μπλοκάρει
 * ποτέ την αποθήκευση: αν αποτύχει, το lead υπάρχει στο /admin/leads.
 */
export async function submitLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  const get = (k: string) => String(fd.get(k) ?? "");

  // Honeypot: ο άνθρωπος δεν βλέπει το πεδίο, το bot το γεμίζει. Απαντάμε «ΟΚ»
  // χωρίς να αποθηκεύσουμε, για να μην καταλάβει ότι απορρίφθηκε.
  if (get("website").trim() !== "") return { ok: true };

  // Υποβολή σε < 3" από το άνοιγμα = bot. Χωρίς JS το πεδίο μένει κενό → δεκτό.
  const started = Number(get("started_at"));
  if (started && Date.now() - started < 3000) return { ok: true };

  const v = validateLead({
    name: get("name"),
    phone: get("phone"),
    grade: get("grade"),
    interest: get("interest"),
    source_path: get("source_path"),
    source_label: get("source_label"),
  });
  if (!v.ok) return { error: v.error };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch (e) {
    console.error("[leads] admin client unavailable:", e instanceof Error ? e.message : e);
    return { error: `Προσωρινό πρόβλημα. ${FALLBACK}` };
  }

  // Ίδιο τηλέφωνο μέσα σε 10 λεπτά = διπλό πάτημα, όχι δεύτερο lead.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: dup } = await sb
    .from("leads")
    .select("id")
    .eq("phone", v.lead.phone)
    .gte("created_at", since)
    .limit(1);
  if (dup && dup.length > 0) return { ok: true };

  const { data: row, error } = await sb.from("leads").insert(v.lead).select("id").single();
  if (error || !row) {
    console.error("[leads] insert failed:", error?.message);
    return { error: `Δεν αποθηκεύτηκε. Δοκίμασε ξανά ή ${FALLBACK.toLowerCase()}` };
  }

  if (await notifyNewLead(v.lead)) {
    await sb.from("leads").update({ notified_at: new Date().toISOString() }).eq("id", row.id);
  }

  return { ok: true };
}

/**
 * Email ειδοποίησης μέσω Resend (https://resend.com). Ενεργοποιείται μόνο αν
 * υπάρχουν `RESEND_API_KEY` και `LEADS_NOTIFY_TO` στο Vercel. Επιστρέφει true
 * αν στάλθηκε.
 */
async function notifyNewLead(lead: LeadRecord): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_TO;
  if (!key || !to) return false;

  const from = process.env.LEADS_NOTIFY_FROM ?? "Κορυφή site <onboarding@resend.dev>";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";
  const text = [
    `Νέο lead από το korifi-edu.gr`,
    ``,
    `Όνομα:      ${lead.name}`,
    `Τηλέφωνο:   ${lead.phone}`,
    `Τάξη:       ${lead.grade ?? "—"}`,
    `Ενδιαφέρον: ${lead.interest ?? "—"}`,
    `Σελίδα:     ${lead.source_label ?? "—"}${lead.source_path ? ` (${site}${lead.source_path})` : ""}`,
    ``,
    `Όλα τα leads: ${site}/admin/leads`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `Νέο lead: ${lead.name}${lead.grade ? ` · ${lead.grade}` : ""}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[leads] resend failed:", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[leads] resend error:", e instanceof Error ? e.message : e);
    return false;
  }
}
