/**
 * Next.js 16 instrumentation hook.
 *
 * `register()` is called exactly once per server instance (Node.js or Edge)
 * before the first request is served. We fan out to the runtime-specific
 * Sentry config so each surface inits its own SDK — the Node SDK and the
 * Edge SDK are not interchangeable, so we must not import both.
 *
 * The individual config modules no-op when their DSN env isn't set, so
 * this file is safe to keep loaded in every environment.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
