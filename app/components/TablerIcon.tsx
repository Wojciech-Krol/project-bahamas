"use client";

import { Icon as IconifyIcon } from "@iconify/react";
import { TABLER } from "@/src/lib/tablerIcons";

export function TablerIcon({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const icon = TABLER[name];
  if (!icon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[TablerIcon] Unknown icon "${name}". Add it to app/lib/tablerIcons.ts`);
    }
    return null;
  }
  return (
    <IconifyIcon
      icon={icon}
      className={className}
      width={size}
      height={size}
    />
  );
}
