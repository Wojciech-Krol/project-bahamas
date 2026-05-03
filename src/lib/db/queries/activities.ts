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
import { formatDuration, formatNextSessionTime, formatPrice, pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type ActivityRow = {
  id: string;
  slug: string | null;
  title_i18n: I18nBag;
  description_i18n: I18nBag;
  price_cents: number;
  currency: string;
  duration_min: number;
  level: string | null;
  category: string | null;
  style: string[] | null;
  age_group: string | null;
  hero_image: string | null;
  created_at: string;
  venue:
    | {
        id: string;
        slug: string | null;
        name: string;
        address: string | null;
        city: string | null;
        lat: number | null;
        lng: number | null;
        description_i18n: I18nBag;
        hero_image: string | null;
      }
    | null;
};

/** Columns + joined venue fields pulled for every activity composition.
 *
 * `venues!inner` is critical: without it, neighborhood / city filters via
 * `.ilike("venues.city", ...)` would only NULL out the embedded venue when
 * the predicate failed instead of dropping the parent activity row. The
 * inner join semantics make the filter behave as you'd intuitively expect.
 */
const ACTIVITY_SELECT = `
  id,
  slug,
  title_i18n,
  description_i18n,
  price_cents,
  currency,
  duration_min,
  level,
  category,
  style,
  age_group,
  hero_image,
  created_at,
  venue:venues!inner (
    id,
    slug,
    name,
    address,
    city,
    lat,
    lng,
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

// Cream-to-blush gradient stand-in. Encoded inline so missing DB rows never
// trigger the "empty src" browser warning, and so we don't ship a binary
// asset to the bundle. Hex color matches the surface-container palette.
export const ACTIVITY_HERO_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" preserveAspectRatio="none">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#FAEEDA"/><stop offset="1" stop-color="#E8C7B8"/>' +
      "</linearGradient></defs>" +
      '<rect width="16" height="10" fill="url(#g)"/></svg>',
  );

function composeActivity(
  row: ActivityRow,
  locale: Locale,
  nextSessionByActivityId?: Map<string, string>,
): Activity {
  const title = pick(row.title_i18n, locale);
  const description = pick(row.description_i18n, locale);
  const venue = row.venue;
  const venueName = venue?.name ?? "";
  // `address` or `city` is the human-friendly location label. Prefer full
  // address if present; fall back to city.
  const location = venue?.address ?? venue?.city ?? "";
  const neighborhood = venue?.city ?? "";
  const nextStartsAt = nextSessionByActivityId?.get(row.id);
  const coords =
    venue && typeof venue.lat === "number" && typeof venue.lng === "number"
      ? { lat: venue.lat, lng: venue.lng }
      : undefined;

  return {
    id: row.id,
    slug: row.slug ?? row.id,
    title: title || row.id,
    time: formatNextSessionTime(nextStartsAt, locale),
    location,
    neighborhood,
    price: formatPrice(row.price_cents, row.currency, locale),
    imageUrl: row.hero_image ?? venue?.hero_image ?? ACTIVITY_HERO_PLACEHOLDER,
    imageAlt: title,
    description: description || undefined,
    duration: formatDuration(row.duration_min, locale) || undefined,
    level: row.level ?? undefined,
    schoolId: venue?.id ?? undefined,
    schoolSlug: venue?.slug ?? undefined,
    schoolName: venueName || undefined,
    category: row.category ?? undefined,
    styles: row.style ?? undefined,
    coords,
    // `tag`, `joined`, `rating`, `reviewCount`, `instructorAvatar`,
    // `schoolAvatar` aren't on the current schema — leave undefined for
    // Phase 2 to fill in.
  };
}

/**
 * Batch-fetch the next scheduled session start per activity. Returns a
 * Map keyed by activity_id so the composer can look it up in O(1).
 *
 * Implementation: single round-trip pulling all upcoming sessions for the
 * given activities, ordered by starts_at ASC. We keep only the first hit
 * per activity. Index `idx_sessions_activity_starts` covers the access
 * pattern. Activities without an upcoming scheduled session simply won't
 * appear in the map → composer renders an empty `time` field.
 */
async function nextSessionByActivityIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  activityIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (activityIds.length === 0) return map;

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("sessions")
    .select("activity_id, starts_at")
    .in("activity_id", activityIds)
    .eq("status", "scheduled")
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (error) {
    console.warn(
      "[db/queries/activities.nextSessionByActivityIds] failed",
      error,
    );
    return map;
  }

  for (const row of (data ?? []) as Array<{
    activity_id: string;
    starts_at: string;
  }>) {
    if (!map.has(row.activity_id)) {
      map.set(row.activity_id, row.starts_at);
    }
  }
  return map;
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
    console.error("[db/queries/activities.getClosestActivities]", JSON.stringify(error, null, 2));
    return [];
  }

  const sorted = await sortByVenueRankings(supabase, data ?? []);
  const trimmed = sorted.slice(0, limit);
  const nextSessions = await nextSessionByActivityIds(
    supabase,
    trimmed.map((r) => r.id),
  );
  return trimmed.map((row) => composeActivity(row, locale, nextSessions));
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
  const nextSessions = await nextSessionByActivityIds(supabase, [data.id]);
  return composeActivity(data, locale, nextSessions);
}

/** Loads a single activity by slug (SEO-friendly URL lookup). */
export async function getActivityBySlug(
  slug: string,
  locale: Locale,
): Promise<Activity | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    warnNotConfigured("activities.getActivityBySlug");
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("slug", slug)
    .maybeSingle<ActivityRow>();

  if (error) {
    console.error("[db/queries/activities.getActivityBySlug]", error);
    return null;
  }

  if (!data) return null;
  const nextSessions = await nextSessionByActivityIds(supabase, [data.id]);
  return composeActivity(data, locale, nextSessions);
}

export interface ActivityFilters {
  /** Activity category slugs (from `search/constants.ActivityKey`). */
  activities?: string[];
  /** Free-text neighborhood / city match (uses `ilike`). */
  neighborhood?: string;
  /** Sub-category style tags. Matches when activity.style overlaps any. */
  styles?: string[];
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
    // Guard the empty-array case explicitly: `.in('col', [])` returns no
    // rows under PostgREST instead of being a no-op, so callers passing
    // `activities: []` (a perfectly valid "no category filter" payload)
    // would silently get an empty result set. We've checked length > 0
    // above so this branch is correct, but the guard is documented in
    // case the predicate is ever lifted.
    query = query.in("category", filters.activities);
  }

  if (filters.styles && filters.styles.length > 0) {
    // `&&` is the array-overlap operator — match when any selected style
    // is present on the activity. PostgREST exposes it via the `ov`
    // filter; the `{...}` literal is Postgres array syntax.
    query = query.overlaps("style", filters.styles);
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
  const nextSessions = await nextSessionByActivityIds(
    supabase,
    sorted.map((r) => r.id),
  );
  return sorted.map((row) => composeActivity(row, locale, nextSessions));
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

/**
 * Programmatic SEO landings: list activities of a given category in a
 * given city. Drives `/pl/odkryj/[activity]/[city]` and similar.
 *
 * Empty results are not an error — the landing page still renders the
 * intro, FAQ, and partner CTA, so Google still indexes useful content
 * even when no studios have onboarded yet.
 */
export async function getActivitiesByCategoryAndCity(
  category: string,
  city: string,
  locale: Locale,
  limit = 24,
): Promise<Activity[]> {
  const results = await queryWithFilters(
    locale,
    { activities: [category], neighborhood: city },
    "activities.getActivitiesByCategoryAndCity",
  );
  return results.slice(0, limit);
}

/**
 * Same as the city landing query, but filtered down to a specific
 * neighborhood. The `neighborhood` filter on `queryWithFilters` runs
 * `ilike` on `venues.city`, so we pass the human-readable neighborhood
 * name (e.g. "Mokotów"). Schema TODO: split venues into city +
 * neighborhood columns once the partner UI captures them separately.
 */
export async function getActivitiesByCategoryAndNeighborhood(
  category: string,
  neighborhood: string,
  locale: Locale,
  limit = 24,
): Promise<Activity[]> {
  const results = await queryWithFilters(
    locale,
    { activities: [category], neighborhood },
    "activities.getActivitiesByCategoryAndNeighborhood",
  );
  return results.slice(0, limit);
}
