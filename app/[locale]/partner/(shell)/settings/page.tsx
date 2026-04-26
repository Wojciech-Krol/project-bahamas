import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { getPartnerProfile } from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";

import PartnerSettingsClient from "./PartnerSettingsClient";

export default async function PartnerSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) notFound();

  const profile = await getPartnerProfile(partnerId);
  if (!profile) notFound();

  return <PartnerSettingsClient profile={profile} />;
}
