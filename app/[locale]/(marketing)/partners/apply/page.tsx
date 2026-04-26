import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SiteFooter from "@/src/components/SiteFooter";
import SiteNavbar from "@/src/components/SiteNavbar";

import PartnerApplyForm from "./PartnerApplyForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PartnerApply" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `/${locale}/partners/apply`,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/partners/apply`,
      languages: {
        pl: "/pl/partners/apply",
        en: "/en/partners/apply",
      },
    },
  };
}

export default async function PartnersApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PartnerApply" });

  return (
    <>
      <SiteNavbar />
      <main className="pt-20 md:pt-24 pb-20">
        <section className="max-w-3xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-10 md:pb-12 text-center">
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-6">
            {t("badge")}
          </span>
          <h1 className="font-headline font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight text-on-surface mb-5">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-on-surface/70 leading-relaxed max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <p className="mt-4 text-xs text-on-surface/50 italic">
            {t("replacementNote")}
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 md:px-6">
          <PartnerApplyForm locale={locale} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
