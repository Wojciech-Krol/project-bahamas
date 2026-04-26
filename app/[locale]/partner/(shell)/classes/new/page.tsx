import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { getVenuesByPartner } from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import ClassEditorClient from "../[id]/ClassEditorClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function NewPartnerClassPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const _locale: Locale = isLocale(raw) ? raw : "pl";

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) notFound();

  const venues = await getVenuesByPartner(partnerId);

  return (
    <ClassEditorClient
      mode="page"
      activity={null}
      venues={venues}
      initialCurriculum={[]}
      initialInstructors={[]}
    />
  );
}
