"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";
import {
  CATEGORY_STYLES,
  stylesForCategories,
} from "@/src/lib/categoryStyles";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Comma-separated activity (category) keys currently selected. */
  activities: string;
  /** Comma-separated style slugs currently selected. */
  styles: string;
  /** Commit selected styles back to the parent (URL-driven submit caller). */
  onApply: (nextStyles: string) => void;
};

/**
 * Right-side drawer that lets users narrow a search by category-specific
 * style sub-filters (e.g. dance → jazz / ballet / modern).
 *
 * Source of truth for which styles to surface = `activities` prop. When
 * the user has no category selected we render an empty state instead of
 * dumping the full taxonomy on them.
 *
 * The drawer keeps a local `selected` set so users can toggle freely
 * without firing a router push per click; pressing "Apply" commits the
 * set up via `onApply` and the parent handles URL/router push + close.
 */
export default function FilterDrawer({
  open,
  onClose,
  activities,
  styles,
  onApply,
}: FilterDrawerProps) {
  const t = useTranslations();

  const activeCategories = useMemo(
    () =>
      activities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [activities],
  );

  const initial = useMemo(
    () =>
      new Set(
        styles
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    [styles],
  );

  // Mirror upstream `styles` into local pending state: when the drawer
  // is open and the parent passes a fresh styles string (e.g. user
  // navigated, we reopened), reset the pending selection. Done via the
  // documented "adjust state when a prop changes" idiom — a guarded
  // setState during render — instead of an effect, so we don't trigger
  // a cascading re-render on every mount of an unchanged value.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [snapStyles, setSnapStyles] = useState(styles);
  const [selected, setSelected] = useState<Set<string>>(initial);
  if (open && snapStyles !== styles) {
    setSnapStyles(styles);
    setSelected(initial);
  }

  const sectionsToRender = activeCategories.filter(
    (cat) => (CATEGORY_STYLES as Record<string, readonly string[]>)[cat],
  );

  const allowedStyles = useMemo(
    () => new Set(stylesForCategories(activeCategories)),
    [activeCategories],
  );

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  function apply() {
    // Drop any styles whose parent category is no longer selected.
    const filtered = Array.from(selected).filter((s) => allowedStyles.has(s));
    onApply(filtered.join(","));
    onClose();
  }

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-on-surface/30 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("Common.filters")}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-surface flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-on-surface/[0.08] shrink-0">
          <h2 className="font-headline font-bold text-lg text-on-surface">
            {t("Common.filters")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Common.close")}
            className="w-9 h-9 rounded-full hover:bg-surface-container-low flex items-center justify-center"
          >
            <Icon name="close" className="text-[20px] text-on-surface" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {sectionsToRender.length === 0 ? (
            <div className="text-sm text-on-surface/60 text-center py-12">
              {t("Search.filterDrawer.empty")}
            </div>
          ) : (
            sectionsToRender.map((cat) => {
              const styleList =
                (CATEGORY_STYLES as Record<string, readonly string[]>)[cat] ??
                [];
              return (
                <section key={cat}>
                  <h3 className="font-headline font-bold text-sm text-on-surface mb-3">
                    {t(`Search.activityLabels.${cat}`)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {styleList.map((slug) => {
                      const active = selected.has(slug);
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => toggle(slug)}
                          aria-pressed={active}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                            active
                              ? "bg-primary text-on-primary border-primary"
                              : "bg-surface-container-lowest text-on-surface border-on-surface/[0.12] hover:border-primary"
                          }`}
                        >
                          {t(`Search.styles.${slug}`)}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 px-5 py-4 border-t border-on-surface/[0.08] shrink-0">
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-on-surface underline underline-offset-2"
          >
            {t("Common.clearAll")}
          </button>
          <button
            type="button"
            onClick={apply}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold hover:opacity-90 active:scale-95 transition"
          >
            {t("Common.applyFilters")}
          </button>
        </footer>
      </aside>
    </>
  );
}
