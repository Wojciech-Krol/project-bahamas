import { getTranslations, setRequestLocale } from "next-intl/server";

import { getFavoriteActivities } from "@/src/lib/db/queries";
import { Link } from "@/src/i18n/navigation";
import { Icon } from "@/src/components/Icon";
import HeartButton from "@/src/components/HeartButton";

export const dynamic = "force-dynamic";

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Account" });
  const activities = await getFavoriteActivities(
    locale === "en" ? "en" : "pl",
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
          {t("favorites.title")}
        </h2>
        <p className="text-on-surface/60 mt-1">
          {t("favorites.subtitle", { count: activities.length })}
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-on-surface/20 bg-surface-container-lowest/50 p-12 text-center editorial-shadow">
          <span className="inline-flex w-16 h-16 rounded-2xl bg-tertiary-container text-on-tertiary-container items-center justify-center mb-5">
            <Icon name="favorite" className="text-[28px]" />
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
            {t("favorites.empty")}
          </h3>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-3 rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors"
          >
            <Icon name="search" className="text-[18px]" />
            {t("favorites.browseCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {activities.map((a) => (
            <Link
              key={a.id}
              href={{
                pathname: "/activity/[slug]",
                params: { slug: a.slug ?? a.id },
              }}
              className="group flex flex-col bg-surface-container-lowest rounded-[1.75rem] overflow-hidden border border-on-surface/[0.06] editorial-shadow hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-fixed to-secondary-fixed">
                {a.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={a.imageUrl}
                    alt={a.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <HeartButton
                    activityId={a.id}
                    initialFavorited={true}
                    variant="card"
                    loginNext={`/account/favorites`}
                  />
                </div>
                {a.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
                    {a.tag}
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2">
                <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1">
                  {a.title}
                </h3>
                <p className="text-sm text-on-surface/60 flex items-center gap-1 min-w-0">
                  <Icon
                    name="location_on"
                    className="text-[14px] shrink-0 text-primary"
                  />
                  <span className="truncate">{a.location}</span>
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-headline font-bold text-primary">
                    {a.price}
                  </span>
                  {a.duration && (
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface/55">
                      <Icon name="schedule" className="text-[14px]" />
                      {a.duration}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
