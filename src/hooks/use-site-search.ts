// src/hooks/use-site-search.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rich Bilingual Site Search Hook

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, API_MODE, type SearchResult } from '@/services';
import { NAV_SEARCH_SOURCE, type NavSearchItem, getBilingualKeywords } from '@/lib/navigation-search';

const DEBOUNCE_MS = 250;

export function useSiteSearchItems() {
  const tItems = useTranslations('Menu.items');
  const tSections = useTranslations('Menu.sections');

  // Build items with rich bilingual keywords and descriptions
  const staticItems = useMemo<NavSearchItem[]>(
    () =>
      NAV_SEARCH_SOURCE.map((entry) => {
        let title = entry.labelKey;
        try {
          title = tItems(entry.labelKey);
        } catch {
          // fallback
        }

        let section = entry.sectionLabelKey;
        try {
          section = tSections(entry.sectionLabelKey);
        } catch {
          // fallback
        }

        const bilingual = getBilingualKeywords(entry.href);
        const keywords = [
          title,
          section,
          entry.href,
          entry.labelKey,
          ...(entry.keywordsEn || []),
          ...(entry.keywordsFa || []),
          ...(bilingual.en || []),
          ...(bilingual.fa || []),
        ];

        return {
          href: entry.href,
          title,
          section,
          icon: entry.icon,
          color: entry.color,
          keywords,
          description: bilingual.descriptionFa || bilingual.descriptionEn,
        };
      }),
    [tItems, tSections],
  );

  return { staticItems, isStatic: API_MODE === 'fake' };
}

/**
 * Real mode remote search
 */
export function useRemoteSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (query.trim().length < 1) {
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
