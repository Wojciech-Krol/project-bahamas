"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/src/lib/db/admin";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { venueUploadRateLimiter } from "@/src/lib/ratelimit";

const PHOTO_BUCKET = "venues";
const PHOTO_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const PHOTO_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

/** Returns the partner id when the current user is a member of the venue's
 * partner, or null. The partner id is needed both for ownership checks and
 * as the first segment of the venues Storage bucket path. */
async function resolveOwningPartnerId(
  venueId: string,
): Promise<string | null> {
  const current = await getCurrentUser();
  if (!current) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("partner_id")
    .eq("id", venueId)
    .maybeSingle();
  if (!data) return null;
  const partnerId = (data as { partner_id: string }).partner_id;
  const { data: m } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("partner_id", partnerId)
    .eq("user_id", current.user.id)
    .maybeSingle();
  return m ? partnerId : null;
}

async function userOwnsVenue(venueId: string): Promise<boolean> {
  return (await resolveOwningPartnerId(venueId)) !== null;
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
  revalidatePath(`/pl/szkola/[slug]`, "page");
  revalidatePath(`/en/school/[slug]`, "page");
  return { ok: true };
}

// ---------- photo upload ----------

export type UploadPhotoResult =
  | { ok: true; url: string }
  | { error: string };

function readUploadedFile(formData: FormData): File | null {
  const f = formData.get("file");
  if (!(f instanceof File) || f.size === 0) return null;
  return f;
}

function publicUrlFor(path: string): string {
  const admin = createAdminClient();
  return admin.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function uploadVenuePhoto(
  venueId: string,
  formData: FormData,
  folder: "hero" | "gallery",
): Promise<UploadPhotoResult> {
  if (!venueId) return { error: "invalid_input" };
  const partnerId = await resolveOwningPartnerId(venueId);
  if (!partnerId) return { error: "forbidden" };

  // Rate-limit per partner so a malicious or runaway script can't fill the
  // venues storage bucket. 30/h is more than enough for real gallery edits.
  const limit = await venueUploadRateLimiter.check(partnerId);
  if (!limit.success) return { error: "rate_limited" };

  const file = readUploadedFile(formData);
  if (!file) return { error: "no_file" };
  if (file.size > PHOTO_MAX_BYTES) return { error: "too_large" };
  if (!PHOTO_MIME.has(file.type)) return { error: "not_image" };

  const ext = PHOTO_EXT[file.type] ?? "jpg";
  const path = `${partnerId}/${venueId}/${folder}/${randomUUID()}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  // Belt-and-braces: enforce again on the actual byte count.
  if (buf.byteLength > PHOTO_MAX_BYTES) return { error: "too_large" };

  const admin = createAdminClient();
  const { error: uploadErr } = await admin.storage
    .from(PHOTO_BUCKET)
    .upload(path, buf, { contentType: file.type, upsert: false });
  if (uploadErr) {
    console.error("[uploadVenuePhoto] upload failed", uploadErr);
    return { error: "internal" };
  }

  return { ok: true, url: publicUrlFor(path) };
}

export async function uploadVenueHero(
  venueId: string,
  formData: FormData,
): Promise<UploadPhotoResult> {
  const result = await uploadVenuePhoto(venueId, formData, "hero");
  if ("error" in result) return result;

  const supabase = await createClient();
  const { error } = await supabase
    .from("venues")
    .update({ hero_image: result.url })
    .eq("id", venueId);
  if (error) {
    console.error("[uploadVenueHero] hero update failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/venue");
  revalidatePath(`/pl/szkola/[slug]`, "page");
  revalidatePath(`/en/school/[slug]`, "page");
  return result;
}

export async function uploadVenueGalleryPhoto(
  venueId: string,
  formData: FormData,
): Promise<UploadPhotoResult> {
  const result = await uploadVenuePhoto(venueId, formData, "gallery");
  if ("error" in result) return result;

  const supabase = await createClient();
  // Read–append–write. Race window is tiny + scoped per partner; if two
  // partners' uploads collide on the same venue we accept that one append
  // can lose. RLS scopes both the read and the write.
  const { data: row, error: readErr } = await supabase
    .from("venues")
    .select("gallery")
    .eq("id", venueId)
    .maybeSingle();
  if (readErr) {
    console.error("[uploadVenueGalleryPhoto] read failed", readErr);
    return { error: "internal" };
  }
  const existing = Array.isArray((row as { gallery: unknown } | null)?.gallery)
    ? ((row as { gallery: string[] }).gallery as string[])
    : [];
  const next = [...existing, result.url];

  const { error: writeErr } = await supabase
    .from("venues")
    .update({ gallery: next })
    .eq("id", venueId);
  if (writeErr) {
    console.error("[uploadVenueGalleryPhoto] write failed", writeErr);
    return { error: "internal" };
  }

  revalidatePath("/partner/venue");
  revalidatePath(`/pl/szkola/[slug]`, "page");
  revalidatePath(`/en/school/[slug]`, "page");
  return result;
}

export async function removeVenueGalleryPhoto(
  venueId: string,
  url: string,
): Promise<VenueActionResult> {
  if (!venueId || !url) return { error: "invalid_input" };
  const partnerId = await resolveOwningPartnerId(venueId);
  if (!partnerId) return { error: "forbidden" };

  const supabase = await createClient();
  const { data: row, error: readErr } = await supabase
    .from("venues")
    .select("gallery")
    .eq("id", venueId)
    .maybeSingle();
  if (readErr) {
    console.error("[removeVenueGalleryPhoto] read failed", readErr);
    return { error: "internal" };
  }
  const existing = Array.isArray((row as { gallery: unknown } | null)?.gallery)
    ? ((row as { gallery: string[] }).gallery as string[])
    : [];
  const next = existing.filter((u) => u !== url);

  const { error: writeErr } = await supabase
    .from("venues")
    .update({ gallery: next })
    .eq("id", venueId);
  if (writeErr) {
    console.error("[removeVenueGalleryPhoto] write failed", writeErr);
    return { error: "internal" };
  }

  // Best-effort delete of the storage object — derive the path from the
  // URL prefix. Failures are logged but do not fail the user-facing action,
  // since the URL has already been removed from the gallery list.
  try {
    const admin = createAdminClient();
    const marker = `/${PHOTO_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.slice(idx + marker.length);
      // Verify the path is scoped to this partner before deleting — defensive
      // against a tampered URL pointing at someone else's object.
      if (path.startsWith(`${partnerId}/${venueId}/`)) {
        await admin.storage.from(PHOTO_BUCKET).remove([path]);
      }
    }
  } catch (err) {
    console.warn("[removeVenueGalleryPhoto] storage delete soft-failed", err);
  }

  revalidatePath("/partner/venue");
  revalidatePath(`/pl/szkola/[slug]`, "page");
  revalidatePath(`/en/school/[slug]`, "page");
  return { ok: true };
}
