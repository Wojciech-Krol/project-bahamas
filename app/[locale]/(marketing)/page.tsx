import { setRequestLocale } from "next-intl/server";

import { getClosestActivities } from "@/src/lib/db/queries/activities";
import { getReviews } from "@/src/lib/db/queries/reviews";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import HomeClient from "./HomeClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const [closestActivities, reviews] = await Promise.all([
    getClosestActivities(locale),
    getReviews(undefined, locale),
  ]);

  return <HomeClient closestActivities={closestActivities} reviews={reviews} />;
}
