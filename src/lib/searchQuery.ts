import type { AgeCounts } from "@/app/components/search/constants";

export type SearchParams = {
  activities: string;
  neighborhood: string;
  when: string;
  ageCounts: AgeCounts;
};

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  activities: "",
  neighborhood: "",
  when: "",
  ageCounts: { kids: 0, teens: 0, adults: 1 },
};

export function buildSearchQuery(p: SearchParams): string {
  const sp = new URLSearchParams();
  if (p.activities) sp.set("activities", p.activities);
  if (p.neighborhood) sp.set("neighborhood", p.neighborhood);
  if (p.when) sp.set("when", p.when);
  if (p.ageCounts.kids) sp.set("kids", String(p.ageCounts.kids));
  if (p.ageCounts.teens) sp.set("teens", String(p.ageCounts.teens));
  if (p.ageCounts.adults !== 1) sp.set("adults", String(p.ageCounts.adults));
  return sp.toString();
}

type ParamSource =
  | URLSearchParams
  | { get(key: string): string | null }
  | Record<string, string | string[] | undefined>;

function readParam(src: ParamSource, key: string): string {
  if (src instanceof URLSearchParams) return src.get(key) ?? "";
  const maybeGet = (src as { get?: (k: string) => string | null }).get;
  if (typeof maybeGet === "function") return maybeGet.call(src, key) ?? "";
  const v = (src as Record<string, string | string[] | undefined>)[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseSearchQuery(src: ParamSource): SearchParams {
  const num = (key: string, def: number): number => {
    const raw = readParam(src, key);
    if (!raw) return def;
    const n = Number(raw);
    return Number.isFinite(n) ? n : def;
  };
  return {
    activities: readParam(src, "activities"),
    neighborhood: readParam(src, "neighborhood"),
    when: readParam(src, "when"),
    ageCounts: {
      kids: num("kids", 0),
      teens: num("teens", 0),
      adults: num("adults", 1),
    },
  };
}
