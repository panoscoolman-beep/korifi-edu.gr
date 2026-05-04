"use server";

/**
 * Admin server actions for course access codes.
 * - generateAccessCode: creates a random 8-char code (uppercase letters + digits)
 *   for a course with optional max_uses + expiry. Returns the new code so the
 *   admin can copy + share with students.
 * - deleteAccessCode: revokes a code so future redemptions fail.
 */
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion

function randomCode(len = 8): string {
  let out = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") throw new Error("Admin only");
  return { supabase, user };
}

export async function generateAccessCode(_prev: unknown, fd: FormData): Promise<{ error?: string; code?: string }> {
  const courseId    = String(fd.get("course_id") ?? "");
  const description = (fd.get("description") as string | null)?.trim() || null;
  const maxUsesRaw  = String(fd.get("max_uses") ?? "").trim();
  const expiresRaw  = String(fd.get("expires_at") ?? "").trim();

  if (!courseId) return { error: "Λείπει το course_id" };

  const { supabase, user } = await assertAdmin();

  // Try up to 5 times in the unlikely event of collision
  let lastErr: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(8);
    const { error } = await supabase.from("course_access_codes").insert({
      course_id:   courseId,
      code,
      description,
      max_uses:    maxUsesRaw === "" ? null : Number(maxUsesRaw),
      expires_at:  expiresRaw === "" ? null : new Date(expiresRaw).toISOString(),
      created_by:  user.id,
    });
    if (!error) {
      revalidatePath(`/admin/courses/${courseId}`, "page");
      return { code };
    }
    lastErr = error.message;
    if (!error.message.toLowerCase().includes("unique")) break; // non-collision error
  }
  return { error: lastErr ?? "Δημιουργία κωδικού απέτυχε" };
}

export async function deleteAccessCode(codeId: string, courseId: string) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from("course_access_codes").delete().eq("id", codeId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`, "page");
}

/**
 * Public action — students call this to redeem a code and get enrolled.
 * Delegates validation to the server-side `redeem_course_access_code` RPC
 * which enforces auth, validity, expiry, and uses count atomically.
 */
export async function redeemAccessCode(_prev: unknown, fd: FormData): Promise<{ error?: string; success?: boolean }> {
  const code     = String(fd.get("code") ?? "").trim().toUpperCase();
  const courseId = String(fd.get("course_id") ?? "");
  if (!code)     return { error: "Πληκτρολόγησε τον κωδικό σου." };
  if (!courseId) return { error: "Λείπει το μάθημα." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Συνδέσου πρώτα στον λογαριασμό σου." };

  const { data, error } = await supabase.rpc("redeem_course_access_code", {
    p_code: code,
    p_course_id: courseId,
  });
  if (error) return { error: error.message };

  // RPC returns array of rows
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.success) {
    const map: Record<string, string> = {
      auth_required:    "Συνδέσου πρώτα στον λογαριασμό σου.",
      invalid_code:     "Άκυρος κωδικός για αυτό το μάθημα.",
      expired:          "Ο κωδικός έχει λήξει.",
      max_uses_reached: "Ο κωδικός έχει χρησιμοποιηθεί τις μέγιστες φορές.",
    };
    return { error: map[row?.error ?? "invalid_code"] ?? "Άκυρος κωδικός." };
  }

  // Bust caches so the unlocked content shows up
  updateTag("lessons");
  revalidatePath(`/courses`, "layout");
  return { success: true };
}
