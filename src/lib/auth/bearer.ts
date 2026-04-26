/**
 * Constant-time Bearer-token verification for cron / webhook endpoints.
 *
 * Plain `if (header === expected)` short-circuits on the first mismatching
 * byte. Over many probes an attacker can measure the response time delta
 * to recover the secret a byte at a time. `crypto.timingSafeEqual` does
 * the comparison in time proportional to the input length only — no early
 * exit on mismatch.
 *
 * Use at the top of any Route Handler that authenticates with a shared
 * secret in the Authorization header.
 */

import { timingSafeEqual } from "node:crypto";

export function verifyBearer(
  authorizationHeader: string | null | undefined,
  expectedSecret: string,
): boolean {
  if (!authorizationHeader || !expectedSecret) return false;
  const expected = `Bearer ${expectedSecret}`;
  // timingSafeEqual demands equal-length buffers — return false early on
  // length mismatch (the length itself is not secret).
  if (authorizationHeader.length !== expected.length) return false;
  const a = Buffer.from(authorizationHeader);
  const b = Buffer.from(expected);
  return timingSafeEqual(a, b);
}
