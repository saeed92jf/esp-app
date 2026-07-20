// src/hooks/use-auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// جایگزین useSimpleAuth.ts قدیمی. از لایه api/ استفاده می‌کند تا با تغییر
// API_MODE به 'real'، بدون تغییر کد همین‌جا به سرور واقعی وصل شود.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/services';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/core/types';
import type { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // بازیابی session ذخیره‌شده هنگام mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // مقدار خراب — کاربر مهمان فرض می‌شود
    } finally {
      setLoading(false);
    }
  }, []);

  /** کاربر را برمی‌گرداند تا caller بدون انتظار برای setState ریدایرکت کند. */
  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const { user: loggedIn, token } = await api.auth.login({ identifier, password });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedIn));
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // حتی اگر سرور خطا داد، session محلی پاک می‌شود
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    }
  }, []);

  return { user, loading, isLoggingIn, login, logout };
}

// خطای login را به پیام i18n-friendly تبدیل می‌کند
export function getAuthErrorKey(err: unknown): 'invalidCredentials' | 'invalidForm' {
  if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') return 'invalidCredentials';
  return 'invalidForm';
}
