import { expect, test } from "@playwright/test";

/**
 * Minimum-viable liveness check — if this fails, something catastrophic
 * broke in the marketing build. Keeps the suite green by default so we
 * can rely on `test:e2e` as a CI gate while Phase 2+ tests stay
 * `.skip()`'d awaiting real env.
 */
test("home page renders with the site navbar", async ({ page }) => {
  await page.goto("/pl");
  await expect(page.getByTestId("site-navbar")).toBeVisible();
});
