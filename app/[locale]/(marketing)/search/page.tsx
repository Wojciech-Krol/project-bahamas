import { setRequestLocale } from "next-intl/server";

import { getFilteredActivities } from "@/src/lib/db/queries/activities";
import { parseSearchQuery } from "@/src/lib/searchQuery";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import SearchClient from "./SearchClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale: raw }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const initial = parseSearchQuery(sp);
  const activityKeys = initial.activities
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const results = await getFilteredActivities(locale, {
    activities: activityKeys,
    neighborhood: initial.neighborhood || undefined,
  });

  return <SearchClient initial={initial} results={results} />;
}
