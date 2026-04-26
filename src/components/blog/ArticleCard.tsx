import { Link } from "../../../src/i18n/navigation";
import CategoryPill from "./CategoryPill";
import ArticleMeta from "./ArticleMeta";
import type { BlogArticleSummary }  from "@/src/lib/blogContent";

type Props = {
  article: BlogArticleSummary;
  locale: string;
  variant?: "featured" | "default";
  featuredLabel?: string;
};

export default function ArticleCard({
  article,
  locale,
  variant = "default",
  featuredLabel,
}: Props) {
  const isFeatured = variant === "featured";
  const aspect = isFeatured
    ? "aspect-[16/10] md:aspect-auto md:h-full"
    : "aspect-[16/10]";

  return (
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest border border-on-surface/[0.05] editorial-shadow hover:-translate-y-1 hover:shadow-[0px_30px_60px_rgba(45,10,23,0.12)] transition-all duration-300 ${
        isFeatured ? "h-full" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${aspect}`}>
        <img
          src={article.coverImage}
          alt={article.coverAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <CategoryPill label={article.categoryLabel} variant="overlay" />
          {isFeatured && featuredLabel && (
            <CategoryPill
              label={featuredLabel}
              variant="overlay"
              className="!bg-primary !text-on-primary"
            />
          )}
        </div>
        {isFeatured && (
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <h2 className="font-headline font-extrabold text-white text-2xl md:text-4xl leading-[1.1] tracking-tight drop-shadow-lg">
              {article.title}
            </h2>
            <p className="text-white/85 text-sm md:text-base mt-3 max-w-xl line-clamp-2">
              {article.excerpt}
            </p>
          </div>
        )}
      </div>

      {!isFeatured && (
        <div className="flex flex-col gap-3 p-5 md:p-6 flex-1">
          <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-on-surface/60 leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
          <div className="pt-3 mt-auto border-t border-on-surface/[0.06]">
            <ArticleMeta
              authorName={article.author.name}
              authorAvatar={article.author.avatar}
              publishedAt={article.publishedAt}
              locale={locale}
              tone="dark"
            />
          </div>
        </div>
      )}

      {isFeatured && (
        <div className="p-6 md:p-8 flex items-center justify-between gap-4 border-t border-on-surface/[0.06]">
          <ArticleMeta
            authorName={article.author.name}
            authorAvatar={article.author.avatar}
            publishedAt={article.publishedAt}
            locale={locale}
            tone="dark"
          />
          <span className="shrink-0 bg-primary-fixed text-primary px-4 py-2 rounded-full font-headline font-bold text-[0.65rem] uppercase tracking-widest">
            →
          </span>
        </div>
      )}
    </Link>
  );
}
