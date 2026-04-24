"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/src/lib/db/server";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().min(1).max(120),
});

export type AuthActionState = {
  error?: string;
};

function originFromHeaders(host: string | null, proto: string | null) {
  if (!host) return "";
  return `${proto ?? "https"}://${host}`;
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "invalidCredentials" };
  }

  const locale = (formData.get("locale") as string) || "pl";
  redirect(`/${locale}`);
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });
  if (error) {
    return { error: "signupFailed" };
  }

  const locale = (formData.get("locale") as string) || "pl";
  redirect(`/${locale}`);
}

export async function googleSignInAction(formData: FormData): Promise<void> {
  const locale = (formData.get("locale") as string) || "pl";
  const headerList = await headers();
  const origin = originFromHeaders(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
    headerList.get("x-forwarded-proto"),
  );

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/${locale}`,
    },
  });
  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth`);
  }
  redirect(data.url);
}
