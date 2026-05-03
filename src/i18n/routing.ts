import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "always",
  // Hreflang advertised once via HTML <link rel="alternate"> in metadata.
  // Validators flag duplication if next-intl also emits the Link header.
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/about": { pl: "/o-nas", en: "/about" },
    "/search": { pl: "/szukaj", en: "/search" },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/activity/[slug]": { pl: "/zajecia/[slug]", en: "/activity/[slug]" },
    "/school/[slug]": { pl: "/szkola/[slug]", en: "/school/[slug]" },
    "/discover/[activity]/[city]": {
      pl: "/odkryj/[activity]/[city]",
      en: "/discover/[activity]/[city]",
    },
    "/partners/apply": {
      pl: "/partnerzy/zglos",
      en: "/partners/apply",
    },
    "/privacy": { pl: "/prywatnosc", en: "/privacy" },
    "/terms": { pl: "/regulamin", en: "/terms" },
    "/cookies": { pl: "/cookies", en: "/cookies" },
    "/login": "/login",
    "/signup": "/signup",
    "/account": { pl: "/konto", en: "/account" },
    "/account/bookings": { pl: "/konto/rezerwacje", en: "/account/bookings" },
    "/account/favorites": { pl: "/konto/ulubione", en: "/account/favorites" },
    "/account/calendar": { pl: "/konto/kalendarz", en: "/account/calendar" },
    "/bookings/[id]": { pl: "/rezerwacje/[id]", en: "/bookings/[id]" },
    "/admin": "/admin",
    "/partner": "/partner",
    "/partner/login": "/partner/login",
    "/partner/classes": "/partner/classes",
    "/partner/classes/new": "/partner/classes/new",
    "/partner/classes/[id]": "/partner/classes/[id]",
    "/partner/instructors": "/partner/instructors",
    "/partner/venue": "/partner/venue",
    "/partner/bookings": "/partner/bookings",
    "/partner/reviews": "/partner/reviews",
    "/partner/insights": "/partner/insights",
    "/partner/payouts": "/partner/payouts",
    "/partner/settings": "/partner/settings",
    "/partner/promote": "/partner/promote",
    "/partner/payments": "/partner/payments",
    "/partner/plans": "/partner/plans",
    "/partner/integrations": "/partner/integrations",
    "/createarticle": "/createarticle",
    "/createarticle/preview": "/createarticle/preview",
  },
});

export type Locale = (typeof routing.locales)[number];

export type AppPathname = keyof typeof routing.pathnames;
