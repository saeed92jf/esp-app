'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';

const HEARTBEAT_INTERVAL_MS = 25000; // 25 seconds regular ping
const ACTIVITY_THROTTLE_MS = 20000;  // 20 seconds throttle on user activity triggers
const MULTI_TAB_KEY = 'esp_active_browser_tabs';

/**
 * Helper to check and coordinate multi-tab sessions in the browser.
 * Prevents closing one tab from turning the user offline while other tabs are active.
 */
function getActiveTabCount(currentTabId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem(MULTI_TAB_KEY);
    if (!raw) return 1;
    const tabs: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    let alive = 0;
    for (const [id, lastSeen] of Object.entries(tabs)) {
      if (id !== currentTabId && now - lastSeen < 45000) {
        alive++;
      }
    }
    return alive;
  } catch {
    return 1;
  }
}

function registerTabHeartbeat(tabId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(MULTI_TAB_KEY);
    const tabs: Record<string, number> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    // Prune stale tabs older than 60s
    const cleaned: Record<string, number> = {};
    for (const [id, ts] of Object.entries(tabs)) {
      if (now - ts < 60000) {
        cleaned[id] = ts;
      }
    }
    cleaned[tabId] = now;
    localStorage.setItem(MULTI_TAB_KEY, JSON.stringify(cleaned));
  } catch {}
}

function unregisterTab(tabId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(MULTI_TAB_KEY);
    if (!raw) return 0;
    const tabs: Record<string, number> = JSON.parse(raw);
    delete tabs[tabId];
    localStorage.setItem(MULTI_TAB_KEY, JSON.stringify(tabs));
    const now = Date.now();
    let remainingAlive = 0;
    for (const ts of Object.values(tabs)) {
      if (now - ts < 45000) remainingAlive++;
    }
    return remainingAlive;
  } catch {
    return 0;
  }
}

/**
 * Global Real-Time Presence Heartbeat Hook.
 * Seamlessly tracks user active state, ensures continuous background presence,
 * coordinates across multiple tabs, and announces online/offline states to the backend.
 */
export function usePresence() {
  const { user } = useAuth();
  const lastPingRef = useRef<number>(0);
  const tabIdRef = useRef<string>('');

  useEffect(() => {
    tabIdRef.current = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const now = Date.now();
      // Throttle: avoid spamming heartbeats more than once per 5s
      if (now - lastPingRef.current < 5000) return;
      lastPingRef.current = now;

      // Update multi-tab registry
      if (tabIdRef.current) {
        registerTabHeartbeat(tabIdRef.current);
      }

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
          tabId: tabIdRef.current,
        }),
      });
    } catch {
      // Ignore background network errors
    }
  }, [user]);

  const sendOffline = useCallback(() => {
    if (!user || !user.id) return;
    try {
      // Multi-Tab Protection:
      // If user still has other open tabs in the browser, DO NOT send offline!
      const remainingTabs = unregisterTab(tabIdRef.current);
      if (remainingTabs > 0) {
        return;
      }

      const payload = JSON.stringify({
        userId: user.id,
        email: user.email,
        tabId: tabIdRef.current,
      });
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

    // 2. Continuous periodic heartbeat interval (works even when tab is backgrounded)
    const interval = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    // 3. Tab visibility changes & window focus (instant refresh on revisit)
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastPingRef.current > 5000) {
          sendHeartbeat();
        }
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastPingRef.current > 5000) {
        sendHeartbeat();
      }
    };

    // 4. User Interaction Listeners (activity awareness)
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastPingRef.current > ACTIVITY_THROTTLE_MS) {
        sendHeartbeat();
      }
    };

    // 5. On tab/window close
    const handleBeforeUnload = () => {
      sendOffline();
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Throttled active interaction detection
      window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
      window.addEventListener('keydown', handleUserInteraction, { passive: true });
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pointerdown', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
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
