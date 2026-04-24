/**
 * Cloudflare Turnstile server-side verification.
 *
 * When `TURNSTILE_SECRET_KEY` is missing the verifier is a no-op: every
 * token (including `""`) resolves as a successful verification. The
 * matching client component (`TurnstileWidget`) skips rendering when
 * the public site key is absent, so the whole flow degrades cleanly in
 * dev. A single warn is emitted on first use to flag the situation.
 *
 * `turnstileEnabled` is the public switch the UI uses to decide whether
 * to bother wiring the widget. Keep the server-side no-op in sync — if
 * UI renders nothing, server must accept empty tokens.
 */

import { env } from "@/src/env";

// See note in `src/lib/ratelimit.ts` — `env` is typed against the client
// schema, so server-only keys need a local re-type to be readable.
type ServerEnv = typeof env & { TURNSTILE_SECRET_KEY?: string };
const serverEnv = env as ServerEnv;

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5000;

export const turnstileEnabled = Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export type TurnstileVerifyResult = {
  success: boolean;
  errorCodes?: string[];
};

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

let noopWarned = false;

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint.
 *
 * @param token     The token returned by the client widget. In no-op mode
 *                  this is allowed to be `""`.
 * @param clientIp  Optional client IP; forwarded as `remoteip` to help
 *                  Cloudflare's risk scoring.
 *
 * Pre-config behaviour:
 *   * In dev / test / preview deploys the verifier is a no-op and accepts
 *     every token, including `""`. The matching client widget renders
 *     nothing in this case so the user never sees a broken captcha.
 *   * In production the verifier FAILS CLOSED — `verifyTurnstile` returns
 *     `success: false` so the apply form rejects the submission. This
 *     keeps a missing key from silently leaving the form unprotected on
 *     the live site. Set `TURNSTILE_DEV_BYPASS=1` to opt into the no-op
 *     fallback in production (e.g. for staging environments without a
 *     dedicated Cloudflare site key).
 */
export async function verifyTurnstile(
  token: string,
  clientIp?: string,
): Promise<TurnstileVerifyResult> {
  if (!serverEnv.TURNSTILE_SECRET_KEY) {
    const isProd = process.env.NODE_ENV === "production";
    const devBypass = process.env.TURNSTILE_DEV_BYPASS === "1";
    if (isProd && !devBypass) {
      if (!noopWarned) {
        noopWarned = true;
        console.error(
          "[turnstile] TURNSTILE_SECRET_KEY missing in production — " +
            "rejecting submission. Set the secret or TURNSTILE_DEV_BYPASS=1.",
        );
      }
      return {
        success: false,
        errorCodes: ["server-not-configured"],
      };
    }
    if (!noopWarned) {
      noopWarned = true;
      console.warn(
        "[turnstile] Turnstile not configured, bot protection disabled",
      );
    }
    return { success: true };
  }

  const body = new URLSearchParams();
  body.set("secret", serverEnv.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (clientIp && clientIp !== "unknown") {
    body.set("remoteip", clientIp);
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        success: false,
        errorCodes: [`http-${response.status}`],
      };
    }

    const json = (await response.json()) as SiteverifyResponse;
    return {
      success: json.success,
      errorCodes: json["error-codes"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[turnstile] verification failed:", message);
    return {
      success: false,
      errorCodes: ["network-error"],
    };
  }
}
