import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import SiteNavbar from "@/src/components/SiteNavbar";
import SiteFooter from "@/src/components/SiteFooter";
import { Icon } from "@/src/components/Icon";
import ArticleBody from "@/src/components/blog/ArticleBody";
import ArticleCard from "@/src/components/blog/ArticleCard";
import ArticleMeta from "@/src/components/blog/ArticleMeta";
import CategoryPill from "@/src/components/blog/CategoryPill";
import { getAllArticles, getAllSlugs, getArticle } from "@/src/lib/blogContent";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [{ url: article.coverImage, alt: article.coverAlt }],
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/blog/${slug}`])
      ),
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const allArticles = await getAllArticles(locale);
  const related = allArticles.filter((a) => a.slug !== slug).slice(0, 3);

  const siteUrl = "https://hakuna.example";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.heroImage],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: locale === "pl" ? "pl-PL" : "en-GB",
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Hakuna",
    },
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${slug}`,
  };

  return (
    <>
      <SiteNavbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="pt-20 md:pt-24 pb-16 md:pb-24">
        <section className="relative h-[60vh] md:h-[75vh] min-h-[420px] md:min-h-[560px] w-full overflow-hidden">
          <img
            src={article.heroImage}
            alt={article.heroAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 md:px-6 pb-10 md:pb-16 text-white">
            <div className="max-w-site mx-auto">
              <div className="flex flex-wrap gap-2 mb-5">
                <CategoryPill label={article.categoryLabel} variant="overlay" />
              </div>
              <h1 className="font-headline font-extrabold text-3xl md:text-6xl leading-[1.05] tracking-tight max-w-5xl">
                {article.title}
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-xl text-white/85 max-w-3xl leading-relaxed">
                {article.subtitle}
              </p>
              <div className="mt-6 md:mt-8">
                <ArticleMeta
                  authorName={article.author.name}
                  authorAvatar={article.author.avatar}
                  publishedAt={article.publishedAt}
                  locale={locale}
                  tone="light"
                />
              </div>
            </div>
          </div>
        </section>

        <article className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <ArticleBody blocks={article.body} />

          <div className="mt-14 md:mt-20 flex items-center justify-between gap-4 pt-8 border-t border-on-surface/[0.08]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-headline font-bold uppercase tracking-widest text-primary hover:-translate-x-0.5 transition-transform"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              {t("backToBlog")}
            </Link>
            <ArticleMeta
              authorName={article.author.name}
              authorAvatar={article.author.avatar}
              publishedAt={article.publishedAt}
              locale={locale}
              tone="dark"
            />
          </div>
        </article>

        {related.length > 0 && (
          <section className="max-w-site mx-auto px-4 md:px-6 pt-8 md:pt-12">
            <h2 className="font-headline font-extrabold text-2xl md:text-4xl text-on-surface mb-6 md:mb-10 tracking-tight">
              {t("title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {related.map((r) => (
                <ArticleCard key={r.slug} article={r} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
