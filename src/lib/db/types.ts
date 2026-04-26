/**
 * UI-contract types for data returned by the DB query layer.
 *
 * IMPORTANT: this file is the seam boundary between the UI (currently mocked
 * in `app/lib/mockData.ts`) and the Supabase-backed query layer in
 * `src/lib/db/queries/*`. It duplicates the shape of `Activity`, `Review`,
 * and `School` from `app/lib/mockData.ts` so the query layer can compile
 * without importing across the `app/` / `src/` boundary.
 *
 * Keep this file in **exact shape parity** with `app/lib/mockData.ts` until
 * the Phase 1b page-swap lands — at that point the mock file retires and
 * this becomes the single source of truth. When you change one, change the
 * other in the same commit.
 */

export type Activity = {
  id: string;
  slug: string;
  title: string;
  time: string;
  location: string;
  neighborhood: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  tag?: string;
  joined?: number;
  instructorAvatar?: string;
  description?: string;
  instructorName?: string;
  duration?: string;
  schoolId?: string;
  schoolSlug?: string;
  schoolName?: string;
  schoolAvatar?: string;
  rating?: number;
  reviewCount?: number;
  level?: string;
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  activity?: string;
};

export type School = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  location: string;
  stats: { label: string; value: string }[];
  about: string;
  classes: Activity[];
  gallery: string[];
};

export type SessionSlot = {
  id: string;
  activityId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  spotsTaken: number;
  spotsLeft: number;
};

export type Locale = "pl" | "en";
