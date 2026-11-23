"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface GoogleAddShortcutTileProps {
  onClick: () => void;
  className?: string;
}

export function GoogleAddShortcutTile({
  onClick,
  className,
}: GoogleAddShortcutTileProps) {
  const t = useTranslations("Home");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("quickAccess.addShortcut")}
      className={cn(
        "group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] shrink-0 focus:outline-none text-center rounded-[12px] sm:rounded-[14px] overflow-hidden bg-transparent active:scale-95 transition-transform duration-150 transform-gpu cursor-pointer select-none",
        className
      )}
    >
      {/* GPU-accelerated instant hover layer (matching .segmented-item color & speed) */}
      <span 
        className="absolute inset-0 rounded-[inherit] bg-accent opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-hover:duration-0 pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col items-center justify-start w-full h-full pt-3 sm:pt-4 pointer-events-none">
        {/* Google Circular Plus Bubble */}
        <div
          className={cn(
            "flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-foreground/80 shadow-xs"
          )}
        >
          <Plus className="size-5 sm:size-6 stroke-[2]" />
        </div>

        {/* Label */}
        <span className="mt-2 sm:mt-3 text-[11px] sm:text-[12.5px] font-medium tracking-normal text-foreground/90 leading-tight block w-full max-w-[60px] sm:max-w-[76px] truncate text-center">
          {t("quickAccess.addShortcut")}
        </span>
      </div>
    </button>
  );
}
