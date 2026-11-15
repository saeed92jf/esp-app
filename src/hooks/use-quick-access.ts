// src/hooks/use-quick-access.ts
// ─────────────────────────────────────────────────────────────────────────────
// Robust Hook for managing Quick Access shortcuts layout with per-user persistence,
// login synchronization, and resilient fallback decoupling from module changes.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '@/services';
import { NAVIGATION, type NavItem, type NavColor } from '@/config/navigation';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { getUserStorageKey } from '@/services/preferences.service';

export const QUICK_ACCESS_MAX = 7;

export const ALL_SELECTABLE_ITEMS: NavItem[] = NAVIGATION.filter(
  (g) => g.id !== 'settings' && g.items.length > 0,
).flatMap((g) => g.items);

export const DEFAULT_HREFS: string[] = [
  "/ESP-Flow",
  "/tasks",
  "/projects",
  "/customers",
  "/dictionary",
  "/did-you-know",
];

/**
 * Normalizes an href for robust comparison across development route changes.
 * Handles trailing slashes, casing differences, and leading slashes.
 */
export function normalizeHref(href: string): string {
  if (!href) return "";
  const cleaned = href.trim().toLowerCase().replace(/\/+$/, "");
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

/**
 * Known module fallbacks for routes that may be renamed, added, or refactored in development.
 */
const KNOWN_MODULE_FALLBACKS: Record<string, Partial<NavItem>> = {
  "/esp-flow": { labelKey: "ESP-Flow", color: "violet" },
  "/tasks": { labelKey: "tasks", color: "sky" },
  "/projects": { labelKey: "projects", color: "blue" },
  "/customers": { labelKey: "customers", color: "teal" },
  "/dictionary": { labelKey: "dictionary", color: "emerald" },
  "/did-you-know": { labelKey: "didYouKnow", color: "amber" },
  "/datasheet-ai": { labelKey: "datasheetAI", color: "cyan" },
  "/aparat": { labelKey: "videos", color: "rose" },
  "/videos": { labelKey: "videos", color: "rose" },
  "/directory": { labelKey: "directory", color: "sky" },
  "/community": { labelKey: "community", color: "indigo" },
  "/dashboard": { labelKey: "dashboard", color: "blue" },
  "/profile": { labelKey: "profile", color: "purple" },
  "/issue-center": { labelKey: "issueCenter", color: "red" },
  "/holding": { labelKey: "holdings", color: "teal" },
  "/phonebook": { labelKey: "phonebook", color: "sky" },
};

/**
 * Resolves a NavItem from an href against NAVIGATION, with resilient fallback.
 * If a module changes route, casing, or is in active development, this function
 * gracefully resolves or synthesizes a valid NavItem so cards are never lost or broken.
 */
export function resolveQuickAccessItem(href: string, selectableItems: NavItem[]): NavItem {
  const norm = normalizeHref(href);

  // 1. Direct exact match
  const exact = selectableItems.find((i) => i.href === href);
  if (exact) return exact;

  // 2. Normalized match in selectable items
  const normalized = selectableItems.find((i) => normalizeHref(i.href) === norm);
  if (normalized) return normalized;

  // 3. Fallback: Search all NAVIGATION groups (including sub-items or secondary groups)
  const allNavItems = NAVIGATION.flatMap((g) => g.items);
  const inAll = allNavItems.find((i) => normalizeHref(i.href) === norm);
  if (inAll) return inAll;

  // 4. Known module dictionary fallback
  const fallback = KNOWN_MODULE_FALLBACKS[norm];
  if (fallback) {
    return {
      labelKey: fallback.labelKey || href,
      href,
      color: (fallback.color as NavColor) || "blue",
      public: true,
    };
  }

  // 5. Clean dynamic fallback
  const cleanSegment = href.replace(/^\//, "").replace(/-/g, " ");
  const dynamicTitle = cleanSegment ? cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1) : href;

  return {
    labelKey: dynamicTitle,
    href,
    color: "blue",
    public: true,
  };
}

/**
 * Deduplicates an array of hrefs by their normalized form while preserving order.
 */
function deduplicateHrefs(hrefs: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const h of hrefs) {
    if (!h) continue;
    const norm = normalizeHref(h);
    if (!seen.has(norm)) {
      seen.add(norm);
      result.push(h);
    }
  }
  return result;
}

/**
 * Reads cached quick access hrefs synchronously from localStorage for a specific user.
 */
function getCachedUserHrefs(userId?: string): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.quickAccessHrefs) && parsed.quickAccessHrefs.length > 0) {
        return deduplicateHrefs(parsed.quickAccessHrefs).slice(0, QUICK_ACCESS_MAX);
      }
    }
  } catch {}
  return null;
}

export function useQuickAccess() {
  const { user } = useAuth();
  
  const getResolvedUserId = (): string => {
    if (user?.id) return user.id;
    if (user?.email) return user.email;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
        if (raw) {
          const u = JSON.parse(raw);
          const id = u?.id || u?.userId || u?.email;
          if (id && String(id).trim().toLowerCase() !== "guest") {
            return String(id).trim().toLowerCase();
          }
        }
      } catch {}
    }
    return "guest";
  };

  const activeUserId = getResolvedUserId();

  // Immediate synchronous initialization from user-scoped storage (zero flash)
  const [selectedHrefs, setSelectedHrefs] = useState<string[]>(() => {
    const cached = getCachedUserHrefs(user?.id || user?.email);
    return cached && cached.length > 0 ? cached : DEFAULT_HREFS;
  });

  const [hydrated, setHydrated] = useState(false);
  const activeUserRef = useRef(activeUserId);
  activeUserRef.current = activeUserId;

  // Synchronize state directly when user changes or logs in
  const loadUserPreferences = useCallback(async (targetUserId: string) => {
    let resolvedTarget = targetUserId;
    if (!resolvedTarget || resolvedTarget === "guest") {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
          if (raw) {
            const u = JSON.parse(raw);
            const id = u?.id || u?.userId || u?.email;
            if (id && String(id).trim().toLowerCase() !== "guest") {
              resolvedTarget = String(id).trim().toLowerCase();
            }
          }
        } catch {}
      }
    }

    // 1. Instant local read for the target user
    const localCached = getCachedUserHrefs(resolvedTarget);
    if (localCached && localCached.length > 0) {
      setSelectedHrefs(localCached);
    }

    // 2. Fetch fresh preferences from server
    try {
      const prefs = await api.preferences.get(resolvedTarget);
      if (activeUserRef.current !== resolvedTarget && activeUserRef.current !== "guest") return; // Discard if user changed meanwhile

      if (Array.isArray(prefs.quickAccessHrefs) && prefs.quickAccessHrefs.length > 0) {
        const cleaned = deduplicateHrefs(prefs.quickAccessHrefs).slice(0, QUICK_ACCESS_MAX);
        setSelectedHrefs(cleaned);
      } else if (!localCached || localCached.length === 0) {
        setSelectedHrefs(DEFAULT_HREFS);
      }
    } catch {
      // Fallback already satisfied by localCached
    } finally {
      setHydrated(true);
    }
  }, []);

  // React to auth / user identity changes (Login, Logout, Account switch)
  useEffect(() => {
    void loadUserPreferences(activeUserId);
  }, [activeUserId, loadUserPreferences]);

  // Listen to login/logout and preference sync events across tabs & components
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newUser = customEvent.detail;
      const newId = newUser?.id || newUser?.email || "guest";
      void loadUserPreferences(newId);
    };

    const handlePreferencesSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const updatedPrefs = customEvent.detail;
      if (Array.isArray(updatedPrefs?.quickAccessHrefs)) {
        const cleaned = deduplicateHrefs(updatedPrefs.quickAccessHrefs).slice(0, QUICK_ACCESS_MAX);
        setSelectedHrefs(cleaned);
      }
    };

    window.addEventListener("esp:auth-user-changed", handleAuthChange);
    window.addEventListener("esp:user-preferences-updated", handlePreferencesSync);

    return () => {
      window.removeEventListener("esp:auth-user-changed", handleAuthChange);
      window.removeEventListener("esp:user-preferences-updated", handlePreferencesSync);
    };
  }, [loadUserPreferences]);

  // Explicit, atomic save handler triggered solely by user modifications
  const saveHrefs = useCallback((newHrefs: string[]) => {
    const cleaned = deduplicateHrefs(newHrefs).slice(0, QUICK_ACCESS_MAX);
    setSelectedHrefs(cleaned);

    let userId = activeUserRef.current;
    if (!userId || userId === "guest") {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
          if (raw) {
            const u = JSON.parse(raw);
            const id = u?.id || u?.userId || u?.email;
            if (id && String(id).trim().toLowerCase() !== "guest") {
              userId = String(id).trim().toLowerCase();
            }
          }
        } catch {}
      }
    }

    if (typeof window !== "undefined") {
      try {
        const key = getUserStorageKey(userId);
        const raw = localStorage.getItem(key);
        const current = raw ? JSON.parse(raw) : {};
        const merged = { ...current, quickAccessHrefs: cleaned };
        localStorage.setItem(key, JSON.stringify(merged));
      } catch {}
    }

    void api.preferences.update({ quickAccessHrefs: cleaned }, userId);
  }, []);

  // Resolved NavItems respecting exact sequence, never dropping missing modules
  const items: NavItem[] = useMemo(() => {
    return selectedHrefs.map((href) => resolveQuickAccessItem(href, ALL_SELECTABLE_ITEMS));
  }, [selectedHrefs]);

  const toggle = useCallback((href: string) => {
    const norm = normalizeHref(href);
    const exists = selectedHrefs.some((h) => normalizeHref(h) === norm);

    if (exists) {
      saveHrefs(selectedHrefs.filter((h) => normalizeHref(h) !== norm));
    } else {
      if (selectedHrefs.length >= QUICK_ACCESS_MAX) {
        return;
      }
      saveHrefs([...selectedHrefs, href]);
    }
  }, [selectedHrefs, saveHrefs]);

  const removeShortcut = useCallback((href: string) => {
    const norm = normalizeHref(href);
    saveHrefs(selectedHrefs.filter((h) => normalizeHref(h) !== norm));
  }, [selectedHrefs, saveHrefs]);

  const addShortcut = useCallback((href: string) => {
    const norm = normalizeHref(href);
    if (selectedHrefs.some((h) => normalizeHref(h) === norm) || selectedHrefs.length >= QUICK_ACCESS_MAX) {
      return;
    }
    saveHrefs([...selectedHrefs, href]);
  }, [selectedHrefs, saveHrefs]);

  const moveShortcut = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= selectedHrefs.length || toIndex < 0 || toIndex >= selectedHrefs.length) {
      return;
    }
    const copy = [...selectedHrefs];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    saveHrefs(copy);
  }, [selectedHrefs, saveHrefs]);

  const moveEarlier = useCallback((href: string) => {
    const norm = normalizeHref(href);
    const idx = selectedHrefs.findIndex((h) => normalizeHref(h) === norm);
    if (idx > 0) {
      moveShortcut(idx, idx - 1);
    }
  }, [selectedHrefs, moveShortcut]);

  const moveLater = useCallback((href: string) => {
    const norm = normalizeHref(href);
    const idx = selectedHrefs.findIndex((h) => normalizeHref(h) === norm);
    if (idx >= 0 && idx < selectedHrefs.length - 1) {
      moveShortcut(idx, idx + 1);
    }
  }, [selectedHrefs, moveShortcut]);

  const reorderShortcuts = useCallback((newHrefs: string[]) => {
    saveHrefs(newHrefs);
  }, [saveHrefs]);

  const reset = useCallback(() => {
    saveHrefs(DEFAULT_HREFS);
  }, [saveHrefs]);

  const isFull = selectedHrefs.length >= QUICK_ACCESS_MAX;
  const isSelected = useCallback((href: string) => {
    const norm = normalizeHref(href);
    return selectedHrefs.some((h) => normalizeHref(h) === norm);
  }, [selectedHrefs]);

  return {
    items,
    selectedHrefs,
    toggle,
    removeShortcut,
    addShortcut,
    moveEarlier,
    moveLater,
    moveShortcut,
    reorderShortcuts,
    reset,
    isFull,
    isSelected,
    hydrated,
  };
}
