"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  detectClientIp,
  resolveLocationFromIp,
} from "../services/hardware-location.service";

interface SearchFooterProps {
  startOffsetClass: string;
}

export function SearchFooter({ startOffsetClass }: SearchFooterProps) {
  const t = useTranslations("Search");
  const locale = useLocale();
  const [ipAddress, setIpAddress] = useState<string>("192.168.10.45");

  useEffect(() => {
    let isMounted = true;
    detectClientIp().then((ip) => {
      if (isMounted && ip) {
        setIpAddress(ip);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve location from the Hardware IP Database
  const resolved = resolveLocationFromIp(ipAddress, locale);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-border/40 bg-slate-100/70 dark:bg-[#171717]/80 text-[#70757a] dark:text-[#9aa0a6] text-[12px] sm:text-[13px] transition-colors select-none">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Location based on Hardware IP Database           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full px-2.5 sm:px-6 py-2.5 sm:py-3 border-b border-border/30 dark:border-zinc-800/80">
        <div className="flex items-center">
          {/* Spacer to align vertically with Search Box and Results */}
          <div className={cn("hidden sm:block", startOffsetClass)} aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-[13px]">
            {/* Active Network Location Badge */}
            <span className="flex items-center gap-1.5 font-medium text-foreground/90">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>{resolved.locationName}</span>
              {resolved.department && (
                <span className="text-muted-foreground font-normal text-[11px] sm:text-xs">
                  ({resolved.department})
                </span>
              )}
            </span>

            <span className="opacity-30">•</span>

            {/* IP Address Attribution */}
            <span className="text-muted-foreground text-[11.5px] sm:text-xs fa-num">
              {t("footer.fromYourIp")} ({ipAddress})
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM ROW: Useful Links & Copyright (Expanded Height)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full px-2.5 sm:px-6 py-3.5 sm:py-4.5 min-h-[48px] sm:min-h-[52px] flex items-center">
        <div className="flex items-center w-full">
          {/* Spacer to align vertically with Search Box and Results */}
          <div className={cn("hidden sm:block", startOffsetClass)} aria-hidden="true" />

          <div className="flex flex-1 flex-wrap items-center gap-4 sm:gap-6 text-[12px] sm:text-[13px]">
            <Link
              href="/sitemap"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {t("footer.help")}
            </Link>
            <a
              href="mailto:support@esp-app.com?subject=Search%20Feedback"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {t("footer.feedback")}
            </a>
            <Link
              href="/privacy"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {t("footer.sitemap")}
            </Link>

            {/* Brand copyright */}
            <span className="ms-auto hidden md:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground fa-num">
              <span>© {currentYear} EUROSLOT PARS CORE</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
