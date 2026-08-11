"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { Search, X, LayoutGrid, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchHistory } from "@/hooks/use-search-history";

export interface GenericSearchBoxProps<T> {
  className?: string;
  placeholder?: string;
  historyKey: string;
  items: T[];
  filterFn: (query: string, items: T[]) => T[];
  renderItem: (
    item: T,
    isSelected: boolean,
    onSelect: () => void,
  ) => React.ReactNode;
  getItemKey: (item: T) => string;
  onSelect: (item: T) => void;
  onQueryChange?: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
  showOverallViewButton?: boolean;
  onOverallViewClick?: () => void;
}

export function GenericSearchBox<T>({
  className,
  placeholder,
  historyKey,
  items,
  filterFn,
  renderItem,
  getItemKey,
  onSelect,
  onQueryChange,
  onOpenChange,
  showOverallViewButton,
  onOverallViewClick,
}: GenericSearchBoxProps<T>) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isNavigatingHistory, setIsNavigatingHistory] = useState(false);
  const [hasSubmittedHistory, setHasSubmittedHistory] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEscapeTimeRef = useRef<number>(0);

  const {
    history,
    add: addToHistory,
    remove: removeHistory,
  } = useSearchHistory(historyKey);

  const filteredResults = filterFn(query, items);

  const showResultsMode =
    (!isNavigatingHistory && query.trim().length > 0) || hasSubmittedHistory;

  const showDropdown =
    isFocused &&
    (showResultsMode
      ? filteredResults.length > 0 || query.trim().length > 0
      : history.length > 0);

  useEffect(() => {
    onOpenChange?.(showDropdown);
  }, [showDropdown, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setSelectedIndex(-1);
        setIsNavigatingHistory(false);
        setHasSubmittedHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEscapeTimeRef.current < 900) {
          setQuery("");
          onQueryChange?.("");
          setSelectedIndex(-1);
          setIsNavigatingHistory(false);
          setHasSubmittedHistory(false);
          setIsFocused(false);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleSelect = useCallback(
    (item: T) => {
      if (query.trim()) {
        addToHistory(query.trim());
      }
      setIsFocused(false);
      setSelectedIndex(-1);
      setIsNavigatingHistory(false);
      setHasSubmittedHistory(false);
      onSelect(item);
    },
    [addToHistory, query, onSelect],
  );

  const applySelectedTerm = useCallback((term: string) => {
    setQuery(term);
    onQueryChange?.(term);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const len = term.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  }, []);

  const handleEscapePress = useCallback(() => {
    const now = Date.now();
    const isDoubleEscape = now - lastEscapeTimeRef.current < 900;
    lastEscapeTimeRef.current = now;

    if (isDoubleEscape || !showDropdown) {
      setQuery("");
      onQueryChange?.("");
      setSelectedIndex(-1);
      setIsNavigatingHistory(false);
      setHasSubmittedHistory(false);
      setIsFocused(false);
    } else {
      setIsFocused(false);
      setSelectedIndex(-1);
      setIsNavigatingHistory(false);
    }
  }, [showDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleEscapePress();
      return;
    }

    if (!showResultsMode) {
      const count = history.length;
      if (count === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = selectedIndex < count - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(nextIndex);
        setIsNavigatingHistory(true);
        const term = history[nextIndex];
        if (term) applySelectedTerm(term);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : count - 1;
        setSelectedIndex(nextIndex);
        setIsNavigatingHistory(true);
        const term = history[nextIndex];
        if (term) applySelectedTerm(term);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (query.trim()) {
          setIsNavigatingHistory(false);
          setHasSubmittedHistory(true);
          setSelectedIndex(-1);
        }
      }
    } else {
      const count = filteredResults.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (count > 0) {
          const nextIndex = selectedIndex < count - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(nextIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (count > 0) {
          const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : count - 1;
          setSelectedIndex(nextIndex);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex] as T);
        } else if (filteredResults.length > 0) {
          handleSelect(filteredResults[0] as T);
        }
      }
    }
  };

  const handleOverallViewScroll = () => {
    if (onOverallViewClick) {
      onOverallViewClick();
      return;
    }
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isHistoryPreselected = !showResultsMode && selectedIndex >= 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto h-[46px] w-full max-w-2xl sm:h-[48px] z-40",
        className,
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "bg-background absolute inset-x-0 top-0 select-none overflow-hidden dark:bg-[#202124]",
          "border-none shadow-[0_3px_12px_rgba(0,0,0,0.22),0_1px_4px_rgba(0,0,0,0.12)] outline-none ring-0 dark:shadow-[0_4px_18px_rgba(0,0,0,0.85),0_1px_4px_rgba(255,255,255,0.06)]",
          showDropdown ? "rounded-[24px]" : "rounded-full",
        )}
      >
        <div className="relative flex h-[46px] items-center px-3.5 sm:h-[48px] sm:px-4">
          {isHistoryPreselected ? (
            <History className="me-3 size-5 shrink-0 animate-in fade-in-50 stroke-[1.8] text-[#9aa0a6] duration-150" />
          ) : (
            <Search className="me-3 size-5 shrink-0 text-[#9aa0a6]" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onQueryChange?.(e.target.value);
              setIsFocused(true);
              setSelectedIndex(-1);
              setIsNavigatingHistory(false);
              setHasSubmittedHistory(false);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              isFocused
                ? ""
                : placeholder ||
                  (isRtl
                    ? "جستجو..."
                    : "Search...")
            }
            className="text-foreground placeholder:text-muted-foreground/70 flex-1 border-none bg-transparent pe-10 text-start text-[14.5px] font-normal leading-normal outline-none focus:placeholder-transparent focus:ring-0 sm:text-[15px]"
            aria-label="Search"
            autoComplete="off"
            spellCheck="false"
          />

          {showOverallViewButton && (
            <button
              type="button"
              onClick={handleOverallViewScroll}
              title={isRtl ? "نمای کلی امکانات و کارت‌ها" : "Overall Features View"}
              aria-label={isRtl ? "نمای کلی امکانات و کارت‌ها" : "Overall Features View"}
              className="bg-muted hover:bg-muted/80 absolute end-[7px] top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-all duration-150 sm:end-[8px] sm:size-[34px]"
            >
              <LayoutGrid className="text-foreground/70 size-4 stroke-[2] sm:size-4.5" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="space-y-0.5 overflow-hidden pb-3 pt-0.5 animate-in fade-in-50 duration-100 sm:pb-3.5">
            {!showResultsMode &&
              history.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`hist-${idx}`}
                    onClick={() => {
                      setQuery(item);
                      onQueryChange?.(item);
                      setIsNavigatingHistory(false);
                      setHasSubmittedHistory(true);
                      setSelectedIndex(-1);
                    }}
                    className={cn(
                      "group/item relative me-2.5 flex h-[36px] cursor-pointer select-none items-center justify-between transition-colors",
                      "rounded-s-none rounded-e-full",
                      isSelected
                        ? "bg-[#e8eaed] dark:bg-[#303134]"
                        : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#303134]/80",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-3 pe-9 ps-4">
                      <History className="size-4.5 shrink-0 stroke-[1.8] text-[#9aa0a6]" />
                      <span className="truncate text-start text-[14px] font-normal text-[#202124] dark:text-[#e8eaed]">
                        {item}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistory(item);
                        if (selectedIndex === idx) {
                          setSelectedIndex(-1);
                        }
                      }}
                      title={isRtl ? "حذف از تاریخچه" : "Remove from history"}
                      className={cn(
                        "absolute end-[6px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#70757a] transition-all hover:bg-black/10 dark:text-[#9aa0a6] dark:hover:bg-white/15",
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100",
                      )}
                    >
                      <X className="size-3.5 stroke-[2]" />
                    </button>
                  </div>
                );
              })}

            {showResultsMode && filteredResults.length > 0 && (
              <div className="space-y-0.5">
                {filteredResults.map((item, idx) => (
                  <React.Fragment key={getItemKey(item as T)}>
                    {renderItem(item as T, idx === selectedIndex, () =>
                      handleSelect(item as T),
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {showResultsMode && filteredResults.length === 0 && (
              <div className="px-6 py-5 text-center text-muted-foreground">
                <Search className="mx-auto mb-1.5 size-6 opacity-40" />
                <p className="text-xs">
                  {isRtl
                    ? `هیچ نتیجه‌ای برای "${query}" یافت نشد.`
                    : `No results found for "${query}".`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
