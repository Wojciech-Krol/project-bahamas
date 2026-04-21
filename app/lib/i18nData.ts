"use client";

import { useMessages, useTranslations } from "next-intl";
import {
  ACTIVITIES_DATA,
  CLOSEST_IDS,
  SEARCH_RESULT_IDS,
  REVIEW_IDS,
  REVIEWS_DATA,
  type Activity,
  type Review,
} from "./mockData";
import type { SearchParams } from "./searchQuery";
import type { ActivityKey } from "../components/search/constants";

type ActivityCopy = {
  title?: string;
  time?: string;
  location?: string;
  neighborhood?: string;
  description?: string;
  instructor?: string;
  school?: string;
  level?: string;
  duration?: string;
  tag?: string;
};

function composeActivity(id: string, copy: ActivityCopy): Activity {
  const base = ACTIVITIES_DATA[id];
  return {
    id,
    imageUrl: base?.imageUrl ?? "",
    imageAlt: base?.imageAlt ?? "",
    price: base?.price ?? "",
    joined: base?.joined,
    instructorAvatar: base?.instructorAvatar,
    schoolId: base?.schoolId,
    schoolAvatar: base?.schoolAvatar,
    rating: base?.rating,
    reviewCount: base?.reviewCount,
    title: copy.title ?? id,
    time: copy.time ?? "",
    location: copy.location ?? "",
    neighborhood: copy.neighborhood ?? "",
    description: copy.description,
    instructorName: copy.instructor,
    schoolName: copy.school,
    level: copy.level,
    duration: copy.duration,
    tag: copy.tag || undefined,
  };
}

type MessageBag = {
  activities?: Record<string, ActivityCopy>;
  reviews?: Record<string, { name?: string; text?: string; activity?: string }>;
};

export function useActivitiesByIds(ids: string[]): Activity[] {
  const messages = useMessages() as MessageBag;
  const bag = messages.activities ?? {};
  return ids.map((id) => composeActivity(id, bag[id] ?? {}));
}

export function useClosestActivities(): Activity[] {
  return useActivitiesByIds(CLOSEST_IDS);
}

export function useSearchResults(): Activity[] {
  return useActivitiesByIds(SEARCH_RESULT_IDS);
}

function matchesActivityKeys(
  activity: Activity,
  keys: string[],
  tLabel: (k: ActivityKey) => string
): boolean {
  if (keys.length === 0) return true;
  const haystack = `${activity.title} ${activity.description ?? ""}`.toLowerCase();
  return keys.some((k) => {
    let label: string;
    try {
      label = tLabel(k as ActivityKey);
    } catch {
      label = k;
    }
    return haystack.includes(label.toLowerCase()) || haystack.includes(k.toLowerCase());
  });
}

function matchesNeighborhood(activity: Activity, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    activity.neighborhood.toLowerCase().includes(q) ||
    activity.location.toLowerCase().includes(q)
  );
}

export function useFilteredActivities(filters: SearchParams): Activity[] {
  const allIds = Array.from(
    new Set([...CLOSEST_IDS, ...SEARCH_RESULT_IDS, ...Object.keys(ACTIVITIES_DATA)])
  );
  const all = useActivitiesByIds(allIds);
  const tLabel = useTranslations("Search.activityLabels");

  const activityKeys = filters.activities
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return all.filter(
    (a) =>
      matchesActivityKeys(a, activityKeys, (k) => tLabel(k)) &&
      matchesNeighborhood(a, filters.neighborhood)
  );
}

export function useReviews(ids: string[] = REVIEW_IDS): Review[] {
  const messages = useMessages() as MessageBag;
  const bag = messages.reviews ?? {};
  return ids.map((id) => {
    const base = REVIEWS_DATA[id];
    const copy = bag[id] ?? {};
    return {
      id,
      avatar: base?.avatar ?? "",
      rating: base?.rating ?? 5,
      name: copy.name ?? "",
      text: copy.text ?? "",
      activity: copy.activity,
    };
  });
}
