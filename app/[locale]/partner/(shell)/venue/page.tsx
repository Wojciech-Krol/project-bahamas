"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../../../../components/Icon";
import { CURRENT_VENUE } from "../../../../lib/partnerMockData";

const ABOUT_MAX = 500;

type StatEntry = { value: string; label: string };

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
      {children}
    </label>
  );
}

export default function PartnerVenuePage() {
  const tV = useTranslations("Partner.venue");
  const tSec = useTranslations("Partner.venue.sections");
  const tField = useTranslations("Partner.venue.fields");
  const tPrev = useTranslations("Partner.venue.preview");
  const tMock = useTranslations("Partner.mock.venue");
  const tStats = useTranslations("Partner.mock");
  const tNb = useTranslations("Partner.mock.neighborhoods");
  const tClasses = useTranslations("Partner.mock.classes");

  const [name, setName] = useState(tMock("name"));
  const [tagline, setTagline] = useState(tMock("tagline"));
  const [about, setAbout] = useState(tMock("about"));
  const [address, setAddress] = useState(tMock("address"));
  const [activeNb, setActiveNb] = useState(CURRENT_VENUE.activeNeighborhoodId);
  const [stats, setStats] = useState<StatEntry[]>(
    (tStats.raw("stats") as StatEntry[]).slice(),
  );
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const ratingValue = tStats("rating.value");
  const ratingCount = tStats.raw("rating.count") as number;
  const slug = tMock("slug");

  function updateStat(i: number, key: keyof StatEntry, v: string) {
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* form */}
      <div className="p-8 border-r border-on-surface/5 space-y-6 overflow-auto">
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-2">
              {tV("badge")}
            </span>
            <h1 className="font-headline font-extrabold text-3xl tracking-tight">
              {tV("title")}
            </h1>
          </div>
          <a
            href={`/school/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
          >
            {tV("viewLive")}
            <Icon name="open_in_new" className="text-[14px]" />
          </a>
        </div>

        <Section icon="badge" title={tSec("identity")}>
          <FieldLabel>{tField("name")}</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-headline font-bold mb-4"
          />
          <FieldLabel>{tField("tagline")}</FieldLabel>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary italic mb-4"
          />
          <FieldLabel>{tField("about")}</FieldLabel>
          <textarea
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value.slice(0, ABOUT_MAX))}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
          />
          <div className="text-right text-[0.65rem] text-on-surface/40 mt-1">
            {tField("aboutCounter", { count: about.length, max: ABOUT_MAX })}
          </div>
        </Section>

        <Section icon="place" title={tSec("location")}>
          <FieldLabel>{tField("address")}</FieldLabel>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-medium mb-4"
          />
          <FieldLabel>{tField("neighborhood")}</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {CURRENT_VENUE.neighborhoodIds.map((id) => {
              const active = id === activeNb;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveNb(id)}
                  className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface/60 hover:bg-primary-fixed hover:text-primary"
                  }`}
                >
                  {tNb(id)}
                </button>
              );
            })}
            <button
              type="button"
              className="bg-surface-container-high text-on-surface/60 px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-primary-fixed hover:text-primary"
            >
              {tField("addNeighborhood")}
            </button>
          </div>
        </Section>

        <Section icon="photo_library" title={tSec("photos")}>
          <FieldLabel>{tField("heroImage")}</FieldLabel>
          <div
            className={`h-32 rounded-2xl bg-gradient-to-br ${CURRENT_VENUE.heroGradient} mb-4 relative overflow-hidden group cursor-pointer`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Icon name="image" className="text-[32px]" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
              <span className="opacity-0 group-hover:opacity-100 bg-white text-on-surface px-4 py-2 rounded-full text-[0.7rem] font-bold uppercase tracking-widest transition-opacity">
                {tField("replace")}
              </span>
            </div>
          </div>

          <FieldLabel>
            {tField("galleryHeading", { count: CURRENT_VENUE.galleryGradients.length })}
          </FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {CURRENT_VENUE.galleryGradients.map((g, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-gradient-to-br ${g}`}
              />
            ))}
            <button
              type="button"
              className="aspect-square rounded-xl bg-surface-container-low border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary-fixed/20 flex items-center justify-center text-primary"
            >
              <Icon name="add_a_photo" className="text-[24px]" />
            </button>
          </div>
        </Section>

        <Section icon="emoji_events" title={tSec("stats")}>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s, i) => (
              <div key={i}>
                <label className="block text-[0.55rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                  {tField("numberLabel")}
                </label>
                <input
                  value={s.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary font-bold text-sm"
                />
                <input
                  value={s.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-xs text-on-surface/60"
                />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* preview */}
      <div className="bg-surface-container-low p-8 overflow-auto">
        <div className="sticky top-0 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="visibility" className="text-[18px] text-primary" />
            <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/60">
              {tPrev("liveAt", { slug })}
            </div>
          </div>
          <div className="flex gap-1 bg-surface-container-lowest rounded-full p-1 border border-[#FAEEDA]">
            {(["desktop", "mobile"] as const).map((v) => {
              const active = v === viewMode;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${
                    active ? "bg-primary text-on-primary" : "text-on-surface/60"
                  }`}
                >
                  {tPrev(v)}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`bg-surface-container-lowest rounded-2xl overflow-hidden border border-[#FAEEDA] editorial-shadow transition-all ${viewMode === "mobile" ? "max-w-[360px] mx-auto" : ""}`}
        >
          <div
            className={`relative h-40 bg-gradient-to-br ${CURRENT_VENUE.heroGradient}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline font-extrabold">
                  {tMock("initial")}
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 text-xs flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[12px] text-secondary-fixed-dim"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-bold">{ratingValue}</span>
                  <span className="text-white/60">
                    · {tPrev("reviewsCount", { count: ratingCount })}
                  </span>
                </div>
              </div>
              <h1 className="font-headline font-extrabold text-2xl leading-tight">
                {name}
              </h1>
              <p className="italic text-white/80 text-sm">{tagline}</p>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm text-on-surface/70 leading-relaxed mb-4">{about}</p>

            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-on-surface/5 mb-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-headline font-bold text-primary">{s.value}</div>
                  <div className="text-[0.55rem] text-on-surface/50 uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest">
                {tPrev("classesOffered")}
              </span>
              <span className="text-primary text-xs font-bold">
                {tPrev("viewFull")}
              </span>
            </div>
            <h2 className="font-headline font-bold mb-3">{tPrev("currentSchedule")}</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="h-16 bg-gradient-to-br from-primary/50 to-tertiary/50" />
                <div className="p-2">
                  <div className="text-xs font-bold">
                    {tClasses("contemporary.title")}
                  </div>
                  <div className="text-[0.6rem] text-on-surface/50">
                    {tClasses("contemporary.schedule")}
                  </div>
                  <div className="text-[0.7rem] text-primary font-bold mt-1">€22</div>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="h-16 bg-gradient-to-br from-secondary/50 to-secondary-fixed-dim" />
                <div className="p-2">
                  <div className="text-xs font-bold">{tClasses("urbanFlow.title")}</div>
                  <div className="text-[0.6rem] text-on-surface/50">
                    {tClasses("urbanFlow.schedule")}
                  </div>
                  <div className="text-[0.7rem] text-primary font-bold mt-1">€28</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-[0.65rem] text-on-surface/40 italic">
          {tPrev("changesHint")}
        </div>
      </div>
    </div>
  );
}
