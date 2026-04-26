import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  getActivityById,
  getReviewsByActivity,
  getUpcomingSessionsByActivity,
} from "@/src/lib/db/queries";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import ActivityClient from "./ActivityClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const activity = await getActivityById(id, locale);
  if (!activity) notFound();

  const [sessions, reviews] = await Promise.all([
    getUpcomingSessionsByActivity(id),
    getReviewsByActivity(id, locale),
  ]);

  return (
    <ActivityClient
      id={id}
      activity={activity}
      sessions={sessions}
      reviews={reviews}
      locale={locale}
    />
  );
}
