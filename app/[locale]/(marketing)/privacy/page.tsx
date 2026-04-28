import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LegalPage from "@/src/components/LegalPage";
import { localizedAlternates } from "@/app/lib/seoMeta";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

const SECTIONS = ["collect", "use", "cookies", "retention", "rights", "contact"] as const;

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
  const t = await getTranslations({ locale, namespace: "Legal.privacy" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localizedAlternates(locale, "/privacy"),
  };
}

export default function PrivacyPolicyPage() {
  return <LegalPage pageKey="privacy" sections={SECTIONS} />;
}
