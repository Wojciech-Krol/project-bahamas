"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";

const schema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "invalid_slug" }),
  contactEmail: z.string().email().max(200),
  city: z.string().max(80).optional(),
});

export type SettingsActionResult = { ok: true } | { error: string };

export async function updatePartnerProfile(
  formData: FormData,
): Promise<SettingsActionResult> {
  const current = await getCurrentUser();
  if (!current) return { error: "forbidden" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    contactEmail: formData.get("contactEmail"),
    city: formData.get("city") ?? undefined,
  });
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message;
    return { error: code === "invalid_slug" ? "invalid_slug" : "invalid_input" };
  }

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) return { error: "forbidden" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      contact_email: parsed.data.contactEmail,
      city: parsed.data.city || null,
    })
    .eq("id", partnerId);

  if (error) {
    // Slug uniqueness violations come back as Postgres 23505. Surface a
    // useful code so the form can hint the user instead of showing the
    // generic "internal" message.
    if ((error as { code?: string }).code === "23505") {
      return { error: "slug_taken" };
    }
    console.error("[updatePartnerProfile] update failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/settings");
  return { ok: true };
}
