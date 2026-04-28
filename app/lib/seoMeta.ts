import { getPathname } from "@/src/i18n/navigation";
import { routing, type AppPathname } from "@/src/i18n/routing";

type Locale = (typeof routing.locales)[number];

type Alternates = {
  canonical: string;
  languages: Record<string, string>;
};

/**
 * Build canonical + hreflang alternates for a given locale + internal
 * pathname. Returns LOCALIZED URLs (e.g. /pl/o-nas, not /pl/about) so
 * Google can crawl each language correctly.
 *
 * Pass the INTERNAL pathname key (the one declared in src/i18n/routing.ts
 * `pathnames`); the helper rewrites it via next-intl's `getPathname` to
 * the URL each locale actually serves.
 */
export function localizedAlternates(
  locale: Locale,
  href: AppPathname,
  params?: Record<string, string>,
): Alternates {
  // next-intl returns either the localized path (e.g. "/pl/o-nas") or the
  // canonical key when no rewrite exists. We treat its output as the
  // source of truth for both fields.
  const argFor = (l: Locale): Parameters<typeof getPathname>[0] => {
    return params
      ? ({
          locale: l,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          href: { pathname: href as any, params } as any,
        } as Parameters<typeof getPathname>[0])
      : ({ locale: l, href } as Parameters<typeof getPathname>[0]);
  };

  const canonical = getPathname(argFor(locale));
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = getPathname(argFor(l));
  }
  // x-default points to the default locale (PL).
  languages["x-default"] = getPathname(argFor(routing.defaultLocale));

  return { canonical, languages };
}
