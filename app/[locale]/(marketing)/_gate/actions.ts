"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  LANDING_GATE_COOKIE,
  LANDING_GATE_OPEN_VALUE,
} from "@/app/lib/landingGate";
import { routing } from "@/src/i18n/routing";

const PASSWORD = process.env.LANDING_GATE_PASSWORD ?? "Proj3kt-Bachamy2030";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type GateState = { error: "wrong" | null };

export async function unlockLandingGate(
  _prev: GateState,
  formData: FormData,
): Promise<GateState> {
  const submitted = String(formData.get("password") ?? "");
  const rawLocale = String(formData.get("locale") ?? routing.defaultLocale);
  const locale = (routing.locales as readonly string[]).includes(rawLocale)
    ? rawLocale
    : routing.defaultLocale;

  if (submitted !== PASSWORD) {
    return { error: "wrong" };
  }

  const store = await cookies();
  store.set({
    name: LANDING_GATE_COOKIE,
    value: LANDING_GATE_OPEN_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect(`/${locale}`);
}
