import type { Activity, Review, School, SessionSlot } from "@/src/lib/db/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.pl";

type Locale = "pl" | "en";

const ORGANIZATION_NAME = "Hakuna";
const ORGANIZATION_LOGO = `${SITE_URL}/android-chrome-512x512.png`;

function localePath(locale: Locale, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: ORGANIZATION_LOGO,
    sameAs: [],
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORGANIZATION_NAME,
    inLanguage: locale === "pl" ? "pl-PL" : "en-GB",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localePath(locale, item.path),
    })),
  };
}

type EventSchemaInput = {
  activity: Activity;
  locale: Locale;
  sessions?: SessionSlot[];
  reviews?: Review[];
  pathname: string;
};

export function eventSchema({
  activity,
  locale,
  sessions,
  reviews,
  pathname,
}: EventSchemaInput) {
  const upcoming = sessions?.[0];
  const priceMatch = activity.price.match(/(\d+)/);
  const priceNumber = priceMatch ? Number(priceMatch[1]) : undefined;
  const priceCurrency = activity.price.toLowerCase().includes("zł") ? "PLN" : "EUR";

  const aggregateRating =
    activity.rating && activity.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: activity.rating,
          reviewCount: activity.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const reviewSchema = reviews?.slice(0, 5).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.text,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.description ?? activity.title,
    image: [activity.imageUrl],
    startDate: upcoming?.startsAt,
    endDate: upcoming?.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: activity.schoolName ?? activity.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: activity.neighborhood,
        addressCountry: "PL",
        streetAddress: activity.location,
      },
    },
    organizer: activity.schoolName
      ? {
          "@type": "Organization",
          name: activity.schoolName,
        }
      : { "@id": `${SITE_URL}/#organization` },
    offers:
      priceNumber !== undefined
        ? {
            "@type": "Offer",
            price: priceNumber,
            priceCurrency,
            availability:
              upcoming && upcoming.spotsLeft > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/LimitedAvailability",
            url: localePath(locale, pathname),
            validFrom: upcoming?.startsAt,
          }
        : undefined,
    aggregateRating,
    review: reviewSchema,
    inLanguage: locale === "pl" ? "pl-PL" : "en-GB",
    url: localePath(locale, pathname),
  };
}

type LocalBusinessInput = {
  school: School;
  locale: Locale;
  pathname: string;
};

export function localBusinessSchema({
  school,
  locale,
  pathname,
}: LocalBusinessInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": localePath(locale, pathname),
    name: school.name,
    description: school.about,
    image: [school.heroImage, ...school.gallery].slice(0, 5),
    logo: school.logo ?? ORGANIZATION_LOGO,
    address: {
      "@type": "PostalAddress",
      addressLocality: school.location,
      addressCountry: "PL",
    },
    aggregateRating: school.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: school.rating,
          reviewCount: school.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    url: localePath(locale, pathname),
    priceRange: "$$",
  };
}

type ArticleSchemaInput = {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  authorName: string;
};

export function articleSchema({
  locale,
  slug,
  title,
  description,
  image,
  publishedAt,
  authorName,
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: [image],
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: locale === "pl" ? "pl-PL" : "en-GB",
    author: { "@type": "Person", name: authorName },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: localePath(locale, `/blog/${slug}`),
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}

export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
