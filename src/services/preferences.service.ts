// src/services/preferences.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// تنظیمات کاربر که فعلاً در localStorage است (quick-access, theme, primary-color).
// این سرویس به‌گونه‌ای طراحی شده که در fake mode از localStorage و در real mode
// از سرور بخواند — بدون تغییر در کامپوننت‌های مصرف‌کننده.

import type { HttpClient } from './core/http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  quickAccessHrefs: string[];
  primaryColor: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFS: UserPreferences = {
  quickAccessHrefs: [],
  primaryColor: 'blue',
  theme: 'system',
};

const STORAGE_KEY = 'esp-user-preferences';

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
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }

  async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.get();
    const updated = { ...current, ...patch };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealPreferencesService implements IPreferencesService {
  constructor(private http: HttpClient) {}

  async get(): Promise<UserPreferences> {
    return this.http.get<UserPreferences>('/users/me/preferences');
  }

  async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.http.patch<UserPreferences>('/users/me/preferences', patch);
  }
}
