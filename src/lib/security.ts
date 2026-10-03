import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time check of an `Authorization: Bearer <secret>` header.
 *
 * - Fails closed: returns `false` if the secret is missing/empty, so a misconfigured
 *   deployment can never accept a bare `"Bearer "`.
 * - Uses `timingSafeEqual` to avoid leaking the secret via response timing. The
 *   length pre-check is required (timingSafeEqual throws on unequal lengths) and
 *   only leaks the length of the expected header, not its contents.
 */
export function safeBearerEqual(
  authHeader: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(authHeader ?? "");
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}

/**
 * Επιστρέφει ασφαλή εσωτερική διαδρομή για redirect μετά από login/callback.
 * Δέχεται μόνο σχετικά paths του ίδιου site («/…»). Απορρίπτει «//evil.com»
 * και «/\\evil.com» (οι browsers τα ερμηνεύουν ως άλλο host) και κάθε απόλυτο URL,
 * ώστε ένα link `/login?next=https://evil.com` να μη γίνει open redirect.
 */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}

