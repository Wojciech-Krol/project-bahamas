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
  },
});
