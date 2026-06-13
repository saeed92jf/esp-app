"use client";

import { useState, useEffect, useCallback } from "react";
import { NAVIGATION } from "@/config/navigation";
import type { NavItem } from "@/config/navigation";

// Maximum number of pinned quick-access cards the user can select.
export const QUICK_ACCESS_MAX = 5;

// Storage key for persisting the user's selection across sessions.
const STORAGE_KEY = "quick-access-items";

// Default items: first item of each navigation group, capped at MAX.
const DEFAULT_HREFS: string[] = NAVIGATION.flatMap((g) => g.items.slice(0, 1))
  .slice(0, QUICK_ACCESS_MAX)
  .map((item) => item.href);

// Flat list of all selectable items (excluding the settings group).
export const ALL_SELECTABLE_ITEMS: NavItem[] = NAVIGATION.filter(
  (g) => g.id !== "settings" && g.items.length > 0,
).flatMap((g) => g.items);

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return DEFAULT_HREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HREFS;
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((x) => typeof x === "string") &&
      parsed.length > 0 &&
      parsed.length <= QUICK_ACCESS_MAX
    ) {
      return parsed as string[];
    }
  } catch {
    // Corrupted storage — fall back to defaults.
  }
  return DEFAULT_HREFS;
}

export function useQuickAccess() {
  // Selected hrefs; hydrated from localStorage on the client.
  const [selectedHrefs, setSelectedHrefs] = useState<string[]>(DEFAULT_HREFS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    setSelectedHrefs(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever the selection changes.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedHrefs));
  }, [selectedHrefs, hydrated]);

  // Resolve hrefs back to full NavItem objects (preserves selection order).
  const items: NavItem[] = selectedHrefs
    .map((href) => ALL_SELECTABLE_ITEMS.find((i) => i.href === href))
    .filter((i): i is NavItem => Boolean(i));

  // Toggle a single item on/off; respects the max cap.
  const toggle = useCallback((href: string) => {
    setSelectedHrefs((prev) => {
      if (prev.includes(href)) {
        return prev.filter((h) => h !== href);
      }
      if (prev.length >= QUICK_ACCESS_MAX) return prev; // cap reached
      return [...prev, href];
    });
  }, []);

  // Reset to defaults.
  const reset = useCallback(() => setSelectedHrefs(DEFAULT_HREFS), []);

  const isFull = selectedHrefs.length >= QUICK_ACCESS_MAX;
  const isSelected = (href: string) => selectedHrefs.includes(href);

  return { items, selectedHrefs, toggle, reset, isFull, isSelected, hydrated };
}
