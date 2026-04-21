import { getTranslations } from "next-intl/server";
import {
  BLOG_ARTICLES,
  getArticleBySlug,
  getSortedArticles,
  type BlogArticleBase,
  type BlogCategoryKey,
} from "./blogData";

export type RankingItem = {
  rank: number;
  name: string;
  image?: string;
  imageAlt?: string;
  summary: string;
  rating?: number;
  priceLabel?: string;
  locationLabel?: string;
  tags?: string[];
  pros?: string[];
  cons?: string[];
  url?: string;
  ctaLabel?: string;
};

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "ranking"; items: RankingItem[] };

export type BlogArticleCopy = {
  title: string;
  subtitle: string;
  excerpt: string;
  coverAlt: string;
  heroAlt: string;
  body: ArticleBlock[];
};

export type BlogArticle = BlogArticleBase & BlogArticleCopy & {
  categoryLabel: string;
};

async function loadCopy(slug: string, locale: string): Promise<BlogArticleCopy> {
  const tArticle = await getTranslations({
    locale,
    namespace: `blog.articles.${slug}`,
  });
  return {
    title: tArticle("title"),
    subtitle: tArticle("subtitle"),
    excerpt: tArticle("excerpt"),
    coverAlt: tArticle("coverAlt"),
    heroAlt: tArticle("heroAlt"),
    body: tArticle.raw("body") as ArticleBlock[],
  };
}

async function loadCategoryLabel(
  key: BlogCategoryKey,
  locale: string
): Promise<string> {
  const tCat = await getTranslations({ locale, namespace: "blog.categoryLabels" });
  return tCat(key);
}

export async function getArticle(
  slug: string,
  locale: string
): Promise<BlogArticle | null> {
  const base = getArticleBySlug(slug);
  if (!base) return null;
  const copy = await loadCopy(slug, locale);
  const categoryLabel = await loadCategoryLabel(base.categoryKey, locale);
  return { ...base, ...copy, categoryLabel };
}

export type BlogArticleSummary = BlogArticleBase & {
  title: string;
  excerpt: string;
  coverAlt: string;
  categoryLabel: string;
};

export async function getAllArticles(
  locale: string
): Promise<BlogArticleSummary[]> {
  const tCat = await getTranslations({ locale, namespace: "blog.categoryLabels" });
  const sorted = getSortedArticles();
  return Promise.all(
    sorted.map(async (base) => {
      const tArticle = await getTranslations({
        locale,
        namespace: `blog.articles.${base.slug}`,
      });
      return {
        ...base,
        title: tArticle("title"),
        excerpt: tArticle("excerpt"),
        coverAlt: tArticle("coverAlt"),
        categoryLabel: tCat(base.categoryKey),
      };
    })
  );
}

export function getAllSlugs(): string[] {
  return BLOG_ARTICLES.map((a) => a.slug);
}
