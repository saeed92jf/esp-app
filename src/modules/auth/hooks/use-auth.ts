// src/hooks/use-auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Refactored to use Zustand to prevent state loss and UI flashing on client navigations.

'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { api, ApiError } from '@/services';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/core/types';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoggingIn: (isLoggingIn: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
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
}));

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Only hydrate once globally
    if (store.hydrated) return;
    
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) {
        let parsed = JSON.parse(raw) as User;
        
        // Sync with fake API mock users (so you see new changes without relogging)
        try {
          const { DEMO_USERS } = require('@/modules/auth/services/auth.service');
          const match = DEMO_USERS?.find((d: any) => d.user.id === parsed.id);
          if (match) {
            parsed = { ...parsed, ...match.user };
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          // ignore
        }

        store.setUser(parsed);
      }
    } catch {
      // ignore
    } finally {
      store.setLoading(false);
      store.setHydrated(true);
    }
  }, [store.hydrated]);

  const login = useCallback(async (identifier: string, password: string) => {
    store.setIsLoggingIn(true);
    try {
      const { user: loggedIn, token } = await api.auth.login({ identifier, password });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedIn));
      store.setUser(loggedIn);
      return loggedIn;
    } finally {
      store.setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      store.setUser(null);
    }
  }, []);

  return {
    user: store.user,
    loading: store.loading,
    isLoggingIn: store.isLoggingIn,
    login,
    logout,
  };
}

export function getAuthErrorKey(err: unknown): 'invalidCredentials' | 'invalidForm' {
  if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') return 'invalidCredentials';
  return 'invalidForm';
}
