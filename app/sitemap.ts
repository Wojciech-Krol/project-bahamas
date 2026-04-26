import type { MetadataRoute } from "next";
import { routing } from "../src/i18n/routing";
import { getAllSlugs } from "@/src/lib/blogContent";
import { createAdminClient } from "../src/lib/db/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.example";

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/partners/apply", priority: 0.6, changeFrequency: "monthly" },
  { path: "/search", priority: 0.8, changeFrequency: "daily" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

function languageMap(pathSuffix: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${pathSuffix}`]),
  );
}

type IdRow = { id: string; updated_at?: string | null };

async function fetchPublishedIds(table: "activities" | "venues"): Promise<IdRow[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from(table)
      .select("id, updated_at")
      .eq("is_published", true)
      .limit(50000);
    if (error || !data) return [];
    return data as IdRow[];
  } catch {
    // Pre-launch / Supabase env missing → no dynamic entries. The sitemap
    // still emits static + blog routes so the build doesn't fail.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${entry.path}`,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages: languageMap(entry.path) },
    })),
  );

  const blogEntries: MetadataRoute.Sitemap = getAllSlugs().flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: languageMap(`/blog/${slug}`) },
    })),
  );

  // Dynamic entries — every published activity + venue gets a per-locale URL
  // with hreflang alternates so Google can serve the right language to the
  // right user. Pulled in parallel so the sitemap build doesn't double its
  // round-trip.
  const [activities, venues] = await Promise.all([
    fetchPublishedIds("activities"),
    fetchPublishedIds("venues"),
  ]);

  const activityEntries: MetadataRoute.Sitemap = activities.flatMap((row) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/activity/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages: languageMap(`/activity/${row.id}`) },
    })),
  );

  const venueEntries: MetadataRoute.Sitemap = venues.flatMap((row) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/school/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages: languageMap(`/school/${row.id}`) },
    })),
  );

  return [...staticEntries, ...blogEntries, ...activityEntries, ...venueEntries];
}
