import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config.
 *
 * `webServer` boots `next dev` on an isolated port (3333) so the suite
 * doesn't collide with a developer's normal 3000. CI should set
 * `CI=true` which flips retries on and disables webServer reuse.
 *
 * Test files live under `tests/e2e/`. Unit tests (vitest) stay in
 * `tests/*.spec.ts` at the top level and are picked up by the
 * vitest config, not this one — Playwright's `testDir` keeps them
 * separate.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3333",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3333",
    url: "http://localhost:3333",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
