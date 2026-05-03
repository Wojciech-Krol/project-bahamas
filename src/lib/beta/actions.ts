"use server";

import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { z } from "zod";

import { createAdminClient } from "@/src/lib/db/admin";
import { sendEmail } from "@/src/lib/email/resend";
import { BetaSignupConfirm } from "@/src/lib/email/templates/BetaSignupConfirm";
import { betaSignupRateLimiter, getClientIp } from "@/src/lib/ratelimit";
import { verifyTurnstile } from "@/src/lib/turnstile";

export type SubmitBetaSignupResult =
  | { ok: true }
  | { ok: false; error: "validation" | "rate_limited" | "bot_check" | "server" };

const submitSchema = z.object({
  email: z.string().email().max(254),
  locale: z.enum(["pl", "en"]).default("pl"),
  source: z.string().max(64).optional(),
  variant: z.enum(["beta", "business"]).default("beta"),
  turnstile_token: z.string().max(2048).optional(),
});

/** Salted SHA-256 of an IP, truncated. Lets us de-dupe + rate-limit
 *  in DB without storing the raw IP (data minimisation). */
function hashIp(ip: string): string {
  const salt = process.env.BETA_SIGNUP_IP_SALT ?? "hakuna-beta-fallback-salt";
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

export async function submitBetaSignup(
  raw: unknown,
): Promise<SubmitBetaSignupResult> {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };
  const input = parsed.data;

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const userAgent = headerList.get("user-agent")?.slice(0, 256) ?? null;

  const limit = await betaSignupRateLimiter.check(ip);
  if (!limit.success) return { ok: false, error: "rate_limited" };

  // Turnstile token may be absent in legacy callers (the existing form
  // hasn't been wired with the widget yet). When the secret is configured
  // we still want bot-check to fail closed for missing tokens; when it
  // isn't (local dev, pre-launch) the verifier no-ops.
  const bot = await verifyTurnstile(input.turnstile_token ?? "", ip);
  if (!bot.success) return { ok: false, error: "bot_check" };

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[beta-signup] admin client unavailable", err);
    return { ok: false, error: "server" };
  }

  // Upsert on the citext PK — duplicate signups are a no-op for the user
  // (we don't leak that the email is on the list). `onConflict: 'email'`
  // collapses the second insert to nothing and the row's existing
  // `created_at` is preserved.
  const { error: insertError } = await admin
    .from("beta_signups")
    .upsert(
      {
        email: input.email,
        locale: input.locale,
        source: input.source ?? null,
        variant: input.variant,
        ip_hash: hashIp(ip),
        user_agent: userAgent,
      },
      { onConflict: "email", ignoreDuplicates: true },
    );

  if (insertError) {
    console.error("[beta-signup] insert failed", insertError);
    return { ok: false, error: "server" };
  }

  // Confirmation email. Failures are non-fatal — the row is persisted,
  // and the operator can resend from the admin tooling later.
  try {
    await sendEmail({
      to: input.email,
      subject:
        input.locale === "pl"
          ? "Jesteś na liście bety Hakuna"
          : "You're on the Hakuna beta list",
      react: BetaSignupConfirm({ email: input.email, locale: input.locale }),
    });
  } catch (err) {
    console.error("[beta-signup] confirmation email failed", err);
  }

  return { ok: true };
}
