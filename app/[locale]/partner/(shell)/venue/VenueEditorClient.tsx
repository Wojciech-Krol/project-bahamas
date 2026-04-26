"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Icon } from "@/app/components/Icon";
import { updateVenue, type VenueActionResult } from "./actions";
import type { PartnerVenue, PartnerVenueRaw } from "@/src/lib/db/queries";
import VenuePhotosManager from "./VenuePhotosManager";

const initialState: VenueActionResult | null = null;

export default function VenueEditorClient({
  venues,
  initialVenue,
}: {
  venues: PartnerVenue[];
  initialVenue: PartnerVenueRaw | null;
}) {
  const t = useTranslations("Partner.venue");
  const tField = useTranslations("Partner.venue.fields");
  const tCommon = useTranslations("Partner.common");
  const tErr = useTranslations("Partner.classEditor.error");

  const [activeId, setActiveId] = useState<string>(initialVenue?.id ?? "");
  // Local snapshot of the edited venue. Updates when user switches venue.
  const [venue, setVenue] = useState<PartnerVenueRaw | null>(initialVenue);

  const action = async (
    _prev: VenueActionResult | null,
    formData: FormData,
  ): Promise<VenueActionResult | null> => {
    if (!venue) return null;
    return updateVenue(venue.id, formData);
  };

  const [state, formAction] = useActionState(action, initialState);

  async function onSelectVenue(id: string) {
    setActiveId(id);
    // Hydrate via a client-side fetch to a tiny RSC could be added later;
    // for now, partner edits one venue per page-load and we ask them to
    // navigate away and back to switch. Most partners have a single venue.
    if (venue && venue.id === id) return;
    setVenue(null);
  }

  if (venues.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {t("emptyState")}
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="p-8 text-center text-on-surface/60">
        {t("selectAnother")}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-2">
            {t("badge")}
          </span>
          <h1 className="font-headline font-extrabold text-3xl tracking-tight">
            {t("title")}
          </h1>
        </div>
        {venues.length > 1 && (
          <select
            value={activeId}
            onChange={(e) => onSelectVenue(e.target.value)}
            className="px-4 py-2 bg-surface-container-lowest border border-[#FAEEDA] rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <form action={formAction} className="space-y-6">
        <Section icon="badge" title={t("sections.identity")}>
          <FieldLabel>{tField("name")}</FieldLabel>
          <input
            name="name"
            defaultValue={venue.name}
            required
            maxLength={120}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-headline font-bold mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>{tField("about")} (PL)</FieldLabel>
              <textarea
                name="descriptionPl"
                rows={4}
                defaultValue={venue.descriptionI18n.pl}
                maxLength={2000}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
              />
            </div>
            <div>
              <FieldLabel>{tField("about")} (EN)</FieldLabel>
              <textarea
                name="descriptionEn"
                rows={4}
                defaultValue={venue.descriptionI18n.en}
                maxLength={2000}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
              />
            </div>
          </div>
        </Section>

        <Section icon="place" title={t("sections.location")}>
          <FieldLabel>{tField("address")}</FieldLabel>
          <input
            name="address"
            defaultValue={venue.address ?? ""}
            maxLength={200}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-medium mb-4"
          />
          <FieldLabel>{tField("city")}</FieldLabel>
          <input
            name="city"
            defaultValue={venue.city ?? ""}
            maxLength={80}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-medium"
          />
        </Section>

        {/* Hero image is now managed by the photo manager below — keep the
            field as a hidden input so updateVenue() does not null it out. */}
        <input type="hidden" name="heroImage" value={venue.heroImage ?? ""} />

        <Section icon="visibility" title={t("sections.visibility")}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={venue.isPublished}
              className="w-5 h-5 accent-primary"
            />
            <div>
              <div className="font-bold text-sm">{tField("publish")}</div>
              <div className="text-xs text-on-surface/60">
                {tField("publishHint")}
              </div>
            </div>
          </label>
        </Section>

        {state && "error" in state && (
          <div className="rounded-xl bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
            {tErr(state.error)}
          </div>
        )}
        {state && "ok" in state && state.ok && (
          <div className="rounded-xl bg-tertiary-container/40 px-3 py-2 text-sm text-on-tertiary-container">
            {t("savedToast")}
          </div>
        )}

        <div className="flex justify-end gap-2 sticky bottom-0 bg-surface py-4 border-t border-on-surface/5">
          <SubmitButton label={tCommon("save")} />
        </div>
      </form>

      <div className="mt-6">
        <VenuePhotosManager
          venueId={venue.id}
          initialHero={venue.heroImage}
          initialGallery={venue.gallery}
        />
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5">
      <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name={icon} className="text-[20px] text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
      {children}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary disabled:opacity-50"
    >
      {label}
    </button>
  );
}
