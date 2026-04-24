import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SiteNavbar from "@/app/components/SiteNavbar";
import SiteFooter from "@/app/components/SiteFooter";
import ArticleCard from "@/app/components/blog/ArticleCard";
import { getAllArticles } from "@/app/lib/blogContent";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.blog" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale: locale === "pl" ? "pl_PL" : "en_GB",
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { pl: "/pl/blog", en: "/en/blog" },
    },
  };
}

export default async function BlogListPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const articles = await getAllArticles(locale);
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== featured.slug);

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <section className="max-w-site mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10 md:mb-16">
            <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container mb-6">
              Journal
            </span>
            <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight text-on-surface">
              {t("title")}
            </h1>
            <p className="mt-5 md:mt-7 text-lg md:text-xl text-on-surface/60 max-w-2xl leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-8">
              <ArticleCard
                article={featured}
                locale={locale}
                variant="featured"
                featuredLabel={t("featuredBadge")}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
              {rest.slice(0, 2).map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  locale={locale}
                />
              ))}
            </div>
          </div>

          {rest.length > 2 && (
            <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {rest.slice(2).map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
