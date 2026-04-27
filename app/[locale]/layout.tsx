import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../src/i18n/routing";
import CookieConsentGate from "@/src/components/CookieConsentGate";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext"],
  variable: "--font-be-vietnam",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.club";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const titleDefault = t("titleDefault");
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: t("keywords").split(","),
    openGraph: {
      title: titleDefault,
      description: t("description"),
      type: "website",
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      siteName: "Hakuna",
      url: `${SITE_URL}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: t("description"),
    },
    // No alternates here on purpose. Each route owns its own canonical +
    // hreflang via getPathname so localized pathnames (e.g. /pl/o-nas) get
    // the right URL. If we set canonical at layout level, every child page
    // without its own override would canonicalize to /pl — Google would
    // then de-duplicate the whole site to the homepage.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fdf9f0",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`scroll-smooth overflow-x-hidden ${plusJakarta.variable} ${beVietnam.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className="font-body antialiased text-on-surface overflow-x-hidden w-full relative bg-[radial-gradient(ellipse_80%_55%_at_30%_18%,#ffe2d8_0%,transparent_70%),radial-gradient(ellipse_70%_50%_at_75%_45%,#fde7c4_0%,transparent_75%),linear-gradient(180deg,#fff1ec_0%,#fdf6e8_45%,#fef0d8_100%)] bg-fixed"
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          {children}
          <CookieConsentGate />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
