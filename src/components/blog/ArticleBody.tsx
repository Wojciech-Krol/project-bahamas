import type { ArticleBlock, RankingItem }  from "@/src/lib/blogContent";
import { Icon } from "../Icon";

function RankingCard({ item }: { item: RankingItem }) {
  const hasPros = item.pros && item.pros.length > 0;
  const hasCons = item.cons && item.cons.length > 0;
  const hasTags = item.tags && item.tags.length > 0;
  const hasMeta = item.rating != null || item.priceLabel || item.locationLabel;

  return (
    <article className="group relative bg-surface-container/40 rounded-[2rem] overflow-hidden border border-on-surface/[0.06] shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr]">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-on-surface/5">
          {item.image && (
            <img
              src={item.image}
              alt={item.imageAlt ?? item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute top-4 left-4 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-on-primary shadow-lg">
            <span className="font-headline font-extrabold text-2xl md:text-3xl leading-none">
              {item.rank}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h3 className="font-headline font-extrabold text-2xl md:text-3xl tracking-tight text-on-surface leading-tight">
              {item.name}
            </h3>
            {hasMeta && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface/65">
                {item.rating != null && (
                  <span className="inline-flex items-center gap-1 font-semibold text-on-surface">
                    <Icon name="star" className="text-[16px] text-primary" />
                    {item.rating.toFixed(1)}
                  </span>
                )}
                {item.locationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="near_me" className="text-[16px]" />
                    {item.locationLabel}
                  </span>
                )}
                {item.priceLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="payments" className="text-[16px]" />
                    {item.priceLabel}
                  </span>
                )}
              </div>
            )}
          </header>

          {hasTags && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags!.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-base md:text-lg text-on-surface/75 leading-relaxed">
            {item.summary}
          </p>

          {(hasPros || hasCons) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {hasPros && (
                <ul className="flex flex-col gap-2">
                  {item.pros!.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-on-surface/80"
                    >
                      <Icon
                        name="check_circle"
                        className="text-[18px] text-[#2f8f60] shrink-0 mt-0.5"
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
              {hasCons && (
                <ul className="flex flex-col gap-2">
                  {item.cons!.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-sm text-on-surface/65"
                    >
                      <Icon
                        name="remove_circle"
                        className="text-[18px] text-on-surface/40 shrink-0 mt-0.5"
                      />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {item.url && (
            <div className="pt-2">
              <a
                href={item.url}
                className="inline-flex items-center gap-2 text-sm font-headline font-bold uppercase tracking-widest text-primary hover:translate-x-0.5 transition-transform"
              >
                {item.ctaLabel ?? "Zobacz szkołę"}
                <Icon name="arrow_forward" className="text-[18px]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-lg md:text-xl text-on-surface/85 leading-[1.75] mb-6">
          {block.text}
        </p>
      );
    case "heading": {
      const sizes =
        block.level === 2
          ? "text-2xl md:text-4xl mt-14 mb-5"
          : "text-xl md:text-2xl mt-10 mb-4";
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag
          className={`font-headline font-extrabold tracking-tight text-on-surface ${sizes}`}
        >
          {block.text}
        </Tag>
      );
    }
    case "image":
      return (
        <figure className="my-10 -mx-4 md:-mx-12">
          <img
            src={block.src}
            alt={block.alt}
            className="w-full h-auto rounded-[1.5rem] md:rounded-[2rem] object-cover"
          />
          {block.caption && (
            <figcaption className="mt-3 px-4 md:px-0 text-sm text-on-surface/55 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="my-10 border-l-4 border-primary pl-6 md:pl-8 italic">
          <p className="font-headline text-xl md:text-2xl leading-snug text-on-surface/90">
            “{block.text}”
          </p>
          {block.cite && (
            <cite className="block mt-3 not-italic text-sm font-semibold text-primary uppercase tracking-widest">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "ranking":
      return (
        <div className="my-10 md:my-14 -mx-4 md:-mx-12 flex flex-col gap-6 md:gap-8">
          {block.items.map((item) => (
            <RankingCard key={item.rank} item={item} />
          ))}
        </div>
      );
  }
}

export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="font-body">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
