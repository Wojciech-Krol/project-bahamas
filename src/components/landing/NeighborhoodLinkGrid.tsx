import { Link } from "@/src/i18n/navigation";
import { Icon } from "../Icon";

type NeighborhoodCard = {
  name: string;
  href: string;
  hint?: string;
};

type Props = {
  heading: string;
  items: NeighborhoodCard[];
};

/**
 * Hub-and-spoke grid linking from a city landing to each of its
 * neighborhoods. Each card is a `<Link>` so internal authority flows
 * down the topology.
 */
export default function NeighborhoodLinkGrid({ heading, items }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="max-w-site mx-auto px-4 md:px-6 py-12 md:py-20">
      <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface mb-8 md:mb-12">
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href as never}
            className="group flex items-center justify-between gap-4 bg-surface-container-lowest border border-on-surface/[0.06] rounded-2xl px-5 py-4 hover:border-primary/40 hover:bg-primary-fixed/20 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-headline font-semibold text-base md:text-lg text-on-surface truncate">
                {it.name}
              </div>
              {it.hint && (
                <div className="text-xs md:text-sm text-on-surface/55 truncate mt-0.5">
                  {it.hint}
                </div>
              )}
            </div>
            <Icon
              name="arrow_forward"
              className="text-[20px] text-on-surface/40 group-hover:text-primary transition-colors shrink-0"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
