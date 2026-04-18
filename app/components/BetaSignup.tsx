"use client";

import { useState } from "react";
import { Icon } from "./Icon";

type Props = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  variant?: "beta" | "business";
};

export default function BetaSignup({
  title = "Be among the first. Join the Hakuna beta.",
  subtitle = "Early access, founder updates, and hand-picked activities in your city — straight to your inbox.",
  ctaLabel = "Join Beta",
  variant = "beta",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("success");
    setEmail("");
  };

  return (
    <section
      className={`max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20`}
    >
      <div
        className={`rounded-[2rem] md:rounded-[3rem] px-6 md:px-16 py-12 md:py-20 text-center overflow-hidden relative ${
          variant === "business"
            ? "bg-surface-container-high"
            : "bg-gradient-to-br from-primary to-tertiary text-on-primary"
        }`}
      >
        <div
          className={`inline-block px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest mb-6 ${
            variant === "business"
              ? "bg-primary-fixed text-primary"
              : "bg-white/20 text-on-primary"
          }`}
        >
          {variant === "business" ? "For Venues" : "Beta Test"}
        </div>
        <h2
          className={`font-headline font-extrabold text-3xl md:text-5xl tracking-tight mb-4 ${
            variant === "business" ? "text-on-surface" : ""
          }`}
        >
          {title}
        </h2>
        <p
          className={`max-w-2xl mx-auto text-base md:text-lg mb-8 ${
            variant === "business" ? "text-on-surface/70" : "text-on-primary/80"
          }`}
        >
          {subtitle}
        </p>
        {status === "success" ? (
          <div
            className={`inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold ${
              variant === "business"
                ? "bg-primary text-on-primary"
                : "bg-white text-primary"
            }`}
          >
            <Icon name="check_circle" className="text-[22px]" />
            Thanks — check your inbox.
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className={`flex-1 px-5 py-4 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 ${
                variant === "business"
                  ? "bg-surface-container-lowest text-on-surface placeholder:text-on-surface/40 focus:ring-primary/30"
                  : "bg-white/95 text-on-surface placeholder:text-on-surface/40 focus:ring-white"
              }`}
            />
            <button
              type="submit"
              className={`px-8 py-4 rounded-2xl font-headline uppercase tracking-widest text-[0.75rem] font-bold transition-all hover:-translate-y-0.5 ${
                variant === "business"
                  ? "bg-primary text-on-primary hover:bg-tertiary"
                  : "bg-white text-primary hover:bg-on-surface hover:text-on-primary"
              }`}
            >
              {ctaLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
