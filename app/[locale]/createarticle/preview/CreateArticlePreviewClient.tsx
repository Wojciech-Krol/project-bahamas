"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "../../../../src/i18n/navigation";
import { TablerIcon } from "@/src/components/TablerIcon";
import CategoryPill from "@/src/components/blog/CategoryPill";

type DraftData = {
  title: string;
  subtitle: string;
  body: string;
  author: string;
  category: string;
  tags: string;
  featuredImage: string;
  updatedAt: string | null;
};

type PreviewCopy = {
  notice: string;
  backToEditor: string;
  draftBadge: string;
  publishedBadge: string;
  untitled: string;
  unknownAuthor: string;
  noCategory: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
  activitiesTitle: string;
  activitiesDescription: string;
  addActivity: string;
  comingSoon: string;
  tagsLabel: string;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=1600&h=900&fit=crop";

function authorAvatarFor(name: string) {
  const safe = encodeURIComponent(name.trim() || "Author");
  return `https://ui-avatars.com/api/?background=2D0A17&color=fff&bold=true&size=128&name=${safe}`;
}

function getFirstImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function getPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function CreateArticlePreviewClient({
  locale,
  copy,
}: {
  locale: string;
  copy: PreviewCopy;
}) {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`create-article:draft:${locale}`);
      if (raw) {
        const parsed = JSON.parse(raw) as DraftData;
        setDraft({
          title: parsed.title ?? "",
          subtitle: parsed.subtitle ?? "",
          body: parsed.body ?? "",
          author: parsed.author ?? "",
          category: parsed.category ?? "",
          tags: parsed.tags ?? "",
          featuredImage: parsed.featuredImage ?? "",
          updatedAt: parsed.updatedAt ?? null,
        });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [locale]);

  const tags = useMemo(() => {
    if (!draft?.tags) return [] as string[];
    return draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [draft?.tags]);

  const subtitle = useMemo(() => draft?.subtitle?.trim() ?? "", [draft?.subtitle]);

  const heroImage = useMemo(() => {
    if (draft?.featuredImage?.trim()) return draft.featuredImage;
    if (!draft?.body) return FALLBACK_HERO;
    return getFirstImageFromHtml(draft.body) ?? FALLBACK_HERO;
  }, [draft?.body, draft?.featuredImage]);

  const formattedDate = useMemo(
    () => formatDate(draft?.updatedAt ?? null, locale),
    [draft?.updatedAt, locale]
  );

  if (!hydrated) {
    return (
      <main className="pt-24 md:pt-32 pb-24 min-h-[60vh]">
        <div className="max-w-site mx-auto px-4 md:px-6 text-on-surface/60">
          …
        </div>
      </main>
    );
  }

  const hasContent = !!draft && (!!draft.title.trim() || !!draft.subtitle.trim() || !!draft.body.trim());

  if (!hasContent) {
    return (
      <main className="pt-24 md:pt-32 pb-24 min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed text-primary mb-6">
            <TablerIcon name="article" className="text-3xl" />
          </div>
          <h1 className="font-headline font-extrabold text-3xl md:text-5xl tracking-tight text-on-surface">
            {copy.emptyTitle}
          </h1>
          <p className="mt-5 text-base md:text-lg text-on-surface/65 leading-relaxed">
            {copy.emptyDescription}
          </p>
          <Link
            href="/createarticle"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-headline font-bold uppercase tracking-widest text-on-primary hover:bg-primary/90 transition-colors"
          >
            <TablerIcon name="edit" className="text-[18px]" />
            {copy.emptyCta}
          </Link>
        </div>
      </main>
    );
  }

  const articleTitle = draft!.title.trim() || copy.untitled;
  const articleAuthor = draft!.author.trim() || copy.unknownAuthor;
  const articleCategory = draft!.category.trim() || copy.noCategory;

  return (
    <main className="pt-20 md:pt-24 pb-16 md:pb-24">
      {/* Preview notice strip */}
      <div className="bg-primary-fixed text-primary border-b border-primary/20">
        <div className="max-w-site mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <TablerIcon name="eye" className="text-[18px]" />
            <span>{copy.notice}</span>
          </p>
          <Link
            href="/createarticle"
            className="inline-flex items-center gap-1 text-sm font-headline font-bold uppercase tracking-widest hover:-translate-x-0.5 transition-transform"
          >
            <TablerIcon name="arrow-left" className="text-[18px]" />
            {copy.backToEditor}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-[55vh] md:h-[70vh] min-h-[420px] md:min-h-[520px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 md:px-6 pb-10 md:pb-16 text-white">
          <div className="max-w-site mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <CategoryPill label={articleCategory} variant="overlay" />
              <CategoryPill
                label={copy.draftBadge}
                variant="overlay"
                className="!bg-primary !text-on-primary"
              />
            </div>
            <h1 className="font-headline font-extrabold text-3xl md:text-6xl leading-[1.05] tracking-tight max-w-5xl">
              {articleTitle}
            </h1>
            {subtitle ? (
              <p className="mt-4 md:mt-6 text-base md:text-xl text-white/85 max-w-3xl leading-relaxed line-clamp-3">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-6 md:mt-8 flex items-center gap-3">
              <img
                src={authorAvatarFor(articleAuthor)}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm text-white">
                  {articleAuthor}
                </span>
                {formattedDate ? (
                  <time
                    dateTime={draft!.updatedAt ?? undefined}
                    className="text-xs text-white/70"
                  >
                    {formattedDate}
                  </time>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div
          className="font-body text-on-surface
            [&_p]:text-lg [&_p]:md:text-xl [&_p]:text-on-surface/85 [&_p]:leading-[1.75] [&_p]:mb-6
            [&_h2]:font-headline [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-on-surface [&_h2]:text-2xl [&_h2]:md:text-4xl [&_h2]:mt-14 [&_h2]:mb-5
            [&_strong]:font-bold [&_em]:italic [&_u]:underline
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
            [&_img]:rounded-2xl [&_img]:my-10 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:block"
          dangerouslySetInnerHTML={{ __html: draft!.body || "" }}
        />

        {tags.length > 0 ? (
          <div className="mt-12 pt-8 border-t border-on-surface/[0.08]">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/55 mb-3">
              {copy.tagsLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      {/* Activities placeholder */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <div className="rounded-[2rem] border border-dashed border-on-surface/15 bg-surface-container/40 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
            <div className="max-w-xl">
              <h2 className="font-headline font-extrabold text-2xl md:text-4xl tracking-tight text-on-surface">
                {copy.activitiesTitle}
              </h2>
              <p className="mt-2 text-sm md:text-base text-on-surface/65 leading-relaxed">
                {copy.activitiesDescription}
              </p>
            </div>
            <button
              type="button"
              disabled
              title={copy.comingSoon}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-headline font-bold uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TablerIcon name="plus" className="text-[18px]" />
              {copy.addActivity}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="relative aspect-[4/3] rounded-[1.5rem] border border-dashed border-on-surface/15 bg-surface-container-lowest/60 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="absolute top-3 left-3 flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 text-primary font-headline font-extrabold text-sm">
                  {slot}
                </div>
                <TablerIcon name="building-store" className="text-3xl text-on-surface/35" />
                <p className="mt-3 text-sm text-on-surface/55">{copy.comingSoon}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
