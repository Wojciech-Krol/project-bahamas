import { NextResponse } from "next/server";

import { getPathname } from "@/src/i18n/navigation";
import { routing, type AppPathname } from "@/src/i18n/routing";
import { getAllSlugs } from "@/src/lib/blogContent";
import { createAdminClient } from "@/src/lib/db/admin";

import { liveCityLandingParams } from "./../lib/geo";

// Route handler instead of `app/sitemap.ts` so we can pin
// `Content-Type: application/xml; charset=utf-8` (Next 16's MetadataRoute
// helper omits the charset, which trips a subset of strict validators).
// Vercel still negotiates `Content-Encoding: gzip` on the edge — that's
// fine; gzip + application/xml is well-formed HTTP.
export const dynamic = "force-static";
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.club";

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

type SlugRow = { id: string; slug: string | null; updated_at?: string | null };

type UrlEntry = {
  loc: string;
  alternates: Record<string, string>;
  lastmod: string;
  changefreq: StaticEntry["changefreq"];
  priority: number;
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

function renderUrl(entry: UrlEntry): string {
  const links = Object.entries(entry.alternates)
    .map(
      ([lang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}"/>`,
    )
    .join("\n");
  return [
    "  <url>",
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    links,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

async function fetchPublishedSlugs(
  table: "activities" | "venues",
): Promise<SlugRow[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from(table)
      .select("id, slug, updated_at")
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

export async function GET(): Promise<NextResponse> {
  const nowIso = new Date().toISOString();

  const staticUrls: UrlEntry[] = STATIC_ENTRIES.flatMap((entry) =>
    routing.locales.map((locale) => ({
      loc: `${SITE_URL}${getPathname({ locale, href: entry.href })}`,
      alternates: staticAlternates(entry.href),
      lastmod: nowIso,
      changefreq: entry.changefreq,
      priority: entry.priority,
    })),
  );

  const blogUrls: UrlEntry[] = getAllSlugs().flatMap((slug) =>
    routing.locales.map((locale) => ({
      loc: `${SITE_URL}/${locale}/blog/${slug}`,
      alternates: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`]),
      ),
      lastmod: nowIso,
      changefreq: "monthly" as const,
      priority: 0.7,
    })),
  );

  const [activities, venues, landingParams] = await Promise.all([
    fetchPublishedSlugs("activities"),
    fetchPublishedSlugs("venues"),
    liveCityLandingParams(),
  ]);

  const activityUrls: UrlEntry[] = activities
    .filter((row) => !!row.slug)
    .flatMap((row) =>
      routing.locales.map((locale) => ({
        loc: `${SITE_URL}/${locale}${ACTIVITY_PATH[locale]}/${row.slug}`,
        alternates: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${SITE_URL}/${l}${ACTIVITY_PATH[l]}/${row.slug}`,
          ]),
        ),
        lastmod: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : nowIso,
        changefreq: "weekly" as const,
        priority: 0.7,
      })),
    );

  const venueUrls: UrlEntry[] = venues
    .filter((row) => !!row.slug)
    .flatMap((row) =>
      routing.locales.map((locale) => ({
        loc: `${SITE_URL}/${locale}${SCHOOL_PATH[locale]}/${row.slug}`,
        alternates: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${SITE_URL}/${l}${SCHOOL_PATH[l]}/${row.slug}`,
          ]),
        ),
        lastmod: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : nowIso,
        changefreq: "weekly" as const,
        priority: 0.6,
      })),
    );

  const landingUrls: UrlEntry[] = landingParams.flatMap(({ activity, city }) =>
    routing.locales.map((locale) => {
      const pathname = getPathname({
        locale,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href: {
          pathname: "/discover/[activity]/[city]" as AppPathname,
          params: { activity, city },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      return {
        loc: `${SITE_URL}${pathname}`,
        alternates: Object.fromEntries(
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
        ),
        lastmod: nowIso,
        changefreq: "weekly" as const,
        priority: 0.8,
      };
    }),
  );

  const all = [
    ...staticUrls,
    ...blogUrls,
    ...activityUrls,
    ...venueUrls,
    ...landingUrls,
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
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
