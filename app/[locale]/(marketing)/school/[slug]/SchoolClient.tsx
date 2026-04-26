"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import SiteNavbar from "@/src/components/SiteNavbar";
import SiteFooter from "@/src/components/SiteFooter";
import ReviewsSection from "@/src/components/ReviewsSection";
import { Icon } from "@/src/components/Icon";
import type { Activity, Review, School } from "@/src/lib/mockData";

function ClassCard({ c }: { c: Activity }) {
  const tCommon = useTranslations("Common");
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden border border-on-surface/[0.05] editorial-shadow flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-fixed to-secondary-fixed">
        {c.imageUrl && (
          <img
            src={c.imageUrl}
            alt={c.imageAlt || c.title}
            className="w-full h-full object-cover"
          />
        )}
        {c.tag && (
          <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest">
            {c.tag}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-headline font-bold text-lg text-on-surface">
          {c.title}
        </h3>
        {c.description && (
          <p className="text-sm text-on-surface/60 line-clamp-2">
            {c.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-bold text-primary">{c.price}</span>
          <Link
            href={{
              pathname: "/activity/[slug]",
              params: { slug: c.slug ?? c.id },
            }}
            className="bg-primary-fixed text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-primary hover:text-on-primary transition-colors"
          >
            {tCommon("book")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SchoolClient({
  school,
  reviews,
}: {
  school: School;
  reviews: Review[];
}) {
  const t = useTranslations("School");
  const tCommon = useTranslations("Common");

  return (
    <>
      <SiteNavbar />
      <main className="pt-20 md:pt-24">
        <section className="relative h-[55vh] md:h-[60vh] min-h-[420px] w-full overflow-hidden">
          <img
            src={school.heroImage}
            alt={school.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-site mx-auto px-4 md:px-6 pb-10 md:pb-14 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-extrabold text-2xl md:text-3xl">
                {school.name.charAt(0)}
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2">
                <Icon name="star" className="text-[18px] text-secondary-fixed" />
                <span className="font-bold">{school.rating.toFixed(1)}</span>
                <span className="text-white/70 text-sm">
                  · {tCommon("reviewsCount", { count: school.reviewCount })}
                </span>
              </div>
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
              {school.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-white/80">
              <Icon name="location_on" className="text-[18px]" />
              <span>{school.location}</span>
            </div>
          </div>
        </section>

        {school.stats.length > 0 && (
          <section className="max-w-site mx-auto px-4 md:px-6 -mt-10 md:-mt-16 relative z-10">
            <div className="bg-surface-container-lowest rounded-[2rem] editorial-shadow p-6 md:p-8 grid grid-cols-3 gap-4 md:gap-6">
              {school.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-headline font-extrabold text-2xl md:text-4xl text-primary">
                    {stat.value}
                  </div>
                  <div className="text-[0.65rem] md:text-xs font-bold uppercase tracking-widest text-on-surface/50 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-site mx-auto px-4 md:px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 items-start">
          <div>
            <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
              {t("pulseBadge")}
            </span>
            <h2 className="font-headline font-bold text-4xl md:text-5xl leading-none tracking-tight mb-6">
              {t("aboutPrefix")} {school.name}
            </h2>
            {school.tagline && (
              <p className="text-lg text-on-surface/70 italic">
                {school.tagline}
              </p>
            )}
          </div>
          <div className="space-y-6">
            <p className="text-on-surface/80 leading-relaxed text-lg">
              {school.about}
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              <Icon name="map" className="text-[20px]" />
              {t("viewOnMap")}
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
        </section>

        {school.classes.length > 0 && (
          <section className="max-w-site mx-auto px-4 md:px-6 pb-12 md:pb-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container mb-3">
                  {t("classesOfferedBadge")}
                </span>
                <h2 className="font-headline font-bold text-3xl md:text-5xl tracking-tight">
                  {t("currentSchedule")}
                </h2>
              </div>
              <Link href="/search" className="text-primary font-bold hover:underline">
                {t("viewFullSchedule")}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {school.classes.map((c) => (
                <ClassCard key={c.id} c={c} />
              ))}
            </div>
          </section>
        )}

        {school.gallery.length > 0 && (
          <section className="max-w-site mx-auto px-4 md:px-6 pb-12 md:pb-20">
            <h2 className="font-headline font-bold text-3xl md:text-5xl tracking-tight mb-8">
              {t("inTheStudio")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {school.gallery.map((src, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-[1.5rem] ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewsSection reviews={reviews} title={t("whatStudentsSay")} />
      </main>
      <SiteFooter />
    </>
  );
}
