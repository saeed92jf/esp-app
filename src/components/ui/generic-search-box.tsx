"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X, History, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSearchHistory } from "@/hooks/use-search-history";

function AiModeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-3.5 sm:size-4 shrink-0", className)}
    >
      <path d="M12 2.5C12 7.75 16.25 12 21.5 12C16.25 12 12 16.25 12 21.5C12 16.25 7.75 12 2.5 12C7.75 12 12 7.75 12 2.5Z" />
    </svg>
  );
}

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
  showClearButton?: boolean;
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
  showClearButton,
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
    } else if (initialQuery !== undefined) {
      setInternalQuery(initialQuery);
    }
  }, [value, initialQuery]);

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
  const hasAiMode = showAiModeButton ?? (showOverallViewButton || false);
  const shouldShowClear = showClearButton !== undefined
    ? showClearButton
    : (compact || !hasAiMode);
  const aiInteractiveColor = "text-muted-foreground group-hover/ai:text-primary transition-colors";

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
          "absolute inset-x-0 top-0 select-none z-10",
          compact ? "rounded-[22px]" : "rounded-[28px]"
        )}
      >
        {/* Continuous Soft Shadow Layer: velvety, gentle elevation for hero and search page */}
        <div 
          className={cn(
            "absolute inset-0 -z-10 rounded-[inherit] pointer-events-none transition-shadow duration-200",
            compact
              ? "shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
              : "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03),0_8px_24px_-6px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.25),0_1px_4px_rgba(0,0,0,0.15)]"
          )}
        />
        {/* Content Container: border is always present in both open and closed states */}
        <div
          className={cn(
            "bg-white dark:bg-[#181d33] text-foreground outline-none ring-0 border border-border/80 dark:border-border/60 hover:border-border dark:hover:border-border/90 focus-within:border-primary/60 dark:focus-within:border-primary/60",
            compact ? "shadow-2xs" : "shadow-none",
            "relative w-full overflow-hidden rounded-[inherit] transition-colors duration-150"
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
            <History className={cn("shrink-0 stroke-[1.8] text-muted-foreground/80 dark:text-muted-foreground/70", compact ? "me-2.5 size-4 sm:size-4.5" : "me-3 size-5")} />
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
              <Search className={cn("shrink-0 stroke-[2.2] text-muted-foreground/80 dark:text-muted-foreground/70 group-hover:text-primary transition-colors", compact ? "me-2.5 size-4 sm:size-4.5" : "me-3 size-5")} />
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
              "flex-1 border-none bg-transparent text-start font-normal leading-normal outline-none focus:placeholder-transparent focus:ring-0",
              hasAiMode
                ? shouldShowClear && query.trim().length > 0
                  ? (compact ? "pe-28 sm:pe-30" : "pe-32 sm:pe-36")
                  : (compact ? "pe-20 sm:pe-22" : "pe-24 sm:pe-28")
                : shouldShowClear && query.trim().length > 0
                  ? (compact ? "pe-9 sm:pe-10" : "pe-10 sm:pe-12")
                  : (compact ? "pe-3" : "pe-4"),
              compact ? "text-[13.5px] sm:text-[14px]" : "text-[14.5px] sm:text-[15px]",
              darkFlatWhite
                ? "text-foreground dark:text-zinc-900 placeholder:text-muted-foreground/90 dark:placeholder:text-zinc-500"
                : "text-foreground placeholder:text-muted-foreground/75 dark:placeholder:text-muted-foreground/50"
            )}
            aria-label="Search"
            autoComplete="off"
            spellCheck="false"
          />

          {shouldShowClear && query.trim().length > 0 && (
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
                  ? (hasAiMode ? "end-[78px] sm:end-[84px] size-6 sm:size-7" : "end-[8px] size-6 sm:size-7")
                  : (hasAiMode ? "end-[94px] sm:end-[102px] size-7 sm:size-8" : "end-[10px] size-7 sm:size-8"),
                darkFlatWhite
                  ? "text-zinc-400 hover:text-zinc-700 hover:bg-black/5 dark:text-zinc-500 dark:hover:text-zinc-900 dark:hover:bg-black/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:text-muted-foreground/70 dark:hover:text-foreground dark:hover:bg-white/10"
              )}
            >
              <X className={cn(compact ? "size-3.5" : "size-4", "stroke-[2]")} />
            </button>
          )}

          {hasAiMode && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    layout
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSubmitSearch && query.trim()) {
                        addToHistory(query.trim());
                        setIsFocused(false);
                        onSubmitSearch(query.trim());
                      } else if (onOverallViewClick) {
                        onOverallViewClick();
                      } else if (inputRef.current) {
                        inputRef.current.focus();
                        setIsFocused(true);
                      }
                    }}
                    aria-label={t("searchBox.aiModeUnavailable")}
                    className={cn(
                      "group/ai absolute flex items-center gap-1.5 rounded-full cursor-pointer select-none overflow-hidden",
                      showDropdown ? "flex-row-reverse" : "flex-row",
                      compact
                        ? "inset-y-1.5 end-1.5 px-2.5 text-[11px]"
                        : "inset-y-1.5 end-1.5 sm:inset-y-2 sm:end-2 px-3 sm:px-3.5 text-[12px] sm:text-[12.5px]",
                      darkFlatWhite
                        ? "bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-100 dark:hover:bg-zinc-200/90 text-zinc-700 dark:text-zinc-800 border border-zinc-300 dark:border-zinc-300 shadow-2xs hover:shadow-xs active:scale-98"
                        : "bg-muted/70 hover:bg-muted text-foreground/85 hover:text-foreground border border-border/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-foreground/80 dark:hover:text-foreground dark:border-white/10 shadow-2xs hover:shadow-xs active:scale-98"
                    )}
                    transition={{ layout: { duration: 0.2, ease: "easeInOut" } }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showDropdown ? (
                        <motion.span
                          key="tailless-arrow"
                          initial={{ opacity: 0, scale: 0.4, rotate: isRtl ? 30 : -30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.4, rotate: isRtl ? -30 : 30 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="inline-flex shrink-0 items-center justify-center"
                        >
                          {isRtl ? (
                            <ChevronLeft className={cn("size-3.5 sm:size-4 shrink-0 stroke-[2.6] transition-colors", aiInteractiveColor)} />
                          ) : (
                            <ChevronRight className={cn("size-3.5 sm:size-4 shrink-0 stroke-[2.6] transition-colors", aiInteractiveColor)} />
                          )}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="ai-mode-icon"
                          initial={{ opacity: 0, scale: 0.4, rotate: isRtl ? -30 : 30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.4, rotate: isRtl ? 30 : -30 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="inline-flex shrink-0 items-center justify-center"
                        >
                          <AiModeIcon className={cn("transition-colors", aiInteractiveColor)} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span
                      layout
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className={cn("font-semibold tracking-tight leading-none transition-colors", aiInteractiveColor)}
                    >
                      {t("searchBox.aiModeButton")}
                    </motion.span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10} className="text-xs font-medium shadow-md">
                  {t("searchBox.aiModeUnavailable")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {showDropdown && (
          <div className="w-full space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[60vh] pt-1 pb-5 sm:pb-6 border-t border-border/60 dark:border-white/[0.08]">
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
                      "group/item relative w-full flex cursor-pointer select-none items-center justify-between px-3 sm:px-3.5 transition-colors",
                      compact ? "h-[38px] text-[13.5px]" : "h-[44px] text-[14px]",
                      isSelected
                        ? (darkFlatWhite ? "bg-[#e8eaed] dark:bg-[#e8eaed]" : "bg-muted/80 dark:bg-white/[0.09] text-foreground")
                        : (darkFlatWhite ? "hover:bg-[#e8eaed]/80 dark:hover:bg-[#e8eaed]/80" : "hover:bg-muted/50 dark:hover:bg-white/[0.05] text-foreground/90"),
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-y-0 start-0 w-[3.5px] bg-primary" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-3 pe-8">
                      <History className={cn(compact ? "size-4" : "size-4.5", "shrink-0 stroke-[1.8] text-muted-foreground/70 dark:text-muted-foreground/60 group-hover/item:text-primary transition-colors")} />
                      <span className={cn("truncate text-start font-normal", darkFlatWhite ? "text-[#202124] dark:text-[#202124]" : "text-foreground")}>
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
                              "absolute end-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full transition-all",
                              darkFlatWhite
                                ? "text-[#70757a] hover:bg-black/10 dark:text-[#70757a] dark:hover:bg-black/10"
                                : "text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:text-muted-foreground/60 dark:hover:text-foreground dark:hover:bg-white/10",
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
              <div className="w-full space-y-0.5">
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
                  "px-6 pt-5 pb-6 text-center transition-colors",
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
                      : "text-muted-foreground/50"
                  )}
                />
                <p
                  className={cn(
                    "text-xs font-normal",
                    darkFlatWhite ? "text-[#70757a] dark:text-[#70757a]" : "text-muted-foreground"
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
