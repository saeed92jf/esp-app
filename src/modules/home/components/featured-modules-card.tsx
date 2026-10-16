"use client";

import { useTranslations } from "next-intl";
import { Boxes } from "lucide-react";

interface FeaturedModulesCardProps {
  className?: string;
}

export function FeaturedModulesCard({ className }: FeaturedModulesCardProps) {
  const t = useTranslations("Home.featuredCard");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 sm:p-10 text-center flex flex-col items-center shadow-none transition-all">
        {/* Module Icon Container */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="size-16 sm:size-20 rounded-2xl bg-muted/70 border border-border/70 flex items-center justify-center text-foreground">
            <Boxes className="size-8 sm:size-10 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-foreground text-background border border-background shadow-none">
            {t("badge")}
          </span>
        </div>

        {/* Main Title */}
        <h3 className="text-base sm:text-xl font-bold text-foreground tracking-tight mb-2.5 max-w-md leading-snug">
          {t("title")}
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
          {t("subtitle")}
        </p>

        {/* Future Modules Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-muted/60 border border-border/60 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {t("tagPiping")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-muted/60 border border-border/60 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {t("tagMaterials")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-muted/60 border border-border/60 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-sky-500" />
            {t("tagSimulation")}
          </span>
        </div>
      </div>
    </div>
  );
}
