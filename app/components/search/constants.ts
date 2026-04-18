export type SearchField = "activities" | "neighborhood" | "when" | "age" | null;

export type AgeCounts = { kids: number; teens: number; adults: number };

export const ACTIVITY_CATEGORIES = [
  {
    name: "Sports & Fitness",
    items: [
      { emoji: "🧘", label: "Yoga" },
      { emoji: "🎾", label: "Tennis" },
      { emoji: "🏊", label: "Swimming" },
      { emoji: "🧗", label: "Climbing" },
      { emoji: "🥊", label: "Boxing" },
      { emoji: "🏃", label: "Running" },
    ],
  },
  {
    name: "Arts & Creative",
    items: [
      { emoji: "🎨", label: "Pottery" },
      { emoji: "💃", label: "Dance" },
      { emoji: "🎵", label: "Music" },
      { emoji: "📸", label: "Photography" },
      { emoji: "🍳", label: "Cooking" },
      { emoji: "🎸", label: "Guitar" },
    ],
  },
];

export const NEIGHBORHOOD_SUGGESTIONS = [
  { name: "Mitte", sub: "Central Berlin", icon: "location_city" },
  { name: "Prenzlauer Berg", sub: "Pankow District", icon: "park" },
  { name: "Kreuzberg", sub: "Friedrichshain-Kreuzberg", icon: "local_cafe" },
  { name: "Friedrichshain", sub: "East Berlin", icon: "music_note" },
  { name: "Neukölln", sub: "South Berlin", icon: "diversity_3" },
  { name: "Charlottenburg", sub: "West Berlin", icon: "castle" },
];

export const WHEN_OPTIONS = [
  { label: "Now", sub: "Next 30 min", icon: "bolt" },
  { label: "Today", sub: "Until midnight", icon: "today" },
  { label: "Tomorrow", sub: "All day", icon: "event" },
  { label: "This week", sub: "Next 7 days", icon: "date_range" },
  { label: "This weekend", sub: "Sat – Sun", icon: "weekend" },
  { label: "Pick a date", sub: "Calendar", icon: "calendar_month" },
];

export const AGE_GROUPS = [
  { label: "Kids", sub: "Ages 3–8", key: "kids" as const },
  { label: "Teens", sub: "Ages 9–17", key: "teens" as const },
  { label: "Adults", sub: "Ages 18+", key: "adults" as const },
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
