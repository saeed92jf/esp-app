'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

const POLL_INTERVAL_MS = 10000; // 10 seconds
const SEEN_NOTIFS_STORAGE_KEY = 'esp_seen_desktop_notifications';

/**
 * Synthesizes a crisp, elegant dual-tone chime (A5 -> E6) using the Web Audio API.
 * 100% self-contained, zero external audio asset dependencies.
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    // Pleasant harmonized bell chime: 880Hz (A5) ascending to 1318.5Hz (E6)
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.1);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.start(now);
    osc.stop(now + 0.38);
  } catch {
    // Audio autoplay might be blocked before first user gesture
  }
}

/**
 * Spawns a native Windows Desktop Toast Notification via standard Web Notification API.
 */
export function triggerDesktopNotification({
  title,
  body,
  icon = '/favicon.ico',
  tag,
  actionUrl,
  onClick,
}: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  actionUrl?: string;
  onClick?: () => void;
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || `esp-${Date.now()}`,
      silent: false, // Allows Windows Action Center / Toast audio
    });

    notif.onclick = () => {
      try {
        window.focus();
      } catch {}
      if (onClick) onClick();
      notif.close();
    };
  } catch (err) {
    console.warn('[DesktopNotification] Native notification failed:', err);
  }
}

/**
 * Global Desktop & Windows Notification Coordinator.
 * Runs silently in AppShell, listens for incoming notifications,
 * plays a clean chime, delivers native Windows toasts, and updates the header popover.
 */
export function DesktopNotificationManager() {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);
  const promptShownRef = useRef<boolean>(false);

  // Initialize seen IDs from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(SEEN_NOTIFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          seenIdsRef.current = new Set(parsed);
        }
      }
    } catch {}
  }, []);

  const saveSeenIds = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(seenIdsRef.current).slice(-150);
      sessionStorage.setItem(SEEN_NOTIFS_STORAGE_KEY, JSON.stringify(arr));
    } catch {}
  }, []);

  // Request desktop notification permission on first user click if not determined yet
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          toast.success(
            isRtl
              ? 'اعلان‌های ویندوز با موفقیت فعال شد'
              : 'Windows Desktop Notifications Enabled',
            { duration: 4000 }
          );
        }
      } catch {}
    }
  }, [isRtl]);

  // Polite non-intrusive prompt toast on login if permission is default
  useEffect(() => {
    if (!user || promptShownRef.current) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      promptShownRef.current = true;
      const timer = setTimeout(() => {
        toast.info(
          isRtl
            ? 'دریافت اعلان‌های زنده در ویندوز'
            : 'Get Real-Time Windows Notifications',
          {
            description: isRtl
              ? 'برای اطلاع آنی از تسک‌ها و پیام‌های جدید حتی هنگام کار با سایر نرم‌افزارها، اعلان ویندوز را فعال کنید.'
              : 'Stay informed about new tasks and comments even when working in other apps.',
            action: {
              label: isRtl ? 'فعال‌سازی' : 'Enable',
              onClick: () => requestPermission(),
            },
            duration: 8000,
          }
        );
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [user, isRtl, requestPermission]);

  // Global click listener to trigger permission prompt seamlessly
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    const handleFirstGesture = () => {
      requestPermission();
      window.removeEventListener('click', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
    };
  }, [requestPermission]);

  // Real-Time Notification Poller
  useEffect(() => {
    if (!user || !user.id) return;

    const fetchLatestNotifications = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('esp-auth-token') : null;
        const res = await fetch('/api/real/notifications?unreadOnly=true&limit=20', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        const notifs = data.notifications || data.data || [];
        if (!Array.isArray(notifs)) return;

        // On first run, seed all currently existing unread notifications so we don't spam the user
        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          for (const n of notifs) {
            if (n && n.id) {
              seenIdsRef.current.add(String(n.id));
            }
          }
          saveSeenIds();
          return;
        }

        // Detect genuinely new notifications
        const incoming: any[] = [];
        for (const n of notifs) {
          if (!n || !n.id) continue;
          const idStr = String(n.id);
          // Filter out legacy mock IDs
          if (['notif-1', 'notif-2', 'notif-3', 'notif-sys-1', 'notif-admin-1', 'notif-admin-req'].includes(idStr)) {
            continue;
          }
          if (!seenIdsRef.current.has(idStr) && !n.read) {
            seenIdsRef.current.add(idStr);
            incoming.push(n);
          }
        }

        if (incoming.length > 0) {
          saveSeenIds();

          // 1. Play clean chime sound
          playNotificationChime();

          // 2. Process each new notification
          for (const item of incoming.slice(0, 3)) {
            const title = isRtl ? (item.titleFa || item.title || 'اعلان جدید') : (item.titleEn || item.title || 'New Notification');
            const body = isRtl ? (item.descriptionFa || item.description || '') : (item.descriptionEn || item.description || '');
            const actionUrl = item.actionUrl;

            // Native Windows Notification Toast
            triggerDesktopNotification({
              title,
              body,
              icon: '/favicon.ico',
              tag: item.id,
              onClick: () => {
                if (actionUrl) router.push(actionUrl);
              },
            });

            // In-App Sonner Toast
            toast(title, {
              description: body,
              action: actionUrl
                ? {
                    label: isRtl ? 'مشاهده' : 'View',
                    onClick: () => router.push(actionUrl),
                  }
                : undefined,
              duration: 6000,
            });

            // Announce to Header Popover Bell
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('esp_notification_added', { detail: item })
              );
            }
          }
        }
      } catch {
        // Ignore background polling errors
      }
    };

    // Run first check immediately after 1.5s
    const initTimer = setTimeout(fetchLatestNotifications, 1500);
    const interval = setInterval(fetchLatestNotifications, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [user, isRtl, router, saveSeenIds]);

  return null;
}

