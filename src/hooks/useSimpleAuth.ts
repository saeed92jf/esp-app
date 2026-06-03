// src/hooks/useSimpleAuth.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { fakeApi } from '@/lib/fake-api';
import type { User, AppUser } from '@/types/auth';

const STORAGE_KEY = 'demo-auth-user';

/**
 * Minimal client-side auth backed by localStorage.
 * SECURITY: localStorage is not a secure session store — demo only.
 */
export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Restore persisted session on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // Corrupted value: start as guest.
    } finally {
      setLoading(false);
    }
  }, []);

  // Returns the user so callers can redirect without waiting for setState.
  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const loggedIn = await fakeApi.login(identifier, password);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fakeApi.logout();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, isLoggingIn, login, logout };
}
