import { AVATAR } from "./mockData";

export type BlogCategoryKey = "city" | "wellness" | "kids" | "sport" | "culture";

export type BlogArticleBase = {
  slug: string;
  coverImage: string;
  heroImage: string;
  publishedAt: string;
  author: { name: string; avatar: string };
  categoryKey: BlogCategoryKey;
  featured?: boolean;
};

const COVER = {
  warsaw: "https://images.unsplash.com/photo-1580128660010-6d9761b11d83?w=1600&h=1000&fit=crop",
  yoga: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&h=1000&fit=crop",
  family: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1600&h=1000&fit=crop",
  running: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1600&h=1000&fit=crop",
  pottery: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1600&h=1000&fit=crop",
  dance: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=1000&fit=crop",
};

export const BLOG_ARTICLES: BlogArticleBase[] = [
  {
    slug: "best-dance-schools-warsaw",
    coverImage: COVER.dance,
    heroImage: COVER.dance,
    publishedAt: "2026-04-18",
    author: { name: "Anna Kowalska", avatar: AVATAR("anna-k") },
    categoryKey: "city",
  },
  {
    slug: "warsaw-weekend-guide",
    coverImage: COVER.warsaw,
    heroImage: COVER.warsaw,
    publishedAt: "2026-04-12",
    author: { name: "Anna Kowalska", avatar: AVATAR("anna-k") },
    categoryKey: "city",
    featured: true,
  },
  {
    slug: "morning-yoga-habits",
    coverImage: COVER.yoga,
    heroImage: COVER.yoga,
    publishedAt: "2026-04-05",
    author: { name: "Elena Grace", avatar: AVATAR("elena-g") },
    categoryKey: "wellness",
  },
  {
    slug: "family-friendly-weekends",
    coverImage: COVER.family,
    heroImage: COVER.family,
    publishedAt: "2026-03-28",
    author: { name: "Marek Nowak", avatar: AVATAR("marek-n") },
    categoryKey: "kids",
  },
  {
    slug: "why-run-clubs-work",
    coverImage: COVER.running,
    heroImage: COVER.running,
    publishedAt: "2026-03-20",
    author: { name: "Daniel Osei", avatar: AVATAR("daniel-o") },
    categoryKey: "sport",
  },
  {
    slug: "pottery-beginners-guide",
    coverImage: COVER.pottery,
    heroImage: COVER.pottery,
    publishedAt: "2026-03-14",
    author: { name: "Jonas Weber", avatar: AVATAR("jonas-w") },
    categoryKey: "culture",
  },
];

export function getArticleBySlug(slug: string): BlogArticleBase | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getSortedArticles(): BlogArticleBase[] {
  return [...BLOG_ARTICLES].sort(
    (a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0)
  );
}
