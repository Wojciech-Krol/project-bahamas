import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

// Detail pages are static-by-default with hourly revalidation. Activities
// change rarely (price tweaks, schedule swaps); a 1h TTL keeps Google's
// crawler hitting cached HTML while still picking up partner edits within
// an hour. Partner mutations also trigger revalidatePath in
// classes/actions.ts so urgent updates propagate instantly.
export const revalidate = 3600;
export const dynamicParams = true;

import {
  getActivityBySlug,
  getCurriculumByActivity,
  getInstructorsByActivity,
  getReviewsByActivity,
  getUpcomingSessionsByActivity,
} from "@/src/lib/db/queries";
import { routing } from "@/src/i18n/routing";
import { getPathname } from "@/src/i18n/navigation";
import type { Locale } from "@/src/lib/db/types";
import {
  breadcrumbSchema,
  eventSchema,
  jsonLdScript,
} from "@/app/lib/structuredData";

import ActivityClient from "./ActivityClient";

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
  const activity = await getActivityBySlug(slug, locale);
  if (!activity) return {};

  const canonical = getPathname({
    locale,
    href: { pathname: "/activity/[slug]", params: { slug } },
  });
  const description =
    activity.description ??
    (locale === "pl"
      ? `${activity.title} w ${activity.location}. Zarezerwuj zajęcia online na Hakuna.`
      : `${activity.title} in ${activity.location}. Book your spot on Hakuna.`);

  return {
    title: activity.title,
    description,
    openGraph: {
      title: activity.title,
      description,
      url: canonical,
      type: "website",
      images: activity.imageUrl
        ? [{ url: activity.imageUrl, alt: activity.imageAlt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: activity.title,
      description,
      images: activity.imageUrl ? [activity.imageUrl] : undefined,
    },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          getPathname({
            locale: l,
            href: { pathname: "/activity/[slug]", params: { slug } },
          }),
        ]),
      ),
    },
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const activity = await getActivityBySlug(slug, locale);
  if (!activity) notFound();

  const [sessions, reviews, curriculum, instructors] = await Promise.all([
    getUpcomingSessionsByActivity(activity.id),
    getReviewsByActivity(activity.id, locale),
    getCurriculumByActivity(activity.id, locale),
    getInstructorsByActivity(activity.id, locale),
  ]);

  const pathname = getPathname({
    locale,
    href: { pathname: "/activity/[slug]", params: { slug } },
  });
  const event = eventSchema({
    activity,
    locale,
    sessions,
    reviews,
    pathname: pathname.replace(`/${locale}`, ""),
  });
  const breadcrumbs = breadcrumbSchema(locale, [
    { name: locale === "pl" ? "Strona główna" : "Home", path: "" },
    {
      name: locale === "pl" ? "Zajęcia" : "Activities",
      path: getPathname({ locale, href: "/search" }).replace(`/${locale}`, ""),
    },
    {
      name: activity.title,
      path: pathname.replace(`/${locale}`, ""),
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(event) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <ActivityClient
        id={activity.id}
        activity={activity}
        sessions={sessions}
        reviews={reviews}
        curriculum={curriculum}
        instructors={instructors}
        locale={locale}
      />
    </>
  );
}
