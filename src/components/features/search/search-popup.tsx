// src/components/features/search/search-popup.tsx
'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowUp, Clock, Search, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSearchHistory } from '@/hooks/use-search-history';

export interface SearchPopupProps<T> {
  /** Dataset to search against. */
  items?: T[];
  /** Stable unique key per item — used for React keys and de-duplication. */
  getItemKey: (item: T) => string | number;
  /**
   * Returns the strings to match the query against for a given item.
   * Null/undefined/empty entries are ignored. Generic on purpose so the popup
   * can search any shape of data (videos, articles, users, products, ...).
   * Memoize this in the parent to avoid re-filtering on every render.
   */
  getSearchableText: (item: T) => Array<string | null | undefined>;
  /** Render one result row. `query` is forwarded so callers can highlight. */
  renderItem: (item: T, query: string) => ReactNode;
  /** Fired when a result is chosen (click or Enter). */
  onSelect: (item: T) => void;
  /** Minimum characters before searching kicks in. Defaults to 2. */
  minQueryLength?: number;
  className?: string;
}

// Fixed input height (px) used to anchor the absolutely-positioned dropdown.
const SEARCH_BOX_HEIGHT = 48;

export function SearchPopup<T>({
  items = [],
  getItemKey,
  getSearchableText,
  renderItem,
  onSelect,
  minQueryLength = 2,
  className,
}: SearchPopupProps<T>) {
  const t = useTranslations('Search');
  const {
    history,
    add: addToHistory,
    clear: clearHistory,
  } = useSearchHistory();

  // --- State ----------------------------------------------------------------
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1); // result list cursor
  const [recentIndex, setRecentIndex] = useState(-1); // recent list cursor
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false); // arrow-key driven

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const keyboardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Search (de-duplicated by key) ---------------------------------------
  const results = useMemo(() => {
    if (query.length < minQueryLength) return [];
    const q = query.toLowerCase();
    const matched = items.filter((item) =>
      getSearchableText(item).some((field) => field?.toLowerCase().includes(q)),
    );
    return Array.from(
      new Map(matched.map((item) => [getItemKey(item), item])).values(),
    );
  }, [query, items, minQueryLength, getSearchableText, getItemKey]);

  // --- Derived view flags ---------------------------------------------------
  const hasResults = query.length >= minQueryLength && results.length > 0;
  const hasNoResults = query.length >= minQueryLength && results.length === 0;
  const showRecent =
    (query.length < minQueryLength || hasNoResults) && history.length > 0;
  const shouldShowDropdown =
    isFocused && (query.length >= minQueryLength || history.length > 0);

  // --- Auto-select first actionable item whenever the view changes ----------
  useEffect(() => {
    if (hasResults || hasNoResults) {
      setSelectedIndex(0);
      setRecentIndex(-1);
    } else if (query.length < minQueryLength && history.length > 0) {
      setRecentIndex(0);
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(-1);
      setRecentIndex(-1);
    }
  }, [hasResults, hasNoResults, query, history.length, minQueryLength]);

  // Keep the active item in view during keyboard navigation.
  useEffect(() => {
    if (keyboardMode) {
      selectedItemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, recentIndex, keyboardMode]);

  // Cleanup the keyboard-mode reset timer on unmount.
  useEffect(() => {
    return () => {
      if (keyboardTimeoutRef.current) clearTimeout(keyboardTimeoutRef.current);
    };
  }, []);

  // --- Handlers -------------------------------------------------------------
  const resetSearch = () => {
    setQuery('');
    setSelectedIndex(-1);
    setRecentIndex(-1);
    setIsFocused(false);
    setKeyboardMode(false);
  };

  const selectItem = (item: T) => {
    addToHistory(query);
    onSelect(item);
    resetSearch();
    inputRef.current?.blur();
  };

  const selectRecent = (term: string) => {
    setQuery(term);
    setKeyboardMode(false);
    inputRef.current?.focus();
  };

  // Any arrow key switches to keyboard mode and auto-expires after 3s idle.
  const enterKeyboardMode = () => {
    setKeyboardMode(true);
    if (keyboardTimeoutRef.current) clearTimeout(keyboardTimeoutRef.current);
    keyboardTimeoutRef.current = setTimeout(() => setKeyboardMode(false), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') enterKeyboardMode();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hasResults && selectedIndex < results.length - 1) {
          setSelectedIndex((p) => p + 1);
        } else if (hasNoResults) {
          // Move from the "no results" row into the recent list.
          if (selectedIndex === 0 && history.length > 0) {
            setSelectedIndex(-1);
            setRecentIndex(0);
          } else if (recentIndex < history.length - 1) {
            setRecentIndex((p) => p + 1);
          }
        } else if (showRecent && recentIndex < history.length - 1) {
          setRecentIndex((p) => p + 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (hasResults && selectedIndex > 0) {
          setSelectedIndex((p) => p - 1);
        } else if (hasNoResults) {
          if (recentIndex === 0) {
            setRecentIndex(-1);
            setSelectedIndex(0);
          } else if (recentIndex > 0) {
            setRecentIndex((p) => p - 1);
          }
        } else if (showRecent && recentIndex > 0) {
          setRecentIndex((p) => p - 1);
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (hasResults && selectedIndex >= 0 && results[selectedIndex]) {
          selectItem(results[selectedIndex]);
        } else if (recentIndex >= 0 && history[recentIndex]) {
          selectRecent(history[recentIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setQuery('');
        inputRef.current?.focus();
        break;
    }
  };

  // Mouse hover only selects when NOT in keyboard mode (avoids fighting nav).
  const hoverResult = (i: number) => {
    if (!keyboardMode) {
      setSelectedIndex(i);
      setRecentIndex(-1);
    }
  };
  const hoverRecent = (i: number) => {
    if (!keyboardMode) {
      setRecentIndex(i);
      setSelectedIndex(-1);
    }
  };

  // Shared row classes; `active` paints the themed selected state.
  const rowClass = (active: boolean) =>
    cn(
      'flex w-full items-center gap-3 border-s-2 border-transparent px-4 py-3 text-start transition-colors',
      active
        ? 'border-primary bg-accent text-accent-foreground'
        : 'hover:bg-accent/60',
    );

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseMove={() => keyboardMode && setKeyboardMode(false)}
    >
      {/* Input shell — squares its bottom corners when the dropdown is open. */}
      <div
        className={cn(
          'border-border bg-background border px-0.5 shadow-lg transition-[border-radius]',
          shouldShowDropdown
            ? 'rounded-t-4xl border-b-transparent'
            : 'rounded-4xl',
        )}
      >
        <div
          className="relative flex items-center"
          style={{ height: SEARCH_BOX_HEIGHT }}
        >
          <Search className="text-muted-foreground pointer-events-none absolute inset-s-4 size-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setKeyboardMode(false);
            }}
            // Delay blur so dropdown clicks register before it closes.
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            // Empty the placeholder while focused so it disappears on click.
            placeholder={isFocused ? '' : t('placeholder')}
            className="text-foreground placeholder:text-muted-foreground h-full w-full bg-transparent ps-11 pe-4 text-base focus:outline-none"
          />
        </div>
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          className="border-border bg-popover animate-in fade-in-0 slide-in-from-top-1 absolute inset-x-0 z-50 overflow-hidden rounded-b-4xl border border-t-0 shadow-lg"
          style={{ top: SEARCH_BOX_HEIGHT }}
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Results */}
            {hasResults && (
              <>
                <div className="bg-muted/50 px-4 py-2">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {t('results')} ({results.length})
                  </p>
                </div>
                {results.map((item, i) => (
                  <div
                    key={getItemKey(item)}
                    ref={
                      selectedIndex === i && keyboardMode
                        ? selectedItemRef
                        : null
                    }
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => hoverResult(i)}
                    className={cn(
                      rowClass(selectedIndex === i),
                      'cursor-pointer',
                    )}
                    style={{ cursor: keyboardMode ? 'none' : 'pointer' }}
                  >
                    {/* Row content is fully owned by the parent via renderItem. */}
                    {renderItem(item, query)}
                  </div>
                ))}
              </>
            )}

            {/* No results row */}
            {hasNoResults && (
              <div
                ref={
                  selectedIndex === 0 && keyboardMode ? selectedItemRef : null
                }
                className={rowClass(selectedIndex === 0 && recentIndex === -1)}
              >
                <XCircle className="text-muted-foreground size-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{t('noResults', { query })}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t('tryDifferent')}
                  </p>
                </div>
              </div>
            )}

            {/* Recent searches (no-results fallback OR empty query) */}
            {showRecent && (
              <>
                <div className="bg-muted/50 flex items-center justify-between px-4 py-2">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {t('recent')}
                  </p>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearHistory}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    {t('clear')}
                  </button>
                </div>
                {history.map((term, i) => (
                  <div
                    key={term}
                    ref={
                      recentIndex === i && keyboardMode ? selectedItemRef : null
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectRecent(term)}
                    onMouseEnter={() => hoverRecent(i)}
                    className={cn(
                      rowClass(recentIndex === i),
                      'cursor-pointer',
                    )}
                    style={{ cursor: keyboardMode ? 'none' : 'pointer' }}
                  >
                    <Clock className="text-muted-foreground size-4 shrink-0" />
                    <span dir="auto" className="truncate">
                      {term}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Keyboard hints */}
          <div className="border-border bg-muted/30 text-muted-foreground flex justify-between border-t px-4 py-2 text-xs">
            <span className="flex items-center gap-1">
              <ArrowUp className="size-3" />
              <ArrowDown className="size-3" />
              {t('navigate')}
            </span>
            <span>{t('select')}</span>
            <span>{t('escape')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
