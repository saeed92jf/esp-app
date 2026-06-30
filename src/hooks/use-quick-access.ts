// src/hooks/use-quick-access.ts
// ─────────────────────────────────────────────────────────────────────────────
// نسخه جدید — منطق UI همان قبلی است، اما ذخیره/بازیابی از طریق
// api.preferences انجام می‌شود (نه مستقیم localStorage). این یعنی وقتی
// API_MODE=real شود، quick-access خودکار روی سرور sync می‌شود.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services';
import { NAVIGATION, type NavItem } from '@/config/navigation';

export const QUICK_ACCESS_MAX = 5;

const DEFAULT_HREFS: string[] = NAVIGATION.flatMap((g) => g.items.slice(0, 1))
  .slice(0, QUICK_ACCESS_MAX)
  .map((item) => item.href);

export const ALL_SELECTABLE_ITEMS: NavItem[] = NAVIGATION.filter(
  (g) => g.id !== 'settings' && g.items.length > 0,
).flatMap((g) => g.items);

export function useQuickAccess() {
  const [selectedHrefs, setSelectedHrefs] = useState<string[]>(DEFAULT_HREFS);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true); // جلوگیری از save بلافاصله بعد از load اولیه

  // بارگذاری اولیه از سرویس preferences
  useEffect(() => {
    let cancelled = false;
    api.preferences.get().then((prefs) => {
      if (cancelled) return;
      setSelectedHrefs(
        prefs.quickAccessHrefs.length > 0 ? prefs.quickAccessHrefs : DEFAULT_HREFS,
      );
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  // ذخیره با هر تغییر (به‌جز بار اول)
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

  const reset = useCallback(() => setSelectedHrefs(DEFAULT_HREFS), []);

  const isFull = selectedHrefs.length >= QUICK_ACCESS_MAX;
  const isSelected = (href: string) => selectedHrefs.includes(href);

  return { items, selectedHrefs, toggle, reset, isFull, isSelected, hydrated };
}
