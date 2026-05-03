import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { getCurrentUser } from "@/src/lib/db/server";
import {
  exchangeCodeForTokens,
  isCalendarConfigured,
} from "@/src/lib/calendar/google";
import { upsertCalendarIntegration } from "@/src/lib/calendar/storage";

const STATE_COOKIE = "hk_cal_state";

function callbackUrl(req: NextRequest): string {
  // Prefer the actual origin we were called on so localhost ↔ prod
  // both work without env juggling. Fall back to NEXT_PUBLIC_SITE_URL.
  const base =
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/integrations/google-calendar/callback`;
}

function dashboardUrl(req: NextRequest, error?: string): string {
  // We don't know the user's locale here without a separate lookup,
  // so go through the locale-aware proxy at /account/calendar — the
  // next-intl middleware injects the right prefix.
  const url = new URL("/account/calendar", req.nextUrl.origin);
  if (error) url.searchParams.set("error", error);
  return url.toString();
}

export async function GET(req: NextRequest) {
  if (!isCalendarConfigured()) {
    return NextResponse.redirect(dashboardUrl(req, "missing_config"));
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  if (error || !code || !state) {
    return NextResponse.redirect(dashboardUrl(req, "oauth_failed"));
  }

  const cookieStore = await cookies();
  const expected = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!expected || expected !== state) {
    return NextResponse.redirect(dashboardUrl(req, "oauth_failed"));
  }

  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.redirect(dashboardUrl(req, "not_signed_in"));
  }

  // state shape: `<user_id>.<nonce>`. Reject if the user-id segment
  // doesn't match the currently signed-in user (race between
  // initiating user and callback consumer).
  const [stateUserId] = state.split(".");
  if (stateUserId !== current.user.id) {
    return NextResponse.redirect(dashboardUrl(req, "oauth_failed"));
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      redirectUri: callbackUrl(req),
    });
    await upsertCalendarIntegration(current.user.id, tokens);
  } catch (err) {
    console.error("[calendar/callback] failed", err);
    return NextResponse.redirect(dashboardUrl(req, "oauth_failed"));
  }

  return NextResponse.redirect(dashboardUrl(req));
}
