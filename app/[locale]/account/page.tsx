import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getCurrentUser } from "@/src/lib/db/server";

import AccountForms from "./AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Guard: signed-in users only. Supabase may not be configured in
  // local dev — in that case we 404 by falling through the redirect
  // (there's no session so the helper returns null and we bounce to
  // login, which itself renders a degraded form).
  let current;
  try {
    current = await getCurrentUser();
  } catch {
    current = null;
  }
  if (!current) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "Account" });

  const deletionRequestedAt = current.profile?.deletion_requested_at as
    | string
    | undefined;
  const deletionReadableDate = deletionRequestedAt
    ? new Date(
        new Date(deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(locale)
    : null;

  return (
    <div className="min-h-screen bg-surface pt-24 md:pt-32 pb-16">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <header className="mb-10">
          <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">
            {t("title")}
          </h1>
          <p className="text-on-surface/70">{t("subtitle")}</p>
        </header>
        <AccountForms
          locale={locale}
          deletionPending={!!deletionRequestedAt}
          deletionDate={deletionReadableDate}
        />
      </div>
    </div>
  );
}
