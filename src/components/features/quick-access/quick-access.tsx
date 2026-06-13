// components/cards/QuickAccessCard.tsx

"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  href: string;
  icon?: LucideIcon;
  title: string;
  /** Tailwind hover-bg class, e.g. "hover:bg-sky-500/10" from NAV_COLOR_MAP */
  hoverBgClassName?: string;
  /** Tailwind icon color class, e.g. "text-sky-500" from NAV_COLOR_MAP */
  iconClassName?: string;
  /** Tailwind icon bg class, e.g. "bg-sky-500/10" from NAV_COLOR_MAP */
  iconBgClassName?: string;
  className?: string;
}

/**
 * QuickAccessCard — flat, borderless card for the hero quick-access row.
 *
 * Visual spec:
 * - No border, no shadow by default
 * - Rounded icon with colored background
 * - Subtle full-card hover background tint
 */
export function QuickAccessCard({
  href,
  icon: Icon,
  title,
  hoverBgClassName,
  iconClassName,
  iconBgClassName,
  className,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-2xl p-4 text-center",
        "transition-colors duration-300 ease-out",
        // Default hover tint; overridden by hoverBgClassName if provided
        hoverBgClassName ?? "hover:bg-muted",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            "transition-transform duration-300 ease-out",
            "group-hover:scale-110 motion-reduce:transform-none",
            // Colored icon background from NAV_COLOR_MAP
            iconBgClassName ?? "bg-muted",
          )}
        >
          <Icon
            className={cn("size-6", iconClassName ?? "text-muted-foreground")}
            strokeWidth={2}
          />
        </span>
      )}

      <span className="text-sm font-semibold leading-tight">{title}</span>
    </Link>
  );
}
