import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import Reveal, { RevealItem } from "./Reveal";
import type { Review }  from "@/src/lib/mockData";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-secondary" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          className={`text-[18px] ${i < rating ? "text-secondary" : "text-on-surface/15"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  title,
  subtitle,
}: {
  reviews: Review[];
  title?: string;
  subtitle?: string;
}) {
  const t = useTranslations("Reviews");
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");
  return (
    <section className="max-w-site mx-auto px-4 md:px-6 py-12 md:py-24">
      <Reveal
        stagger={0.08}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14"
      >
        <RevealItem>
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
            {t("badge")}
          </span>
          <h2 className="font-headline font-bold text-4xl md:text-6xl leading-none tracking-tight text-on-surface">
            {resolvedTitle}
          </h2>
        </RevealItem>
        <RevealItem as="p" className="text-on-surface/60 text-lg max-w-md">
          {resolvedSubtitle}
        </RevealItem>
      </Reveal>

      <Reveal
        stagger={0.1}
        delay={0.15}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
      >
        {reviews.map((r) => (
          <RevealItem
            key={r.id}
            as="article"
            className="bg-surface-container-lowest rounded-[1.5rem] p-6 md:p-7 border border-on-surface/[0.05] editorial-shadow flex flex-col gap-4"
          >
            <Stars rating={r.rating} />
            <p className="text-on-surface/80 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-on-surface/[0.06]">
              {r.avatar ? (
                <Image
                  src={r.avatar}
                  alt={r.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline font-bold text-sm shrink-0">
                  {(r.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-sm text-on-surface truncate">
                  {r.name}
                </div>
                {r.activity && (
                  <div className="text-xs text-on-surface/50 truncate">
                    {r.activity}
                  </div>
                )}
              </div>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
