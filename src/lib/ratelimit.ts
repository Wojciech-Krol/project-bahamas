/**
 * Upstash-backed sliding-window rate limiter with graceful degradation.
 *
 * When the Upstash Redis env is missing (local dev, pre-launch staging
 * without a Redis instance provisioned) `check()` is a no-op: every call
 * reports success and burns no quota. A single warn is emitted the first
 * time the no-op path is hit so the operator knows the limiter isn't
 * actually enforcing anything.
 *
 * Wire up by setting both `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` — the limiter becomes active on next process
 * start. The Supabase/Resend libs follow the same degradation pattern.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/src/env";

// `env` resolves to the client-only shape at the type level (the runtime
// parses the server schema on the server, but TS infers from the union
// intersection). Server-only keys are real at runtime; re-type locally so
// we can read them without fighting the union. Mirrors the pattern in
// `src/lib/db/admin.ts`.
type ServerEnv = typeof env & {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
};

const serverEnv = env as ServerEnv;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

export type RateLimiter = {
  check: (identifier: string) => Promise<RateLimitResult>;
};

type RateLimiterOptions = {
  windowSeconds: number;
  requests: number;
};

let cachedRedis: Redis | null = null;
let noopWarned = false;

function getRedis(): Redis | null {
  if (!serverEnv.UPSTASH_REDIS_REST_URL || !serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!cachedRedis) {
    cachedRedis = new Redis({
      url: serverEnv.UPSTASH_REDIS_REST_URL,
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return cachedRedis;
}

/**
 * Build a named rate limiter. Each `name` shares a Redis keyspace
 * (`rl:<name>:<identifier>`) so limiters with different names don't
 * collide even at the same identifier.
 */
export function createRateLimiter(
  name: string,
  options: RateLimiterOptions,
): RateLimiter {
  const redis = getRedis();

  if (!redis) {
    return {
      async check(): Promise<RateLimitResult> {
        if (!noopWarned) {
          noopWarned = true;
          console.warn(
            "[ratelimit] Upstash not configured, running in no-op mode",
          );
        }
        return {
          success: true,
          limit: options.requests,
          remaining: options.requests,
          resetMs: 0,
        };
      },
    };
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      options.requests,
      `${options.windowSeconds} s`,
    ),
    prefix: `rl:${name}`,
    analytics: false,
  });

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        // Upstash returns `reset` as an absolute epoch ms timestamp.
        resetMs: result.reset,
      };
    },
  };
}

/**
 * Pre-configured limiter for the partner-apply form: 5 submissions per
 * hour per IP. Import and call `.check(ip)` from the Server Action.
 */
export const partnerApplyRateLimiter = createRateLimiter("partner-apply", {
  windowSeconds: 60 * 60,
  requests: 5,
});

/**
 * Extract a best-effort client IP. Reads standard proxy headers in the
 * order Vercel / Cloudflare / generic reverse proxies set them. Accepts
 * either a `Request` (the usual Server Action / Route Handler input) or
 * a raw `Headers` object (for callers that already destructured it).
 *
 * Falls back to `"unknown"` — callers should be fine rate-limiting a
 * shared bucket for traffic we can't identify, since real clients behind
 * a proxy will have headers set.
 */
export function getClientIp(source: Request | Headers): string {
  const headers: Headers = source instanceof Headers ? source : source.headers;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) return trimmed;
  }

  return "unknown";
}
