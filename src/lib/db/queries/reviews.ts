/**
 * Review queries — compose `public.reviews` rows + `profiles` (author name /
 * avatar) + `activities` (activity title) into the `Review` UI shape.
 */

import { createClient } from "@/src/lib/db/server";
import type { Locale, Review } from "@/src/lib/db/types";
import { pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type ReviewRow = {
  id: string;
  rating: number;
  text: string | null;
  author:
    | {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      }
    | null;
  activity:
    | {
        id: string;
        title_i18n: I18nBag;
      }
    | null;
};

const REVIEW_SELECT = `
  id,
  rating,
  text,
  author:profiles!reviews_author_id_fkey (
    id,
    full_name,
    avatar_url
  ),
  activity:activities (
    id,
    title_i18n
  )
`;

function composeReview(row: ReviewRow, locale: Locale): Review {
  const activityTitle = pick(row.activity?.title_i18n ?? null, locale);
  return {
    id: row.id,
    name: row.author?.full_name ?? "",
    avatar: row.author?.avatar_url ?? "",
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

  return (data ?? []).map((row) => composeReview(row, locale));
}
