"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "./Icon";
import Reveal from "./Reveal";
import { submitBetaSignup } from "@/src/lib/beta/actions";

type Props = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  variant?: "beta" | "business";
  /** Origin tag for analytics, e.g. "home-hero" / "blog-footer". */
  source?: string;
};

export default function BetaSignup({
  title,
  subtitle,
  ctaLabel,
  variant = "beta",
  source,
}: Props) {
  const t = useTranslations("Beta");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<
    "validation" | "rate_limited" | "bot_check" | "server" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setErrorKey("validation");
      return;
    }

    startTransition(async () => {
      const res = await submitBetaSignup({
        email,
        locale: locale === "en" ? "en" : "pl",
        source,
        variant,
      });
      if (res.ok) {
        setStatus("success");
        setErrorKey(null);
        setEmail("");
      } else {
        setStatus("error");
        setErrorKey(res.error);
      }
    });
  };

  const resolvedTitle =
    title ?? (variant === "business" ? t("businessTitle") : t("defaultTitle"));
  const resolvedSubtitle =
    subtitle ??
    (variant === "business" ? t("businessSubtitle") : t("defaultSubtitle"));
  const resolvedCta =
    ctaLabel ?? (variant === "business" ? t("businessCta") : t("defaultCta"));

  return (
    <section className="max-w-site mx-auto px-4 md:px-6 py-12 md:py-20">
      <Reveal
        stagger={0.1}
        className={`rounded-[2rem] md:rounded-[3rem] px-6 md:px-16 py-12 md:py-20 text-center overflow-hidden relative ${
          variant === "business"
            ? "bg-surface-container-high"
            : "bg-gradient-to-br from-primary to-tertiary text-on-primary"
        }`}
      >
        <Reveal.Item
          className={`inline-block px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest mb-6 ${
            variant === "business"
              ? "bg-primary-fixed text-primary"
              : "bg-white/20 text-on-primary"
          }`}
        >
          {variant === "business" ? t("businessBadge") : t("betaBadge")}
        </Reveal.Item>
        <Reveal.Item
          as="h2"
          className={`font-headline font-extrabold text-3xl md:text-5xl tracking-tight mb-4 ${
            variant === "business" ? "text-on-surface" : ""
          }`}
        >
          {resolvedTitle}
        </Reveal.Item>
        <Reveal.Item
          as="p"
          className={`max-w-2xl mx-auto text-base md:text-lg mb-8 ${
            variant === "business" ? "text-on-surface/70" : "text-on-primary/80"
          }`}
        >
          {resolvedSubtitle}
        </Reveal.Item>
        {status === "success" ? (
          <Reveal.Item
            className={`inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold ${
              variant === "business"
                ? "bg-primary text-on-primary"
                : "bg-white text-primary"
            }`}
          >
            <Icon name="check_circle" className="text-[22px]" />
            {t("success")}
          </Reveal.Item>
        ) : (
          <Reveal.Item>
            <form
              onSubmit={onSubmit}
              className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setErrorKey(null);
                  }
                }}
                disabled={isPending}
                placeholder={t("emailPlaceholder")}
                className={`flex-1 px-5 py-4 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  variant === "business"
                    ? "bg-surface-container-lowest text-on-surface placeholder:text-on-surface/40 focus:ring-primary/30"
                    : "bg-white/95 text-on-surface placeholder:text-on-surface/40 focus:ring-white"
                }`}
              />
              <button
                type="submit"
                disabled={isPending}
                className={`px-8 py-4 rounded-2xl font-headline uppercase tracking-widest text-[0.75rem] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${
                  variant === "business"
                    ? "bg-primary text-on-primary hover:bg-tertiary"
                    : "bg-white text-primary hover:bg-on-surface hover:text-on-primary"
                }`}
              >
                {isPending ? t("submitting") : resolvedCta}
              </button>
            </form>
            {status === "error" && errorKey && (
              <p
                role="alert"
                className={`mt-3 text-sm font-semibold ${
                  variant === "business"
                    ? "text-primary"
                    : "text-on-primary/90"
                }`}
              >
                {t(`errors.${errorKey}`)}
              </p>
            )}
          </Reveal.Item>
        )}
      </Reveal>
    </section>
  );
}
