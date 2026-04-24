"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";
import { sendEmail } from "@/src/lib/email/resend";
import { PartnerApproved } from "@/src/lib/email/templates/PartnerApproved";
import { PartnerRejected } from "@/src/lib/email/templates/PartnerRejected";
import { env } from "@/src/env";

/**
 * Admin server actions — approve / reject pending partner applications.
 *
 * Trust model: every action re-checks the admin guard via getCurrentUser().
 * The layout guard protects page renders; actions are separately reachable
 * POST endpoints and MUST re-authorize. Never trust the form payload alone.
 *
 * Data plane: we use the service-role client (createAdminClient) for the
 * actual writes. RLS policies also grant admin update (via is_admin()),
 * but service role is a strong single-purpose path that avoids RLS drift
 * when policies evolve — the admin-ness check is done explicitly here.
 */

type Locale = "pl" | "en";

const LOCALES = ["pl", "en"] as const;

const ApproveSchema = z.object({
  partner_id: z.string().uuid(),
  locale: z.enum(LOCALES),
});

const RejectSchema = z.object({
  partner_id: z.string().uuid(),
  locale: z.enum(LOCALES),
  reason: z.string().trim().max(500).optional(),
});

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string;
  status: "pending" | "approved" | "suspended" | "rejected";
};

async function requireAdmin(): Promise<void> {
  const current = await getCurrentUser();
  const role = current?.profile?.role as string | undefined;
  if (!current || role !== "admin") {
    // Matches the layout's "don't reveal existence" posture. A non-admin
    // probing the action directly gets the same generic error a random
    // failure would produce — no hint that admin actions even exist.
    throw new Error("not-authorized");
  }
}

function getSiteBaseUrl(): string | undefined {
  return env.NEXT_PUBLIC_SITE_URL ?? undefined;
}

export async function approvePartner(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = ApproveSchema.safeParse({
    partner_id: formData.get("partner_id"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    console.error("[admin.approvePartner] invalid input");
    return;
  }
  const { partner_id, locale } = parsed.data;

  const admin = createAdminClient();

  const { data: partner, error: loadError } = await admin
    .from("partners")
    .select("id, name, contact_email, status")
    .eq("id", partner_id)
    .maybeSingle();

  if (loadError || !partner) {
    console.error("[admin.approvePartner] load failed", loadError);
    return;
  }

  const row = partner as PartnerRow;
  if (row.status !== "pending") {
    console.warn("[admin.approvePartner] already-decided", {
      id: row.id,
      status: row.status,
    });
    revalidatePath(`/${locale}/admin`);
    return;
  }

  const { error: updateError } = await admin
    .from("partners")
    .update({ status: "approved" })
    .eq("id", partner_id)
    .eq("status", "pending"); // optimistic concurrency against racing admins
  if (updateError) {
    console.error("[admin.approvePartner] update failed", updateError);
    return;
  }

  // Link to an existing auth user if one is already registered with this
  // contact email. Supabase doesn't expose a direct "get user by email"
  // endpoint stably, so we page through admin.auth.listUsers and match.
  // Approval volume is low (admin action, one at a time) so this is fine.
  let existingUserId: string | null = null;
  try {
    const { data: usersPage } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const match = usersPage?.users.find(
      (u) =>
        typeof u.email === "string" &&
        u.email.toLowerCase() === row.contact_email.toLowerCase(),
    );
    existingUserId = match?.id ?? null;
  } catch {
    existingUserId = null;
  }

  let magicLink: string | undefined;

  if (existingUserId) {
    // Link their existing user to the partner as owner. Ignore conflicts —
    // if the row already exists (e.g. re-approval), that's fine.
    await admin.from("partner_members").upsert(
      {
        partner_id: row.id,
        user_id: existingUserId,
        role: "owner",
      },
      { onConflict: "partner_id,user_id" },
    );
  } else {
    // No account yet — generate a magic link they can use to finish setup.
    // The member row gets created later when they first authenticate + an
    // admin or onboarding flow wires it up. We intentionally do NOT auto-
    // invent an auth user here (generateLink in 'magiclink' mode does not
    // create the user — it only works for users created via invite or
    // subsequent sign-up). If the email is valid, generateLink may 422 —
    // we swallow that and the email goes out without a one-click link.
    try {
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: row.contact_email,
      });
      magicLink = linkData?.properties?.action_link ?? undefined;
    } catch {
      magicLink = undefined;
    }
  }

  try {
    await sendEmail({
      to: row.contact_email,
      subject:
        locale === "pl"
          ? "Twoje zgłoszenie do Hakuna zostało zaakceptowane"
          : "Your Hakuna partner application is approved",
      react: PartnerApproved({
        partnerName: row.name,
        locale: locale as Locale,
        magicLink,
        baseUrl: getSiteBaseUrl(),
      }),
    });
  } catch (e) {
    // Email delivery failure must not poison the state transition — the
    // partner is already approved in the DB. Log and continue; the admin
    // can resend manually if needed.
    console.error("[admin.approvePartner] email send failed", e);
  }

  revalidatePath(`/${locale}/admin`);
}

export async function rejectPartner(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = RejectSchema.safeParse({
    partner_id: formData.get("partner_id"),
    locale: formData.get("locale"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success) {
    console.error("[admin.rejectPartner] invalid input");
    return;
  }
  const { partner_id, locale, reason } = parsed.data;
  const trimmedReason = reason && reason.length > 0 ? reason : undefined;

  const admin = createAdminClient();

  const { data: partner, error: loadError } = await admin
    .from("partners")
    .select("id, name, contact_email, status")
    .eq("id", partner_id)
    .maybeSingle();

  if (loadError || !partner) {
    console.error("[admin.rejectPartner] load failed", loadError);
    return;
  }

  const row = partner as PartnerRow;
  if (row.status !== "pending") {
    console.warn("[admin.rejectPartner] already-decided", {
      id: row.id,
      status: row.status,
    });
    revalidatePath(`/${locale}/admin`);
    return;
  }

  const { error: updateError } = await admin
    .from("partners")
    .update({ status: "rejected" })
    .eq("id", partner_id)
    .eq("status", "pending");
  if (updateError) {
    console.error("[admin.rejectPartner] update failed", updateError);
    return;
  }

  try {
    await sendEmail({
      to: row.contact_email,
      subject:
        locale === "pl"
          ? "Aktualizacja zgłoszenia do Hakuna"
          : "An update on your Hakuna partner application",
      react: PartnerRejected({
        partnerName: row.name,
        locale: locale as Locale,
        reason: trimmedReason,
      }),
    });
  } catch (e) {
    console.error("[admin.rejectPartner] email send failed", e);
  }

  revalidatePath(`/${locale}/admin`);
}
