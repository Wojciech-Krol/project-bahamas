import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getFilteredActivities } from "@/src/lib/db/queries/activities";
import { getFavoriteIds } from "@/src/lib/favorites/actions";
import { parseSearchQuery } from "@/src/lib/searchQuery";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";
import { localizedAlternates } from "@/app/lib/seoMeta";

import SearchClient from "./SearchClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ locale: raw }, sp] = await Promise.all([params, searchParams]);
  const locale: Locale = isLocale(raw) ? raw : "pl";
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const hasParams = Object.values(sp).some(
    (v) => v !== undefined && v !== "" && v !== "0",
  );

  const titleBase =
    locale === "pl" ? "Szukaj zajęć" : "Search activities";

  return {
    title: titleBase,
    description: t("description"),
    robots: {
      index: !hasParams,
      follow: true,
    },
    alternates: localizedAlternates(locale, "/search"),
  };
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
  const styleKeys = initial.styles
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [results, favorites] = await Promise.all([
    getFilteredActivities(locale, {
      activities: activityKeys,
      neighborhood: initial.neighborhood || undefined,
      styles: styleKeys.length > 0 ? styleKeys : undefined,
    }),
    getFavoriteIds(),
  ]);

  return (
    <SearchClient
      initial={initial}
      results={results}
      favoritedIds={Array.from(favorites)}
    />
  );
}
