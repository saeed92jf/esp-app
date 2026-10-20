"use client";

import React, { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, ArrowUpRight, ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GenericSearchBox } from "@/components/ui/generic-search-box";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { useSearchSuggestions } from "@/modules/search/hooks/use-universal-search";
import type { SearchSuggestion } from "@/modules/search/types/search.types";

interface GoogleSearchBoxProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onOverviewClick?: () => void;
  placeholder?: string;
  initialQuery?: string;
  value?: string;
  onQueryChange?: (query: string) => void;
  onSubmitSearch?: (query: string) => void;
  compact?: boolean;
  darkFlatWhite?: boolean;
  showAiModeButton?: boolean;
  showClearButton?: boolean;
}

export function GoogleSearchBox({
  className,
  onOpenChange,
  placeholder,
  initialQuery = "",
  value,
  onQueryChange,
  onSubmitSearch,
  compact = false,
  darkFlatWhite = true,
  showAiModeButton,
  showClearButton,
}: GoogleSearchBoxProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  const [internalQuery, setInternalQuery] = useState(initialQuery || value || "");
  const query = value !== undefined ? value : internalQuery;
  const [, startTransition] = useTransition();

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    } else if (initialQuery !== undefined) {
      setInternalQuery(initialQuery);
    }
  }, [value, initialQuery]);

  // Live Google-style autocomplete suggestions
  const suggestions = useSearchSuggestions(query);

  const handleQueryChange = (newVal: string) => {
    if (value === undefined) {
      setInternalQuery(newVal);
    }
    onQueryChange?.(newVal);
  };

  const handleSubmitSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (onSubmitSearch) {
      onSubmitSearch(trimmed);
    } else {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      });
    }
  };

  const renderSuggestionItem = (
    item: SearchSuggestion,
    isSelected: boolean,
    onSelect: () => void
  ) => {
    const isItemEn = /[a-zA-Z]/.test(item.text) && !/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(item.text);

    return (
      <div
        key={item.text}
        onClick={onSelect}
        dir={isItemEn ? "ltr" : isRtl ? "rtl" : "ltr"}
        className={cn(
          "group/sugg relative w-full flex cursor-pointer select-none items-center justify-between px-3 sm:px-3.5 transition-colors",
          compact ? "h-[38px] text-[13.5px]" : "h-[44px] text-[14px]",
          isSelected
            ? "bg-[#e8eaed] dark:bg-[#e8eaed]"
            : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#e8eaed]/80"
        )}
      >
        {isSelected && (
          <span className="absolute inset-y-0 start-0 w-[3.5px] bg-[#1a73e8]" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Search className={cn(compact ? "size-4" : "size-4.5", "shrink-0 stroke-[2] text-[#9aa0a6] dark:text-[#70757a]")} />
          <span className="truncate text-start font-normal leading-normal text-[#202124] dark:text-[#202124]">
            <HighlightMatch
              text={item.text}
              query={query}
              highlightClassName="font-semibold text-[#1a73e8] dark:text-[#1a73e8] bg-blue-50 dark:bg-blue-900/30 px-1 py-0.5 rounded-xs"
            />
          </span>
        </div>

        <div className="text-zinc-400 dark:text-zinc-500 shrink-0 pe-1 ms-2 opacity-0 group-hover/sugg:opacity-100 transition-opacity">
          {isItemEn ? (
            <ArrowUpRight className="size-3.5" />
          ) : isRtl ? (
            <ArrowUpLeft className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </div>
      </div>
    );
  };

  // AI Mode button is temporarily hidden per user request to avoid layout offset issues
  const finalShowAiModeButton = showAiModeButton !== undefined ? showAiModeButton : false;
  const finalShowClearButton = showClearButton !== undefined ? showClearButton : compact;

  return (
    <GenericSearchBox
      className={className}
      historyKey="nav-search-history"
      items={suggestions}
      filterFn={(_q, items) => items}
      renderItem={renderSuggestionItem}
      getItemKey={(item) => item.text}
      onSelect={(item) => handleSubmitSearch(item.text)}
      onSubmitSearch={handleSubmitSearch}
      onQueryChange={handleQueryChange}
      onOpenChange={onOpenChange}
      showAiModeButton={finalShowAiModeButton}
      showClearButton={finalShowClearButton}
      darkFlatWhite={darkFlatWhite}
      compact={compact}
      value={value}
      initialQuery={initialQuery}
      placeholder={
        placeholder ||
        (isRtl
          ? "جستجو در ابزارها، محاسبات، مخازن تحت فشار..."
          : "Search tools, calculations, pressure vessels...")
      }
    />
  );
}
