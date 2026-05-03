import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SiteFooter from "@/src/components/SiteFooter";
import SiteNavbar from "@/src/components/SiteNavbar";
import { Link } from "@/src/i18n/navigation";
import { getPathname } from "@/src/i18n/navigation";
import { routing, type AppPathname } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";
import { getActivitiesByCategoryAndCity } from "@/src/lib/db/queries";
import {
  ACTIVITY_LABELS_PL,
  ACTIVITY_SLUGS_PL,
  CITIES,
  CITY_KEYS,
  getActivityFromPlSlug,
  isCityKey,
  liveCityLandingParams,
  type CityKey,
} from "@/app/lib/geo";
import { localizedAlternates } from "@/app/lib/seoMeta";
import {
  breadcrumbSchema,
  faqPageSchema,
  jsonLdScript,
} from "@/app/lib/structuredData";
import CategoryLandingHero from "@/src/components/landing/CategoryLandingHero";
import FAQAccordion from "@/src/components/landing/FAQAccordion";
import NeighborhoodLinkGrid from "@/src/components/landing/NeighborhoodLinkGrid";
import ActivityRowCard from "@/src/components/ActivityRowCard";

// Static-render every (activity, city) combo at build time. Each ISR
// revalidation refreshes activity lists; the static frame around them
// (intro, FAQ, neighborhoods) is stable.
export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return liveCityLandingParams();
}

type RouteParams = { locale: string; activity: string; city: string };

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

type ResolvedParams = {
  locale: Locale;
  activityKey: ReturnType<typeof getActivityFromPlSlug>;
  activitySlug: string;
  city: (typeof CITIES)[CityKey];
};

function resolve(raw: RouteParams): ResolvedParams | null {
  const locale: Locale = isLocale(raw.locale) ? raw.locale : "pl";
  const activityKey = getActivityFromPlSlug(raw.activity);
  if (!activityKey) return null;
  if (!isCityKey(raw.city)) return null;
  return {
    locale,
    activityKey,
    activitySlug: raw.activity,
    city: CITIES[raw.city],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const raw = await params;
  const r = resolve(raw);
  if (!r) return {};

  const activityLabel = ACTIVITY_LABELS_PL[r.activityKey!];
  const title = `${activityLabel} ${r.city.inForm} — ${r.city.name} | Hakuna`;
  const description = `Najlepsze studia i otwarte zajęcia ${activityLabel.toLowerCase()} ${r.city.inForm}. Filtruj po dzielnicy, godzinie i poziomie. Rezerwuj online.`;

  const alternates = localizedAlternates(
    r.locale,
    "/discover/[activity]/[city]" as AppPathname,
    { activity: r.activitySlug, city: raw.city },
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
    },
    alternates,
  };
}

export default async function CategoryCityLandingPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const raw = await params;
  setRequestLocale(raw.locale);
  const r = resolve(raw);
  if (!r) notFound();

  const activityLabel = ACTIVITY_LABELS_PL[r.activityKey!];
  const tCommon = await getTranslations({
    locale: r.locale,
    namespace: "Landing.common",
  });
  const tIntros = await getTranslations({
    locale: r.locale,
    namespace: "Landing.intros",
  });
  const tCityHooks = await getTranslations({
    locale: r.locale,
    namespace: "Landing.cityHooks",
  });
  const tFaq = await getTranslations({
    locale: r.locale,
    namespace: "Landing.faq",
  });

  // Intro is keyed by activity × city. Falls back to the city hook +
  // a generic line so any combo without bespoke copy still ships
  // unique-enough text rather than a 404.
  let intro: string;
  try {
    intro = tIntros(`${r.activityKey}.${raw.city}`);
  } catch {
    let cityHook = "";
    try {
      cityHook = tCityHooks(raw.city);
    } catch {
      cityHook = "";
    }
    intro = `${activityLabel} ${r.city.inForm}. ${cityHook} Sprawdź najbliższe zajęcia poniżej i zarezerwuj online — bez dzwonienia, bez emaili.`;
  }

  // FAQ is shared per activity (yoga questions don't really change
  // between cities). If no bespoke FAQ exists, render none — better
  // than fluff that hurts E-E-A-T.
  let faqItems: { question: string; answer: string }[] = [];
  try {
    const raw = tFaq.raw(`${r.activityKey}.items`);
    if (Array.isArray(raw)) faqItems = raw;
  } catch {
    faqItems = [];
  }

  const activities = await getActivitiesByCategoryAndCity(
    r.activityKey!,
    r.city.name,
    r.locale,
    24,
  );

  const homeHref = getPathname({ locale: r.locale, href: "/" });
  const searchHref = getPathname({ locale: r.locale, href: "/search" });
  const partnerHref = getPathname({ locale: r.locale, href: "/partners/apply" });
  const landingHref = getPathname({
    locale: r.locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    href: {
      pathname: "/discover/[activity]/[city]",
      params: { activity: r.activitySlug, city: raw.city },
    } as any,
  });

  const breadcrumbs = breadcrumbSchema(r.locale, [
    { name: tCommon("homeLabel"), path: "" },
    { name: tCommon("discoverLabel"), path: "/search".replace(`/${r.locale}`, "") },
    {
      name: `${activityLabel} ${r.city.name}`,
      path: landingHref.replace(`/${r.locale}`, ""),
    },
  ]);

  const faqLd = faqItems.length > 0 ? faqPageSchema(faqItems) : null;

  // Sister-city links — drive crawl flow horizontally across the
  // hub-and-spoke topology without leaving the activity vertical.
  const sisterCities = CITY_KEYS.filter((k) => k !== r.city.key).map((k) => ({
    name: `${activityLabel} ${CITIES[k].name}`,
    href: getPathname({
      locale: r.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href: {
        pathname: "/discover/[activity]/[city]",
        params: { activity: r.activitySlug, city: k },
      } as any,
    }),
    hint: undefined,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
        />
      )}

      <SiteNavbar />
      <main className="pt-4 md:pt-8 pb-16 md:pb-24">
        <CategoryLandingHero
          badge={activityLabel}
          title={`${activityLabel} ${r.city.inForm}`}
          intro={intro}
          crumbs={[
            { label: tCommon("homeLabel"), href: homeHref },
            { label: tCommon("discoverLabel"), href: searchHref },
            { label: `${activityLabel} ${r.city.name}` },
          ]}
        />

        {activities.length > 0 ? (
          <section className="max-w-site mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-6 md:mb-8 gap-4 flex-wrap">
              <h2 className="font-headline font-bold text-2xl md:text-4xl text-on-surface">
                {activityLabel} {r.city.inForm}
              </h2>
              <Link
                href={searchHref as never}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {tCommon("viewAllInCity", { cityIn: r.city.inForm })} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {activities.map((a) => (
                <ActivityRowCard key={a.id} activity={a} />
              ))}
            </div>
          </section>
        ) : (
          <section className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16 text-center">
            <h2 className="font-headline font-bold text-2xl md:text-4xl text-on-surface mb-4">
              {tCommon("noResultsTitle", {
                activity: activityLabel.toLowerCase(),
                cityIn: r.city.inForm,
              })}
            </h2>
            <p className="text-on-surface/70 leading-relaxed mb-8">
              {tCommon("noResultsBody", {
                cityFrom: r.city.fromForm,
                cityIn: r.city.inForm,
              })}
            </p>
            <Link
              href={partnerHref as never}
              className="inline-block bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              {tCommon("ctaPartner")}
            </Link>
          </section>
        )}

        <NeighborhoodLinkGrid
          heading={tCommon("neighborhoodsHeading")}
          items={r.city.neighborhoods.map((n) => ({
            name: `${activityLabel} ${r.city.name} — ${n.name}`,
            // Neighborhood landings are a Phase 4 wave 2 deliverable;
            // for now the link routes back to filtered search so users
            // still get a useful landing target.
            href: searchHref,
            hint: n.inForm,
          }))}
        />

        {faqItems.length > 0 && (
          <FAQAccordion
            heading={tCommon("faqHeading")}
            items={faqItems}
          />
        )}

        <NeighborhoodLinkGrid
          heading={`${activityLabel} w innych miastach`}
          items={sisterCities}
        />
      </main>
      <SiteFooter />
    </>
  );
}

// Re-export so unused-import lint stays quiet for type-only helpers.
export type { ActivityKey } from "@/src/components/search/constants";
export const _activitySlugs = ACTIVITY_SLUGS_PL;
