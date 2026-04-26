import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.club";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/pl/partner",
        "/en/partner",
        "/pl/admin",
        "/en/admin",
        "/pl/account",
        "/en/account",
        "/pl/bookings",
        "/en/bookings",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
