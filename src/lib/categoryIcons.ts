import type { ActivityKey } from "@/app/components/search/constants";

/**
 * Single source of truth: activity category key → Tabler icon name (without
 * the `tabler:` prefix). Swap the entire icon set by editing this map.
 *
 * Tabler reference: https://tabler.io/icons
 */
export const CATEGORY_ICONS: Record<ActivityKey, string> = {
  // Sports
  yoga: "yoga",
  tennis: "ball-tennis",
  swimming: "swimming",
  climbing: "mountain",
  boxing: "boxing-punch",
  running: "run",
  // Arts
  pottery: "palette",
  dance: "music",
  music: "music",
  photography: "camera",
  cooking: "tools-kitchen-2",
  guitar: "guitar-pick",
};

/**
 * Resolves a free-form activity title to a Tabler icon name. Used by surfaces
 * that don't carry a typed category key (e.g. map markers built from raw
 * titles). Falls back to a neutral location pin.
 */
export function tablerIconForTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("yoga") || t.includes("hatha") || t.includes("joga")) return "yoga";
  if (t.includes("tennis") || t.includes("tenis")) return "ball-tennis";
  if (t.includes("swim") || t.includes("pływan")) return "swimming";
  if (t.includes("climb") || t.includes("wspinacz")) return "mountain";
  if (t.includes("boxing") || t.includes("boks")) return "boxing-punch";
  if (t.includes("run") || t.includes("biega")) return "run";
  if (t.includes("dance") || t.includes("taniec") || t.includes("taneczne")) return "music";
  if (t.includes("guitar") || t.includes("gitar")) return "guitar-pick";
  if (t.includes("music") || t.includes("muzyk")) return "music";
  if (t.includes("photo") || t.includes("fot")) return "camera";
  if (t.includes("cook") || t.includes("gotow")) return "tools-kitchen-2";
  if (t.includes("pottery") || t.includes("ceramik")) return "palette";
  if (t.includes("padel")) return "ball-tennis";
  if (t.includes("football") || t.includes("piłk") || t.includes("pilk")) return "ball-football";
  if (t.includes("basket") || t.includes("kosz")) return "ball-basketball";
  if (t.includes("volley") || t.includes("siatk")) return "ball-volleyball";
  if (t.includes("bike") || t.includes("rower")) return "bike";
  if (t.includes("ski") || t.includes("narty")) return "ski-jumping";
  if (t.includes("gym") || t.includes("siłow") || t.includes("silow")) return "barbell";
  return "map-pin";
}
