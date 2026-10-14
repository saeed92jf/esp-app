// src/components/ui/locale-switcher.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useState(locale);

  useEffect(() => {
    setOptimisticLocale(locale);
  }, [locale]);

  function handleLocaleChange(nextLocale: string) {
    if (!nextLocale || nextLocale === locale || isPending) return;
    setOptimisticLocale(nextLocale);
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as Locale });
    });
  }

  const shortNormal = optimisticLocale === "en" ? "EN" : "FA";
  const shortHover = optimisticLocale === "en" ? "FA" : "EN";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(HEADER_ICON_BUTTON_CLASS, "relative group", className)}
            disabled={isPending}
            onClick={() => {
              const next = optimisticLocale === "en" ? "fa" : "en";
              handleLocaleChange(next);
            }}
            aria-label="Toggle Language"
          >
            <div className="relative flex items-center justify-center w-full h-full font-bold text-[13px] font-sans tracking-widest">
              <span>{shortNormal}</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {tHeader("language")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

