"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

type ActionState = { error?: string; ok?: string } | null;

function getSiteOrigin(reqHeaders: Headers): string {
  const proto = reqHeaders.get("x-forwarded-proto") ?? "http";
  const host  = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email    = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next     = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) return { error: "Συμπληρώστε email και κωδικό." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message === "Invalid login credentials"
      ? "Λάθος email ή κωδικός."
      : `Σφάλμα σύνδεσης: ${error.message}` };
  }

  revalidatePath("/", "layout");
  redirect(next || "/dashboard");
}

export async function signUpWithPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email     = String(formData.get("email") ?? "").trim();
  const password  = String(formData.get("password") ?? "");
  const fullName  = String(formData.get("full_name") ?? "").trim();

  if (!email || !password || !fullName) return { error: "Συμπληρώστε όλα τα πεδία." };
  if (password.length < 8)              return { error: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες." };

  const supabase = await createClient();
  const origin   = getSiteOrigin(await headers());
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: `Σφάλμα εγγραφής: ${error.message}` };

  return { ok: "Σου στείλαμε email επιβεβαίωσης. Ελέγξε τα εισερχόμενά σου." };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin   = getSiteOrigin(await headers());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error)   throw new Error(error.message);
  if (data.url) redirect(data.url);
}

export async function sendPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email  = String(formData.get("email") ?? "").trim();
  if (!email)  return { error: "Δώσε το email σου." };

  const supabase = await createClient();
  const origin   = getSiteOrigin(await headers());
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });
  if (error) return { error: `Σφάλμα: ${error.message}` };

  return { ok: "Σου στείλαμε σύνδεσμο επαναφοράς. Ελέγξε τα εισερχόμενά σου." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
