"use client";

import React, { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSiteSearchItems,
  useRemoteSearch,
} from "@/hooks/use-site-search";
import {
  normalizeSearchText,
  type NavSearchItem,
} from "@/lib/navigation-search";
import { type NavColor, resolveNavIconGradient } from "@/config/navigation";
import { GenericSearchBox } from "@/components/ui/generic-search-box";
import { AppIcon } from "@/components/ui/app-icon";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

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
    const Icon = item.icon;
    const navGradientClass = resolveNavIconGradient(item.color);

    return (
      <div
        key={item.href}
        onClick={onSelect}
        className={cn(
          "group/result relative me-2.5 flex h-[52px] cursor-pointer select-none items-center justify-between px-3.5 transition-colors",
          "rounded-s-none rounded-e-full",
          isSelected
            ? "bg-[#e8eaed] dark:bg-[#303134]"
            : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#303134]/80",
        )}
      >
        {isSelected && (
          <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3 ps-1">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800",
              Icon && navGradientClass,
            )}
          >
            {Icon ? (
              <AppIcon icon={Icon as unknown as PhosphorIcon} className="size-4" />
            ) : (
              <Search className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col text-start">
            <span className="truncate text-[13.5px] font-medium leading-snug text-[#202124] dark:text-[#e8eaed]">
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
