/**
 * Partner-side queries — the dashboard reads catalog + bookings + reviews
 * from the partner's perspective. Public queries (`activities.ts`,
 * `reviews.ts`, `venues.ts`) all add `is_published = true` filters, so the
 * partner needs its own surface that returns drafts too.
 *
 * Auth assumption: caller is already a `partner_members` row for `partnerId`.
 * The `(shell)/layout.tsx` guard enforces this. Queries below run through
 * the request-scoped client and lean on RLS as a backstop.
 */

import { createClient } from "@/src/lib/db/server";
import type { Locale } from "@/src/lib/db/types";
import { formatDuration, formatPrice, pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type PartnerActivityRow = {
  id: string;
  title_i18n: I18nBag;
  description_i18n: I18nBag;
  price_cents: number;
  currency: string;
  duration_min: number;
  level: string | null;
  category: string | null;
  age_group: string | null;
  hero_image: string | null;
  is_published: boolean;
  created_at: string;
  venue:
    | {
        id: string;
        name: string;
        partner_id: string;
      }
    | null;
};

export type PartnerActivity = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  priceLabel: string;
  durationMin: number;
  durationLabel: string;
  level: string | null;
  category: string | null;
  ageGroup: string | null;
  heroImage: string | null;
  isPublished: boolean;
  venueId: string;
  venueName: string;
};

const PARTNER_ACTIVITY_SELECT = `
  id,
  title_i18n,
  description_i18n,
  price_cents,
  currency,
  duration_min,
  level,
  category,
  age_group,
  hero_image,
  is_published,
  created_at,
  venue:venues!inner (
    id,
    name,
    partner_id
  )
`;

function compose(row: PartnerActivityRow, locale: Locale): PartnerActivity {
  const title = pick(row.title_i18n, locale);
  const description = pick(row.description_i18n, locale);
  return {
    id: row.id,
    title: title || row.id,
    description: description || null,
    priceCents: row.price_cents,
    currency: row.currency,
    priceLabel: formatPrice(row.price_cents, row.currency, locale),
    durationMin: row.duration_min,
    durationLabel: formatDuration(row.duration_min, locale),
    level: row.level,
    category: row.category,
    ageGroup: row.age_group,
    heroImage: row.hero_image,
    isPublished: row.is_published,
    venueId: row.venue?.id ?? "",
    venueName: row.venue?.name ?? "",
  };
}

/**
 * Every activity the partner owns (published or not), newest-first. Used
 * by the partner classes list. Filtering by status happens client-side
 * on the small returned set.
 */
export async function getActivitiesByPartner(
  partnerId: string,
  locale: Locale,
): Promise<PartnerActivity[]> {
  if (!partnerId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(PARTNER_ACTIVITY_SELECT)
    .eq("venue.partner_id", partnerId)
    .order("created_at", { ascending: false })
    .returns<PartnerActivityRow[]>();

  if (error) {
    console.error("[db/queries/partner.getActivitiesByPartner]", error);
    return [];
  }

  return (data ?? []).map((r) => compose(r, locale));
}

/** Single activity by id, scoped to the partner. Returns null when the id
 * doesn't belong to the partner (RLS already blocks read but we double-check
 * the join in case the calling page already trusts a stale id from the URL). */
export async function getPartnerActivityById(
  activityId: string,
  partnerId: string,
  locale: Locale,
): Promise<PartnerActivity | null> {
  if (!activityId || !partnerId) return null;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .select(PARTNER_ACTIVITY_SELECT)
    .eq("id", activityId)
    .eq("venue.partner_id", partnerId)
    .maybeSingle<PartnerActivityRow>();

  if (error) {
    console.error("[db/queries/partner.getPartnerActivityById]", error);
    return null;
  }
  if (!data) return null;
  return compose(data, locale);
}
