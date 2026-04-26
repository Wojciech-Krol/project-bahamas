"use client";

import { Icon as IconifyIcon } from "@iconify/react";

export function TablerIcon({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  return (
    <IconifyIcon
      icon={`tabler:${name}`}
      className={className}
      width={size}
      height={size}
    />
  );
}
