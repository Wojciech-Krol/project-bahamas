import { Link } from "@/src/i18n/navigation";
import { Icon } from "../Icon";

type Crumb = { label: string; href?: string };

type Props = {
  badge: string;
  title: string;
  intro: string;
  crumbs: Crumb[];
};

/**
 * Hero block for /odkryj/[activity]/[city] landings. Composed from the
 * same primitives the About page uses (badge + extrabold H1 + lead
 * paragraph) plus a breadcrumb row so Google's BreadcrumbList JSON-LD
 * has a visible counterpart for users.
 */
export default function CategoryLandingHero({
  badge,
  title,
  intro,
  crumbs,
}: Props) {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-10 md:pb-16">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs md:text-sm text-on-surface/55 mb-6 md:mb-8 flex-wrap"
      >
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-2">
              {c.href && !isLast ? (
                <Link
                  href={c.href as never}
                  className="hover:text-primary transition-colors"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? "text-on-surface/80 font-medium" : ""
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
              {!isLast && (
                <Icon
                  name="chevron_right"
                  className="text-[16px] text-on-surface/30"
                />
              )}
            </span>
          );
        })}
      </nav>

      <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-6">
        {badge}
      </span>
      <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight text-on-surface mb-6">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-on-surface/70 leading-relaxed max-w-3xl">
        {intro}
      </p>
    </section>
  );
}
