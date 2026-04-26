import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "../src/i18n/routing";
import { getPathname } from "../src/i18n/navigation";
import { getAllSlugs } from "@/src/lib/blogContent";
import { createAdminClient } from "../src/lib/db/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.club";

type StaticPath = Exclude<AppPathname, `${string}[${string}]${string}`>;

type StaticEntry = {
  href: StaticPath;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

// Internal pathnames — getPathname rewrites each to the localized URL
// (e.g. "/about" -> "/pl/o-nas" / "/en/about"). Keep this list in sync
// with src/i18n/routing.ts pathnames.
const STATIC_ENTRIES: StaticEntry[] = [
  { href: "/", priority: 1.0, changeFrequency: "weekly" },
  { href: "/about", priority: 0.7, changeFrequency: "monthly" },
  { href: "/partners/apply", priority: 0.6, changeFrequency: "monthly" },
  { href: "/search", priority: 0.5, changeFrequency: "daily" },
  { href: "/blog", priority: 0.9, changeFrequency: "weekly" },
  { href: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { href: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { href: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

function staticAlternates(href: StaticPath): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}${getPathname({ locale: l, href })}`]),
  );
}

type SlugRow = { id: string; slug: string | null; updated_at?: string | null };

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
    // Pre-launch / Supabase env missing → no dynamic entries. The sitemap
    // still emits static + blog routes so the build doesn't fail.
    return [];
  }
}

const ACTIVITY_PATH: Record<string, string> = {
  pl: "/zajecia",
  en: "/activity",
};
const SCHOOL_PATH: Record<string, string> = {
  pl: "/szkola",
  en: "/school",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ENTRIES.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${getPathname({ locale, href: entry.href })}`,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages: staticAlternates(entry.href) },
    })),
  );

  const blogEntries: MetadataRoute.Sitemap = getAllSlugs().flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`]),
        ),
      },
    })),
  );

  // Dynamic entries — every published activity + venue gets a per-locale URL
  // with hreflang alternates so Google can serve the right language to the
  // right user. Pulled in parallel so the sitemap build doesn't double its
  // round-trip.
  const [activities, venues] = await Promise.all([
    fetchPublishedSlugs("activities"),
    fetchPublishedSlugs("venues"),
  ]);

  function dynamicAlternates(
    pathBuilder: (locale: string) => string,
  ): Record<string, string> {
    return Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}/${l}${pathBuilder(l)}`]),
    );
  }

  const activityEntries: MetadataRoute.Sitemap = activities
    .filter((row) => !!row.slug)
    .flatMap((row) =>
      routing.locales.map((locale) => {
        const segment = `${ACTIVITY_PATH[locale]}/${row.slug}`;
        return {
          url: `${SITE_URL}/${locale}${segment}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: {
            languages: dynamicAlternates(
              (l) => `${ACTIVITY_PATH[l]}/${row.slug}`,
            ),
          },
        };
      }),
    );

  const venueEntries: MetadataRoute.Sitemap = venues
    .filter((row) => !!row.slug)
    .flatMap((row) =>
      routing.locales.map((locale) => {
        const segment = `${SCHOOL_PATH[locale]}/${row.slug}`;
        return {
          url: `${SITE_URL}/${locale}${segment}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.6,
          alternates: {
            languages: dynamicAlternates(
              (l) => `${SCHOOL_PATH[l]}/${row.slug}`,
            ),
          },
        };
      }),
    );

  return [...staticEntries, ...blogEntries, ...activityEntries, ...venueEntries];
}
