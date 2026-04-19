"use client";

import { useMessages } from "next-intl";
import {
  ACTIVITIES_DATA,
  CLOSEST_IDS,
  SEARCH_RESULT_IDS,
  REVIEW_IDS,
  REVIEWS_DATA,
  type Activity,
  type Review,
} from "./mockData";

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
