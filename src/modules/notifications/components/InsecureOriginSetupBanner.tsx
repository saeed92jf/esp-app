'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { X, Copy, Check, Bell, BellOff, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const LS_DISMISSED_KEY = 'esp_insecure_origin_dismissed';
const LS_SHOW_AGAIN_KEY = 'esp_insecure_origin_show_always';

type Browser = 'chrome' | 'edge' | 'brave' | 'opera' | 'firefox' | 'safari';

interface InsecureOriginSetupBannerProps {
  /** If true, shows the banner even if the user previously dismissed it (for settings panel re-open) */
  forceShow?: boolean;
  onClose?: () => void;
}

function detectBrowser(): Browser {
  if (typeof window === 'undefined') return 'chrome';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('opr') || ua.includes('opera')) return 'opera';
  if (ua.includes('brave') || (navigator as any).brave) return 'brave';
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  return 'chrome';
}

const BROWSER_LABELS: Record<Browser, string> = {
  chrome: 'Chrome',
  edge: 'Edge',
  brave: 'Brave',
  opera: 'Opera',
  firefox: 'Firefox',
  safari: 'Safari',
};

const BROWSER_ICONS: Record<Browser, string> = {
  chrome: '🌐',
  edge: '🔷',
  brave: '🦁',
  opera: '🔴',
  firefox: '🦊',
  safari: '🧭',
};

interface BrowserInstructions {
  flagUrl: string | null;
  steps: { fa: string; en: string }[];
  note?: { fa: string; en: string };
}

function getInstructions(browser: Browser, appUrl: string): BrowserInstructions {
  switch (browser) {
    case 'chrome':
    case 'brave':
    case 'opera':
      return {
        flagUrl: 'chrome://flags/#unsafely-treat-insecure-origin-as-secure',
        steps: [
          {
            fa: `آدرس زیر را کپی کرده و در نوار آدرس مرورگر وارد کنید:`,
            en: 'Copy and paste the following URL into your browser address bar:',
          },
          {
            fa: `در فیلد "Insecure origins treated as secure" آدرس سایت را وارد کنید: ${appUrl}`,
            en: `In the "Insecure origins treated as secure" field, enter the site URL: ${appUrl}`,
          },
          {
            fa: 'گزینه کناری را به "Enabled" تغییر دهید.',
            en: 'Change the adjacent dropdown to "Enabled".',
          },
          {
            fa: 'روی دکمه "Relaunch" در پایین صفحه کلیک کنید.',
            en: 'Click the "Relaunch" button at the bottom of the page.',
          },
        ],
      };
    case 'edge':
      return {
        flagUrl: 'edge://flags/#unsafely-treat-insecure-origin-as-secure',
        steps: [
          {
            fa: `آدرس زیر را کپی کرده و در نوار آدرس Edge وارد کنید:`,
            en: 'Copy and paste the following URL into your Edge address bar:',
          },
          {
            fa: `در فیلد "Insecure origins treated as secure" آدرس سایت را وارد کنید: ${appUrl}`,
            en: `In the "Insecure origins treated as secure" field, enter the site URL: ${appUrl}`,
          },
          {
            fa: 'گزینه کناری را به "Enabled" تغییر دهید.',
            en: 'Change the adjacent dropdown to "Enabled".',
          },
          {
            fa: 'روی دکمه "Restart" کلیک کنید.',
            en: 'Click the "Restart" button.',
          },
        ],
      };
    case 'firefox':
      return {
        flagUrl: 'about:config',
        steps: [
          {
            fa: `آدرس about:config را در Firefox باز کنید.`,
            en: 'Open about:config in Firefox.',
          },
          {
            fa: 'روی "Accept the Risk and Continue" کلیک کنید.',
            en: 'Click "Accept the Risk and Continue".',
          },
          {
            fa: 'در باکس جستجو عبارت dom.webnotifications.serviceworker.enabled را تایپ کنید.',
            en: 'Search for dom.webnotifications.serviceworker.enabled.',
          },
          {
            fa: 'روی آیکون toggle کلیک کنید تا مقدار به true تبدیل شود.',
            en: 'Click the toggle icon to set it to true.',
          },
        ],
        note: {
          fa: '⚠️ Firefox به صورت بومی از Web Notifications روی HTTP (بدون HTTPS) پشتیبانی کامل نمی‌کند.',
          en: '⚠️ Firefox does not natively support Web Notifications over plain HTTP without HTTPS.',
        },
      };
    case 'safari':
      return {
        flagUrl: null,
        steps: [
          {
            fa: 'Safari از تنظیمات flag برای اعلان روی HTTP پشتیبانی نمی‌کند.',
            en: 'Safari does not support flag-based notification override for HTTP origins.',
          },
          {
            fa: 'برای دریافت اعلان ویندوز، لطفاً از Chrome یا Edge استفاده کنید.',
            en: 'For desktop notifications, please use Chrome or Edge.',
          },
        ],
        note: {
          fa: '⚠️ برای اعلان کامل، اتصال HTTPS لازم است.',
          en: '⚠️ HTTPS is required for full notification support in Safari.',
        },
      };
  }
}

export function InsecureOriginSetupBanner({ forceShow = false, onClose }: InsecureOriginSetupBannerProps) {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const [visible, setVisible] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [selectedBrowser, setSelectedBrowser] = useState<Browser>('chrome');
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origin = window.location.origin;
    setAppUrl(origin);
    setSelectedBrowser(detectBrowser());
    setNotifEnabled(Notification.permission === 'granted');

    const isInsecure = window.location.protocol !== 'https:';
    const isDismissed = localStorage.getItem(LS_DISMISSED_KEY) === 'true';

    if (forceShow || (isInsecure && !isDismissed)) {
      setVisible(true);
    }
  }, [forceShow]);

  const handleDismiss = useCallback((permanent: boolean) => {
    if (permanent) {
      localStorage.setItem(LS_DISMISSED_KEY, 'true');
    } else {
      sessionStorage.setItem(LS_DISMISSED_KEY, 'session');
    }
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setNotifEnabled(result === 'granted');
    } else {
      setNotifEnabled(Notification.permission === 'granted');
    }
    localStorage.setItem(LS_DISMISSED_KEY, 'true');
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const copyToClipboard = useCallback((text: string, type: 'flag' | 'url') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'flag') {
        setCopiedFlag(true);
        setTimeout(() => setCopiedFlag(false), 2000);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    }).catch(() => {});
  }, []);

  const handleResetDismiss = useCallback(() => {
    localStorage.removeItem(LS_DISMISSED_KEY);
    sessionStorage.removeItem(LS_DISMISSED_KEY);
    setVisible(true);
  }, []);

  if (!visible) return null;

  const instructions = getInstructions(selectedBrowser, appUrl);
  const browsers: Browser[] = ['chrome', 'edge', 'brave', 'opera', 'firefox', 'safari'];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[480px] z-[9999] shadow-2xl rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800 dark:border-amber-700 overflow-hidden"
      role="dialog"
      aria-label={isRtl ? 'راهنمای فعال‌سازی اعلان مرورگر' : 'Browser Notification Setup Guide'}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-700">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-amber-900 dark:text-amber-200 truncate">
            {isRtl ? 'راهنمای فعال‌سازی اعلان ویندوز' : 'Enable Windows Notifications'}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {isRtl ? 'سایت روی HTTP است — یک تنظیم ساده لازم است' : 'Site is on HTTP — a quick browser flag setup is needed'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            title={isRtl ? (expanded ? 'جمع کردن' : 'باز کردن') : (expanded ? 'Collapse' : 'Expand')}
          >
            {expanded ? <ChevronDown className="w-4 h-4 text-amber-700 dark:text-amber-300" /> : <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-300" />}
          </button>
          <button
            onClick={() => handleDismiss(false)}
            className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            title={isRtl ? 'بستن' : 'Close'}
          >
            <X className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Notification Status Row */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/60 dark:bg-zinc-700/40 border border-amber-100 dark:border-zinc-600">
            <div className="flex items-center gap-2">
              {notifEnabled ? (
                <Bell className="w-4 h-4 text-green-500" />
              ) : (
                <BellOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                {isRtl
                  ? (notifEnabled ? '✅ اعلان ویندوز فعال است' : '❌ اعلان ویندوز غیرفعال یا مسدود است')
                  : (notifEnabled ? '✅ Notifications are granted' : '❌ Notifications are blocked or not set')}
              </span>
            </div>
            {!notifEnabled && (
              <button
                onClick={handleConfirm}
                className="text-xs px-2 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                {isRtl ? 'درخواست مجوز' : 'Request'}
              </button>
            )}
          </div>

          {/* App URL Display */}
          <div>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              {isRtl ? 'آدرس سایت شما:' : 'Your app URL:'}
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 px-3 py-2">
              <span className="flex-1 text-xs font-mono text-zinc-700 dark:text-zinc-100 truncate select-all">{appUrl}</span>
              <button
                onClick={() => copyToClipboard(appUrl, 'url')}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title={isRtl ? 'کپی آدرس' : 'Copy URL'}
              >
                {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Browser Tabs */}
          <div>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
              {isRtl ? 'مرورگر خود را انتخاب کنید:' : 'Select your browser:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {browsers.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrowser(b)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                    selectedBrowser === b
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:border-amber-400'
                  }`}
                >
                  <span>{BROWSER_ICONS[b]}</span>
                  <span>{BROWSER_LABELS[b]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flag URL */}
          {instructions.flagUrl && (
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                {isRtl ? 'آدرس تنظیمات مرورگر:' : 'Browser flags URL:'}
              </p>
              <div className="flex items-center gap-2 bg-zinc-800 dark:bg-zinc-900 rounded-lg px-3 py-2">
                <span className="flex-1 text-xs font-mono text-green-300 truncate select-all">{instructions.flagUrl}</span>
                <button
                  onClick={() => copyToClipboard(instructions.flagUrl!, 'flag')}
                  className="shrink-0 text-zinc-400 hover:text-green-300 transition-colors"
                  title={isRtl ? 'کپی آدرس' : 'Copy'}
                >
                  {copiedFlag ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                {isRtl
                  ? '⚠️ این آدرس را باید در نوار آدرس مرورگر وارد کنید (کلیک‌پذیر نیست)'
                  : '⚠️ Paste this in the browser address bar (links to chrome:// are blocked)'}
              </p>
            </div>
          )}

          {/* Step-by-step instructions */}
          <div>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
              {isRtl ? 'مراحل تنظیم:' : 'Setup steps:'}
            </p>
            <ol className="space-y-2">
              {instructions.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed">
                    {isRtl ? step.fa : step.en}
                  </p>
                </li>
              ))}
            </ol>
            {instructions.note && (
              <p className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-800">
                {isRtl ? instructions.note.fa : instructions.note.en}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConfirm}
              className="flex-1 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors shadow"
            >
              {isRtl ? '✅ تایید کردم، فعال‌سازی' : '✅ Done, Activate'}
            </button>
            <button
              onClick={() => handleDismiss(false)}
              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-200 text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-600"
            >
              {isRtl ? 'بعداً' : 'Later'}
            </button>
            <button
              onClick={() => handleDismiss(true)}
              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 dark:text-zinc-400 text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-600"
            >
              {isRtl ? 'نمایش نده' : 'Don\'t show'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A small inline trigger button for settings panels.
 * Clicking it shows the InsecureOriginSetupBanner even if previously dismissed.
 */
export function InsecureOriginSettingsTrigger() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(localStorage.getItem(LS_DISMISSED_KEY) === 'true');
  }, []);

  const toggle = () => {
    if (isDismissed) {
      // Reset and show
      localStorage.removeItem(LS_DISMISSED_KEY);
      sessionStorage.removeItem(LS_DISMISSED_KEY);
      setIsDismissed(false);
      setShowBanner(true);
    } else {
      setShowBanner(v => !v);
    }
  };

  return (
    <>
      <button
        onClick={toggle}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium transition-colors"
      >
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-start">
          {isRtl ? 'راهنمای تنظیم اعلان مرورگر (HTTP)' : 'Browser Notification Setup (HTTP)'}
        </span>
        {isDismissed ? (
          <span className="text-[10px] text-zinc-400">{isRtl ? 'مخفی شده' : 'Hidden'}</span>
        ) : (
          <span className="text-[10px] text-green-500">{isRtl ? 'فعال' : 'Active'}</span>
        )}
      </button>
      {showBanner && (
        <InsecureOriginSetupBanner forceShow onClose={() => setShowBanner(false)} />
      )}
    </>
  );
}
