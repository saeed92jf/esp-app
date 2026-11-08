'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

const CHIME_THROTTLE_MS = 2800;
const SEEN_NOTIFS_STORAGE_KEY = 'esp_seen_desktop_notifications';
const LS_INSECURE_DISMISSED = 'esp_insecure_origin_dismissed';
let lastChimeTime = 0;

/**
 * Synthesizes a crisp, elegant dual-tone chime (A5 -> E6) using the Web Audio API.
 * Deduplicated with cross-tab throttling so no duplicate chime ever plays.
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem('esp_desktop_notifications_enabled') === 'false') return;
  } catch {}
  const now = Date.now();

  // 1. Cross-tab & intra-tab deduplication lock
  try {
    const stored = localStorage.getItem('esp_last_chime_time');
    if (stored && now - Number(stored) < CHIME_THROTTLE_MS) return;
    localStorage.setItem('esp_last_chime_time', String(now));
  } catch {}

  if (now - lastChimeTime < CHIME_THROTTLE_MS) return;
  lastChimeTime = now;

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

    const audioNow = ctx.currentTime;
    // Pleasant harmonized bell chime: 880Hz (A5) ascending to 1318.5Hz (E6)
    osc.frequency.setValueAtTime(880, audioNow);
    osc.frequency.exponentialRampToValueAtTime(1318.5, audioNow + 0.1);
    gain.gain.setValueAtTime(0.18, audioNow);
    gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.38);

    osc.start(audioNow);
    osc.stop(audioNow + 0.38);
  } catch {
    // Audio autoplay might be blocked before first user gesture
  }
}

/**
 * Spawns a native Windows Desktop Toast Notification via ServiceWorker or Web Notification API.
 * silent: true ensures Windows Action Center doesn't play its OS ding over our chime.
 */
export async function triggerDesktopNotification({
  title,
  body,
  icon = '/esp-core-fav-icon.svg',
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
  try {
    if (localStorage.getItem('esp_desktop_notifications_enabled') === 'false') return;
  } catch {}
  if (Notification.permission !== 'granted') return;

  // 1. Modern Service Worker registration path (persistent in Windows, unthrottled in background)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          tag: tag || `esp-${Date.now()}`,
          silent: true, // Prevents Windows default chime from doubling with Web Audio
          data: { url: actionUrl || '/' },
        });
        return;
      }
    } catch {}
  }

  // 2. Classic Notification API fallback
  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || `esp-${Date.now()}`,
      silent: true, // Prevents duplicate chime
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
 * Runs silently in AppShell, registers Service Worker,
 * uses an unthrottled Web Worker timer for background delivery,
 * deduplicates audio chimes, delivers native Windows toasts, and updates the header bell.
 */
export function DesktopNotificationManager() {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);
  const promptShownRef = useRef<boolean>(false);


  // Register Service Worker for Windows background notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('[SW] Service Worker registration failed:', err);
    });
  }, []);

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

  // Request desktop notification permission on user action
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.warning(
        isRtl
          ? 'مرورگر شما از سیستم اعلان ویندوز پشتیبانی نمی‌کند یا دسترسی محدود است.'
          : 'Your browser does not support desktop notifications.'
      );
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error(
        isRtl
          ? 'اعلان ویندوز در مرورگر مسدود است. لطفاً از آیکون کنار آدرس سایت دسترسی Notifications را روی Allow قرار دهید.'
          : 'Notifications are blocked. Please allow them in your browser site settings.'
      );
      return;
    }

    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        playNotificationChime();
        await triggerDesktopNotification({
          title: isRtl ? 'اعلان‌های ویندوز یورواسلات پارس' : 'Euroslot Pars Desktop Notifications',
          body: isRtl
            ? 'سیستم اعلان با موفقیت فعال شد. پیام‌ها و تسک‌های جدید به صورت آنی به ویندوز ارسال می‌شوند.'
            : 'Notifications enabled successfully.',
          actionUrl: '/tasks',
        });
        toast.success(
          isRtl
            ? 'اعلان‌های ویندوز با موفقیت فعال و تایید شد'
            : 'Windows Desktop Notifications Enabled & Verified',
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.warn('[DesktopNotification] Permission request failed:', err);
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
              ? 'برای دریافت آنی پیام‌های گفتگوی تسک‌ها حتی هنگام کوچک بودن پنجره مرورگر، اعلان ویندوز را فعال کنید.'
              : 'Stay informed about task discussions even when the browser is minimized.',
            action: {
              label: isRtl ? 'فعال‌سازی' : 'Enable',
              onClick: () => requestPermission(),
            },
            duration: 9000,
          }
        );
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [user, isRtl, requestPermission]);

  // Global click listener to trigger permission prompt seamlessly on first gesture
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

  // Expose global test trigger on window for debugging & UI buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__espTriggerTestNotification = async () => {
        playNotificationChime();
        await triggerDesktopNotification({
          title: isRtl ? 'تست اعلان ویندوز - سامانه ESP' : 'Test Notification - ESP Platform',
          body: isRtl ? 'این یک اعلان تستی از سیستم گفتگوی تسک‌ها است.' : 'This is a test notification from ESP.',
          actionUrl: '/tasks',
        });
      };
      (window as any).__espRequestNotificationPermission = requestPermission;
    }
  }, [isRtl, requestPermission]);

  // Real-Time Notification Poller via unthrottled Web Worker (continues running in background tabs & minimized windows)
  useEffect(() => {
    if (!user || !user.id) return;

    let worker: Worker | null = null;
    let fallbackInterval: any = null;

    const fetchLatestNotifications = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('esp-auth-token') : null;
        const queryParams = new URLSearchParams({
          unreadOnly: 'true',
          limit: '20',
          userId: String(user.id),
          role: String(user.role || 'user'),
        });

        // Use the real API endpoint /api/notifications
        const res = await fetch(`/api/notifications?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        const notifs = data.notifications || data.data || [];
        if (!Array.isArray(notifs)) return;

        // On first run, seed existing notifications so we don't spam the user
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
          // Filter out mock IDs
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

          // 1. Play deduplicated single chime sound
          playNotificationChime();

          // 2. Process each new notification
          for (const item of incoming.slice(0, 3)) {
            const title = isRtl ? (item.titleFa || item.title || 'اعلان جدید') : (item.titleEn || item.title || 'New Notification');
            const body = isRtl ? (item.descriptionFa || item.description || '') : (item.descriptionEn || item.description || '');
            const actionUrl = item.actionUrl;

            // Native Windows Notification Toast (ServiceWorker / Notification API)
            triggerDesktopNotification({
              title,
              body,
              icon: '/esp-core-fav-icon.svg',
              tag: item.id,
              actionUrl: actionUrl || '/tasks',
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

    // Instantiate unthrottled Web Worker
    try {
      if (typeof window !== 'undefined' && window.Worker) {
        worker = new Worker('/notification-worker.js');
        worker.onmessage = (e) => {
          if (e.data && e.data.type === 'tick') {
            fetchLatestNotifications();
          }
        };
        worker.postMessage({ action: 'start', interval: 5000 });
      }
    } catch {
      // Fallback
    }

    if (!worker) {
      fallbackInterval = setInterval(fetchLatestNotifications, 6000);
    }

    // Immediate sync on tab switch or window focus
    const handleFocusOrVisible = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchLatestNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);

    // Initial check after 1.2s
    const initTimer = setTimeout(fetchLatestNotifications, 1200);

    return () => {
      clearTimeout(initTimer);
      if (worker) {
        worker.postMessage({ action: 'stop' });
        worker.terminate();
      }
      if (fallbackInterval) clearInterval(fallbackInterval);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
    };
  }, [user, isRtl, router, saveSeenIds]);

  return null;
}


