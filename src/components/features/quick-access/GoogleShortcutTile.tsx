"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type NavColor, resolveNavIconGradient } from "@/config/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { useAuthModal } from "@/modules/auth/hooks/use-auth-modal";
import { useAuth } from "@/modules/auth/hooks/use-auth";

interface GoogleShortcutTileProps {
  href: string;
  icon?: LucideIcon;
  color?: NavColor;
  title: string;
  onEdit?: () => void;
  onRemove?: (href: string) => void;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export function GoogleShortcutTile({
  href,
  icon: Icon,
  color,
  title,
  onEdit,
  onRemove,
  onClick,
  className,
}: GoogleShortcutTileProps) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navGradientClass = resolveNavIconGradient(color);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] shrink-0 focus:outline-none text-center rounded-[12px] sm:rounded-[14px] overflow-hidden bg-transparent active:scale-95 transition-transform duration-150 transform-gpu cursor-pointer",
        className
      )}
    >
      {/* GPU-accelerated instant hover layer (matching .segmented-item color & speed) */}
      <span 
        className="absolute inset-0 rounded-[inherit] bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-hover:duration-0 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* 3-dots More Actions Button (Appears on hover with delay, no background by default, darkens on button hover) */}
      {(onRemove || onEdit) && (
        <div 
          className={cn(
            "absolute top-1 end-1 z-30 transition-opacity duration-200",
            isMenuOpen 
              ? "opacity-100" 
              : "opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-300"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} dir={isRtl ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "size-5.5 sm:size-6 rounded-full flex items-center justify-center transition-colors duration-150 outline-none cursor-pointer",
                  "bg-transparent text-muted-foreground/75 hover:text-foreground",
                  "hover:bg-black/10 dark:hover:bg-white/15",
                  isMenuOpen && "bg-black/10 dark:bg-white/15 text-foreground"
                )}
                aria-label="Options"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align={isRtl ? "start" : "end"} 
              side="bottom" 
              sideOffset={4}
              className="w-32 p-1 rounded-xl shadow-lg border border-border/50 bg-popover z-50 text-xs duration-200 ease-out data-open:duration-200 data-open:fade-in-0 data-open:zoom-in-95 data-closed:duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onEdit();
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors rtl:text-right ltr:text-left w-full justify-start"
                >
                  <span>{t("quickAccess.editCards")}</span>
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onRemove(href);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors rtl:text-right ltr:text-left w-full justify-start"
                >
                  <span>{t("quickAccess.delete")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Content Container (relative z-10 to sit above GPU segmented-item background) */}
      <div className="relative z-10 flex flex-col items-center justify-start w-full h-full pt-3 sm:pt-4 pointer-events-none">
        {/* Google Circular Icon Bubble */}
        <div
          className={cn(
            "flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/90 shadow-xs"
          )}
        >
          {Icon && (
            <AppIcon
              icon={Icon}
              className={cn("size-5 sm:size-6", navGradientClass)}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Shortcut Title */}
        <span
          className="mt-2 sm:mt-3 text-[11px] sm:text-[12.5px] font-medium tracking-normal text-foreground/90 leading-tight block w-full max-w-[60px] sm:max-w-[76px] truncate text-center"
          title={title}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}
