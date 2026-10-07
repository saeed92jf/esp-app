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
  const { openModal } = useAuthModal();

  const navGradientClass = resolveNavIconGradient(color);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] focus:outline-none text-center",
        className
      )}
    >
      {/* Absolute Hover Background (GPU Accelerated, with visual margin) */}
      <div
        className={cn(
          "absolute inset-1 sm:inset-1.5 rounded-2xl pointer-events-none transition-opacity duration-100 ease-out",
          "bg-black/[0.05] dark:bg-white/[0.08] opacity-0 group-hover:opacity-100",
          isMenuOpen && "opacity-100 duration-0"
        )}
      />

      {/* Content Container (relative to sit above background) */}
      <div className="relative flex flex-col items-center justify-start w-full h-full pt-3 sm:pt-4 pointer-events-none">
        {/* Google Circular Icon Bubble */}
        <div
          className={cn(
            "flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
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
          className="mt-2 sm:mt-3 text-[11px] sm:text-[12.5px] font-normal tracking-normal text-foreground/90 leading-tight block w-full max-w-[60px] sm:max-w-[76px] truncate text-center"
          title={title}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}
