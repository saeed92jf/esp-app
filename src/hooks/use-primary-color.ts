// src/hooks/use-primary-color.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLOR_STORAGE_KEY,
  PRIMARY_COLORS,
  type PrimaryColorId,
} from '@/config/settings';

// Every possible color class — used to clear stale ones before applying.
const ALL_COLOR_CLASSES = PRIMARY_COLORS.map((c) => `primary-color-${c.id}`);

// One year, so the preference survives across sessions.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Swap the active primary-color class on <html>. */
function applyColorClass(id: PrimaryColorId) {
  const root = document.documentElement;
  root.classList.remove(...ALL_COLOR_CLASSES);
  root.classList.add(`primary-color-${id}`);
}

/** Read the saved color from the cookie (client-side only). */
function readColorCookie(): PrimaryColorId | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${PRIMARY_COLOR_STORAGE_KEY}=`));
  const value = match?.split('=')[1] as PrimaryColorId | undefined;

  return value && PRIMARY_COLORS.some((c) => c.id === value) ? value : null;
}

/**
 * usePrimaryColor
 * - Hydrates the saved color from the cookie on mount.
 * - `setColor` updates state, persists to a cookie, and re-applies the class.
 * - Exposes `presets` so consumers (e.g. PrimaryColorSwitcher) can render
 *   swatches without importing PRIMARY_COLORS themselves.
 *
 * IMPORTANT: We use a COOKIE (not localStorage) so the server can read the
 * preference and apply `primary-color-*` directly on <html> during SSR.
 * That removes the inline <head> script entirely — no FOUC, and no React
 * "script tag" warning on locale switches.
 */
export function usePrimaryColor() {
  // `colorId` matches the consumer component's API.
  const [colorId, setColorId] = useState<PrimaryColorId>(DEFAULT_PRIMARY_COLOR);

  // Sync React state with whatever the server already rendered from the cookie.
  useEffect(() => {
    const stored = readColorCookie();
    if (stored) {
      setColorId(stored);
    }
  }, []);

  const setColor = useCallback((id: PrimaryColorId) => {
    // 1) Instant visual feedback: swap the class on <html> right away.
    applyColorClass(id);

    // 2) Persist in a cookie so SSR (and locale switches) pick it up.
    document.cookie = `${PRIMARY_COLOR_STORAGE_KEY}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;

    // 3) Update local state.
    setColorId(id);
  }, []);

  // `presets` is the single source of truth for the swatch list.
  return { colorId, setColor, presets: PRIMARY_COLORS } as const;
}
