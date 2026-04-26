/**
 * Venue queries — the "school" detail page composes its data from here.
 *
 * Maps `public.venues` onto the `School` UI contract. Some fields that the
 * UI expects (`tagline`, `logo`, `stats`) don't yet exist on the schema;
 * reasonable fallbacks are used and flagged with `TODO(phase-2)` comments
 * so they're easy to grep for when Phase 2 extends the schema.
 */

import { createClient } from "@/src/lib/db/server";
import type { Activity, Locale, School } from "@/src/lib/db/types";
import { formatDuration, formatPrice, pick } from "./_i18n";
import { ACTIVITY_HERO_PLACEHOLDER } from "./activities";

type I18nBag = Record<string, string | null | undefined> | null;

type VenueActivityRow = {
  id: string;
  slug: string | null;
  title_i18n: I18nBag;
  description_i18n: I18nBag;
  price_cents: number;
  currency: string;
  duration_min: number;
  level: string | null;
  hero_image: string | null;
  is_published: boolean;
};

type VenueRow = {
  id: string;
  slug: string | null;
  name: string;
  description_i18n: I18nBag;
  address: string | null;
  city: string | null;
  hero_image: string | null;
  gallery: string[] | null;
  rating: number | null;
  review_count: number | null;
  is_published: boolean;
  activities: VenueActivityRow[] | null;
};

const VENUE_SELECT = `
  id,
  slug,
  name,
  description_i18n,
  address,
  city,
  hero_image,
  gallery,
  rating,
  review_count,
  is_published,
  activities:activities (
    id,
    slug,
    title_i18n,
    description_i18n,
    price_cents,
    currency,
    duration_min,
    level,
    hero_image,
    is_published
  )
`;

function truncate(s: string, max = 140): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

function venueActivityToActivity(
  row: VenueActivityRow,
  locale: Locale,
  schoolId: string,
  schoolSlug: string | null,
  schoolName: string,
): Activity {
  const title = pick(row.title_i18n, locale);
  const description = pick(row.description_i18n, locale);
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    title: title || row.id,
    time: "",
    location: "",
    neighborhood: "",
    price: formatPrice(row.price_cents, row.currency, locale),
    imageUrl: row.hero_image ?? ACTIVITY_HERO_PLACEHOLDER,
    imageAlt: title,
    description: description || undefined,
    duration: formatDuration(row.duration_min, locale) || undefined,
    level: row.level ?? undefined,
    schoolId,
    schoolSlug: schoolSlug ?? undefined,
    schoolName: schoolName || undefined,
  };
}

function composeVenue(data: VenueRow, locale: Locale): School {
  const about = pick(data.description_i18n, locale);
  const classes = (data.activities ?? [])
    .filter((a) => a.is_published)
    .map((a) =>
      venueActivityToActivity(a, locale, data.id, data.slug, data.name),
    );

  // TODO(phase-2): `tagline`, `logo`, `stats` don't exist on `venues` yet.
  //   - Schema addition candidates: `tagline_i18n jsonb`, `logo_url text`,
  //     `stats jsonb` (array of {label,value}).
  //   - For now, derive a tagline from the description and leave the rest
  //     empty so the UI degrades gracefully.
  const tagline = truncate(about);
  const logo: string | undefined = data.hero_image ?? undefined;
  const stats: { label: string; value: string }[] = [];

  return {
    id: data.id,
    slug: data.slug ?? data.id,
    name: data.name,
    tagline,
    heroImage: data.hero_image ?? ACTIVITY_HERO_PLACEHOLDER,
    logo,
    rating: Number(data.rating ?? 0),
    reviewCount: data.review_count ?? 0,
    location: data.address ?? data.city ?? "",
    stats,
    about,
    classes,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
  };
}

export async function getVenueById(
  id: string,
  locale: Locale,
): Promise<School | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    console.warn(
      "[db/queries/venues.getVenueById] Supabase not configured — returning null.",
    );
    return null;
  }

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_SELECT)
    .eq("id", id)
    .maybeSingle<VenueRow>();

  if (error) {
    console.error("[db/queries/venues.getVenueById]", error);
    return null;
  }
  if (!data) return null;
  return composeVenue(data, locale);
}

export async function getVenueBySlug(
  slug: string,
  locale: Locale,
): Promise<School | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    console.warn(
      "[db/queries/venues.getVenueBySlug] Supabase not configured — returning null.",
    );
    return null;
  }

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_SELECT)
    .eq("slug", slug)
    .maybeSingle<VenueRow>();

  if (error) {
    console.error("[db/queries/venues.getVenueBySlug]", error);
    return null;
  }
  if (!data) return null;
  return composeVenue(data, locale);
}
