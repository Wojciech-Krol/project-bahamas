import { expect, test } from "@playwright/test";

/**
 * Partner apply E2E.
 *
 * Requires Phase 2 env to pass end-to-end:
 *   - NEXT_PUBLIC_SUPABASE_URL + keys (real DB)
 *   - UPSTASH_REDIS_REST_URL / TOKEN (rate limit — or unset to no-op)
 *   - NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY
 *     (the Turnstile widget refuses to issue a real token in headless
 *     browsers; tests need the staging site key `1x00000000000000000000AA`
 *     which always passes, plus the matching secret)
 *   - RESEND_API_KEY (otherwise email sends are stubbed — still passes
 *     but you won't see real mail; acceptable for CI)
 *
 * Skipped by default so the suite is green pre-launch. Remove `.skip`
 * once the operator provisions the services above and points the test
 * at a disposable Supabase project.
 */
test.skip("partner apply form submits successfully", async ({ page }) => {
  await page.goto("/pl/partners/apply");

  await page.getByLabel(/nazwa/i).fill("Test Studio");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/miasto/i).fill("Warszawa");

  await page.getByRole("button", { name: /wyślij/i }).click();

  await expect(page.getByText(/mamy twoje zgłoszenie/i)).toBeVisible({
    timeout: 10_000,
  });
});
