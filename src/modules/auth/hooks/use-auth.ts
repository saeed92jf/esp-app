// src/hooks/use-auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Refactored to use Zustand to prevent state loss and UI flashing on client navigations.

'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { api, ApiError } from '@/services';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/core/types';
import type { User } from '@/types/auth';
import { usePrimaryColor } from '@/hooks/use-primary-color';
import { DEFAULT_PRIMARY_COLOR } from '@/config/settings';

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoggingIn: (isLoggingIn: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  updateAvatar: (url: string | null) => void;
  updateUser: (partial: Partial<User>) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isLoggingIn: false,
  hydrated: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),
  setHydrated: (hydrated) => set({ hydrated }),
  updateAvatar: (url) => set((state) => ({ user: state.user ? { ...state.user, avatar: url || undefined } : null })),
  updateUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
}));

export function useAuth() {
  const store = useAuthStore();
  const { setColor } = usePrimaryColor();

  useEffect(() => {
    // Only hydrate once globally
    if (store.hydrated) return;
    
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem("esp_auth_user");
      if (raw) {
        let parsed = JSON.parse(raw) as User;
        
        // Auto-fix malformed cached users from previous unmapped API responses
        if (!parsed.role) parsed.role = 'customer';
        if (!parsed.fullName && (parsed as any).full_name) parsed.fullName = (parsed as any).full_name;
        if (!parsed.fullName) parsed.fullName = parsed.email || 'User';
        
        // Sync with fake API mock users / dynamic overrides
        try {
          const stored = localStorage.getItem("esp_demo_users_override");
          if (stored) {
            const dynamicUsers = JSON.parse(stored);
            const match = dynamicUsers?.find((d: any) => d.user.id === parsed.id);
            if (match) {
              parsed = { ...match.user, ...parsed };
            }
          } else {
            const { DEMO_USERS } = require('@/modules/auth/services/auth.service');
            const match = DEMO_USERS?.find((d: any) => d.user.id === parsed.id);
            if (match) {
              parsed = { ...match.user, ...parsed };
            }
          }
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed));
          localStorage.setItem("esp_auth_user", JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }

        // Load custom avatar if it exists
        const customAvatar = localStorage.getItem(`esp_custom_avatar_${parsed.id}`);
        if (customAvatar) {
          parsed.avatar = customAvatar;
        }

        if (parsed.primaryColor) {
          setColor(parsed.primaryColor as any);
        }

        store.setUser(parsed);
      } else {
        store.setUser(null);
        setColor(DEFAULT_PRIMARY_COLOR);
      }
    } catch {
      // ignore
    } finally {
      store.setLoading(false);
      store.setHydrated(true);
    }
  }, [store.hydrated, setColor]);

  const login = useCallback(async (identifier: string, password: string) => {
    store.setIsLoggingIn(true);
    try {
      const { user: loggedIn, token } = await api.auth.login({ identifier, password });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedIn));
      localStorage.setItem("esp_auth_user", JSON.stringify(loggedIn));
      store.setUser(loggedIn);
      
      if (loggedIn.primaryColor) {
        setColor(loggedIn.primaryColor as any);
      }
      
      return loggedIn;
    } finally {
      store.setIsLoggingIn(false);
    }
  }, [setColor]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem("esp_auth_user");
      store.setUser(null);
      setColor(DEFAULT_PRIMARY_COLOR);
    }
  }, [setColor]);

  const updatePrimaryColor = useCallback(async (color: string) => {
    setColor(color as any);
    if (!store.user) return;

    const updatedUser: User = { ...store.user, primaryColor: color };
    store.updateUser({ primaryColor: color });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
        localStorage.setItem("esp_auth_user", JSON.stringify(updatedUser));

        // Persist in mock database (esp_demo_users_override)
        const stored = localStorage.getItem("esp_demo_users_override");
        let users = stored ? JSON.parse(stored) : [];
        if (!users.length) {
          const { DEMO_USERS } = require('@/modules/auth/services/auth.service');
          users = JSON.parse(JSON.stringify(DEMO_USERS));
        }
        const idx = users.findIndex((u: any) => u.user.id === updatedUser.id);
        if (idx !== -1) {
          users[idx].user = { ...users[idx].user, primaryColor: color };
        } else {
          users.push({
            email: updatedUser.email || '',
            mobile: updatedUser.mobile || '',
            password: '',
            user: updatedUser,
          });
        }
        localStorage.setItem("esp_demo_users_override", JSON.stringify(users));

        // Also update in esp_user_profile if exists
        const storedProfile = localStorage.getItem("esp_user_profile");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.personal) {
            parsedProfile.personal.primaryColor = color;
            localStorage.setItem("esp_user_profile", JSON.stringify(parsedProfile));
          }
        }
      } catch {}

      // Fire and forget update to API services (for real backend mode compliance)
      try {
        api.user.updateProfile({ primaryColor: color }).catch(() => {});
        api.preferences.update({ primaryColor: color }).catch(() => {});
      } catch {}
    }
  }, [store.user, setColor]);

  return {
    user: store.user,
    loading: store.loading,
    isLoggingIn: store.isLoggingIn,
    login,
    logout,
    updateAvatar: store.updateAvatar,
    updateUser: store.updateUser,
    updatePrimaryColor,
  };
}

export function getAuthErrorKey(err: unknown): 'invalidCredentials' | 'invalidForm' {
  if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') return 'invalidCredentials';
  return 'invalidForm';
}
