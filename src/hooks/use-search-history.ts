// src/hooks/use-search-history.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'search-history';
const MAX_ITEMS = 10;

/**
 * Persisted, de-duplicated search history backed by localStorage.
 *
 * - Hydrates once on mount (client only) to avoid SSR/localStorage mismatches.
 * - `add` promotes an existing term to the top instead of duplicating it,
 *   and caps the list at MAX_ITEMS.
 * - Every mutation is mirrored to localStorage so history survives reloads.
 * - All storage access is wrapped in try/catch (private mode / blocked storage).
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const add = useCallback((term: string) => {
    const value = term.trim();
    if (!value) return;
    setHistory((prev) => {
      const next = [value, ...prev.filter((h) => h !== value)].slice(
        0,
        MAX_ITEMS,
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in-memory only */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { history, add, clear };
}
