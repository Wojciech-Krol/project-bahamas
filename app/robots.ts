import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Authenticated user surfaces — never indexable.
        "/pl/partner",
        "/en/partner",
        "/pl/admin",
        "/en/admin",
        "/pl/account",
        "/en/account",
        "/pl/konto",
        "/pl/bookings",
        "/en/bookings",
        "/pl/rezerwacje",
        // Blog admin (other team's lane, no public value).
        "/pl/createarticle",
        "/en/createarticle",
        // Server endpoints — wastes crawl budget, leaks internals on 4xx.
        "/api/",
        // Next.js internals.
        "/_next/",
        // Search results pages with query params — duplicate-content risk.
        // The static /search hub stays allowed via the `allow` rule above.
        "/pl/szukaj?",
        "/en/search?",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
