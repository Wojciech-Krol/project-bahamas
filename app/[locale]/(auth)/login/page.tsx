import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Link } from "@/src/i18n/navigation";
import { safeNextPath } from "@/src/lib/auth/redirects";
import LoginForm from "./LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.login" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth" });
  const next = safeNextPath(sp.next ?? null, locale);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t("login.title")}
        </h1>
        <p className="text-on-surface/70">{t("login.subtitle")}</p>
      </div>
      <LoginForm locale={locale} next={next} />
      <p className="text-sm text-on-surface/70 text-center">
        {t("login.noAccount")}{" "}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          {t("login.signupCta")}
        </Link>
      </p>
    </div>
  );
}
