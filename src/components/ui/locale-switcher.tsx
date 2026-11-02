// src/components/ui/locale-switcher.tsx
"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleLocaleChange() {
    const nextLocale = locale === "en" ? "fa" : "en";

    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    const search = typeof window !== "undefined" ? window.location.search || "" : "";
    const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
    const target = `${pathname}${search}${hash}`;

    startTransition(() => {
      router.replace(target, { locale: nextLocale });
    });
  }

  const shortNormal = locale === "en" ? "EN" : "FA";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(HEADER_ICON_BUTTON_CLASS, "relative group cursor-pointer select-none", className)}
          onClick={handleLocaleChange}
          disabled={isPending}
          aria-label="Toggle Language"
        >
          <div className="relative flex items-center justify-center w-full h-full font-bold text-[13px] font-sans tracking-widest pointer-events-none">
            <span>{shortNormal}</span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tHeader("language")}
      </TooltipContent>
    </Tooltip>
  );
}
