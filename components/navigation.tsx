"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  variant?: "default" | "kids" | "teens" | "adults";
}

const variantStyles = {
  default: {
    bg: "glass border-b border-[var(--color-gray-200)]",
    logo: "text-[var(--color-primary)]",
    text: "text-[var(--color-gray-600)] hover:text-[var(--color-gray-800)]",
    active: "text-[var(--color-primary)]",
  },
  kids: {
    bg: "bg-white/90 backdrop-blur-md border-b border-orange-100",
    logo: "text-[var(--color-kids-primary)]",
    text: "text-[var(--color-gray-600)] hover:text-[var(--color-kids-primary)]",
    active: "text-[var(--color-kids-primary)]",
  },
  teens: {
    bg: "glass-dark border-b border-white/10",
    logo: "text-[var(--color-teens-neon-green)]",
    text: "text-white/70 hover:text-white",
    active: "text-[var(--color-teens-neon-green)]",
  },
  adults: {
    bg: "bg-white/95 backdrop-blur-md border-b border-emerald-100",
    logo: "text-[var(--color-adults-primary)]",
    text: "text-[var(--color-gray-600)] hover:text-[var(--color-adults-primary)]",
    active: "text-[var(--color-adults-primary)]",
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/kids", label: "Kids" },
  { href: "/teens", label: "Teens" },
  { href: "/adults", label: "Adults" },
];

export function Navigation({ variant = "default" }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const styles = variantStyles[variant];

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50", styles.bg)}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                variant === "teens" ? "bg-white/10" : "bg-[var(--color-primary)]/10"
              )}
            >
              <Icon
                name="explore"
                className={styles.logo}
                size="md"
                filled
              />
            </div>
            <span className={cn("text-xl font-bold", styles.logo)}>
              Hakuna
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href ? styles.active : styles.text
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className={cn(
                "p-2 rounded-lg transition-colors",
                variant === "teens"
                  ? "hover:bg-white/10"
                  : "hover:bg-[var(--color-gray-100)]"
              )}
            >
              <Icon
                name="search"
                className={variant === "teens" ? "text-white/70" : "text-[var(--color-gray-500)]"}
              />
            </button>
            <Button
              variant={variant === "teens" ? "outline" : "primary"}
              size="sm"
              className={
                variant === "teens"
                  ? "border-[var(--color-teens-neon-green)] text-[var(--color-teens-neon-green)] hover:bg-[var(--color-teens-neon-green)] hover:text-[var(--color-teens-bg)]"
                  : variant === "kids"
                  ? "bg-[var(--color-kids-primary)] hover:bg-orange-600"
                  : variant === "adults"
                  ? "bg-[var(--color-adults-primary)] hover:bg-emerald-700"
                  : ""
              }
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              variant === "teens"
                ? "hover:bg-white/10"
                : "hover:bg-[var(--color-gray-100)]"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon
              name={mobileMenuOpen ? "close" : "menu"}
              className={variant === "teens" ? "text-white" : "text-[var(--color-gray-700)]"}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={cn(
            "md:hidden py-4 border-t",
            variant === "teens" ? "border-white/10" : "border-[var(--color-gray-200)]"
          )}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? cn(styles.active, variant === "teens" ? "bg-white/10" : "bg-[var(--color-gray-100)]")
                      : styles.text
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 px-4">
                <Button
                  variant="primary"
                  size="md"
                  className={cn(
                    "w-full",
                    variant === "teens"
                      ? "bg-[var(--color-teens-neon-green)] text-[var(--color-teens-bg)]"
                      : variant === "kids"
                      ? "bg-[var(--color-kids-primary)]"
                      : variant === "adults"
                      ? "bg-[var(--color-adults-primary)]"
                      : ""
                  )}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
