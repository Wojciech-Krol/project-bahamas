/**
 * Boost pricing table — hardcoded per plan section 3.4.
 *
 * Lives in its own module (NOT in `actions.ts`) because files with the
 * `"use server"` pragma can only export async functions — a plain object
 * export throws at build time with "A 'use server' file can only export
 * async functions".
 */

export const DURATIONS = [7, 14, 30] as const;
export type Duration = (typeof DURATIONS)[number];

/** Price in minor units (grosze). 4900 = 49 PLN, 8900 = 89 PLN, 16900 = 169 PLN. */
export const DURATION_PRICES_CENTS: Record<Duration, number> = {
  7: 4900,
  14: 8900,
  30: 16900,
};
