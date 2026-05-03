import { NextResponse } from "next/server";

import { getPathname } from "@/src/i18n/navigation";
import { routing, type AppPathname } from "@/src/i18n/routing";
import { getAllSlugs } from "@/src/lib/blogContent";
import { createAdminClient } from "@/src/lib/db/admin";

import { liveCityLandingParams } from "./../lib/geo";

// Route handler instead of `app/sitemap.ts` so we can pin
// `Content-Type: application/xml; charset=utf-8` (Next 16's MetadataRoute
// helper omits the charset, which trips a subset of strict validators).
//
// Optimisations vs. a vanilla emit:
//   - Polish is the canonical locale (hakuna.pl); /pl URL is the
//     `x-default` hreflang on every entry. EN exists for diaspora /
//     visitors but Polish content is the SERP default.
//   - Activities + venues advertise their hero image via the Image
//     Sitemap extension (image:loc) so visual SERP cards have an
//     anchor.
//   - lastmod for activity / venue rows comes from `updated_at`, not
//     "now()". Static + landing pages still default to the build time.
//   - priority is biased toward the Polish locale (1.0 vs 0.7) — the
//     spec is informal but Bing + Yandex still factor it in.
export const dynamic = "force-static";
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.pl";
const DEFAULT_LOCALE = routing.defaultLocale; // "pl"

type StaticPath = Exclude<AppPathname, `${string}[${string}]${string}`>;

type StaticEntry = {
  href: StaticPath;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
};

const STATIC_ENTRIES: StaticEntry[] = [
  { href: "/", priority: 1.0, changefreq: "weekly" },
  { href: "/about", priority: 0.7, changefreq: "monthly" },
  { href: "/partners/apply", priority: 0.6, changefreq: "monthly" },
  { href: "/search", priority: 0.5, changefreq: "daily" },
  { href: "/blog", priority: 0.9, changefreq: "weekly" },
  { href: "/privacy", priority: 0.3, changefreq: "yearly" },
  { href: "/terms", priority: 0.3, changefreq: "yearly" },
  { href: "/cookies", priority: 0.3, changefreq: "yearly" },
];

const ACTIVITY_PATH: Record<string, string> = {
  pl: "/zajecia",
  en: "/activity",
};
const SCHOOL_PATH: Record<string, string> = {
  pl: "/szkola",
  en: "/school",
};

type SlugRow = {
  id: string;
  slug: string | null;
  hero_image?: string | null;
  updated_at?: string | null;
};

type ImageEntry = {
  loc: string;
  caption?: string;
};

type UrlEntry = {
  loc: string;
  alternates: Record<string, string>;
  /** x-default href — typically the Polish URL. */
  xDefault: string;
  lastmod: string;
  changefreq: StaticEntry["changefreq"];
  priority: number;
  images?: ImageEntry[];
};

const XML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => XML_ESCAPE[c] ?? c);
}

/** Bias Polish URLs slightly higher — hakuna.pl is the canonical
 *  domain and the Polish locale is the primary audience. */
function localePriority(locale: string, basePriority: number): number {
  const factor = locale === DEFAULT_LOCALE ? 1.0 : 0.85;
  return Math.min(1, Math.round(basePriority * factor * 10) / 10);
}

function renderUrl(entry: UrlEntry): string {
  const links = Object.entries(entry.alternates)
    .map(
      ([lang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}"/>`,
    )
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(entry.xDefault)}"/>`,
    )
    .join("\n");
  const images = (entry.images ?? [])
    .map(
      (img) =>
        `    <image:image>\n      <image:loc>${xmlEscape(img.loc)}</image:loc>${
          img.caption
            ? `\n      <image:caption>${xmlEscape(img.caption)}</image:caption>`
            : ""
        }\n    </image:image>`,
    )
    .join("\n");
  return [
    "  <url>",
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    links,
    images,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
    "  </url>",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

async function fetchPublishedSlugs(
  table: "activities" | "venues",
): Promise<SlugRow[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from(table)
      .select("id, slug, hero_image, updated_at")
      .eq("is_published", true)
      .limit(50000);
    if (error || !data) return [];
    return data as SlugRow[];
  } catch {
    return [];
  }
}

function staticAlternates(href: StaticPath): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((l) => [
      l,
      `${SITE_URL}${getPathname({ locale: l, href })}`,
    ]),
  );
}

function xDefaultFor(alternates: Record<string, string>): string {
  return alternates[DEFAULT_LOCALE] ?? Object.values(alternates)[0] ?? SITE_URL;
}

export async function GET(): Promise<NextResponse> {
  const nowIso = new Date().toISOString();

  const staticUrls: UrlEntry[] = STATIC_ENTRIES.flatMap((entry) => {
    const alternates = staticAlternates(entry.href);
    return routing.locales.map((locale) => ({
      loc: alternates[locale],
      alternates,
      xDefault: xDefaultFor(alternates),
      lastmod: nowIso,
      changefreq: entry.changefreq,
      priority: localePriority(locale, entry.priority),
    }));
  });

  const blogUrls: UrlEntry[] = getAllSlugs().flatMap((slug) => {
    const alternates = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`]),
    );
    return routing.locales.map((locale) => ({
      loc: `${SITE_URL}/${locale}/blog/${slug}`,
      alternates,
      xDefault: xDefaultFor(alternates),
      lastmod: nowIso,
      changefreq: "monthly" as const,
      priority: localePriority(locale, 0.7),
    }));
  });

  const [activities, venues, landingParams] = await Promise.all([
    fetchPublishedSlugs("activities"),
    fetchPublishedSlugs("venues"),
    liveCityLandingParams(),
  ]);

  const activityUrls: UrlEntry[] = activities
    .filter((row) => !!row.slug)
    .flatMap((row) => {
      const alternates = Object.fromEntries(
        routing.locales.map((l) => [
          l,
          `${SITE_URL}/${l}${ACTIVITY_PATH[l]}/${row.slug}`,
        ]),
      );
      const images: ImageEntry[] = row.hero_image
        ? [{ loc: row.hero_image }]
        : [];
      return routing.locales.map((locale) => ({
        loc: alternates[locale],
        alternates,
        xDefault: xDefaultFor(alternates),
        lastmod: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : nowIso,
        changefreq: "weekly" as const,
        priority: localePriority(locale, 0.7),
        images,
      }));
    });

  const venueUrls: UrlEntry[] = venues
    .filter((row) => !!row.slug)
    .flatMap((row) => {
      const alternates = Object.fromEntries(
        routing.locales.map((l) => [
          l,
          `${SITE_URL}/${l}${SCHOOL_PATH[l]}/${row.slug}`,
        ]),
      );
      const images: ImageEntry[] = row.hero_image
        ? [{ loc: row.hero_image }]
        : [];
      return routing.locales.map((locale) => ({
        loc: alternates[locale],
        alternates,
        xDefault: xDefaultFor(alternates),
        lastmod: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : nowIso,
        changefreq: "weekly" as const,
        priority: localePriority(locale, 0.6),
        images,
      }));
    });

  const landingUrls: UrlEntry[] = landingParams.flatMap(({ activity, city }) => {
    const alternates = Object.fromEntries(
      routing.locales.map((l) => [
        l,
        `${SITE_URL}${getPathname({
          locale: l,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          href: {
            pathname: "/discover/[activity]/[city]" as AppPathname,
            params: { activity, city },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })}`,
      ]),
    );
    return routing.locales.map((locale) => ({
      loc: alternates[locale],
      alternates,
      xDefault: xDefaultFor(alternates),
      lastmod: nowIso,
      changefreq: "weekly" as const,
      // Programmatic landings are SEO bread-and-butter for hakuna.pl —
      // bias them above static pages so crawlers prioritise.
      priority: localePriority(locale, 0.8),
    }));
  });

  const all = [
    ...staticUrls,
    ...blogUrls,
    ...activityUrls,
    ...venueUrls,
    ...landingUrls,
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` +
    ` xmlns:xhtml="http://www.w3.org/1999/xhtml"` +
    ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    all.map(renderUrl).join("\n") +
    `\n</urlset>\n`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
