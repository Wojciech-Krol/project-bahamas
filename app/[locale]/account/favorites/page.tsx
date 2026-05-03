import { getTranslations, setRequestLocale } from "next-intl/server";

import { getFavoriteActivities } from "@/src/lib/db/queries";
import { Link } from "@/src/i18n/navigation";
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
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">
          {t("favorites.title")}
        </h1>
        <p className="text-on-surface/70">
          {t("favorites.subtitle", { count: activities.length })}
        </p>
      </header>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-on-surface/20 p-10 text-center">
          <p className="text-on-surface/60 mb-4">{t("favorites.empty")}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-2.5 text-sm font-bold"
          >
            {t("favorites.browseCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activities.map((a) => (
            <Link
              key={a.id}
              href={{
                pathname: "/activity/[slug]",
                params: { slug: a.slug ?? a.id },
              }}
              className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-on-surface/[0.05] hover:-translate-y-0.5 transition-transform duration-200"
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
                <div className="absolute top-2 right-2">
                  <HeartButton
                    activityId={a.id}
                    initialFavorited={true}
                    variant="card"
                    loginNext={`/account/favorites`}
                  />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-headline font-bold text-base text-on-surface mb-1 line-clamp-1">
                  {a.title}
                </h3>
                <p className="text-sm text-on-surface/60 line-clamp-1">
                  {a.location}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-primary font-bold">{a.price}</span>
                  {a.duration && (
                    <span className="text-xs text-on-surface/50">
                      {a.duration}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
