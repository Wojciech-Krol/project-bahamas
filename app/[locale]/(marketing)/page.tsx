import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getClosestActivities } from "@/src/lib/db/queries/activities";
import { getReviews } from "@/src/lib/db/queries/reviews";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";
import {
  jsonLdScript,
  organizationSchema,
  websiteSchema,
} from "@/app/lib/structuredData";

import HomeClient from "./HomeClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("titleDefault"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `/${locale}`,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { pl: "/pl", en: "/en", "x-default": "/pl" },
    },
  };
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteSchema(locale)) }}
      />
      <HomeClient closestActivities={closestActivities} reviews={reviews} />
    </>
  );
}
