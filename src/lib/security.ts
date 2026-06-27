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
