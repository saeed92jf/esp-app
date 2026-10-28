"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SearchFooterProps {
  startOffsetClass?: string;
  className?: string;
}

/**
 * Dedicated Google-Style Search Footer
 * - Neutral light-grey background (`bg-[#f2f2f2] dark:bg-[#161616]`)
 * - Location and Copyright aligned with search results
 * - Privacy, Terms, and navigation links positioned underneath
 */
export function SearchFooter({ startOffsetClass, className }: SearchFooterProps) {
  const t = useTranslations("Search");
  const locale = useLocale();
  const isRtl = locale === "fa";

  return (
    <footer
      aria-label="Search Results Footer"
      className={cn(
        "mt-auto w-full select-none bg-[#f2f2f2] dark:bg-[#161616] text-[#70757a] dark:text-[#9aa0a6] border-t border-[#dadce0] dark:border-[#27272a] text-[13px] transition-colors",
        className
      )}
    >
      {/* ── ROW 1: Location & Copyright (Aligned with Search Results) ── */}
      <div className="w-full px-2.5 sm:px-6 border-b border-[#dadce0]/70 dark:border-[#27272a]">
        <div className="flex items-center py-3">
          {/* Spacer aligning with Search Box and Results Column */}
          {startOffsetClass && (
            <div className={cn("hidden sm:block", startOffsetClass)} aria-hidden="true" />
          )}

          <div className="w-full max-w-3xl flex items-center justify-between flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-[13px]">
            {/* Location info */}
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-foreground/80">
                {t("footer.country")}
              </span>
              <span className="text-muted-foreground/50 text-[11px] hidden xs:inline">•</span>
              <span className="text-muted-foreground/80 text-[11.5px] sm:text-xs">
                {t("footer.fromYourIp")}
              </span>
            </div>

            {/* Copyright */}
            <div className="text-[11.5px] sm:text-xs text-muted-foreground/80 fa-num">
              © {isRtl ? "۱۴۰۳" : "2026"} {t("footer.copyright")}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Privacy, Terms & Help Links (Under Copyright) ── */}
      <div className="w-full px-2.5 sm:px-6">
        <div className="flex items-center py-2.5 sm:py-3">
          {/* Spacer aligning with Search Box and Results Column */}
          {startOffsetClass && (
            <div className={cn("hidden sm:block", startOffsetClass)} aria-hidden="true" />
          )}

          <nav
            aria-label="Search Footer Navigation"
            className="w-full max-w-3xl flex items-center flex-wrap gap-x-5 sm:gap-x-7 gap-y-2 text-xs sm:text-[12.5px]"
          >
            <Link
              href="/privacy"
              className="hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              {t("footer.sitemap")}
            </Link>
            <Link
              href="/#support"
              className="hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              {t("footer.help")}
            </Link>
            <Link
              href="/#feedback"
              className="hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              {t("footer.feedback")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
