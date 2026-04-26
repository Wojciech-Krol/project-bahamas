import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  getCurriculumRawByActivity,
  getInstructorsRawByActivity,
  getPartnerActivityRawById,
  getVenuesByPartner,
} from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import ClassEditorClient from "./ClassEditorClient";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function PartnerClassEditorPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) notFound();

  const venues = await getVenuesByPartner(partnerId);

  if (id === "new") {
    return (
      <ClassEditorClient
        activity={null}
        venues={venues}
        initialCurriculum={[]}
        initialInstructors={[]}
      />
    );
  }

  const activity = await getPartnerActivityRawById(id, partnerId, locale);
  if (!activity) notFound();

  const [curriculum, instructors] = await Promise.all([
    getCurriculumRawByActivity(id),
    getInstructorsRawByActivity(id),
  ]);

  return (
    <ClassEditorClient
      activity={activity}
      venues={venues}
      initialCurriculum={curriculum}
      initialInstructors={instructors}
    />
  );
}
