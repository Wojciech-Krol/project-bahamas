import type { ActivityKey } from "@/src/components/search/constants";
import { createAdminClient } from "@/src/lib/db/admin";

export const ACTIVITY_KEYS: ActivityKey[] = [
  "yoga",
  "tennis",
  "swimming",
  "climbing",
  "boxing",
  "running",
  "pottery",
  "dance",
  "music",
  "photography",
  "cooking",
  "guitar",
];

export type CityKey =
  | "warszawa"
  | "krakow"
  | "wroclaw"
  | "gdansk"
  | "poznan";

export type Neighborhood = {
  /** URL-safe slug (no diacritics, lowercase). */
  key: string;
  /** Display name with diacritics. */
  name: string;
  /** Locative form for "w {N}" (e.g. "na Mokotowie", "na Kazimierzu"). */
  inForm: string;
};

export type City = {
  key: CityKey;
  /** Display name (nominative). */
  name: string;
  /** Locative form for "w {C}" (e.g. "w Warszawie"). */
  inForm: string;
  /** Genitive form for "z {C}" (e.g. "z Warszawy"). */
  fromForm: string;
  /** Approximate city center for map markers. */
  lat: number;
  lng: number;
  /** Roughly 5–8 highest-traffic neighborhoods, ordered by SEO priority. */
  neighborhoods: Neighborhood[];
};

export const CITIES: Record<CityKey, City> = {
  warszawa: {
    key: "warszawa",
    name: "Warszawa",
    inForm: "Warszawie",
    fromForm: "Warszawy",
    lat: 52.2297,
    lng: 21.0122,
    neighborhoods: [
      { key: "srodmiescie", name: "Śródmieście", inForm: "na Śródmieściu" },
      { key: "mokotow", name: "Mokotów", inForm: "na Mokotowie" },
      { key: "praga-polnoc", name: "Praga-Północ", inForm: "na Pradze-Północ" },
      { key: "wola", name: "Wola", inForm: "na Woli" },
      { key: "ursynow", name: "Ursynów", inForm: "na Ursynowie" },
      { key: "zoliborz", name: "Żoliborz", inForm: "na Żoliborzu" },
    ],
  },
  krakow: {
    key: "krakow",
    name: "Kraków",
    inForm: "Krakowie",
    fromForm: "Krakowa",
    lat: 50.0647,
    lng: 19.945,
    neighborhoods: [
      { key: "stare-miasto", name: "Stare Miasto", inForm: "na Starym Mieście" },
      { key: "kazimierz", name: "Kazimierz", inForm: "na Kazimierzu" },
      { key: "podgorze", name: "Podgórze", inForm: "na Podgórzu" },
      { key: "krowodrza", name: "Krowodrza", inForm: "na Krowodrzy" },
      { key: "nowa-huta", name: "Nowa Huta", inForm: "w Nowej Hucie" },
      { key: "grzegorzki", name: "Grzegórzki", inForm: "na Grzegórzkach" },
    ],
  },
  wroclaw: {
    key: "wroclaw",
    name: "Wrocław",
    inForm: "Wrocławiu",
    fromForm: "Wrocławia",
    lat: 51.1079,
    lng: 17.0385,
    neighborhoods: [
      { key: "stare-miasto", name: "Stare Miasto", inForm: "na Starym Mieście" },
      { key: "srodmiescie", name: "Śródmieście", inForm: "na Śródmieściu" },
      { key: "krzyki", name: "Krzyki", inForm: "na Krzykach" },
      { key: "fabryczna", name: "Fabryczna", inForm: "na Fabrycznej" },
      { key: "psie-pole", name: "Psie Pole", inForm: "na Psim Polu" },
    ],
  },
  gdansk: {
    key: "gdansk",
    name: "Gdańsk",
    inForm: "Gdańsku",
    fromForm: "Gdańska",
    lat: 54.352,
    lng: 18.6466,
    neighborhoods: [
      { key: "srodmiescie", name: "Śródmieście", inForm: "na Śródmieściu" },
      { key: "wrzeszcz", name: "Wrzeszcz", inForm: "na Wrzeszczu" },
      { key: "oliwa", name: "Oliwa", inForm: "na Oliwie" },
      { key: "przymorze", name: "Przymorze", inForm: "na Przymorzu" },
      { key: "zaspa", name: "Zaspa", inForm: "na Zaspie" },
    ],
  },
  poznan: {
    key: "poznan",
    name: "Poznań",
    inForm: "Poznaniu",
    fromForm: "Poznania",
    lat: 52.4064,
    lng: 16.9252,
    neighborhoods: [
      { key: "stare-miasto", name: "Stare Miasto", inForm: "na Starym Mieście" },
      { key: "jezyce", name: "Jeżyce", inForm: "na Jeżycach" },
      { key: "grunwald", name: "Grunwald", inForm: "na Grunwaldzie" },
      { key: "wilda", name: "Wilda", inForm: "na Wildzie" },
    ],
  },
};

export const CITY_KEYS: CityKey[] = Object.keys(CITIES) as CityKey[];

/** Maps an `ActivityKey` to its Polish display label (nominative). */
export const ACTIVITY_LABELS_PL: Record<ActivityKey, string> = {
  yoga: "Joga",
  tennis: "Tenis",
  swimming: "Pływanie",
  climbing: "Wspinaczka",
  boxing: "Boks",
  running: "Bieganie",
  pottery: "Ceramika",
  dance: "Taniec",
  music: "Muzyka",
  photography: "Fotografia",
  cooking: "Gotowanie",
  guitar: "Gitara",
};

/** URL slug for each ActivityKey — used as `/odkryj/[activity]/...` segment. */
export const ACTIVITY_SLUGS_PL: Record<ActivityKey, string> = {
  yoga: "joga",
  tennis: "tenis",
  swimming: "plywanie",
  climbing: "wspinaczka",
  boxing: "boks",
  running: "bieganie",
  pottery: "ceramika",
  dance: "taniec",
  music: "muzyka",
  photography: "fotografia",
  cooking: "gotowanie",
  guitar: "gitara",
};

/** Reverse: PL slug -> ActivityKey. Used to validate URL segments. */
export const ACTIVITY_KEY_FROM_PL_SLUG: Record<string, ActivityKey> =
  Object.fromEntries(
    Object.entries(ACTIVITY_SLUGS_PL).map(([key, slug]) => [
      slug,
      key as ActivityKey,
    ]),
  );

export function isCityKey(value: string): value is CityKey {
  return value in CITIES;
}

export function getCity(key: string): City | null {
  return isCityKey(key) ? CITIES[key] : null;
}

export function getActivityFromPlSlug(slug: string): ActivityKey | null {
  return ACTIVITY_KEY_FROM_PL_SLUG[slug] ?? null;
}

// Live markets — cities with published supply. The DB query in
// `getLiveCityKeys` overrides this list once supply lands; the hardcoded
// fallback keeps pre-launch (empty/unreachable Supabase) deterministic so
// `generateStaticParams` and the sitemap stay consistent.
export const INITIAL_LIVE_CITIES: CityKey[] = ["warszawa", "wroclaw"];

function slugifyCity(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Returns the set of city slugs that currently have at least one published
 * activity in a venue tagged with that city. Falls back to
 * `INITIAL_LIVE_CITIES` when the DB is empty, unreachable, or returns no
 * recognizable city. Slug match is diacritic-insensitive (`Wrocław` →
 * `wroclaw`).
 */
export async function getLiveCityKeys(): Promise<CityKey[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("activities")
      .select("venues!inner(city)")
      .eq("is_published", true);
    if (error || !data || data.length === 0) return INITIAL_LIVE_CITIES;
    const slugs = new Set<CityKey>();
    for (const row of data as Array<{ venues: { city: string | null } | { city: string | null }[] | null }>) {
      const v = row.venues;
      const city = Array.isArray(v) ? v[0]?.city : v?.city;
      const slug = slugifyCity(city);
      if (slug && isCityKey(slug)) slugs.add(slug);
    }
    return slugs.size > 0 ? [...slugs] : INITIAL_LIVE_CITIES;
  } catch {
    return INITIAL_LIVE_CITIES;
  }
}

/**
 * Generates every (activity, city) combo for cities with live supply.
 * Used by `generateStaticParams` on `/odkryj/[activity]/[city]` and the
 * sitemap so we don't index thin-content landings for cities without
 * partners.
 */
export async function liveCityLandingParams(): Promise<
  { activity: string; city: CityKey }[]
> {
  const cities = await getLiveCityKeys();
  return cities.flatMap((city) =>
    ACTIVITY_KEYS.map((key) => ({ activity: ACTIVITY_SLUGS_PL[key], city })),
  );
}
