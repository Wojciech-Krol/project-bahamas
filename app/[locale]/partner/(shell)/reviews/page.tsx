import { getTranslations, setRequestLocale } from "next-intl/server";

import { Icon } from "@/src/components/Icon";
import { getReviewsForPartner } from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import ReviewReplyForm from "./ReviewReplyForm";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function StarRating({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, value));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          className={`text-[14px] ${
            i < filled ? "text-secondary-fixed-dim" : "text-on-surface/15"
          }`}
        />
      ))}
    </span>
  );
}

export default async function PartnerReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const t = await getTranslations({
    locale,
    namespace: "Partner.reviewsAdmin",
  });

  const partnerId = await getPartnerIdForCurrentUser();
  const reviews = partnerId ? await getReviewsForPartner(partnerId, locale) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("badge", { count: reviews.length })}
        </span>
        <h1 className="font-headline font-extrabold text-4xl tracking-tight">
          {t("title")}
        </h1>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {t("emptyState")}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                {r.authorAvatar ? (
                  <img
                    src={r.authorAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold shrink-0">
                    {(r.authorName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-headline font-bold">
                      {r.authorName || "—"}
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  <div className="text-[0.7rem] text-on-surface/50">
                    {formatDate(r.createdAt, locale)}
                    {r.activityTitle ? ` · ${r.activityTitle}` : ""}
                    {r.venueName ? ` · ${r.venueName}` : ""}
                  </div>
                </div>
              </div>
              {r.text && (
                <p className="text-sm text-on-surface/80 whitespace-pre-wrap">
                  {r.text}
                </p>
              )}
              <ReviewReplyForm reviewId={r.id} initialReply={r.partnerReply} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
