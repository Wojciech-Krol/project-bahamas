"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";
import { sendEmail } from "@/src/lib/email/resend";
import { AdminNewApplication } from "@/src/lib/email/templates/AdminNewApplication";
import { PartnerApplicationReceived } from "@/src/lib/email/templates/PartnerApplicationReceived";
import {
  getClientIp,
  partnerApplyRateLimiter,
} from "@/src/lib/ratelimit";
import { verifyTurnstile } from "@/src/lib/turnstile";

/**
 * Selectable brackets for the optional `expected_monthly_bookings` field.
 * Kept in sync with the <select> in PartnerApplyForm.tsx.
 *
 * NOTE: the `partners` table has no column for this value; it is not
 * persisted to the DB. We surface it in the admin notification email only.
 */
const EXPECTED_BRACKETS = ["<50", "50-200", "200-500", "500+"] as const;
type ExpectedBracket = (typeof EXPECTED_BRACKETS)[number];

const applySchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(254),
  city: z.string().trim().min(1).max(80),
  website: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => {
        if (!v) return true;
        try {
          // Accept URLs with or without protocol — normalize in the action.
          const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
          // eslint-disable-next-line no-new
          new URL(withProto);
          return true;
        } catch {
          return false;
        }
      },
      { message: "invalid_url" },
    ),
  expected_monthly_bookings: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v): v is ExpectedBracket | undefined =>
        v === undefined ||
        (EXPECTED_BRACKETS as readonly string[]).includes(v),
      { message: "invalid_choice" },
    ),
  locale: z.enum(["pl", "en"]).default("pl"),
  turnstile_token: z.string().optional().default(""),
});

export type ApplyFieldErrors = {
  name?: string[];
  contact_email?: string[];
  city?: string[];
  website?: string[];
  expected_monthly_bookings?: string[];
};

export type ApplyActionState =
  | { ok: true }
  | {
      ok?: false;
      error:
        | "validation"
        | "rateLimited"
        | "botCheck"
        | "server";
      fields?: ApplyFieldErrors;
      retryAfterMs?: number;
    }
  | Record<string, never>;

const DIACRITICS = /\p{Diacritic}/gu;
const NON_KEBAB = /[^a-z0-9]+/g;
const EDGE_DASH = /^-+|-+$/g;

function toSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(NON_KEBAB, "-")
    .replace(EDGE_DASH, "")
    .slice(0, 80);
}

function randomSuffix(): string {
  // 6 hex chars = 3 bytes; cheap collision guard.
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeWebsite(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function resolveUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  baseSlug: string,
): Promise<string> {
  const seed = baseSlug || "partner";
  // Try the base slug first, then up to 3 randomized suffixes. Each query
  // is a cheap unique-index check.
  const candidates: string[] = [seed];
  for (let i = 0; i < 3; i += 1) {
    candidates.push(`${seed}-${randomSuffix()}`);
  }

  for (const candidate of candidates) {
    const { data, error } = await admin
      .from("partners")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      // RLS or connectivity issue — surface to caller.
      throw new Error(`slug lookup failed: ${error.message}`);
    }
    if (!data) {
      return candidate;
    }
  }

  // Extremely unlikely, but guarantee uniqueness even if all candidates collided.
  return `${seed}-${Date.now().toString(36)}-${randomSuffix()}`;
}

export async function applyAsPartner(
  _prev: ApplyActionState,
  formData: FormData,
): Promise<ApplyActionState> {
  const raw = {
    name: formData.get("name"),
    contact_email: formData.get("contact_email"),
    city: formData.get("city"),
    website: formData.get("website"),
    expected_monthly_bookings: formData.get("expected_monthly_bookings"),
    locale: formData.get("locale"),
    turnstile_token: formData.get("turnstile_token"),
  };

  const parsed = applySchema.safeParse(raw);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      error: "validation",
      fields: flattened.fieldErrors as ApplyFieldErrors,
    };
  }

  const input = parsed.data;

  // Rate-limit by IP — must hit before any network-bound work.
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await partnerApplyRateLimiter.check(ip);
  if (!limit.success) {
    const retryAfterMs = Math.max(0, limit.resetMs - Date.now());
    return { error: "rateLimited", retryAfterMs };
  }

  // Bot check.
  const bot = await verifyTurnstile(input.turnstile_token, ip);
  if (!bot.success) {
    return { error: "botCheck" };
  }

  const admin = createAdminClient();

  let slug: string;
  try {
    slug = await resolveUniqueSlug(admin, toSlug(input.name));
  } catch (err) {
    console.error("[partner-apply] slug resolution failed", err);
    return { error: "server" };
  }

  const websiteUrl = normalizeWebsite(input.website);

  const { error: insertError } = await admin.from("partners").insert({
    name: input.name,
    slug,
    contact_email: input.contact_email,
    city: input.city,
    status: "pending",
    commission_rate_bps: 2000,
  });

  if (insertError) {
    console.error("[partner-apply] insert failed", insertError);
    return { error: "server" };
  }

  // Applicant confirmation — locale-aware. Failures are non-fatal.
  try {
    await sendEmail({
      to: input.contact_email,
      subject:
        input.locale === "pl"
          ? "Hakuna — otrzymaliśmy Twoje zgłoszenie"
          : "Hakuna — we got your application",
      react: PartnerApplicationReceived({
        partnerName: input.name,
        locale: input.locale,
      }),
    });
  } catch (err) {
    console.error("[partner-apply] applicant email failed", err);
  }

  // Admin notification — optional; warn if not configured.
  const serverEnv = env as typeof env & {
    ADMIN_NOTIFICATION_EMAIL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
  };
  const adminEmail = serverEnv.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const siteOrigin =
      serverEnv.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      `https://${headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "hakuna.example"}`;
    try {
      await sendEmail({
        to: adminEmail,
        subject: `New partner application: ${input.name}`,
        react: AdminNewApplication({
          partnerName: input.name,
          contactEmail: input.contact_email,
          city: input.city,
          website: websiteUrl,
          expectedMonthlyBookings: input.expected_monthly_bookings,
          adminUrl: `${siteOrigin}/${input.locale}/admin`,
        }),
      });
    } catch (err) {
      console.error("[partner-apply] admin email failed", err);
    }
  } else {
    console.warn(
      "[partner-apply] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification",
    );
  }

  return { ok: true };
}
