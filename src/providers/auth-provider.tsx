// src/providers/auth-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { fakeApi } from '@/lib/fake-api';
import type { LoginValues } from '@/lib/validations/auth';

// Public user shape exposed to the app (no sensitive fields).
export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
}

// Payload accepted by register (confirmPassword already stripped).
interface RegisterPayload {
  fullName: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // True until we finish reading the persisted session from storage.
  // Used by route guards to avoid redirect flicker on refresh.
  isHydrating: boolean;
  login: (values: LoginValues) => Promise<void>;
  register: (values: RegisterPayload) => Promise<void>;
  logout: () => void;
}

// Storage keys kept in one place to avoid typos across the app.
const STORAGE_KEYS = {
  user: 'esp-app.auth.user',
  token: 'esp-app.auth.token',
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // On mount, restore any persisted session from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      // Corrupted storage — clear it to recover gracefully.
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.token);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  // Centralized persistence helper for a successful auth result.
  const persistSession = useCallback((nextUser: AuthUser, token: string) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    localStorage.setItem(STORAGE_KEYS.token, token);
  }, []);

  // Login: calls fake-api and persists the returned session.
  const login = useCallback(
    async (values: LoginValues) => {
      const result = await fakeApi.login(values);
      persistSession(result.user, result.token);
    },
    [persistSession],
  );

  // Register: creates an account then keeps the user signed in.
  const register = useCallback(
    async (values: RegisterPayload) => {
      const result = await fakeApi.register(values);
      persistSession(result.user, result.token);
    },
    [persistSession],
  );

  // Logout: clears both in-memory state and persisted storage.
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isHydrating,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook with guard so misuse outside the provider fails loudly.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
