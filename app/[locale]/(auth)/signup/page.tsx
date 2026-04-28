import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Link } from "@/src/i18n/navigation";
import SignupForm from "./SignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.signup" });
  return { title: t("title") };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t("signup.title")}
        </h1>
        <p className="text-on-surface/70">{t("signup.subtitle")}</p>
      </div>
      <SignupForm locale={locale} />
      <p className="text-sm text-on-surface/70 text-center">
        {t("signup.haveAccount")}{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          {t("signup.loginCta")}
        </Link>
      </p>
    </div>
  );
}
