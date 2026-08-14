"use client";

import React, { useMemo, useState } from "react";
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
import { GenericSearchBox } from "@/components/ui/generic-search-box";

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
  placeholder?: string;
}

export function GoogleSearchBox({
  className,
  onOpenChange,
  onOverviewClick,
  placeholder,
}: GoogleSearchBoxProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();
  
  const [query, setQuery] = useState("");

  const { staticItems, isStatic } = useSiteSearchItems();
  const { results: remoteResults } = useRemoteSearch(isStatic ? "" : query);

  const allItems: NavSearchItem[] = useMemo(() => {
    if (isStatic) return staticItems;
    return remoteResults.map((r) => ({
      href: r.href,
      title: r.title,
      section: r.section,
      icon: r.icon,
      color: "sky" as NavColor,
      keywords: [r.title, r.section, r.href],
    }));
  }, [isStatic, staticItems, remoteResults]);

  const filterFn = (q: string, items: NavSearchItem[]) => {
    const normalizedQuery = normalizeSearchText(q);
    if (!normalizedQuery) return [];
    
    return items.filter((item) => {
      if (normalizeSearchText(item.title).includes(normalizedQuery)) return true;
      if (normalizeSearchText(item.section).includes(normalizedQuery)) return true;
      if (normalizeSearchText(item.href).includes(normalizedQuery)) return true;
      if (
        item.keywords &&
        item.keywords.some((k) => normalizeSearchText(k).includes(normalizedQuery))
      ) {
        return true;
      }
      return false;
    }).slice(0, 8);
  };

  const renderItem = (item: NavSearchItem, isSelected: boolean, onSelect: () => void) => {
    const Icon: LucideIcon = item.icon || Search;
    const navBgClass = resolveNavBg(item.color);

    return (
      <div
        key={item.href}
        onClick={onSelect}
        className={cn(
          "group/result relative me-2.5 flex h-[40px] cursor-pointer select-none items-center justify-between px-3.5 transition-colors",
          "rounded-s-none rounded-e-full",
          isSelected
            ? "bg-[#e8eaed] dark:bg-[#303134]"
            : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#303134]/80",
        )}
      >
        {isSelected && (
          <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2.5 ps-1">
          <div
            className={cn(
              "flex size-6.5 shrink-0 items-center justify-center rounded-lg text-white shadow-xs",
              navBgClass,
            )}
          >
            <Icon className="size-3.5 stroke-[2.2] text-white" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col text-start">
            <span className="truncate text-[13px] font-medium leading-tight text-[#202124] dark:text-[#e8eaed]">
              {item.title}
            </span>
            <span className="text-muted-foreground truncate text-[11px] leading-tight">
              {item.section}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground/45 shrink-0 pe-2 ms-1">
          {isRtl ? (
            <ArrowLeft className="size-3.5" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <GenericSearchBox
      className={className}
      historyKey="nav-search-history"
      items={allItems}
      filterFn={filterFn}
      renderItem={renderItem}
      getItemKey={(item) => item.href}
      onSelect={(item) => router.push(item.href)}
      onQueryChange={setQuery}
      onOpenChange={onOpenChange}
      showOverallViewButton={true}
      onOverallViewClick={onOverviewClick}
      placeholder={
        placeholder || (isRtl
          ? "جستجو در ابزارها، محاسبات، مخازن تحت فشار..."
          : "Search tools, calculations, pressure vessels...")
      }
    />
  );
}
