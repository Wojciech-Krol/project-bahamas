import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { getReviewsByVenue, getVenueById } from "@/src/lib/db/queries";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import SchoolClient from "./SchoolClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const school = await getVenueById(id, locale);
  if (!school) notFound();

  const reviews = await getReviewsByVenue(id, locale);

  return <SchoolClient school={school} reviews={reviews} />;
}
