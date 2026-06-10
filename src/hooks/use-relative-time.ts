"use client";

import { useMemo } from "react";
import { useNow } from "@/providers/time-provider";

/**
 * Hook that converts a date string into relative time.
 * It automatically updates whenever the global time changes.
 */
export function useRelativeTime(dateStr: string, locale: string) {
  const now = useNow();

  return useMemo(() => {
    if (!dateStr) return locale === "fa" ? "نامشخص" : "Unknown";

    const date = new Date(dateStr);
    const diffSeconds = Math.floor((date.getTime() - now) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
    });

    const minutes = Math.round(diffSeconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (Math.abs(years) >= 1) return rtf.format(years, "year");
    if (Math.abs(months) >= 1) return rtf.format(months, "month");
    if (Math.abs(days) >= 1) return rtf.format(days, "day");
    if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
    if (Math.abs(minutes) >= 1) return rtf.format(minutes, "minute");

    return rtf.format(diffSeconds, "second");
  }, [dateStr, locale, now]);
}
