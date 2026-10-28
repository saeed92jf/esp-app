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
    
    const initAuth = async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("esp_demo_users_override");
        }

        const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
        if (token) {
          try {
            const user = await api.auth.me();
            if (user) {
              if (typeof window !== "undefined") {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
                localStorage.setItem("esp_auth_user", JSON.stringify(user));
              }
              if (user.primaryColor) {
                setColor(user.primaryColor as any);
              }
              store.setUser(user);
              return;
            }
          } catch (err: any) {
            if (err?.status === 401 || err?.code === "UNAUTHORIZED" || err?.code === "MISSING_TOKEN") {
              if (typeof window !== "undefined") {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem("esp-refresh-token");
                localStorage.removeItem(AUTH_USER_KEY);
                localStorage.removeItem("esp_auth_user");
              }
              store.setUser(null);
              setColor(DEFAULT_PRIMARY_COLOR);
              return;
            }
            if (typeof window !== "undefined") {
              const raw = localStorage.getItem(AUTH_USER_KEY);
              if (raw) {
                const cached = JSON.parse(raw) as User;
                store.setUser(cached);
                if (cached.primaryColor) setColor(cached.primaryColor as any);
                return;
              }
            }
          }
        }

        store.setUser(null);
        setColor(DEFAULT_PRIMARY_COLOR);
      } catch {
        store.setUser(null);
      } finally {
        store.setLoading(false);
        store.setHydrated(true);
      }
    };

    initAuth();
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

  const updateUser = useCallback((partial: Partial<User>) => {
    store.updateUser(partial);
    
    // Retrieve latest user from store or local storage fallback
    const currentUser = useAuthStore.getState().user || (
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem('esp_auth_user') || 'null')
        : null
    );

    if (!currentUser) return;

    const updatedUser: User = { ...currentUser, ...partial };
    useAuthStore.getState().setUser(updatedUser);

    if (partial.primaryColor) {
      setColor(partial.primaryColor as any);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
        localStorage.setItem("esp_auth_user", JSON.stringify(updatedUser));

        // Sync with esp_user_profile if exists
        const storedProfile = localStorage.getItem("esp_user_profile");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.personal) {
            if (partial.primaryColor) parsedProfile.personal.primaryColor = partial.primaryColor;
            if (partial.avatarColor) parsedProfile.personal.avatarColor = partial.avatarColor;
            localStorage.setItem("esp_user_profile", JSON.stringify(parsedProfile));
          }
        }

        if (partial.avatarColor) {
          window.dispatchEvent(new CustomEvent("esp_avatar_color_changed", { detail: { avatarColor: partial.avatarColor } }));
        }
      } catch {}
    }
  }, [setColor]);

  const updatePrimaryColor = useCallback(async (color: string) => {
    setColor(color as any);
    updateUser({ primaryColor: color });

    if (typeof window !== 'undefined') {
      // Fire and forget update to API services (for real backend mode compliance)
      try {
        api.user.updateProfile({ primaryColor: color }).catch(() => {});
        api.preferences.update({ primaryColor: color }).catch(() => {});
      } catch {}
    }
  }, [setColor, updateUser]);

  const updateAvatarColor = useCallback(async (color: string) => {
    updateUser({ avatarColor: color });

    if (typeof window !== 'undefined') {
      // Fire and forget update to API services (for real backend mode compliance)
      try {
        api.user.updateProfile({ avatarColor: color }).catch(() => {});
      } catch {}
    }
  }, [updateUser]);

  return {
    user: store.user,
    loading: store.loading,
    isLoggingIn: store.isLoggingIn,
    login,
    logout,
    updateAvatar: store.updateAvatar,
    updateAvatarColor,
    updateUser,
    updatePrimaryColor,
  };
}

export function getAuthErrorKey(err: unknown): 'invalidCredentials' | 'invalidForm' {
  if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') return 'invalidCredentials';
  return 'invalidForm';
}
