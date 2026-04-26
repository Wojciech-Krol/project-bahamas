import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 3600;
export const dynamicParams = true;

import { getReviewsByVenue, getVenueBySlug } from "@/src/lib/db/queries";
import { routing } from "@/src/i18n/routing";
import { getPathname } from "@/src/i18n/navigation";
import type { Locale } from "@/src/lib/db/types";
import {
  breadcrumbSchema,
  jsonLdScript,
  localBusinessSchema,
} from "@/app/lib/structuredData";

import SchoolClient from "./SchoolClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "pl";
  const school = await getVenueBySlug(slug, locale);
  if (!school) return {};

  const canonical = getPathname({
    locale,
    href: { pathname: "/school/[slug]", params: { slug } },
  });
  const description =
    school.tagline ||
    (locale === "pl"
      ? `${school.name} — ${school.location}. Zajęcia, opinie, rezerwacja online.`
      : `${school.name} — ${school.location}. Classes, reviews, online booking.`);

  return {
    title: school.name,
    description,
    openGraph: {
      title: school.name,
      description,
      url: canonical,
      type: "website",
      images: school.heroImage
        ? [{ url: school.heroImage, alt: school.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: school.name,
      description,
      images: school.heroImage ? [school.heroImage] : undefined,
    },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          getPathname({
            locale: l,
            href: { pathname: "/school/[slug]", params: { slug } },
          }),
        ]),
      ),
    },
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const school = await getVenueBySlug(slug, locale);
  if (!school) notFound();

  const reviews = await getReviewsByVenue(school.id, locale);

  const pathname = getPathname({
    locale,
    href: { pathname: "/school/[slug]", params: { slug } },
  }).replace(`/${locale}`, "");
  const business = localBusinessSchema({ school, locale, pathname });
  const breadcrumbs = breadcrumbSchema(locale, [
    { name: locale === "pl" ? "Strona główna" : "Home", path: "" },
    {
      name: locale === "pl" ? "Szkoły" : "Schools",
      path: getPathname({ locale, href: "/search" }).replace(`/${locale}`, ""),
    },
    { name: school.name, path: pathname },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <SchoolClient school={school} reviews={reviews} />
    </>
  );
}
