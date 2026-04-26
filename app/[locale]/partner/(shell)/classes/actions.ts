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
const optionalUrl = z.string().url().or(z.literal("")).optional();

const curriculumItemSchema = z.object({
  titlePl: i18nString,
  titleEn: i18nString,
  descriptionPl: i18nString.max(2000),
  descriptionEn: i18nString.max(2000),
  imageUrl: optionalUrl,
});

const credentialSchema = z.object({
  icon: z.string().max(60),
  labelPl: i18nString,
  labelEn: i18nString,
});

const instructorSchema = z.object({
  name: z.string().min(1).max(120),
  rolePl: i18nString,
  roleEn: i18nString,
  bioPl: i18nString.max(2000),
  bioEn: i18nString.max(2000),
  avatarUrl: optionalUrl,
  credentials: z.array(credentialSchema).max(8).default([]),
});

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
  heroImage: optionalUrl,
  isPublished: z.coerce.boolean().optional(),
  curriculum: z.array(curriculumItemSchema).max(20).default([]),
  instructors: z.array(instructorSchema).max(8).default([]),
});

type UpsertData = z.infer<typeof upsertSchema>;

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

function readJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
    curriculum: readJsonField<unknown[]>(formData.get("curriculum"), []),
    instructors: readJsonField<unknown[]>(formData.get("instructors"), []),
  });
}

function toRow(parsed: UpsertData) {
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

/**
 * Replace the curriculum + instructor child rows for an activity.
 * Supabase JS doesn't expose multi-statement transactions, so we accept
 * a small inconsistency window between the delete and the insert. The
 * partner editor is single-user-per-activity so the window is harmless;
 * if a concurrent reader hits the gap they see an empty list, which is
 * consistent with "the partner is editing".
 */
async function replaceChildRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  activityId: string,
  parsed: UpsertData,
): Promise<{ ok: true } | { error: string }> {
  // curriculum
  const { error: delCurErr } = await supabase
    .from("activity_curriculum_items")
    .delete()
    .eq("activity_id", activityId);
  if (delCurErr) {
    console.error("[replaceChildRows] curriculum delete failed", delCurErr);
    return { error: "internal" };
  }
  if (parsed.curriculum.length > 0) {
    const rows = parsed.curriculum.map((c, idx) => ({
      activity_id: activityId,
      position: idx,
      title_i18n: { pl: c.titlePl, en: c.titleEn },
      description_i18n: { pl: c.descriptionPl, en: c.descriptionEn },
      image_url: c.imageUrl || null,
    }));
    const { error: insCurErr } = await supabase
      .from("activity_curriculum_items")
      .insert(rows);
    if (insCurErr) {
      console.error("[replaceChildRows] curriculum insert failed", insCurErr);
      return { error: "internal" };
    }
  }

  // instructors
  const { error: delInsErr } = await supabase
    .from("activity_instructors")
    .delete()
    .eq("activity_id", activityId);
  if (delInsErr) {
    console.error("[replaceChildRows] instructors delete failed", delInsErr);
    return { error: "internal" };
  }
  if (parsed.instructors.length > 0) {
    const rows = parsed.instructors.map((i, idx) => ({
      activity_id: activityId,
      position: idx,
      name: i.name,
      role_i18n: { pl: i.rolePl, en: i.roleEn },
      bio_i18n: { pl: i.bioPl, en: i.bioEn },
      avatar_url: i.avatarUrl || null,
      credentials_i18n: i.credentials.map((c) => ({
        icon: c.icon,
        label_i18n: { pl: c.labelPl, en: c.labelEn },
      })),
    }));
    const { error: insInsErr } = await supabase
      .from("activity_instructors")
      .insert(rows);
    if (insInsErr) {
      console.error("[replaceChildRows] instructors insert failed", insInsErr);
      return { error: "internal" };
    }
  }

  return { ok: true };
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

  const id = data.id as string;
  const childResult = await replaceChildRows(supabase, id, parsed.data);
  if ("error" in childResult) return childResult;

  revalidatePath("/partner/classes");
  return { ok: true, id };
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

  const childResult = await replaceChildRows(supabase, activityId, parsed.data);
  if ("error" in childResult) return childResult;

  revalidatePath("/partner/classes");
  revalidatePath(`/partner/classes/${activityId}`);
  // Public-facing activity page also needs to refresh.
  revalidatePath(`/pl/activity/${activityId}`);
  revalidatePath(`/en/activity/${activityId}`);
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
