/**
 * Activity queries — read-side of the Hakuna marketplace catalog.
 *
 * Each function returns data shaped exactly like `Activity` from
 * `src/lib/db/types.ts`, which mirrors `app/lib/mockData.ts`. This is the
 * "seam" the UI will swap onto once the DB is seeded.
 *
 * Every function handles the "Supabase not configured" case gracefully by
 * catching the explicit error `createClient()` throws when env vars are
 * missing, logging a single `console.warn`, and returning an empty result.
 * This lets pages keep rendering (with no data) during Phase 1b while the
 * operator finishes the Supabase project setup.
 */

import { createClient } from "@/src/lib/db/server";
import type { Activity, Locale } from "@/src/lib/db/types";
import { formatDuration, formatPrice, pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type ActivityRow = {
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
  created_at: string;
  venue:
    | {
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        description_i18n: I18nBag;
        hero_image: string | null;
      }
    | null;
};

/** Columns + joined venue fields pulled for every activity composition. */
const ACTIVITY_SELECT = `
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
  created_at,
  venue:venues (
    id,
    name,
    address,
    city,
    description_i18n,
    hero_image
  )
`;

function warnNotConfigured(scope: string): void {
  console.warn(
    `[db/queries/${scope}] Supabase not configured — returning empty result. ` +
      "Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  );
}

function composeActivity(row: ActivityRow, locale: Locale): Activity {
  const title = pick(row.title_i18n, locale);
  const description = pick(row.description_i18n, locale);
  const venue = row.venue;
  const venueName = venue?.name ?? "";
  // `address` or `city` is the human-friendly location label. Prefer full
  // address if present; fall back to city.
  const location = venue?.address ?? venue?.city ?? "";
  const neighborhood = venue?.city ?? "";

  return {
    id: row.id,
    title: title || row.id,
    time: "", // TODO Phase 1b+: compute from next `sessions.starts_at`.
    location,
    neighborhood,
    price: formatPrice(row.price_cents, row.currency, locale),
    imageUrl: row.hero_image ?? venue?.hero_image ?? "",
    imageAlt: title,
    description: description || undefined,
    duration: formatDuration(row.duration_min, locale) || undefined,
    level: row.level ?? undefined,
    schoolId: venue?.id ?? undefined,
    schoolName: venueName || undefined,
    // `tag`, `joined`, `rating`, `reviewCount`, `instructorAvatar`,
    // `schoolAvatar` aren't on the current schema — leave undefined for
    // Phase 2 to fill in.
  };
}

/**
 * Boost-aware sort: order an activity list by the `venue_rankings` view
 * columns `(has_active_boost desc, has_subscription desc, rating desc,
 * created_at desc)` per plan section 3.4.
 *
 * Implementation choice: two-step lookup rather than a nested `.select()` on
 * the view. Supabase PostgREST doesn't expose `venue_rankings` as an embedded
 * table unless a foreign-key relationship is declared (it's a view, not a
 * table), and hand-rolling the ranking in TS keeps the activities query
 * simple + unchanged for callers. One extra round trip — negligible
 * next to the composition cost of `ACTIVITY_SELECT`, and both queries hit
 * `venue_id` indexed paths.
 *
 * Fallback: if the view read fails (e.g. migration 0002 not yet applied),
 * return rows in their natural order so the caller still gets data.
 */
async function sortByVenueRankings<
  T extends { venue: { id: string } | null },
>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: T[],
): Promise<T[]> {
  if (rows.length === 0) return rows;

  const venueIds = Array.from(
    new Set(rows.map((r) => r.venue?.id).filter((v): v is string => !!v)),
  );
  if (venueIds.length === 0) return rows;

  const { data: rankings, error } = await supabase
    .from("venue_rankings")
    .select("venue_id, has_active_boost, has_subscription, rating, created_at")
    .in("venue_id", venueIds);

  if (error) {
    console.warn(
      "[db/queries/activities.sortByVenueRankings] falling back to natural order",
      error,
    );
    return rows;
  }

  type Ranking = {
    venue_id: string;
    has_active_boost: boolean | null;
    has_subscription: boolean | null;
    rating: number | null;
    created_at: string | null;
  };
  const map = new Map<string, Ranking>();
  for (const r of (rankings ?? []) as Ranking[]) {
    map.set(r.venue_id, r);
  }

  // Stable sort by the composite key. Booleans are compared truthy > falsy,
  // nulls are treated as falsy / lowest. `created_at desc` ties are broken
  // by whatever order PostgREST returned the activity rows in.
  return [...rows].sort((a, b) => {
    const ra = a.venue?.id ? map.get(a.venue.id) : undefined;
    const rb = b.venue?.id ? map.get(b.venue.id) : undefined;
    const boostA = ra?.has_active_boost ? 1 : 0;
    const boostB = rb?.has_active_boost ? 1 : 0;
    if (boostA !== boostB) return boostB - boostA;
    const subA = ra?.has_subscription ? 1 : 0;
    const subB = rb?.has_subscription ? 1 : 0;
    if (subA !== subB) return subB - subA;
    const ratingA = Number(ra?.rating ?? 0);
    const ratingB = Number(rb?.rating ?? 0);
    if (ratingA !== ratingB) return ratingB - ratingA;
    const createdA = ra?.created_at ?? "";
    const createdB = rb?.created_at ?? "";
    if (createdA !== createdB) return createdA < createdB ? 1 : -1;
    return 0;
  });
}

/**
 * Returns the N most recent published activities, joined to their venue.
 * Used to feed the "closest to you" rail on the home page until real
 * geo-sorting lands.
 *
 * Sort order: boosted venues first, then subscribed partners, then by rating
 * and recency — see `sortByVenueRankings` + plan section 3.4.
 */
export async function getClosestActivities(
  locale: Locale,
  limit = 10,
): Promise<Activity[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    warnNotConfigured("activities.getClosestActivities");
    return [];
  }

  // Pull a wider window than `limit` so the boost/subscription re-sort has
  // something to work with, then trim. 4x is arbitrary but bounds the
  // over-read while leaving headroom for heavily-boosted catalogs.
  const overscan = Math.max(limit * 4, 40);

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(overscan)
    .returns<ActivityRow[]>();

  if (error) {
    console.error("[db/queries/activities.getClosestActivities]", error);
    return [];
  }

  const sorted = await sortByVenueRankings(supabase, data ?? []);
  return sorted.slice(0, limit).map((row) => composeActivity(row, locale));
}

/** Loads a single activity by id (returns `null` if not found / unpublished). */
export async function getActivityById(
  id: string,
  locale: Locale,
): Promise<Activity | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    warnNotConfigured("activities.getActivityById");
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("id", id)
    .maybeSingle<ActivityRow>();

  if (error) {
    console.error("[db/queries/activities.getActivityById]", error);
    return null;
  }

  if (!data) return null;
  return composeActivity(data, locale);
}

export interface ActivityFilters {
  /** Activity category slugs (from `search/constants.ActivityKey`). */
  activities?: string[];
  /** Free-text neighborhood / city match (uses `ilike`). */
  neighborhood?: string;
}

async function queryWithFilters(
  locale: Locale,
  filters: ActivityFilters,
  scope: string,
): Promise<Activity[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    warnNotConfigured(scope);
    return [];
  }

  let query = supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("is_published", true);

  if (filters.activities && filters.activities.length > 0) {
    query = query.in("category", filters.activities);
  }

  if (filters.neighborhood && filters.neighborhood.trim().length > 0) {
    // `.ilike` on a joined-table column needs the `foreignTable` form;
    // PostgREST exposes it via the `venues.city` filter string instead.
    // See https://supabase.com/docs/reference/javascript/using-filters.
    query = query.ilike("venues.city", `%${filters.neighborhood.trim()}%`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .returns<ActivityRow[]>();

  if (error) {
    console.error(`[db/queries/${scope}]`, error);
    return [];
  }

  const sorted = await sortByVenueRankings(supabase, data ?? []);
  return sorted.map((row) => composeActivity(row, locale));
}

/**
 * Search results — category match via `activities.category`, neighborhood
 * match via `venues.city`. Rough MVP; richer full-text search lands later.
 */
export async function getSearchResults(
  locale: Locale,
  filters: ActivityFilters = {},
): Promise<Activity[]> {
  return queryWithFilters(locale, filters, "activities.getSearchResults");
}

/**
 * Broader filter path used by `useFilteredActivities`. Same filter shape
 * as search for now — kept as a distinct export so the seam swap can
 * specialize it without touching page code.
 */
export async function getFilteredActivities(
  locale: Locale,
  filters: ActivityFilters = {},
): Promise<Activity[]> {
  return queryWithFilters(locale, filters, "activities.getFilteredActivities");
}
