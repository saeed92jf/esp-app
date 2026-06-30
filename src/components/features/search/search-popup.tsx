// src/components/features/search/search-popup.tsx
// ─────────────────────────────────────────────────────────────────────────────
// تنها تغییر نسبت به نسخه قبلی: prop اختیاری onQueryChange اضافه شد.
// این یعنی وقتی SiteSearch در real mode کار می‌کند، می‌تواند هر تایپ کاربر را
// به بیرون (برای debounced API call) گزارش دهد، بدون اینکه منطق فیلتر
// داخلی این کامپوننت تغییر کند.

'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowUp, Clock, Search, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSearchHistory } from '@/hooks/use-search-history';

export interface SearchPopupProps<T> {
  items?: T[];
  getItemKey: (item: T) => string | number;
  getSearchableText: (item: T) => Array<string | null | undefined>;
  renderItem: (item: T, query: string) => ReactNode;
  onSelect: (item: T) => void;
  minQueryLength?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  /**
   * اختیاری — اگر تنظیم شود، با هر تغییر query فراخوانی می‌شود.
   * برای real mode که نیاز به remote search دارد (با debounce بیرونی).
   * در fake mode تنظیم نمی‌شود چون فیلتر همینجا client-side انجام می‌شود.
   */
  onQueryChange?: (query: string) => void;
}

const SEARCH_BOX_HEIGHT = 48;

export function SearchPopup<T>({
  items = [],
  getItemKey,
  getSearchableText,
  renderItem,
  onSelect,
  onOpenChange,
  onQueryChange,
  minQueryLength = 2,
  className,
}: SearchPopupProps<T>) {
  const t = useTranslations('Search');
  const { history, add: addToHistory, clear: clearHistory } = useSearchHistory();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentIndex, setRecentIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const keyboardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // گزارش هر تغییر query به بیرون (برای remote search در real mode)
  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  const results = useMemo(() => {
    if (query.length < minQueryLength) return [];
    const q = query.toLowerCase();
    const matched = items.filter((item) =>
      getSearchableText(item).some((field) => field?.toLowerCase().includes(q)),
    );
    return Array.from(new Map(matched.map((item) => [getItemKey(item), item])).values());
  }, [query, items, minQueryLength, getSearchableText, getItemKey]);

  const hasResults = query.length >= minQueryLength && results.length > 0;
  const hasNoResults = query.length >= minQueryLength && results.length === 0;
  const showRecent = (query.length < minQueryLength || hasNoResults) && history.length > 0;
  const shouldShowDropdown = isFocused && (query.length >= minQueryLength || history.length > 0);

  useEffect(() => {
    onOpenChange?.(shouldShowDropdown);

    if (shouldShowDropdown) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isRTL = document.documentElement.dir === 'rtl';
      if (isRTL) {
        document.body.style.paddingInlineStart = `${scrollbarWidth}px`;
      } else {
        document.body.style.paddingInlineEnd = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingInlineStart = '';
      document.body.style.paddingInlineEnd = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingInlineStart = '';
      document.body.style.paddingInlineEnd = '';
    };
  }, [shouldShowDropdown, onOpenChange]);

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

  useEffect(() => {
    if (keyboardMode) {
      selectedItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex, recentIndex, keyboardMode]);

  useEffect(() => {
    return () => {
      if (keyboardTimeoutRef.current) clearTimeout(keyboardTimeoutRef.current);
    };
  }, []);

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

  const hoverResult = (i: number) => {
    if (!keyboardMode) { setSelectedIndex(i); setRecentIndex(-1); }
  };
  const hoverRecent = (i: number) => {
    if (!keyboardMode) { setRecentIndex(i); setSelectedIndex(-1); }
  };

  const rowClass = (active: boolean) =>
    cn(
      'flex w-full items-center gap-3 border-s-2 border-transparent px-4 py-3 text-start transition-colors',
      active ? 'border-primary bg-accent text-accent-foreground' : 'hover:bg-accent/60',
    );

  return (
    <>
      {shouldShowDropdown && (
        <div
          aria-hidden="true"
          className="animate-in fade-in-0 fixed inset-0 bg-black/20 backdrop-blur-xs"
          style={{ zIndex: 'var( --z-search)' }}
          onMouseDown={() => { setIsFocused(false); setQuery(''); }}
        />
      )}
      <div
        className={cn('relative w-full', className)}
        style={{ zIndex: shouldShowDropdown ? 'var( --z-search)' : undefined }}
        onMouseMove={() => keyboardMode && setKeyboardMode(false)}
      >
        <div
          className={cn(
            'border-border bg-background border px-0.5 shadow-lg transition-[border-radius]',
            shouldShowDropdown ? 'rounded-t-4xl border-b-transparent' : 'rounded-4xl',
          )}
        >
          <div className="relative flex items-center" style={{ height: SEARCH_BOX_HEIGHT }}>
            <Search className="text-muted-foreground pointer-events-none absolute inset-s-4 size-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { setIsFocused(true); setKeyboardMode(false); }}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder={isFocused ? '' : t('placeholder')}
              className="text-foreground placeholder:text-muted-foreground h-full w-full bg-transparent ps-11 pe-4 text-base focus:outline-none"
            />
          </div>
        </div>

        {shouldShowDropdown && (
          <div
            className="border-border bg-popover animate-in fade-in-0 slide-in-from-top-1 absolute inset-x-0 overflow-hidden rounded-b-4xl border border-t-0 shadow-2xl"
            style={{ top: SEARCH_BOX_HEIGHT }}
          >
            <div className="max-h-96 overflow-y-auto">
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
                      ref={selectedIndex === i && keyboardMode ? selectedItemRef : null}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => hoverResult(i)}
                      className={cn(rowClass(selectedIndex === i), 'cursor-pointer')}
                      style={{ cursor: keyboardMode ? 'none' : 'pointer' }}
                    >
                      {renderItem(item, query)}
                    </div>
                  ))}
                </>
              )}

              {hasNoResults && (
                <div
                  ref={selectedIndex === 0 && keyboardMode ? selectedItemRef : null}
                  className={rowClass(selectedIndex === 0 && recentIndex === -1)}
                >
                  <XCircle className="text-muted-foreground size-4 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{t('noResults', { query })}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{t('tryDifferent')}</p>
                  </div>
                </div>
              )}

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
                      ref={recentIndex === i && keyboardMode ? selectedItemRef : null}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectRecent(term)}
                      onMouseEnter={() => hoverRecent(i)}
                      className={cn(rowClass(recentIndex === i), 'cursor-pointer')}
                      style={{ cursor: keyboardMode ? 'none' : 'pointer' }}
                    >
                      <Clock className="text-muted-foreground size-4 shrink-0" />
                      <span dir="auto" className="truncate">{term}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

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
    </>
  );
}
