// src/hooks/use-search-history.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

const MAX_ITEMS = 10;

/**
 * Persisted, de-duplicated search history backed by localStorage.
 *
 * - Hydrates once on mount (client only) to avoid SSR/localStorage mismatches.
 * - `add` promotes an existing term to the top instead of duplicating it,
 *   and caps the list at MAX_ITEMS.
 * - `remove` deletes an individual item.
 * - `clear` deletes all items.
 * - Every mutation is mirrored to localStorage so history survives reloads.
 * - All storage access is wrapped in try/catch (private mode / blocked storage).
 */
export function useSearchHistory(key: string = 'search-history') {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
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
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [key]);

  const remove = useCallback((term: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== term);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [key]);

  const clear = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  return { history, add, remove, clear };
}
