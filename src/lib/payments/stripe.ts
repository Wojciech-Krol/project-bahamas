// TODO-OPERATOR: sign DPA with Stripe before production (commit by launch — see LAUNCH_CHECKLIST.md).

/**
 * Stripe SDK singleton — SERVER-ONLY.
 *
 * Reads `STRIPE_SECRET_KEY` from the validated env, throws a clear error if it
 * was never set, and pins the API version so SDK upgrades never silently shift
 * webhook payload shapes under us.
 *
 * Mirrors the runtime-guard pattern from `src/lib/db/admin.ts` — importing this
 * module from client code is a build/runtime error, not a subtle leak of the
 * secret key through tree-shaking.
 *
 * Reserve for Server Actions, Route Handlers (webhooks), and background
 * workers. Browser code that needs Stripe.js should use
 * `@stripe/stripe-js` with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
 */

import Stripe from "stripe";

import { env } from "@/src/env";

// `env` on the server is the union of client + server schemas, but TypeScript
// narrows to the client shape when this file is typechecked as a library. This
// module is server-only (enforced at runtime below) — re-type `env` locally to
// include the server-only key so downstream code stays strict.
type ServerEnv = typeof env & { STRIPE_SECRET_KEY: string };

// Pinned API version. Matches the version the installed `stripe` package
// (v22.x) was generated against — see
// `node_modules/stripe/esm/apiVersion.d.ts`. Bump in lockstep with SDK
// upgrades after reviewing the Stripe changelog.
const STRIPE_API_VERSION = "2026-04-22.dahlia" as const;

let cached: Stripe | null = null;

/**
 * Build (or return the cached) Stripe client. Throws if called from the
 * browser or before the secret key has been provisioned.
 */
export function getStripe(): Stripe {
  if (typeof window !== "undefined") {
    throw new Error(
      "getStripe() was called in the browser. The Stripe secret key must " +
        "never be exposed to client code — import this module only from " +
        "Server Actions, Route Handlers, or background workers.",
    );
  }

  const serverEnv = env as ServerEnv;

  if (!serverEnv.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local " +
        "(server-only) and restart the dev server.",
    );
  }

  if (cached) return cached;

  // The SDK ships an exact literal type for `apiVersion` (LatestApiVersion),
  // but does not re-export its config interface through a public name reachable
  // as `Stripe.StripeConfig`. Building the config object separately and
  // annotating via `ConstructorParameters<typeof Stripe>[1]` keeps the call
  // typesafe without reaching into the SDK's internal module layout.
  type StripeClientConfig = NonNullable<ConstructorParameters<typeof Stripe>[1]>;

  const config: StripeClientConfig = {
    apiVersion: STRIPE_API_VERSION as StripeClientConfig["apiVersion"],
    typescript: true,
    appInfo: {
      name: "Hakuna",
      url: "https://hakuna.pl",
    },
  };

  cached = new Stripe(serverEnv.STRIPE_SECRET_KEY, config);

  return cached;
}
