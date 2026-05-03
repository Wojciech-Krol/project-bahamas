"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";
import { useRouter } from "@/src/i18n/navigation";
import { toggleFavorite } from "@/src/lib/favorites/actions";

type Variant = "card" | "detail";

type HeartButtonProps = {
  activityId: string;
  /** Server-known initial favorited state. */
  initialFavorited?: boolean;
  /** Affects size + colours. `card` = small overlay, `detail` = larger. */
  variant?: Variant;
  /** When unsigned, where to send the user back after they log in. */
  loginNext?: string;
};

const SIZES: Record<Variant, { btn: string; icon: string }> = {
  card: { btn: "w-8 h-8", icon: "text-[14px]" },
  detail: { btn: "w-11 h-11", icon: "text-[20px]" },
};

/**
 * Optimistic favorite toggle. Renders a Tabler heart icon; flips
 * filled / outline on click while the Server Action is in flight.
 *
 * If the user isn't signed in, instead of attempting the action we
 * push to /login?next=<loginNext>. The button stays visible everywhere
 * (cards, detail page) so prospective users still see the affordance.
 */
export default function HeartButton({
  activityId,
  initialFavorited = false,
  variant = "card",
  loginNext,
}: HeartButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const [actualFavorited, setActualFavorited] = useState(initialFavorited);
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    actualFavorited,
    (_, next: boolean) => next,
  );
  const [isPending, startTransition] = useTransition();

  const sizes = SIZES[variant];
  const label = optimisticFavorited
    ? t("Common.unfavorite")
    : t("Common.favorite");

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const next = !actualFavorited;
      setOptimisticFavorited(next);
      const res = await toggleFavorite({ activityId });
      if (!res.ok) {
        if (res.error === "not_signed_in") {
          router.push({
            pathname: "/login",
            query: loginNext ? { next: loginNext } : undefined,
          });
          return;
        }
        // Revert local state on other errors. The optimistic value
        // resets when the transition ends.
        return;
      }
      setActualFavorited(res.favorited);
    });
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={optimisticFavorited}
      onClick={onClick}
      disabled={isPending}
      className={`${sizes.btn} rounded-full flex items-center justify-center transition-all ${
        variant === "card"
          ? "bg-surface-container-lowest/90 hover:bg-primary-fixed"
          : "bg-surface-container-lowest border border-on-surface/[0.08] hover:bg-primary-fixed"
      } ${isPending ? "opacity-70" : ""}`}
    >
      <Icon
        name={optimisticFavorited ? "favorite" : "favorite_border"}
        className={`${sizes.icon} text-primary ${
          optimisticFavorited ? "[font-variation-settings:'FILL'_1]" : ""
        }`}
      />
    </button>
  );
}
