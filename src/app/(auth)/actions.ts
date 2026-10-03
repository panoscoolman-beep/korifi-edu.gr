"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { safeNext } from "@/lib/security";
import { passwordProblem } from "@/lib/password";

type ActionState = { error?: string; ok?: string } | null;

function getSiteOrigin(reqHeaders: Headers): string {
  const proto = reqHeaders.get("x-forwarded-proto") ?? "http";
  const host  = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email    = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next     = safeNext(String(formData.get("next") ?? ""));

  if (!email || !password) return { error: "Συμπληρώστε email και κωδικό." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message === "Invalid login credentials"
      ? "Λάθος email ή κωδικός."
      : `Σφάλμα σύνδεσης: ${error.message}` };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email     = String(formData.get("email") ?? "").trim();
  const password  = String(formData.get("password") ?? "");
  const fullName  = String(formData.get("full_name") ?? "").trim();

  if (!email || !password || !fullName) return { error: "Συμπληρώστε όλα τα πεδία." };
  const weak = passwordProblem(password);
  if (weak) return { error: weak };

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
    // Μετά το link, ο χρήστης πρέπει να ορίσει ΝΕΟ κωδικό — όχι απλώς να συνδεθεί.
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: `Σφάλμα: ${error.message}` };

  return { ok: "Σου στείλαμε σύνδεσμο επαναφοράς. Ελέγξε τα εισερχόμενά σου." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm  = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "Οι δύο κωδικοί δεν ταιριάζουν." };
  const weak = passwordProblem(password);
  if (weak) return { error: weak };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ο σύνδεσμος επαναφοράς έληξε. Ζήτησε νέο από τη σελίδα «Ξέχασα τον κωδικό»." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: `Σφάλμα: ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
