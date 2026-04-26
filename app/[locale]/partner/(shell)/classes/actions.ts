"use server";

/**
 * Partner class CRUD — Server Actions invoked by the editor.
 *
 * Auth: every action re-resolves the current user, then checks `partner_members`
 * to confirm they belong to the partner that owns the venue. RLS would also
 * block writes, but doing it here returns a useful error string instead of a
 * generic Postgres permission denial.
 *
 * All writes go through the request-scoped client so RLS is in play. We don't
 * need the admin client here — a partner editing their own catalog is exactly
 * the case the partner_members policies were written for.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, getCurrentUser } from "@/src/lib/db/server";

const i18nString = z.string().min(0).max(500);

const upsertSchema = z.object({
  venueId: z.string().uuid(),
  titlePl: i18nString,
  titleEn: i18nString,
  descriptionPl: i18nString.max(2000),
  descriptionEn: i18nString.max(2000),
  level: z.string().max(60).optional(),
  category: z.string().max(60).optional(),
  ageGroup: z.string().max(60).optional(),
  durationMin: z.coerce.number().int().min(5).max(720),
  price: z.coerce.number().min(0).max(100000),
  currency: z.enum(["PLN", "EUR", "GBP", "USD"]),
  heroImage: z.string().url().or(z.literal("")).optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type ClassActionResult =
  | { ok: true; id: string }
  | { error: string };

async function assertPartnerOwnsVenue(venueId: string): Promise<string | null> {
  const current = await getCurrentUser();
  if (!current) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("partner_id, partner:partners!inner(id, partner_members!inner(user_id))")
    .eq("id", venueId)
    .maybeSingle();
  if (error || !data) return null;

  const partnerId = (data as { partner_id: string }).partner_id;
  const { data: membership } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("partner_id", partnerId)
    .eq("user_id", current.user.id)
    .maybeSingle();
  if (!membership) return null;
  return partnerId;
}

function readForm(formData: FormData) {
  return upsertSchema.safeParse({
    venueId: formData.get("venueId"),
    titlePl: formData.get("titlePl") ?? "",
    titleEn: formData.get("titleEn") ?? "",
    descriptionPl: formData.get("descriptionPl") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    level: formData.get("level") ?? undefined,
    category: formData.get("category") ?? undefined,
    ageGroup: formData.get("ageGroup") ?? undefined,
    durationMin: formData.get("durationMin"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    heroImage: formData.get("heroImage") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });
}

function toRow(parsed: z.infer<typeof upsertSchema>) {
  return {
    venue_id: parsed.venueId,
    title_i18n: { pl: parsed.titlePl, en: parsed.titleEn },
    description_i18n: { pl: parsed.descriptionPl, en: parsed.descriptionEn },
    level: parsed.level || null,
    category: parsed.category || null,
    age_group: parsed.ageGroup || null,
    duration_min: parsed.durationMin,
    price_cents: Math.round(parsed.price * 100),
    currency: parsed.currency,
    hero_image: parsed.heroImage || null,
    is_published: parsed.isPublished ?? false,
  };
}

export async function createActivity(
  formData: FormData,
): Promise<ClassActionResult> {
  const parsed = readForm(formData);
  if (!parsed.success) return { error: "invalid_input" };

  const partnerId = await assertPartnerOwnsVenue(parsed.data.venueId);
  if (!partnerId) return { error: "forbidden" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createActivity] insert failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/classes");
  return { ok: true, id: data.id as string };
}

export async function updateActivity(
  activityId: string,
  formData: FormData,
): Promise<ClassActionResult> {
  if (!activityId) return { error: "invalid_input" };
  const parsed = readForm(formData);
  if (!parsed.success) return { error: "invalid_input" };

  const partnerId = await assertPartnerOwnsVenue(parsed.data.venueId);
  if (!partnerId) return { error: "forbidden" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update(toRow(parsed.data))
    .eq("id", activityId);

  if (error) {
    console.error("[updateActivity] update failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/classes");
  revalidatePath(`/partner/classes/${activityId}`);
  return { ok: true, id: activityId };
}

export async function deleteActivity(
  activityId: string,
): Promise<ClassActionResult> {
  if (!activityId) return { error: "invalid_input" };

  const current = await getCurrentUser();
  if (!current) return { error: "forbidden" };

  const supabase = await createClient();
  // The RLS policy enforces partner-membership on delete; we still run a
  // visibility check first so we can return a useful error instead of a
  // generic 0-rows-affected.
  const { data: existing } = await supabase
    .from("activities")
    .select("id")
    .eq("id", activityId)
    .maybeSingle();
  if (!existing) return { error: "not_found" };

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    console.error("[deleteActivity] delete failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/classes");
  return { ok: true, id: activityId };
}
