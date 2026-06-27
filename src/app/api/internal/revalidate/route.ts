import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { safeBearerEqual } from "@/lib/security";

/**
 * Internal cache-invalidation endpoint.
 *
 * Used by background scripts (Drive sync, manual DB tools) to invalidate
 * the Next.js unstable_cache + Vercel CDN after writing rows directly to
 * Supabase. No admin server action gets called in those flows, so cache
 * tags need an explicit purge.
 *
 * Auth: requires the service-role key in the Authorization header. Anyone
 * with the service-role key can already write to the DB, so this endpoint
 * doesn't expand the attack surface.
 *
 * POST /api/internal/revalidate
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   Body: { tags?: string[], paths?: string[] }
 *
 * Examples:
 *   { "tags": ["testimonials"] }
 *   { "tags": ["articles"], "paths": ["/blog"] }
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    // Fail closed instead of accepting a bare "Bearer " when the key is unset.
    return NextResponse.json({ error: "server misconfigured" }, { status: 503 });
  }
  if (!safeBearerEqual(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: { tags?: string[]; paths?: string[] };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const tags  = Array.isArray(payload.tags)  ? payload.tags  : [];
  const paths = Array.isArray(payload.paths) ? payload.paths : [];

  // Next 16: revalidateTag(tag, profile) — 'max' = expire stored entry now
  for (const tag of tags) revalidateTag(tag, "max");
  for (const p of paths) revalidatePath(p, "page");

  return NextResponse.json({ revalidated: { tags, paths } });
}
