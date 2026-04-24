/**
 * Review queries — compose `public.reviews` rows + `public_profiles` (author
 * name / avatar, see migration 0006) + `activities` (activity title) into the
 * `Review` UI shape.
 *
 * Author lookup is intentionally a separate query rather than a PostgREST
 * embed: the `profiles` table's RLS policy (`profiles_select_own`) only lets
 * a caller see their OWN profile row, so an embed against `profiles` would
 * silently return null for every review's author when read by anon. The
 * dedicated `public_profiles` view (also created in 0006) projects only the
 * three display-safe columns and has SELECT granted to anon + authenticated.
 */

import { createClient } from "@/src/lib/db/server";
import type { Locale, Review } from "@/src/lib/db/types";
import { pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type ReviewRow = {
  id: string;
  rating: number;
  text: string | null;
  author_id: string;
  activity:
    | {
        id: string;
        title_i18n: I18nBag;
      }
    | null;
};

type AuthorRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

const REVIEW_SELECT = `
  id,
  rating,
  text,
  author_id,
  activity:activities (
    id,
    title_i18n
  )
`;

function composeReview(
  row: ReviewRow,
  author: AuthorRow | undefined,
  locale: Locale,
): Review {
  const activityTitle = pick(row.activity?.title_i18n ?? null, locale);
  return {
    id: row.id,
    name: author?.full_name ?? "",
    avatar: author?.avatar_url ?? "",
    rating: row.rating,
    text: row.text ?? "",
    activity: activityTitle || undefined,
  };
}

/**
 * Fetch reviews. If `ids` is a non-empty array, filter by `id in (ids)`.
 * Otherwise return the 20 most recent reviews (home-page testimonial rail).
 */
export async function getReviews(
  ids: string[] | undefined,
  locale: Locale,
): Promise<Review[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    console.warn(
      "[db/queries/reviews.getReviews] Supabase not configured — returning [].",
    );
    return [];
  }

  let query = supabase.from("reviews").select(REVIEW_SELECT);

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  } else {
    query = query.order("created_at", { ascending: false }).limit(20);
  }

  const { data, error } = await query.returns<ReviewRow[]>();

  if (error) {
    console.error("[db/queries/reviews.getReviews]", error);
    return [];
  }

  const rows = data ?? [];
  if (rows.length === 0) return [];

  // Second hop: pull author display info from the public_profiles view.
  // We cannot embed `profiles` directly because RLS restricts it to the
  // authenticated user's own row.
  const authorIds = Array.from(
    new Set(rows.map((r) => r.author_id).filter((v): v is string => !!v)),
  );

  const authorById = new Map<string, AuthorRow>();
  if (authorIds.length > 0) {
    const { data: authors, error: authorErr } = await supabase
      .from("public_profiles")
      .select("id, full_name, avatar_url")
      .in("id", authorIds)
      .returns<AuthorRow[]>();
    if (authorErr) {
      // Don't fail the whole render — reviews still display, just with
      // empty bylines. Log so an operator notices in Sentry.
      console.warn(
        "[db/queries/reviews.getReviews] author lookup failed",
        authorErr,
      );
    } else {
      for (const a of authors ?? []) authorById.set(a.id, a);
    }
  }

  return rows.map((row) => composeReview(row, authorById.get(row.author_id), locale));
}
