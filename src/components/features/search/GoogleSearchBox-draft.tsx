"use client";

import React, { useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, ArrowRight, ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSiteSearchItems,
  useRemoteSearch,
} from "@/hooks/use-site-search";
import {
  normalizeSearchText,
  type NavSearchItem,
} from "@/lib/navigation-search";
import { type NavColor } from "@/config/navigation";
import { GenericSearchBox } from "../ui/generic-search-box";

const NAV_COLOR_BG_MAP: Record<NavColor, string> = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  slate: "bg-slate-500",
};

function resolveNavBg(color?: NavColor): string {
  if (!color || !NAV_COLOR_BG_MAP[color]) {
    return "bg-primary";
  }
  return NAV_COLOR_BG_MAP[color];
}

interface GoogleSearchBoxProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onOverviewClick?: () => void;
}

export function GoogleSearchBox({
  className,
  onOpenChange,
  onOverviewClick,
}: GoogleSearchBoxProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  const { staticItems, isStatic } = useSiteSearchItems();
  const { results: remoteResults } = useRemoteSearch(isStatic ? "" : ""); // GoogleSearchBox used to pass query, but now it's internal. Since this is just a mockup for remote, we just pass empty or we need to lift query up. Wait, useRemoteSearch in generic search?
  // Let's refactor: useRemoteSearch needs the query. But the query is inside GenericSearchBox.
  // Actually, useRemoteSearch in GoogleSearchBox was already doing: `useRemoteSearch(isStatic ? "" : query)`.
  // To keep it simple, we can just load remote results initially if needed, or we might need to expose onQueryChange in GenericSearchBox.
  // Wait, let's look at `useRemoteSearch` inside GoogleSearchBox.
  // If we just pass `isStatic ? "" : ""` it might not fetch remotely on every keystroke, but looking at useRemoteSearch, it might be fetching based on debounced query.
  // Let's modify GenericSearchBox to accept onQueryChange so we can hoist the query.
  // For now, I will modify GenericSearchBox to accept `onQueryChange`.
