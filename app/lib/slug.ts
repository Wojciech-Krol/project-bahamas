const PL_CHAR_MAP: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "a",
  Ć: "c",
  Ę: "e",
  Ł: "l",
  Ń: "n",
  Ó: "o",
  Ś: "s",
  Ź: "z",
  Ż: "z",
};

function transliteratePolish(input: string): string {
  let out = "";
  for (const ch of input) {
    out += PL_CHAR_MAP[ch] ?? ch;
  }
  return out;
}

export function kebabify(input: string): string {
  if (!input) return "";
  const ascii = transliteratePolish(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function shortIdSuffix(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 6);
}

export function generateActivitySlug({
  title,
  city,
  id,
}: {
  title: string;
  city?: string | null;
  id: string;
}): string {
  const titlePart = kebabify(title) || "zajecia";
  const cityPart = city ? kebabify(city) : "";
  const tail = shortIdSuffix(id);
  return cityPart
    ? `${titlePart}-${cityPart}-${tail}`
    : `${titlePart}-${tail}`;
}

export function generateVenueSlug({
  name,
  city,
  id,
}: {
  name: string;
  city?: string | null;
  id: string;
}): string {
  const namePart = kebabify(name) || "szkola";
  const cityPart = city ? kebabify(city) : "";
  const tail = shortIdSuffix(id);
  return cityPart
    ? `${namePart}-${cityPart}-${tail}`
    : `${namePart}-${tail}`;
}
