import { test } from "@playwright/test";

/**
 * Cancellation window enforcement — placeholder Phase 3 tests.
 *
 * TODOs before un-skipping:
 *   - Full Phase 3 env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *     STRIPE_CONNECT_WEBHOOK_SECRET (test-mode keys).
 *   - A seeded partner with a connected Stripe Express account and
 *     charges_enabled.
 *   - A seeded session at a known distance from `now()` — one
 *     >= 49h out, one < 48h — so the 48-hour window check deterministically
 *     passes/fails.
 *   - A logged-in test user (`storageState` fixture, ideally seeded via
 *     an auth helper that goes through the Supabase admin API).
 *   - Stripe CLI forwarding webhooks to localhost:3333 so
 *     `createBooking` -> `checkout.session.completed` -> booking
 *     confirmation is observable in-test.
 */

test.skip("cancel >=48h succeeds", async () => {
  // Visit /pl/account/bookings (not built yet), find the seeded
  // booking, click cancel, expect success + a refund record.
});

test.skip("cancel <48h fails", async () => {
  // Same fixture but with a session < 48h away. Expect a non-200
  // response and a "cannot cancel within 48h" error message.
});
