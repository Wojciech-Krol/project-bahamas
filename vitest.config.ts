import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Project uses tsconfig path alias "@/*": ["./*"] (see tsconfig.json).
// Mirror it here so tests can import with the same alias as app code.
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.spec.ts", "src/**/*.spec.ts"],
    // Playwright has its own runner at `tests/e2e/` — don't let vitest
    // try to execute those specs (they import from `@playwright/test`
    // and rely on a running dev server + browser).
    exclude: ["node_modules", "dist", ".next", "tests/e2e/**"],
  },
});
