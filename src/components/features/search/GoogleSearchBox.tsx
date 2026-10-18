"use client";

import React, { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, ArrowUpRight, ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GenericSearchBox } from "@/components/ui/generic-search-box";
import { useSearchSuggestions } from "@/modules/search/hooks/use-universal-search";
import type { SearchSuggestion } from "@/modules/search/types/search.types";

interface GoogleSearchBoxProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onOverviewClick?: () => void;
  placeholder?: string;
}

export function GoogleSearchBox({
  className,
  onOpenChange,
  placeholder,
}: GoogleSearchBoxProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  // Live Google-style autocomplete suggestions
  const suggestions = useSearchSuggestions(query);

  const handleSubmitSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const renderSuggestionItem = (
    item: SearchSuggestion,
    isSelected: boolean,
    onSelect: () => void
  ) => {
    return (
      <div
        key={item.text}
        onClick={onSelect}
        className={cn(
          "group/sugg relative me-2.5 flex h-[46px] cursor-pointer select-none items-center justify-between px-3.5 transition-colors",
          "rounded-s-none rounded-e-full",
          isSelected
            ? "bg-[#e8eaed] dark:bg-[#e8eaed]"
            : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#e8eaed]/80"
        )}
      >
        {isSelected && (
          <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3 ps-1">
          <Search className="size-4.5 shrink-0 stroke-[2] text-[#9aa0a6] dark:text-[#70757a]" />
          <span className="truncate text-start text-[14px] font-medium leading-normal text-[#202124] dark:text-[#202124]">
            {item.text}
          </span>
        </div>

        <div className="text-zinc-400 dark:text-zinc-500 shrink-0 pe-2 ms-2 opacity-0 group-hover/sugg:opacity-100 transition-opacity">
          {isRtl ? (
            <ArrowUpLeft className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </div>
      </div>
    );
  };

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
      onQueryChange={setQuery}
      onOpenChange={onOpenChange}
      showAiModeButton={true}
      darkFlatWhite={true}
      placeholder={
        placeholder ||
        (isRtl
          ? "جستجو در ابزارها، محاسبات، مخازن تحت فشار..."
          : "Search tools, calculations, pressure vessels...")
      }
    />
  );
}
