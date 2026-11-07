import preferencesMock from "@/data/mock/preferences.json";
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
  ...(preferencesMock as unknown as UserPreferences),
  quickAccessHrefs: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/dictionary",
    "/did-you-know",
  ],
  favoriteApps: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/dictionary",
    "/did-you-know",
    "/community",
  ],
};

const STORAGE_KEY = 'esp-user-preferences';

function getUserStorageKey(): string {
  if (typeof window === 'undefined') return 'esp-user-preferences-guest';
  try {
    const raw = localStorage.getItem('esp_auth_user') || localStorage.getItem('esp-auth-user');
    if (raw) {
      const u = JSON.parse(raw);
      const id = u?.id || u?.email;
      if (id) return `esp-user-preferences-${id}`;
    }
  } catch {}
  return 'esp-user-preferences-guest';
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IPreferencesService {
  get(): Promise<UserPreferences>;
  update(patch: Partial<UserPreferences>): Promise<UserPreferences>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

export class FakePreferencesService implements IPreferencesService {
  async get(): Promise<UserPreferences> {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try {
      const key = getUserStorageKey();
      const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }

  async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.get();
    const updated = { ...current, ...patch };
    if (typeof window !== 'undefined') {
      try {
        const key = getUserStorageKey();
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (patch.primaryColor) {
          const raw = localStorage.getItem('esp-auth-user') || localStorage.getItem('esp_auth_user');
          if (raw) {
            const user = JSON.parse(raw);
            user.primaryColor = patch.primaryColor;
            localStorage.setItem('esp-auth-user', JSON.stringify(user));
            localStorage.setItem('esp_auth_user', JSON.stringify(user));
          }
        }
      } catch {}
    }
    return updated;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealPreferencesService implements IPreferencesService {
  constructor(private http: HttpClient) {}

  async get(): Promise<UserPreferences> {
    try {
      const res = await this.http.get<UserPreferences>('/users/me/preferences');
      if (res && (res.quickAccessHrefs || res.favoriteApps)) {
        if (typeof window !== 'undefined') {
          try {
            const key = getUserStorageKey();
            localStorage.setItem(key, JSON.stringify(res));
          } catch {}
        }
        return { ...DEFAULT_PREFS, ...res };
      }
    } catch {}

    // Fallback to user-scoped localStorage
    if (typeof window !== 'undefined') {
      try {
        const key = getUserStorageKey();
        const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
      } catch {}
    }
    return DEFAULT_PREFS;
  }

  async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    if (typeof window !== 'undefined') {
      try {
        const key = getUserStorageKey();
        const raw = localStorage.getItem(key);
        const current = raw ? JSON.parse(raw) : DEFAULT_PREFS;
        const merged = { ...current, ...patch };
        localStorage.setItem(key, JSON.stringify(merged));

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
      return await this.http.patch<UserPreferences>('/users/me/preferences', patch);
    } catch {
      return { ...DEFAULT_PREFS, ...patch };
    }
  }
}
