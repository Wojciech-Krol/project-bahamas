import { Icon } from "./Icon";
import type { Review } from "../lib/mockData";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-secondary" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          className={`text-[18px] ${i < rating ? "text-secondary" : "text-on-surface/15"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  title = "What the community says",
  subtitle = "Real people, real rituals. Hakuna is built on the stories of the curious.",
}: {
  reviews: Review[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
        <div>
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
            Reviews
          </span>
          <h2 className="font-headline font-bold text-4xl md:text-6xl leading-none tracking-tight text-on-surface">
            {title}
          </h2>
        </div>
        <p className="text-on-surface/60 text-lg max-w-md">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="bg-surface-container-lowest rounded-[1.5rem] p-6 md:p-7 border border-on-surface/[0.05] editorial-shadow flex flex-col gap-4"
          >
            <Stars rating={r.rating} />
            <p className="text-on-surface/80 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-on-surface/[0.06]">
              <img
                src={r.avatar}
                alt={r.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="font-semibold text-sm text-on-surface truncate">
                  {r.name}
                </div>
                {r.activity && (
                  <div className="text-xs text-on-surface/50 truncate">
                    {r.activity}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
