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
        "group relative flex flex-col items-center justify-start w-[72px] sm:w-[96px] h-[84px] sm:h-[104px] p-1.5 sm:p-2 rounded-2xl cursor-pointer select-none transition-colors duration-150",
        "hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:outline-none",
        className
      )}
    >
      {/* Google Circular Plus Bubble */}
      <div
        className={cn(
          "flex size-10 sm:size-11 items-center justify-center rounded-full",
          "bg-[#f1f3f4] dark:bg-[#303134] text-foreground/80 group-hover:bg-[#e2e7ec] dark:group-hover:bg-[#3c4146] transition-colors duration-150 shadow-xs"
        )}
      >
        <Plus className="size-5 sm:size-5 stroke-[2]" />
      </div>

      {/* Label */}
      <span className="mt-1.5 sm:mt-2 text-[11px] sm:text-[12.5px] font-normal tracking-normal text-foreground/90 text-center leading-tight line-clamp-1 max-w-[64px] sm:max-w-[96px] truncate">
        {t("quickAccess.addShortcut")}
      </span>
    </button>
  );
}
