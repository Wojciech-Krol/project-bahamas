/**
 * Favorites query — list activities the signed-in user has saved.
 *
 * Lives in its own module instead of bolting onto `activities.ts` so
 * concurrent feature branches that both touch the activity composer
 * don't fight over `ACTIVITY_SELECT`. Re-uses `getActivityById` for
 * composition rather than re-implementing the i18n + venue join.
 */

import { createClient } from "@/src/lib/db/server";
import type { Activity, Locale } from "@/src/lib/db/types";
import { getActivityById } from "./activities";

function warnNotConfigured(scope: string): void {
  console.warn(
    `[db/queries/${scope}] Supabase not configured — returning empty result.`,
  );
}

/**
 * Activities the current user has favorited, in most-recently-saved
 * order. RLS scopes the favorites read to the calling user, so we
 * never need the service role here. Returns [] when not signed in.
 *
 * Implementation: fetch ids first (cheap, single index scan), then
 * compose each via the existing single-activity query so we stay in
 * lockstep with the canonical UI shape. Favorites lists are small
 * (≤ a few dozen for any sane user) so the per-row round-trip is OK;
 * if it ever isn't, switch to a batch select with a manual sort.
 */
export async function getFavoriteActivities(
  locale: Locale,
): Promise<Activity[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    warnNotConfigured("favorites.getFavoriteActivities");
    return [];
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("activity_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "[db/queries/favorites.getFavoriteActivities] favorites select failed",
      error,
    );
    return [];
  }

  const ids = (data ?? []).map(
    (r: { activity_id: string }) => r.activity_id,
  );
  if (ids.length === 0) return [];

  const composed = await Promise.all(
    ids.map((id) => getActivityById(id, locale)),
  );
  return composed.filter((a): a is Activity => a !== null);
}
