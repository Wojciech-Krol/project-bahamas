"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import SiteNavbar from "@/src/components/SiteNavbar";
import SiteFooter from "@/src/components/SiteFooter";
import ReviewsSection from "@/src/components/ReviewsSection";
import { Icon } from "@/src/components/Icon";
import TrackActivityView from "@/src/components/analytics/TrackActivityView";
import { ACTIVITY_DETAIL_BASE, AVATAR } from "@/src/lib/mockData";
import type { Activity, Review } from "@/src/lib/mockData";
import type {
  CurriculumItem,
  InstructorEntry,
} from "@/src/lib/db/queries";
import type { Locale, SessionSlot } from "@/src/lib/db/types";
import { createBooking } from "@/src/lib/payments/bookingActions";

// Pure decoration that does not vary per activity. Real curriculum +
// instructor data comes via props from the DB; the avatar pile and
// metadata icon set below are visual sugar with no data attached.
const DECORATIVE = {
  joined: [AVATAR("j1"), AVATAR("j2"), AVATAR("j3")],
  joinedExtra: 12,
  metadataIcons: ACTIVITY_DETAIL_BASE.metadataIcons,
};

function formatSessionLabel(iso: string, locale: Locale): { day: string; time: string } {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return { day, time };
}

export default function ActivityClient({
  id,
  activity,
  sessions,
  reviews,
  curriculum,
  instructors,
  locale,
}: {
  id: string;
  activity: Activity;
  sessions: SessionSlot[];
  reviews: Review[];
  curriculum: CurriculumItem[];
  instructors: InstructorEntry[];
  locale: Locale;
}) {
  const t = useTranslations("Activity");
  const tCommon = useTranslations("Common");
  const tSample = useTranslations("Activity.sample");
  const tError = useTranslations("Activity.bookingError");

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id ?? "",
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? sessions[0],
    [selectedSessionId, sessions],
  );

  function onBook() {
    if (!selectedSession) return;
    setErrorKey(null);
    const sessionId = selectedSession.id;
    startTransition(async () => {
      const result = await createBooking(sessionId);
      if ("ok" in result && result.ok) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if ("error" in result) {
        if (result.error === "not_signed_in") {
          const next = encodeURIComponent(window.location.pathname);
          window.location.href = `/${locale}/login?next=${next}`;
          return;
        }
        setErrorKey(result.error);
      }
    });
  }

  const heroImage = activity.imageUrl || ACTIVITY_DETAIL_BASE.heroImage;
  const tags = tSample.raw("tags") as string[];
  const metadata = [
    {
      icon: DECORATIVE.metadataIcons[0],
      label: t("targetAge"),
      value: tSample("metaAge"),
    },
    {
      icon: DECORATIVE.metadataIcons[1],
      label: t("intensity"),
      value: activity.level ?? tSample("metaIntensity"),
    },
    {
      icon: DECORATIVE.metadataIcons[2],
      label: t("durationLabel"),
      value: activity.duration ?? tSample("metaDuration"),
    },
  ];

  const spotsLeft = selectedSession?.spotsLeft ?? 0;

  return (
    <>
      <TrackActivityView activityId={id} />
      <SiteNavbar />
      <main className="pt-20 md:pt-24 pb-24 md:pb-0">
        <section className="relative h-[55vh] md:h-[70vh] min-h-[360px] md:min-h-[500px] w-full overflow-hidden">
          <img
            src={heroImage}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-site mx-auto px-4 md:px-6 pb-10 md:pb-16 text-white">
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-fixed/90 text-primary px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
              {activity.title}
            </h1>
          </div>
        </section>

        <div className="max-w-site mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 md:gap-14 items-start">
          <div className="space-y-12 md:space-y-16 min-w-0">
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Icon name="auto_awesome" className="text-[22px] text-primary" />
                <h2 className="font-headline font-bold text-xl text-primary uppercase tracking-widest">
                  {t("theExperience")}
                </h2>
              </div>
              <p className="text-lg md:text-xl text-on-surface/80 leading-relaxed">
                {activity.description ?? tSample("description")}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {metadata.map((m) => (
                  <div
                    key={m.label}
                    className="bg-surface-container-low rounded-[1.5rem] p-5"
                  >
                    <Icon name={m.icon} className="text-[22px] text-primary mb-3" />
                    <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                      {m.label}
                    </div>
                    <div className="font-bold text-on-surface">{m.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {curriculum.length > 0 && (
              <section>
                <h2 className="font-headline font-bold text-3xl md:text-4xl tracking-tight mb-8">
                  {t("curriculumFocus")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {curriculum.map((c, idx) => (
                    <article
                      key={c.id}
                      className={`bg-surface-container-lowest rounded-[1.5rem] p-6 border border-on-surface/[0.05] editorial-shadow ${
                        c.imageUrl ? "md:col-span-2 flex flex-col md:flex-row gap-5" : ""
                      }`}
                    >
                      {c.imageUrl && (
                        <img
                          src={c.imageUrl}
                          alt={c.title || activity.title}
                          className="w-full md:w-56 h-40 md:h-auto object-cover rounded-[1rem] shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-headline font-bold text-lg md:text-xl">
                            {c.title}
                          </h3>
                        </div>
                        {c.description && (
                          <p className="text-on-surface/70 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {instructors.length > 0 && (
              <section className="space-y-6">
                {instructors.map((inst, idx) => (
                  <div
                    key={inst.id}
                    className={
                      idx === 0
                        ? "bg-surface-container-low rounded-[2rem] p-6 md:p-10"
                        : "bg-surface-container-lowest rounded-[1.5rem] p-5 border border-on-surface/[0.05]"
                    }
                  >
                    <div
                      className={`flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start ${
                        idx === 0 ? "" : "md:items-center"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {inst.avatarUrl ? (
                          <img
                            src={inst.avatarUrl}
                            alt={inst.name}
                            className={
                              idx === 0
                                ? "w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                                : "w-20 h-20 rounded-full object-cover"
                            }
                          />
                        ) : (
                          <div
                            className={`${
                              idx === 0
                                ? "w-32 h-32 md:w-40 md:h-40"
                                : "w-20 h-20"
                            } rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline font-extrabold text-3xl`}
                          >
                            {(inst.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        {idx === 0 && (
                          <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center border-4 border-surface-container-low">
                            <Icon name="verified" className="text-[18px]" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left min-w-0">
                        {inst.role && (
                          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-2">
                            {inst.role}
                          </div>
                        )}
                        <h3
                          className={`font-headline font-bold text-on-surface mb-3 ${
                            idx === 0 ? "text-3xl" : "text-xl"
                          }`}
                        >
                          {inst.name}
                        </h3>
                        {inst.bio && (
                          <p className="text-on-surface/70 leading-relaxed mb-5">
                            {inst.bio}
                          </p>
                        )}
                        {inst.credentials.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {inst.credentials.map((c, i) => (
                              <span
                                key={`${c.icon}-${i}`}
                                className="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-semibold border border-on-surface/[0.06]"
                              >
                                <Icon
                                  name={c.icon}
                                  className="text-[18px] text-primary"
                                />
                                {c.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 space-y-5">
            <div className="rounded-[2rem] overflow-hidden editorial-shadow border border-on-surface/[0.05] bg-surface-container-lowest">
              <div className="bg-gradient-to-br from-primary to-tertiary text-on-primary p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-widest opacity-80">
                      {t("totalExperience")}
                    </div>
                    <div className="font-headline font-extrabold text-5xl md:text-6xl mt-1">
                      {activity.price}
                    </div>
                  </div>
                  <Icon name="bolt" className="text-[28px]" />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div>
                  <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-3">
                    {t("availableDates")}
                  </div>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-on-surface/60">
                      {t("noSessions")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {sessions.slice(0, 6).map((s) => {
                        const { day, time } = formatSessionLabel(s.startsAt, locale);
                        const isSelected = selectedSessionId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSessionId(s.id)}
                            className={`rounded-2xl p-3 text-center transition-all border-2 ${
                              isSelected
                                ? "bg-primary text-on-primary border-primary"
                                : "bg-surface-container-low border-transparent hover:border-primary/30"
                            }`}
                          >
                            <div className="text-xs font-bold uppercase tracking-widest">
                              {day}
                            </div>
                            <div className="font-bold mt-0.5">{time}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-on-surface/80">
                    <Icon name="location_on" className="text-[20px] text-primary" />
                    <span className="text-sm">{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface/80">
                    <Icon name="person" className="text-[20px] text-primary" />
                    <span className="text-sm">
                      {t("spotsLeft", { count: spotsLeft })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onBook}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-headline uppercase tracking-widest text-sm font-bold hover:bg-tertiary transition-colors disabled:opacity-50"
                  disabled={!selectedSession || spotsLeft <= 0 || pending}
                >
                  {pending ? t("bookingProgress") : t("bookYourSpot")}
                </button>

                {errorKey && (
                  <p className="text-xs text-error text-center" role="alert">
                    {tError(errorKey)}
                  </p>
                )}

                <p className="text-xs text-on-surface/50 text-center">
                  {t("freeCancel")}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-[1.5rem] p-5">
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-3">
                {t("joiningPulse")}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {DECORATIVE.joined.map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-low"
                    />
                  ))}
                  <span className="w-10 h-10 rounded-full bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center border-2 border-surface-container-low">
                    +{DECORATIVE.joinedExtra}
                  </span>
                </div>
                <div className="text-sm text-on-surface/70">
                  {t("alreadyBooked")}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ReviewsSection
          reviews={reviews}
          title={t("whatParticipantsSay")}
          subtitle={t("participantsSubtitle")}
        />
      </main>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-on-surface/[0.06] px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(45,10,23,0.08)]">
        <div className="flex flex-col min-w-0">
          <span className="font-headline font-extrabold text-lg text-on-surface leading-none">
            {activity.price}
          </span>
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mt-1">
            {t("spotsLeftShort", { count: spotsLeft })}
          </span>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="ml-auto bg-primary text-on-primary px-6 py-3.5 rounded-full font-headline font-bold uppercase tracking-widest text-[0.75rem] shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 transition-transform disabled:opacity-50"
          disabled={!selectedSession || spotsLeft <= 0 || pending}
        >
          {pending ? t("bookingProgress") : tCommon("bookNow")}
        </button>
      </div>

      <SiteFooter />
      <div className="md:hidden h-20" aria-hidden />
    </>
  );
}
