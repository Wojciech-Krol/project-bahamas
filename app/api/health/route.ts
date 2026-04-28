/**
 * Health probe.
 *
 * GET `/api/health` returns the liveness of our core dependencies. The
 * monitoring system points here; a non-200 is a pageable event.
 *
 * Checks:
 *   - db:     quick `select 1` through the admin client.
 *   - stripe: `balance.retrieve()` when STRIPE_SECRET_KEY is set;
 *             `"not_configured"` when it isn't.
 *   - resend: env presence check. Resend has no public ping endpoint
 *             and we don't want health pings to burn quota, so we
 *             settle for "configured? y/n".
 *   - version: the release string used elsewhere (Vercel SHA or "dev").
 *
 * Overall status:
 *   200 when nothing is `down` (and at least db + (stripe or
 *       not_configured) are healthy).
 *   503 otherwise.
 */

import { NextResponse } from "next/server";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";
import { getStripe } from "@/src/lib/payments/stripe";

type ServerEnv = typeof env & {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "down" | "not_configured";

export async function GET() {
  const serverEnv = env as ServerEnv;

  type Checks = {
    db: CheckStatus;
    stripe: CheckStatus;
    resend: CheckStatus;
    version: string;
  };
  // Annotate via function-scoped alias so subsequent writes don't narrow
  // the field type below the union (TS would otherwise see only the
  // literal values we assigned).
  const checks: Checks = {
    db: "not_configured",
    stripe: "not_configured",
    resend: "not_configured",
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  };
  // Force the union type to stick across conditional assignments below.
  const setCheck = <K extends keyof Checks>(key: K, value: Checks[K]): void => {
    checks[key] = value;
  };

  // DB
  if (serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      // Cheapest possible probe that still touches auth + the DB:
      // select a single row from a table that always exists. We use
      // `profiles` with `limit(1)` — no filter, admin bypasses RLS,
      // so we're confident this succeeds on a healthy cluster even
      // when the table is empty.
      const { error } = await admin.from("profiles").select("id").limit(1);
      setCheck("db", error ? "down" : "ok");
    } catch {
      setCheck("db", "down");
    }
  }

  // Stripe
  if (serverEnv.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      await stripe.balance.retrieve();
      setCheck("stripe", "ok");
    } catch {
      setCheck("stripe", "down");
    }
  }

  // Resend
  setCheck("resend", serverEnv.RESEND_API_KEY ? "ok" : "not_configured");

  const anyDown =
    checks.db === "down" ||
    checks.stripe === "down" ||
    checks.resend === "down";

  // Treat `db: not_configured` as down too — we require Supabase in
  // prod. Stripe + Resend can legitimately be `not_configured` on a
  // preview deploy, so those don't fail the check.
  const dbHealthy = checks.db === "ok";

  const ok = !anyDown && dbHealthy;

  return NextResponse.json(
    { ok, checks },
    { status: ok ? 200 : 503 },
  );
}
