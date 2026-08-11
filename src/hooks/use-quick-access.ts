// src/hooks/use-quick-access.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook for managing Google-style quick access shortcuts with preferences sync

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services';
import { NAVIGATION, type NavItem } from '@/config/navigation';

export const QUICK_ACCESS_MAX = 8;

export const ALL_SELECTABLE_ITEMS: NavItem[] = NAVIGATION.filter(
  (g) => g.id !== 'settings' && g.items.length > 0,
).flatMap((g) => g.items);

const DEFAULT_HREFS: string[] = ALL_SELECTABLE_ITEMS.slice(0, 5).map(
  (item) => item.href,
);

export function useQuickAccess() {
  const [selectedHrefs, setSelectedHrefs] = useState<string[]>(DEFAULT_HREFS);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true);

  // Initial load from preferences service
  useEffect(() => {
    let cancelled = false;
    api.preferences.get().then((prefs) => {
      if (cancelled) return;
      if (prefs.quickAccessHrefs && prefs.quickAccessHrefs.length > 0) {
        setSelectedHrefs(prefs.quickAccessHrefs.slice(0, QUICK_ACCESS_MAX));
      } else {
        setSelectedHrefs(DEFAULT_HREFS);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Save on change (except first load)
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    void api.preferences.update({ quickAccessHrefs: selectedHrefs });
  }, [selectedHrefs, hydrated]);

  const items: NavItem[] = selectedHrefs
    .map((href) => ALL_SELECTABLE_ITEMS.find((i) => i.href === href))
    .filter((i): i is NavItem => Boolean(i));

  const toggle = useCallback((href: string) => {
    setSelectedHrefs((prev) => {
      if (prev.includes(href)) return prev.filter((h) => h !== href);
      if (prev.length >= QUICK_ACCESS_MAX) return prev;
      return [...prev, href];
    });
  }, []);

  const removeShortcut = useCallback((href: string) => {
    setSelectedHrefs((prev) => prev.filter((h) => h !== href));
  }, []);

  const addShortcut = useCallback((href: string) => {
    setSelectedHrefs((prev) => {
      if (prev.includes(href) || prev.length >= QUICK_ACCESS_MAX) return prev;
      return [...prev, href];
    });
  }, []);

  const reset = useCallback(() => setSelectedHrefs(DEFAULT_HREFS), []);

  const isFull = selectedHrefs.length >= QUICK_ACCESS_MAX;
  const isSelected = (href: string) => selectedHrefs.includes(href);

  return {
    items,
    selectedHrefs,
    toggle,
    removeShortcut,
    addShortcut,
    reset,
    isFull,
    isSelected,
    hydrated,
  };
}
