'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';

const HEARTBEAT_INTERVAL_MS = 25000; // 25 seconds

/**
 * Global Real-Time Presence Heartbeat Hook.
 * Seamlessly tracks user active state and announces online/offline to the backend.
 */
export function usePresence() {
  const { user } = useAuth();
  const lastPingRef = useRef<number>(0);

  const sendHeartbeat = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const now = Date.now();
      // Throttle: avoid spamming heartbeats more than once per 10s
      if (now - lastPingRef.current < 10000) return;
      lastPingRef.current = now;

      const token = typeof window !== 'undefined' ? localStorage.getItem('esp-auth-token') : null;

      await fetch('/api/real/users/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          status: 'active',
        }),
      });
    } catch {
      // Ignore background network errors
    }
  }, [user]);

  const sendOffline = useCallback(() => {
    if (!user || !user.id) return;
    try {
      const payload = JSON.stringify({ userId: user.id, email: user.email });
      const offlineUrl = '/api/real/users/offline';

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(offlineUrl, blob);
      } else {
        fetch(offlineUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;

    // 1. Initial heartbeat immediately upon mount / login
    sendHeartbeat();

    // 2. Periodic heartbeat interval
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);

    // 3. Tab visibility changes & window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    const handleFocus = () => {
      sendHeartbeat();
    };

    // 4. On tab/window close
    const handleBeforeUnload = () => {
      sendOffline();
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [user, sendHeartbeat, sendOffline]);

  return { sendHeartbeat, sendOffline };
}

/**
 * Top-level Presence Tracker Component mounted inside AppShell
 */
export function PresenceTracker() {
  usePresence();
  return null;
}
