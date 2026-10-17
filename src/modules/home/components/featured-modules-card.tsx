"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FeaturedModulesCardProps {
  className?: string;
}

export function FeaturedModulesCard({ className }: FeaturedModulesCardProps) {
  const t = useTranslations("Home.featuredCard");

  return (
    <div
      className={cn(
        "relative w-full max-w-xl mx-auto flex flex-col items-center justify-center px-4 select-none my-auto shrink-0",
        className
      )}
    >
      {/* Sleek Minimalist Featured Card - Layout matching Support Section */}
      <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/85 dark:bg-[#0e1017]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/10 dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7)] text-center flex flex-col items-center gap-4 sm:gap-5">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-40 bg-gradient-to-b from-primary/30 to-indigo-500/10" />

        {/* Large, Bold, Solid-Filled Icon - Standalone with NO background container */}
        <div className="flex items-center justify-center pt-1">
          <SquaresFour weight="fill" className="size-14 sm:size-16 text-primary shrink-0 drop-shadow-md" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>{t("badge")}</span>
        </div>

        {/* Title & Short Clean Description */}
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
