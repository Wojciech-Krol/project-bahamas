"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/src/lib/db/server";
import { safeNextPath } from "@/src/lib/auth/redirects";
import {
  getClientIp,
  loginRateLimiter,
  signupRateLimiter,
} from "@/src/lib/ratelimit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().min(1).max(120),
});

export type AuthActionState = {
  error?: string;
  awaitingConfirmation?: boolean;
  email?: string;
};

function originFromHeaders(host: string | null, proto: string | null) {
  if (!host) return "";
  return `${proto ?? "https"}://${host}`;
}

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  return originFromHeaders(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
    headerList.get("x-forwarded-proto"),
  );
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  // Rate-limit before any auth work — a credential-stuffing run shouldn't
  // be able to drive 1000 signInWithPassword calls/min/IP.
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await loginRateLimiter.check(ip);
  if (!limit.success) {
    return { error: "rateLimited" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Supabase 2.x distinguishes the unconfirmed-email state via `code` /
    // status. Surface a dedicated message so the form can prompt the user
    // to check their inbox instead of saying "wrong password".
    const code = (error as { code?: string }).code;
    if (
      code === "email_not_confirmed" ||
      error.message.toLowerCase().includes("confirm")
    ) {
      return { error: "emailNotConfirmed" };
    }
    return { error: "invalidCredentials" };
  }

  const locale = (formData.get("locale") as string) || "pl";
  const next = safeNextPath(formData.get("next") as string | null, locale);
  redirect(next);
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const locale = (formData.get("locale") as string) || "pl";

  // Rate-limit signups so disposable-inbox bots can't pre-register
  // thousands of accounts. Real users only sign up once.
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await signupRateLimiter.check(ip);
  if (!limit.success) {
    return { error: "rateLimited" };
  }

  const origin = await getOrigin();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, locale },
      // PKCE confirmation link comes back here. The callback runs
      // exchangeCodeForSession and sets the session cookie, then
      // forwards to `next` so the user lands signed in.
      emailRedirectTo: `${origin}/api/auth/callback?next=/${locale}`,
    },
  });
  if (error) {
    return { error: "signupFailed" };
  }

  // When Supabase Auth has "Confirm email" turned ON (default for hosted
  // projects), `signUp` returns the user but no session — the user has
  // to click the link in the confirmation email before they can sign in.
  // Don't redirect to home in that case; show a "check your inbox" panel.
  if (!data.session) {
    return { awaitingConfirmation: true, email: parsed.data.email };
  }

  redirect(`/${locale}`);
}

export async function googleSignInAction(formData: FormData): Promise<void> {
  const locale = (formData.get("locale") as string) || "pl";
  const next = safeNextPath(formData.get("next") as string | null, locale);
  const origin = await getOrigin();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth`);
  }
  redirect(data.url);
}
