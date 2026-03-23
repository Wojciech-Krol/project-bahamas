import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface CategoryCardProps {
  name: string;
  icon: string;
  classCount: number;
  href: string;
  image?: string;
  variant?: "default" | "kids" | "teens" | "adults";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: {
    card: "bg-white border border-[var(--color-gray-200)] hover:border-[var(--color-primary)] hover:shadow-lg",
    icon: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    text: "text-[var(--color-gray-800)]",
    count: "text-[var(--color-gray-500)]",
  },
  kids: {
    card: "bg-white border border-orange-100 hover:border-[var(--color-kids-primary)] hover:shadow-lg hover:shadow-orange-100",
    icon: "bg-[var(--color-kids-primary)]/10 text-[var(--color-kids-primary)]",
    text: "text-[var(--color-gray-800)]",
    count: "text-[var(--color-gray-500)]",
  },
  teens: {
    card: "bg-white/5 border border-white/10 hover:border-[var(--color-teens-neon-green)] hover:bg-white/10",
    icon: "bg-[var(--color-teens-neon-green)]/10 text-[var(--color-teens-neon-green)]",
    text: "text-white",
    count: "text-white/60",
  },
  adults: {
    card: "bg-white border border-emerald-100 hover:border-[var(--color-adults-primary)] hover:shadow-lg hover:shadow-emerald-100",
    icon: "bg-[var(--color-adults-primary)]/10 text-[var(--color-adults-primary)]",
    text: "text-[var(--color-gray-800)]",
    count: "text-[var(--color-gray-500)]",
  },
};

const sizeStyles = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function CategoryCard({
  name,
  icon,
  classCount,
  href,
  image,
  variant = "default",
  size = "md",
}: CategoryCardProps) {
  const styles = variantStyles[variant];

  return (
    <Link href={href} className="block group">
      <div
        className={cn(
          "rounded-2xl transition-all duration-300 overflow-hidden",
          styles.card,
          sizeStyles[size]
        )}
      >
        {image ? (
          <div className="relative aspect-[4/3] -mx-5 -mt-5 mb-4 overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-semibold text-lg text-white">{name}</h3>
              <p className="text-sm text-white/80">{classCount} classes</p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
                styles.icon
              )}
            >
              <Icon name={icon} size="lg" />
            </div>
            <h3 className={cn("font-semibold mb-1", styles.text)}>{name}</h3>
            <p className={cn("text-sm", styles.count)}>
              {classCount} classes
            </p>
          </>
        )}
      </div>
    </Link>
  );
}
