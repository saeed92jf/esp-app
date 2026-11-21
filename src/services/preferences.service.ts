// src/services/preferences.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// User personal preferences service (quick-access cards, favorite apps, theme, primary-color).
// Supports per-user storage in localStorage and backend sync.
// ─────────────────────────────────────────────────────────────────────────────

import type { HttpClient } from './core/http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  quickAccessHrefs: string[];
  favoriteApps?: string[];
  dashboardWidgets?: Record<string, string[]>;
  dashboardLayouts?: Record<string, any>;
  slideRailItems?: string[];
  primaryColor: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFS: UserPreferences = {
  primaryColor: "#0284c7",
  theme: "system",
  quickAccessHrefs: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/customers",
    "/dictionary",
    "/did-you-know",
  ],
  favoriteApps: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/customers",
    "/dictionary",
    "/did-you-know",
    "/community",
  ],
};

const STORAGE_KEY = 'esp-user-preferences';

export function getUserStorageKey(userId?: string): string {
  if (userId && typeof userId === 'string' && userId.trim() && userId.trim().toLowerCase() !== 'guest') {
    return `esp-user-preferences-${userId.trim().toLowerCase()}`;
  }
  if (typeof window === 'undefined') return 'esp-user-preferences-guest';
  try {
    const raw = localStorage.getItem('esp_auth_user') || localStorage.getItem('esp-auth-user');
    if (raw) {
      const u = JSON.parse(raw);
      const id = u?.id || u?.userId || u?.email;
      if (id && String(id).trim().toLowerCase() !== 'guest') {
        return `esp-user-preferences-${String(id).trim().toLowerCase()}`;
      }
    }
  } catch {}
  return 'esp-user-preferences-guest';
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IPreferencesService {
  get(userId?: string): Promise<UserPreferences>;
  update(patch: Partial<UserPreferences>, userId?: string): Promise<UserPreferences>;
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealPreferencesService implements IPreferencesService {
  constructor(private http: HttpClient) {}

  private resolveActiveUserId(userId?: string): string {
    if (userId && typeof userId === 'string' && userId.trim() && userId.trim().toLowerCase() !== 'guest') {
      return userId.trim().toLowerCase();
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('esp_auth_user') || localStorage.getItem('esp-auth-user');
        if (raw) {
          const u = JSON.parse(raw);
          const id = u?.id || u?.userId || u?.email;
          if (id && String(id).trim().toLowerCase() !== 'guest') {
            return String(id).trim().toLowerCase();
          }
        }
      } catch {}
    }
    return 'guest';
  }

  async get(userId?: string): Promise<UserPreferences> {
    const activeId = this.resolveActiveUserId(userId);
    const key = getUserStorageKey(activeId);
    let cached: UserPreferences | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(key);
        if (raw) cached = JSON.parse(raw);
      } catch {}
    }

    try {
      const url = activeId !== 'guest'
        ? `/users/me/preferences?userId=${encodeURIComponent(activeId)}`
        : '/users/me/preferences';
      const res = await this.http.get<UserPreferences>(url);
      if (res) {
        let quickAccessHrefs = res.quickAccessHrefs;
        if (
          (!quickAccessHrefs || quickAccessHrefs.length === 0) &&
          cached?.quickAccessHrefs && cached.quickAccessHrefs.length > 0
        ) {
          quickAccessHrefs = cached.quickAccessHrefs;
        }

        const merged: UserPreferences = {
          ...DEFAULT_PREFS,
          ...cached,
          ...res,
          ...(quickAccessHrefs ? { quickAccessHrefs } : {}),
          ...(cached?.dashboardWidgets && !res.dashboardWidgets ? { dashboardWidgets: cached.dashboardWidgets } : {}),
          ...(cached?.dashboardLayouts && !res.dashboardLayouts ? { dashboardLayouts: cached.dashboardLayouts } : {}),
        };

        if (typeof window !== 'undefined' && activeId !== 'guest') {
          try {
            localStorage.setItem(key, JSON.stringify(merged));
          } catch {}
        }
        return merged;
      }
    } catch {}

    if (cached) return { ...DEFAULT_PREFS, ...cached };
    return DEFAULT_PREFS;
  }

  async update(patch: Partial<UserPreferences>, userId?: string): Promise<UserPreferences> {
    const activeId = this.resolveActiveUserId(userId);
    const key = getUserStorageKey(activeId);
    let current = DEFAULT_PREFS;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(key);
        if (raw) current = JSON.parse(raw);
      } catch {}
    }
    const merged = { ...current, ...patch };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('esp:user-preferences-updated', { detail: merged }));

        if (patch.primaryColor) {
          localStorage.setItem('esp-global-primary-color', patch.primaryColor);
          const rawAuth = localStorage.getItem('esp_auth_user') || localStorage.getItem('esp-auth-user');
          if (rawAuth) {
            const u = JSON.parse(rawAuth);
            u.primaryColor = patch.primaryColor;
            localStorage.setItem('esp_auth_user', JSON.stringify(u));
            localStorage.setItem('esp-auth-user', JSON.stringify(u));
          }
        }
      } catch {}
    }

    try {
      const url = activeId !== 'guest'
        ? `/users/me/preferences?userId=${encodeURIComponent(activeId)}`
        : '/users/me/preferences';
      const payload = { ...patch, userId: activeId !== 'guest' ? activeId : undefined };
      const res = await this.http.patch<UserPreferences>(url, payload);
      return res || merged;
    } catch {
      return merged;
    }
  }
}
