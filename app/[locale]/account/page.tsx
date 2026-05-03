import { getTranslations, setRequestLocale } from "next-intl/server";

import { getCurrentUser } from "@/src/lib/db/server";

import AccountForms from "./AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Layout already enforces auth — by the time we render here `current`
  // is non-null. The duplicate fetch is cheap (request-scoped client
  // dedupes the auth call) and lets us read profile fields without
  // threading them through layout context.
  const current = await getCurrentUser();
  if (!current) return null;

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
    <>
      <header className="mb-8">
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
    </>
  );
}
