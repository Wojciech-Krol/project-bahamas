import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LegalPage from "@/src/components/LegalPage";
import { localizedAlternates } from "@/app/lib/seoMeta";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

const SECTIONS = ["eligibility", "bookings", "cancellation", "conduct", "liability", "changes"] as const;

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "pl";
  const t = await getTranslations({ locale, namespace: "Legal.terms" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localizedAlternates(locale, "/terms"),
  };
}

export default function TermsPage() {
  return <LegalPage pageKey="terms" sections={SECTIONS} />;
}
