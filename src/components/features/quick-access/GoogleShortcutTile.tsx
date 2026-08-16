"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MoreVertical, Trash2, Edit3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type NavColor } from "@/config/navigation";

// Solid vibrant background colors matching navigation & search index
const NAV_COLOR_BG_MAP: Partial<Record<NavColor, string>> = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  slate: "bg-slate-500",
};

function resolveNavBg(color?: NavColor): string {
  if (!color || !NAV_COLOR_BG_MAP[color]) {
    return "bg-primary";
  }
  return NAV_COLOR_BG_MAP[color];
}

interface GoogleShortcutTileProps {
  href: string;
  icon?: LucideIcon;
  color?: NavColor;
  title: string;
  onEdit?: () => void;
  onRemove?: (href: string) => void;
  className?: string;
}

export function GoogleShortcutTile({
  href,
  icon: Icon,
  color,
  title,
  onEdit,
  onRemove,
  className,
}: GoogleShortcutTileProps) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navBgClass = resolveNavBg(color);

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-start w-[72px] sm:w-[96px] h-[84px] sm:h-[104px] p-1.5 sm:p-2 rounded-2xl select-none transition-colors duration-150",
        "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        isMenuOpen && "bg-black/[0.05] dark:bg-white/[0.08]",
        className
      )}
    >
      {/* 3-Dot Action Menu */}
      {(onEdit || onRemove) && (
        <div
          className={cn(
            "absolute top-1.5 z-20 transition-opacity duration-150",
            isRtl ? "left-1.5" : "right-1.5",
            isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-full text-muted-foreground/80 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none"
                aria-label="Shortcut menu"
              >
                <MoreVertical className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRtl ? "start" : "end"}
              className="w-40 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-xl p-1 text-xs z-50"
            >
              {onEdit && (
                <DropdownMenuItem
                  onClick={onEdit}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <Edit3 className="size-3.5 text-muted-foreground" />
                  <span>{t("quickAccess.editShortcut")}</span>
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onClick={() => onRemove(href)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>{t("quickAccess.removeShortcut")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Main Clickable Shortcut Link */}
      <Link
        href={href}
        className="flex flex-col items-center justify-start w-full h-full text-center focus:outline-none"
      >
        {/* Google Circular Icon Bubble */}
        <div
          className={cn(
            "flex size-10 sm:size-11 items-center justify-center rounded-full text-white shadow-xs transition-colors duration-150",
            navBgClass,
            "group-hover:brightness-95"
          )}
        >
          {Icon && (
            <Icon
              className="size-5 text-white stroke-[2]"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Shortcut Title */}
        <span
          className="mt-1.5 sm:mt-2 text-[11px] sm:text-[12.5px] font-normal tracking-normal text-foreground/90 text-center leading-tight line-clamp-1 max-w-[64px] sm:max-w-[96px] truncate"
          title={title}
        >
          {title}
        </span>
      </Link>
    </div>
  );
}
