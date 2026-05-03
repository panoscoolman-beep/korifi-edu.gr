import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth + email verification redirect handler.
 *
 * Supabase sends users here after:
 *   - Google OAuth completes
 *   - Email verification link is clicked
 *   - Password reset link is clicked
 *
 * The 'code' query param is exchanged for a session, then we redirect to
 * the app destination (`?next=...`) or the dashboard by default.
 */
export async function GET(request: NextRequest) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get("code");
  const next  = url.searchParams.get("next") ?? "/dashboard";
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (error) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", error);
    return NextResponse.redirect(login);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", `Σφάλμα επιβεβαίωσης: ${exchangeError.message}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
