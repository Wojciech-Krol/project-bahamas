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
  items: { key: ActivityKey; emoji: string }[];
}[] = [
  {
    key: "sports",
    items: [
      { key: "yoga", emoji: "🧘" },
      { key: "tennis", emoji: "🎾" },
      { key: "swimming", emoji: "🏊" },
      { key: "climbing", emoji: "🧗" },
      { key: "boxing", emoji: "🥊" },
      { key: "running", emoji: "🏃" },
    ],
  },
  {
    key: "arts",
    items: [
      { key: "pottery", emoji: "🎨" },
      { key: "dance", emoji: "💃" },
      { key: "music", emoji: "🎵" },
      { key: "photography", emoji: "📸" },
      { key: "cooking", emoji: "🍳" },
      { key: "guitar", emoji: "🎸" },
    ],
  },
];

export const NEIGHBORHOOD_SUGGESTIONS: { key: NeighborhoodKey; icon: string }[] = [
  { key: "srodmiescie", icon: "location_city" },
  { key: "mokotow", icon: "park" },
  { key: "praga", icon: "local_cafe" },
  { key: "wola", icon: "music_note" },
  { key: "saska", icon: "diversity_3" },
  { key: "ursynow", icon: "castle" },
];

export const WHEN_OPTIONS: { key: WhenKey; icon: string }[] = [
  { key: "now", icon: "bolt" },
  { key: "today", icon: "today" },
  { key: "tomorrow", icon: "event" },
  { key: "thisWeek", icon: "date_range" },
  { key: "thisWeekend", icon: "weekend" },
  { key: "pickDate", icon: "calendar_month" },
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
