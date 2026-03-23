import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface ClassCardProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  duration: string;
  category: string;
  variant?: "default" | "kids" | "teens" | "adults";
  featured?: boolean;
}

const variantStyles = {
  default: {
    card: "bg-white border border-[var(--color-gray-200)] hover:border-[var(--color-primary)]/30",
    badge: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    price: "text-[var(--color-primary)]",
  },
  kids: {
    card: "bg-white border border-orange-100 hover:border-orange-300",
    badge: "bg-[var(--color-kids-primary)]/10 text-[var(--color-kids-primary)]",
    price: "text-[var(--color-kids-primary)]",
  },
  teens: {
    card: "bg-slate-800/50 border border-white/10 hover:border-[var(--color-teens-neon-green)]/30",
    badge: "bg-[var(--color-teens-neon-green)]/10 text-[var(--color-teens-neon-green)]",
    price: "text-[var(--color-teens-neon-green)]",
  },
  adults: {
    card: "bg-white border border-emerald-100 hover:border-emerald-300",
    badge: "bg-[var(--color-adults-primary)]/10 text-[var(--color-adults-primary)]",
    price: "text-[var(--color-adults-primary)]",
  },
};

export function ClassCard({
  id,
  title,
  instructor,
  image,
  rating,
  reviewCount,
  price,
  duration,
  category,
  variant = "default",
  featured = false,
}: ClassCardProps) {
  const styles = variantStyles[variant];

  return (
    <Link href={`/class/${id}`} className="block group">
      <article
        className={cn(
          "rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl",
          styles.card,
          featured && "ring-2 ring-[var(--color-primary)]"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                styles.badge
              )}
            >
              {category}
            </span>
          </div>
          {featured && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-400 text-amber-900">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className={cn(
              "font-semibold text-lg mb-1 line-clamp-2 transition-colors",
              variant === "teens" ? "text-white group-hover:text-[var(--color-teens-neon-green)]" : "text-[var(--color-gray-800)] group-hover:text-[var(--color-primary)]"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-sm mb-3",
              variant === "teens" ? "text-white/60" : "text-[var(--color-gray-500)]"
            )}
          >
            with {instructor}
          </p>

          {/* Rating & Duration */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Icon
                name="star"
                filled
                size="sm"
                className="text-amber-400"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  variant === "teens" ? "text-white" : "text-[var(--color-gray-700)]"
                )}
              >
                {rating.toFixed(1)}
              </span>
              <span
                className={cn(
                  "text-sm",
                  variant === "teens" ? "text-white/50" : "text-[var(--color-gray-400)]"
                )}
              >
                ({reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon
                name="schedule"
                size="sm"
                className={variant === "teens" ? "text-white/50" : "text-[var(--color-gray-400)]"}
              />
              <span
                className={cn(
                  "text-sm",
                  variant === "teens" ? "text-white/60" : "text-[var(--color-gray-500)]"
                )}
              >
                {duration}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-gray-100)]">
            <span className={cn("text-lg font-bold", styles.price)}>
              ${price}
            </span>
            <span
              className={cn(
                "text-sm",
                variant === "teens" ? "text-white/50" : "text-[var(--color-gray-400)]"
              )}
            >
              per session
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
