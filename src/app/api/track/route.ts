import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_EVENT_NAMES } from "@/lib/leads";
import type { SiteEventName } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * POST /api/track — καταγράφει ένα κλικ μετατροπής στον πίνακα `site_events`.
 * Δέχεται μόνο γνωστά ονόματα event, κόβει τα μήκη, δεν αποθηκεύει IP/cookie.
 * Απαντά πάντα 204 (εκτός από κακό payload) ώστε να μη «φωνάζει» στον browser.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name : "";
  if (!(SITE_EVENT_NAMES as readonly string[]).includes(name)) {
    return new NextResponse(null, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|headless|lighthouse/i.test(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof b.path === "string" && b.path.startsWith("/") && !b.path.startsWith("//")
    ? b.path.slice(0, 200)
    : null;
  const place = typeof b.place === "string" ? b.place.slice(0, 40) : null;

  try {
    const sb = createAdminClient();
    const { error } = await sb.from("site_events").insert({ name: name as SiteEventName, path, place });
    if (error) console.error("[track] insert failed:", error.message);
  } catch (e) {
    console.error("[track] unavailable:", e instanceof Error ? e.message : e);
  }

  return new NextResponse(null, { status: 204 });
}
