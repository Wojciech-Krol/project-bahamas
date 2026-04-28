/**
 * Activity content queries — curriculum bullets + instructor profiles.
 *
 * Schema lives in `supabase/migrations/0011_curriculum_and_instructors.sql`.
 * Both tables expose the standard published/member RLS split, so the same
 * request-scoped client used by the activity detail page returns published
 * rows for anon and full rows (incl. drafts) for partner_members.
 */

import { createClient } from "@/src/lib/db/server";
import type { Locale } from "@/src/lib/db/types";
import { pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

export type CurriculumItem = {
  id: string;
  position: number;
  title: string;
  description: string;
  imageUrl: string | null;
};

export type InstructorEntry = {
  id: string;
  position: number;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
  credentials: { icon: string; label: string }[];
};

type CurriculumRow = {
  id: string;
  position: number;
  title_i18n: I18nBag;
  description_i18n: I18nBag;
  image_url: string | null;
};

type InstructorRow = {
  id: string;
  position: number;
  name: string;
  role_i18n: I18nBag;
  bio_i18n: I18nBag;
  avatar_url: string | null;
  credentials_i18n: unknown;
};

type CredentialEntry = {
  icon?: string;
  label_i18n?: I18nBag;
};

export async function getCurriculumByActivity(
  activityId: string,
  locale: Locale,
): Promise<CurriculumItem[]> {
  if (!activityId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_curriculum_items")
    .select("id, position, title_i18n, description_i18n, image_url")
    .eq("activity_id", activityId)
    .order("position", { ascending: true })
    .returns<CurriculumRow[]>();

  if (error) {
    console.error("[db/queries/activityContent.getCurriculumByActivity]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    position: row.position,
    title: pick(row.title_i18n, locale) ?? "",
    description: pick(row.description_i18n, locale) ?? "",
    imageUrl: row.image_url,
  }));
}

export type CurriculumItemRaw = {
  id: string;
  position: number;
  titlePl: string;
  titleEn: string;
  descriptionPl: string;
  descriptionEn: string;
  imageUrl: string | null;
};

export type InstructorEntryRaw = {
  id: string;
  position: number;
  name: string;
  rolePl: string;
  roleEn: string;
  bioPl: string;
  bioEn: string;
  avatarUrl: string | null;
  credentials: { icon: string; labelPl: string; labelEn: string }[];
};

function bag(value: I18nBag): { pl: string; en: string } {
  const safe = value ?? {};
  return {
    pl: typeof safe.pl === "string" ? safe.pl : "",
    en: typeof safe.en === "string" ? safe.en : "",
  };
}

export async function getCurriculumRawByActivity(
  activityId: string,
): Promise<CurriculumItemRaw[]> {
  if (!activityId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const { data, error } = await supabase
    .from("activity_curriculum_items")
    .select("id, position, title_i18n, description_i18n, image_url")
    .eq("activity_id", activityId)
    .order("position", { ascending: true })
    .returns<CurriculumRow[]>();
  if (error) {
    console.error("[db/queries/activityContent.getCurriculumRawByActivity]", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const t = bag(row.title_i18n);
    const d = bag(row.description_i18n);
    return {
      id: row.id,
      position: row.position,
      titlePl: t.pl,
      titleEn: t.en,
      descriptionPl: d.pl,
      descriptionEn: d.en,
      imageUrl: row.image_url,
    };
  });
}

export async function getInstructorsRawByActivity(
  activityId: string,
): Promise<InstructorEntryRaw[]> {
  if (!activityId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const { data, error } = await supabase
    .from("activity_instructors")
    .select(
      "id, position, name, role_i18n, bio_i18n, avatar_url, credentials_i18n",
    )
    .eq("activity_id", activityId)
    .order("position", { ascending: true })
    .returns<InstructorRow[]>();
  if (error) {
    console.error("[db/queries/activityContent.getInstructorsRawByActivity]", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const r = bag(row.role_i18n);
    const b = bag(row.bio_i18n);
    const rawCreds = Array.isArray(row.credentials_i18n)
      ? (row.credentials_i18n as CredentialEntry[])
      : [];
    return {
      id: row.id,
      position: row.position,
      name: row.name,
      rolePl: r.pl,
      roleEn: r.en,
      bioPl: b.pl,
      bioEn: b.en,
      avatarUrl: row.avatar_url,
      credentials: rawCreds.map((c) => {
        const l = bag(c.label_i18n ?? null);
        return {
          icon: typeof c.icon === "string" ? c.icon : "verified",
          labelPl: l.pl,
          labelEn: l.en,
        };
      }),
    };
  });
}

export async function getInstructorsByActivity(
  activityId: string,
  locale: Locale,
): Promise<InstructorEntry[]> {
  if (!activityId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_instructors")
    .select(
      "id, position, name, role_i18n, bio_i18n, avatar_url, credentials_i18n",
    )
    .eq("activity_id", activityId)
    .order("position", { ascending: true })
    .returns<InstructorRow[]>();

  if (error) {
    console.error("[db/queries/activityContent.getInstructorsByActivity]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const rawCreds = Array.isArray(row.credentials_i18n)
      ? (row.credentials_i18n as CredentialEntry[])
      : [];
    const credentials = rawCreds
      .map((c) => ({
        icon: typeof c.icon === "string" ? c.icon : "verified",
        label: pick(c.label_i18n ?? null, locale) ?? "",
      }))
      .filter((c) => c.label.length > 0);

    return {
      id: row.id,
      position: row.position,
      name: row.name,
      role: pick(row.role_i18n, locale) ?? "",
      bio: pick(row.bio_i18n, locale) ?? "",
      avatarUrl: row.avatar_url,
      credentials,
    };
  });
}
