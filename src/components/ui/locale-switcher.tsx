// src/components/ui/locale-switcher.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
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
    <button
      className={cn(HEADER_ICON_BUTTON_CLASS, "relative group", className)}
      disabled={isPending}
      onClick={() => {
        const next = optimisticLocale === "en" ? "fa" : "en";
        handleLocaleChange(next);
      }}
      aria-label="Toggle Language"
    >
      <div className="relative flex items-center justify-center w-full h-full font-bold text-sm font-sans tracking-widest">
        <span
          className="absolute transition-all duration-150 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75"
        >
          {shortNormal}
        </span>
        <span
          className="absolute transition-all duration-150 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 text-primary"
        >
          {shortHover}
        </span>
      </div>
    </button>
  );
}

