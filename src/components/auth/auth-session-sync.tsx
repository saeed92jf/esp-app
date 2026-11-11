// src/components/auth/auth-session-sync.tsx
'use client';

import { useEffect } from 'react';
import { syncAuthToken } from '@/lib/auth/token-storage';

/**
 * Headless client component that guarantees synchronization between
 * localStorage and HTTP cookies across all tabs and page navigations.
 */
export function AuthSessionSync() {
  useEffect(() => {
    syncAuthToken();
  }, []);

  return null;
}

