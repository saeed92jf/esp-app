"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SearchFooterProps {
  startOffsetClass: string;
}

export function SearchFooter({ startOffsetClass }: SearchFooterProps) {
  const t = useTranslations("Search");
  const [locationKey, setLocationKey] = useState<"headOffice" | "factory">("headOffice");
  const [ipAddress, setIpAddress] = useState<string>("192.168.10.45");

  useEffect(() => {
    let isMounted = true;
    // Attempt real client IP retrieval; fallback smoothly on timeout or intranet
    fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2000) })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.ip) {
          setIpAddress(data.ip);
        }
      })
      .catch(() => {
        // Intranet or offline fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleLocation = () => {
    setLocationKey((prev) => (prev === "headOffice" ? "factory" : "headOffice"));
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-border/40 bg-slate-100/70 dark:bg-[#171717]/80 text-[#70757a] dark:text-[#9aa0a6] text-[12px] sm:text-[13px] transition-colors select-none">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Location based on IP (Google Style)              */}
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
              <span>
                {locationKey === "headOffice"
                  ? t("footer.headOffice")
                  : t("footer.factory")}
              </span>
            </span>

            <span className="opacity-30">•</span>

            {/* IP Address Attribution */}
            <span className="text-muted-foreground text-[11.5px] sm:text-xs fa-num">
              {t("footer.fromYourIp")} ({ipAddress})
            </span>

            <span className="opacity-30">•</span>

            {/* Change Location Action */}
            <button
              type="button"
              onClick={handleToggleLocation}
              className="text-[#1a73e8] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium text-[11.5px] sm:text-xs"
            >
              {t("footer.updateLocation")}
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM ROW: Useful Links & Copyright                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full px-2.5 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center">
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
