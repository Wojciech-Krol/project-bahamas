export type SearchField = "activities" | "neighborhood" | "when" | "age" | null;

export type AgeCounts = { kids: number; teens: number; adults: number };

export type ActivityKey =
  | "yoga"
  | "tennis"
  | "swimming"
  | "climbing"
  | "boxing"
  | "running"
  | "pottery"
  | "dance"
  | "music"
  | "photography"
  | "cooking"
  | "guitar";

export type CategoryKey = "sports" | "arts";

export type NeighborhoodKey =
  | "srodmiescie"
  | "mokotow"
  | "praga"
  | "wola"
  | "saska"
  | "ursynow";

export type WhenKey =
  | "now"
  | "today"
  | "tomorrow"
  | "thisWeek"
  | "thisWeekend"
  | "pickDate";

export const ACTIVITY_CATEGORIES: {
  key: CategoryKey;
  items: { key: ActivityKey }[];
}[] = [
  {
    key: "sports",
    items: [
      { key: "yoga" },
      { key: "tennis" },
      { key: "swimming" },
      { key: "climbing" },
      { key: "boxing" },
      { key: "running" },
    ],
  },
  {
    key: "arts",
    items: [
      { key: "pottery" },
      { key: "dance" },
      { key: "music" },
      { key: "photography" },
      { key: "cooking" },
      { key: "guitar" },
    ],
  },
];

// `icon` values are Tabler icon names (without the `tabler:` prefix).
export const NEIGHBORHOOD_SUGGESTIONS: { key: NeighborhoodKey; icon: string }[] = [
  { key: "srodmiescie", icon: "building-skyscraper" },
  { key: "mokotow", icon: "trees" },
  { key: "praga", icon: "coffee" },
  { key: "wola", icon: "music" },
  { key: "saska", icon: "users-group" },
  { key: "ursynow", icon: "building-castle" },
];

export const WHEN_OPTIONS: { key: WhenKey; icon: string }[] = [
  { key: "now", icon: "bolt" },
  { key: "today", icon: "calendar" },
  { key: "tomorrow", icon: "calendar-event" },
  { key: "thisWeek", icon: "calendar-week" },
  { key: "thisWeekend", icon: "calendar-stats" },
  { key: "pickDate", icon: "calendar-month" },
];

export const AGE_GROUPS: { key: keyof AgeCounts }[] = [
  { key: "kids" },
  { key: "teens" },
  { key: "adults" },
];

export function formatMultiSelectDisplay(value: string | undefined): string {
  if (!value) return "";
  const list = value.split(",").map((s) => s.trim()).filter(Boolean);
  const len = list.length;
  if (len === 0) return "";

  if (len === 1) {
    return list[0].length > 20 ? list[0].slice(0, 20) + "..." : list[0];
  }

  if (len === 2) {
    const joined = list.join(", ");
    if (joined.length <= 16) return joined;
    let first = list[0];
    if (first.length > 10) first = first.slice(0, 10) + "..";
    return `${first}, +1`;
  }

  let first = list[0];
  if (first.length > 10) first = first.slice(0, 10) + "..";
  return `${first}, +${len - 1}`;
}
