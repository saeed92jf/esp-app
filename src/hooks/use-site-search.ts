// src/hooks/use-site-search.ts
// ─────────────────────────────────────────────────────────────────────────────
// جایگزین import مستقیم NAV_SEARCH_SOURCE در site-search.tsx.
//
// رفتار بسته به API_MODE فرق می‌کند:
//  • fake: تمام آیتم‌های ناوبری یک‌بار گرفته می‌شود، فیلتر کاملاً client-side
//          و آنی است (همان تجربه فعلی، بدون تأخیر شبکه).
//  • real: هر keystroke (با debounce) یک درخواست واقعی به api.search می‌زند،
//          چون در real mode ممکن است نتایج از منابع دیگر (کاربران، اسناد، ...)
//          هم بیایند که سمت کلاینت موجود نیستند.
//
// کامپوننت SiteSearch با این hook کار می‌کند و کاملاً بی‌خبر از API_MODE است.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, API_MODE, type SearchResult } from '@/services';
import { NAV_SEARCH_SOURCE, type NavSearchItem } from '@/lib/navigation-search';

const DEBOUNCE_MS = 250;

export function useSiteSearchItems() {
  const tItems = useTranslations('Menu.items');
  const tSections = useTranslations('Menu.sections');

  // ── حالت fake: همه آیتم‌ها را یک‌بار resolve می‌کنیم (ترجمه‌شده) ──────────
  const staticItems = useMemo<NavSearchItem[]>(
    () =>
      NAV_SEARCH_SOURCE.map((entry) => ({
        href: entry.href,
        title: tItems(entry.labelKey),
        section: tSections(entry.sectionLabelKey),
        icon: entry.icon,
      })),
    [tItems, tSections],
  );

  return { staticItems, isStatic: API_MODE === 'fake' };
}

/**
 * جستجوی واقعی برای real mode — debounce شده، با cancel خودکار.
 * فقط زمانی فراخوانی شود که API_MODE === 'real' باشد.
 */
export function useRemoteSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      const ac = new AbortController();
      abortRef.current = ac;
      setIsSearching(true);

      api.search
        .search({ query, types: ['navigation'] })
        .then((res) => { if (!ac.signal.aborted) setResults(res.results); })
        .catch(() => { if (!ac.signal.aborted) setResults([]); })
        .finally(() => { if (!ac.signal.aborted) setIsSearching(false); });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  return { results, isSearching };
}
