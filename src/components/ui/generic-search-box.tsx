"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X, History, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  showAiModeButton?: boolean;
  showOverallViewButton?: boolean;
  onOverallViewClick?: () => void;
  renderResultsHeader?: (count: number, query: string) => React.ReactNode;
  darkFlatWhite?: boolean;
  onSubmitSearch?: (query: string) => void;
  value?: string;
  initialQuery?: string;
  compact?: boolean;
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
  showAiModeButton,
  showOverallViewButton,
  onOverallViewClick,
  renderResultsHeader,
  darkFlatWhite = false,
  onSubmitSearch,
  value,
  initialQuery,
  compact = false,
}: GenericSearchBoxProps<T>) {
  const locale = useLocale();
  const t = useTranslations('Common');
  const isRtl = locale === "fa";

  const [internalQuery, setInternalQuery] = useState(initialQuery ?? value ?? "");
  const query = value !== undefined ? value : internalQuery;

  useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    }
  }, [value]);

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
          setInternalQuery("");
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
  }, [onQueryChange]);

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
    setInternalQuery(term);
    onQueryChange?.(term);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const len = term.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  }, [onQueryChange]);

  const handleEscapePress = useCallback(() => {
    const now = Date.now();
    const isDoubleEscape = now - lastEscapeTimeRef.current < 900;
    lastEscapeTimeRef.current = now;

    if (isDoubleEscape || !showDropdown) {
      setInternalQuery("");
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
  }, [showDropdown, onQueryChange]);

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
          if (onSubmitSearch) {
            addToHistory(query.trim());
            setIsFocused(false);
            onSubmitSearch(query.trim());
          }
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
        } else if (onSubmitSearch && query.trim()) {
          addToHistory(query.trim());
          setIsFocused(false);
          onSubmitSearch(query.trim());
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
  const hasAiMode = showAiModeButton ?? showOverallViewButton;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full z-40",
        compact ? "h-[40px] sm:h-[42px]" : "mx-auto h-[48px] max-w-2xl sm:h-[52px]",
        className,
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 select-none transition-all duration-300 z-10",
          compact ? "rounded-[22px]" : "rounded-[28px]",
          showDropdown && "shadow-xl border border-black/10 dark:border-white/15"
        )}
      >
        {/* Continuous Glow Layer: soft primary blending into deep slate in light mode, no shadow in dark mode */}
        <div 
          className={cn(
            "absolute inset-0 -z-10 rounded-[inherit] pointer-events-none transition-shadow duration-300",
            "shadow-[0_2px_14px_-2px_color-mix(in_oklab,var(--primary)_22%,transparent),0_10px_30px_-8px_rgba(30,41,59,0.22)]",
            darkFlatWhite
              ? "dark:shadow-none"
              : "dark:shadow-[0_2px_16px_-2px_color-mix(in_oklab,var(--primary)_20%,transparent),0_12px_32px_-8px_rgba(10,10,10,0.6)]"
          )}
        />
        {/* Content Container */}
        <div
          className={cn(
            darkFlatWhite
              ? "bg-background dark:bg-white text-foreground dark:text-zinc-900 outline-none ring-0"
              : "bg-background dark:bg-[#202124] text-foreground outline-none ring-0",
            compact
              ? "border border-border/80 dark:border-transparent shadow-xs"
              : "border-none shadow-none",
            showDropdown && "shadow-xl border-border/80 dark:border-zinc-300",
            "relative w-full h-full overflow-hidden rounded-[inherit] transition-all duration-200"
          )}
        >
        <div
          className={cn(
            "relative flex items-center",
            compact
              ? "h-[40px] px-3 sm:h-[42px] sm:px-3.5"
              : "h-[48px] px-3.5 sm:h-[52px] sm:px-4"
          )}
        >
          {isHistoryPreselected ? (
            <History className={cn("shrink-0 animate-in fade-in-50 stroke-[1.8] duration-150", compact ? "me-2.5 size-4 sm:size-4.5" : "me-3 size-5", darkFlatWhite ? "text-muted-foreground dark:text-zinc-600" : "text-muted-foreground")} />
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (onSubmitSearch && query.trim()) {
                  addToHistory(query.trim());
                  setIsFocused(false);
                  onSubmitSearch(query.trim());
                }
              }}
              className="cursor-pointer focus:outline-none"
              aria-label="Search"
            >
              <Search className={cn("shrink-0 stroke-[2.2]", compact ? "me-2.5 size-4 sm:size-4.5" : "me-3 size-5", darkFlatWhite ? "text-muted-foreground/90 dark:text-zinc-600" : "text-muted-foreground/90")} />
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const nextVal = e.target.value;
              setInternalQuery(nextVal);
              onQueryChange?.(nextVal);
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
            className={cn(
              "flex-1 border-none bg-transparent pe-10 text-start font-normal leading-normal outline-none focus:placeholder-transparent focus:ring-0",
              compact ? "text-[13.5px] sm:text-[14px]" : "text-[14.5px] sm:text-[15px]",
              darkFlatWhite
                ? "text-foreground dark:text-zinc-900 placeholder:text-muted-foreground/90 dark:placeholder:text-zinc-500"
                : "text-foreground placeholder:text-muted-foreground/90"
            )}
            aria-label="Search"
            autoComplete="off"
            spellCheck="false"
          />

          {query.trim().length > 0 && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                setInternalQuery("");
                onQueryChange?.("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              aria-label="Clear search"
              className={cn(
                "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-colors cursor-pointer",
                compact
                  ? "end-[8px] size-6 sm:size-7"
                  : "end-[10px] size-7 sm:size-8",
                darkFlatWhite
                  ? "text-zinc-400 hover:text-zinc-700 hover:bg-black/5 dark:text-zinc-500 dark:hover:text-zinc-900 dark:hover:bg-black/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <X className={cn(compact ? "size-3.5" : "size-4", "stroke-[2]")} />
            </button>
          )}

          {hasAiMode && query.trim() === "" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    aria-label={t("searchBox.aiMode")}
                    title=""
                    className={cn(
                      "group/ai absolute top-1/2 flex -translate-y-1/2 cursor-default items-center justify-center rounded-full transition-colors duration-200",
                      compact
                        ? "end-[4px] size-7 sm:end-[6px] sm:size-8"
                        : "end-[6px] size-9 sm:end-[7px] sm:size-[38px]",
                      darkFlatWhite
                        ? "text-muted-foreground/60 hover:text-foreground/80 hover:bg-slate-100 dark:text-zinc-600 dark:hover:text-zinc-900 dark:hover:bg-zinc-100"
                        : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Sparkles className={cn(compact ? "size-[16px] sm:size-[18px]" : "size-[20px] sm:size-[22px]", "stroke-[1.8] transition-colors duration-200", darkFlatWhite ? "text-muted-foreground/75 group-hover/ai:text-primary dark:text-zinc-600 dark:group-hover/ai:text-primary" : "text-muted-foreground/75 group-hover/ai:text-primary")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="text-xs font-medium shadow-md">
                  {t("searchBox.aiMode")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {showDropdown && (
          <div className="space-y-0.5 overflow-y-auto custom-scrollbar max-h-[60vh] pb-3 pt-0.5 animate-in fade-in-50 duration-100 sm:pb-3.5 border-t border-border/30 dark:border-zinc-200/60 mx-1">
            {!showResultsMode &&
              history.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`hist-${idx}`}
                    onClick={() => {
                      setInternalQuery(item);
                      onQueryChange?.(item);
                      setIsNavigatingHistory(false);
                      setHasSubmittedHistory(true);
                      setSelectedIndex(-1);
                      if (onSubmitSearch) {
                        setIsFocused(false);
                        onSubmitSearch(item);
                      }
                    }}
                    className={cn(
                      "group/item relative me-2.5 flex cursor-pointer select-none items-center justify-between transition-colors",
                      compact ? "h-[40px] text-[13.5px]" : "h-[44px] text-[14px]",
                      "rounded-s-none rounded-e-full",
                      isSelected
                        ? (darkFlatWhite ? "bg-[#e8eaed] dark:bg-[#e8eaed]" : "bg-[#e8eaed] dark:bg-[#303134]")
                        : (darkFlatWhite ? "hover:bg-[#e8eaed]/80 dark:hover:bg-[#e8eaed]/80" : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#303134]/80"),
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-3 pe-9 ps-4">
                      <History className={cn(compact ? "size-4" : "size-4.5", "shrink-0 stroke-[1.8] text-[#9aa0a6]")} />
                      <span className={cn("truncate text-start font-normal", darkFlatWhite ? "text-[#202124] dark:text-[#202124]" : "text-[#202124] dark:text-[#e8eaed]")}>
                        {item}
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHistory(item);
                              if (selectedIndex === idx) {
                                setSelectedIndex(-1);
                              }
                            }}
                            aria-label={t("searchBox.removeFromHistory")}
                            title=""
                            className={cn(
                              "absolute end-[6px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full transition-all",
                              darkFlatWhite
                                ? "text-[#70757a] hover:bg-black/10 dark:text-[#70757a] dark:hover:bg-black/10"
                                : "text-[#70757a] hover:bg-black/10 dark:text-[#9aa0a6] dark:hover:bg-white/15",
                              isSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover/item:opacity-100",
                            )}
                          >
                            <X className="size-3.5 stroke-[2]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8} className="text-xs font-medium shadow-md">
                          {t("searchBox.removeFromHistory")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })}

            {showResultsMode && filteredResults.length > 0 && (
              <div className="space-y-0.5">
                {renderResultsHeader?.(filteredResults.length, query)}
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
              <div
                className={cn(
                  "px-6 py-5 text-center transition-colors",
                  darkFlatWhite
                    ? "text-[#70757a] dark:text-[#70757a]"
                    : "text-muted-foreground"
                )}
              >
                <Search
                  className={cn(
                    "mx-auto mb-1.5 size-6",
                    darkFlatWhite
                      ? "text-[#70757a] opacity-50 dark:text-[#70757a] dark:opacity-50"
                      : "opacity-40"
                  )}
                />
                <p
                  className={cn(
                    "text-xs font-normal",
                    darkFlatWhite && "text-[#70757a] dark:text-[#70757a]"
                  )}
                >
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
    </div>
  );
}
