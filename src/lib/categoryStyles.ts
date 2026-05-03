/**
 * Category-specific style sub-filters.
 *
 * Each ActivityKey maps to a list of style slugs the search FilterDrawer
 * surfaces when that category is part of the active filter set. Empty
 * list = category has no sub-styles (e.g. running) — the drawer hides
 * its section entirely.
 *
 * Style slugs are stored on `activities.style text[]` (migration 0013).
 * Translated labels live under `Search.styles.<slug>` in messages/*.json.
 *
 * Adding a new style:
 *   1. Push the slug into the list below.
 *   2. Add `Search.styles.<slug>` copy to messages/pl.json + messages/en.json.
 *   3. Partner editor surfaces the picker automatically.
 */
export const CATEGORY_STYLES = {
  yoga: ["vinyasa", "hatha", "ashtanga", "yin", "kundalini", "prenatal"],
  tennis: ["singles", "doubles", "padel", "junior"],
  swimming: ["freestyle", "breaststroke", "butterfly", "backstroke", "open-water"],
  climbing: ["bouldering", "lead", "top-rope", "outdoor"],
  boxing: ["classic", "kickboxing", "muay-thai", "mma", "krav-maga"],
  running: ["road", "trail", "track", "ultra"],
  pottery: ["wheel", "hand-building", "raku", "sculpture"],
  dance: ["jazz", "ballet", "modern", "hip-hop", "salsa", "bachata", "contemporary", "swing", "tango"],
  music: ["piano", "vocals", "drums", "violin", "production"],
  photography: ["portrait", "street", "landscape", "studio", "darkroom"],
  cooking: ["italian", "asian", "polish", "patisserie", "vegan"],
  guitar: ["acoustic", "electric", "classical", "bass", "fingerstyle"],
} as const;

export type CategoryWithStyles = keyof typeof CATEGORY_STYLES;
export type StyleSlug = (typeof CATEGORY_STYLES)[CategoryWithStyles][number];

/** Returns the union of style slugs for the given categories. */
export function stylesForCategories(categories: string[]): string[] {
  const out = new Set<string>();
  for (const cat of categories) {
    const list = (CATEGORY_STYLES as Record<string, readonly string[]>)[cat];
    if (list) for (const s of list) out.add(s);
  }
  return Array.from(out);
}

/** True if any of the categories has ≥1 style sub-filter. */
export function hasStylesForCategories(categories: string[]): boolean {
  return stylesForCategories(categories).length > 0;
}
