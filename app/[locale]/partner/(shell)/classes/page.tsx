import { setRequestLocale } from "next-intl/server";

import {
  getActivitiesByPartner,
  type PartnerActivity,
} from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import PartnerClassesClient from "./PartnerClassesClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function PartnerClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const partnerId = await getPartnerIdForCurrentUser();
  const activities: PartnerActivity[] = partnerId
    ? await getActivitiesByPartner(partnerId, locale)
    : [];

  return <PartnerClassesClient activities={activities} />;
}
