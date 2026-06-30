// components/cards/QuickAccessCard.tsx

"use client";

import { type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  href: string;
  icon?: LucideIcon;
  title: string;
  hoverBgClassName?: string;
  iconClassName?: string;
  iconBgClassName?: string;
  className?: string;
}

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
        "group flex flex-col items-center gap-3.5 rounded-2xl p-4 text-center w-30 h-30",
        "transition-colors duration-300 ease-out",
        hoverBgClassName ?? "hover:bg-muted",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            "transition-transform duration-300 ease-out",
            "group-hover:scale-100 group-hover:hoverBgClassName motion-reduce:transform-none",
            iconBgClassName ?? "bg-muted",
          )}
        >
          <Icon
            className={cn(
              "size-6",
              iconClassName ?? "text-foreground",
              "group-hover:text-white",
            )}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
      )}

      <span className="text-sm text-foreground font-normal leading-tight  line-clamp-1">
        {title}
      </span>
    </Link>
  );
}
