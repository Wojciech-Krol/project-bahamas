"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, getCurrentUser } from "@/src/lib/db/server";

const schema = z.object({
  name: z.string().min(1).max(120),
  descriptionPl: z.string().max(2000),
  descriptionEn: z.string().max(2000),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  heroImage: z.string().url().or(z.literal("")).optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type VenueActionResult = { ok: true } | { error: string };

async function userOwnsVenue(venueId: string): Promise<boolean> {
  const current = await getCurrentUser();
  if (!current) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("partner_id")
    .eq("id", venueId)
    .maybeSingle();
  if (!data) return false;
  const partnerId = (data as { partner_id: string }).partner_id;
  const { data: m } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("partner_id", partnerId)
    .eq("user_id", current.user.id)
    .maybeSingle();
  return !!m;
}

export async function updateVenue(
  venueId: string,
  formData: FormData,
): Promise<VenueActionResult> {
  if (!venueId) return { error: "invalid_input" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    descriptionPl: formData.get("descriptionPl") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    address: formData.get("address") ?? undefined,
    city: formData.get("city") ?? undefined,
    heroImage: formData.get("heroImage") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) return { error: "invalid_input" };

  if (!(await userOwnsVenue(venueId))) return { error: "forbidden" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("venues")
    .update({
      name: parsed.data.name,
      description_i18n: {
        pl: parsed.data.descriptionPl,
        en: parsed.data.descriptionEn,
      },
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      hero_image: parsed.data.heroImage || null,
      is_published: parsed.data.isPublished ?? false,
    })
    .eq("id", venueId);

  if (error) {
    console.error("[updateVenue] update failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/venue");
  revalidatePath(`/pl/school/${venueId}`);
  revalidatePath(`/en/school/${venueId}`);
  return { ok: true };
}
