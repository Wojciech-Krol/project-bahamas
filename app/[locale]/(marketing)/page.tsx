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
import { localizedAlternates } from "@/app/lib/seoMeta";
import { isLandingGateOpen } from "@/app/lib/landingGate";

import HomeClient from "./HomeClient";
import LandingGateForm from "./_gate/LandingGateForm";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "pl";
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const alternates = localizedAlternates(locale, "/");
  return {
    title: t("titleDefault"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: alternates.canonical,
      type: "website",
    },
    alternates,
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

  if (!(await isLandingGateOpen())) {
    return <LandingGateForm locale={locale} />;
  }

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
