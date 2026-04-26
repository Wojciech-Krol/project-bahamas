import { setRequestLocale } from "next-intl/server";

import {
  getPartnerVenueRawById,
  getVenuesByPartner,
} from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";

import VenueEditorClient from "./VenueEditorClient";

export default async function PartnerVenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) {
    return <VenueEditorClient venues={[]} initialVenue={null} />;
  }

  const venues = await getVenuesByPartner(partnerId);
  const targetId = sp.id ?? venues[0]?.id ?? null;
  const initialVenue = targetId
    ? await getPartnerVenueRawById(targetId, partnerId)
    : null;

  return <VenueEditorClient venues={venues} initialVenue={initialVenue} />;
}
