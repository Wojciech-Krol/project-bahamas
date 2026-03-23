"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  variant?: "default" | "kids" | "teens" | "adults";
  placeholder?: string;
  className?: string;
}

const variantStyles = {
  default: {
    container: "bg-white border border-[var(--color-gray-200)] shadow-lg",
    input: "text-[var(--color-gray-800)] placeholder:text-[var(--color-gray-400)]",
    icon: "text-[var(--color-gray-400)]",
    button: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]",
  },
  kids: {
    container: "bg-white border border-orange-200 shadow-lg shadow-orange-100/50",
    input: "text-[var(--color-gray-800)] placeholder:text-[var(--color-gray-400)]",
    icon: "text-[var(--color-kids-primary)]",
    button: "bg-[var(--color-kids-primary)] hover:bg-orange-600",
  },
  teens: {
    container: "bg-white/10 border border-white/20 backdrop-blur-md",
    input: "text-white placeholder:text-white/50",
    icon: "text-[var(--color-teens-neon-green)]",
    button: "bg-[var(--color-teens-neon-green)] hover:bg-cyan-400 text-slate-900",
  },
  adults: {
    container: "bg-white border border-emerald-200 shadow-lg shadow-emerald-100/50",
    input: "text-[var(--color-gray-800)] placeholder:text-[var(--color-gray-400)]",
    icon: "text-[var(--color-adults-primary)]",
    button: "bg-[var(--color-adults-primary)] hover:bg-emerald-700",
  },
};

export function SearchBar({
  variant = "default",
  placeholder = "Search for classes, activities, or instructors...",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const styles = variantStyles[variant];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log("Search:", query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl",
        styles.container,
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 px-2">
        <Icon name="search" className={styles.icon} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-base",
            styles.input
          )}
        />
      </div>
      <Button
        type="submit"
        className={cn("rounded-xl", styles.button)}
      >
        <Icon name="search" size="sm" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
