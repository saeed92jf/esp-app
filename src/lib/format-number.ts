/**
 * Locale codes supported by the app.
 * Extend this union when adding new locales.
 */
export type AppLocale = 'fa' | 'en';

import { toPersianDigits } from '@/utils/textDirection';
/**
 * Format a number according to the active locale using Intl.NumberFormat.
 * - fa: groups with the Persian thousands separator and Persian digits
 * - en: standard "en-US" grouping with Latin digits
 */
export function formatNumber(value: number, locale: AppLocale): string {
  const formatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US');
  return formatter.format(value);
}

/**
 * Format a number or numeric string consistently according to active locale / direction.
 * If isRtl is true (Persian), outputs Persian digits (e.g. 12 -> ۱۲, 1,300 -> ۱،۳۰۰).
 * If isRtl is false (English), outputs English digits (e.g. ۱۲ -> 12, ۱،۳۰۰ -> 1,300).
 */
export function formatLocaleNumber(
  value: number | string | null | undefined,
  isRtl: boolean,
): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'number') {
    return value.toLocaleString(isRtl ? 'fa-IR' : 'en-US');
  }

  const str = String(value);

  if (isRtl) {
    const persianMap: Record<string, string> = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
      ',': '،',
    };
    return str.replace(/[0-9,]/g, (ch) => persianMap[ch] || ch);
  } else {
    const westernMap: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '،': ',',
    };
    return str.replace(/[۰-۹٠-٩،]/g, (ch) => westernMap[ch] || ch);
  }
}

/**
 * Localize a suffix string for display.
 *
 * Handles three cases:
 * 1. Multiplier suffixes ("k", "m") -> spelled-out words per locale
 * 2. Ratio suffixes that contain digits (e.g. "/7") -> digits localized
 * 3. Plain symbols ("+", "%") -> returned unchanged
 *
 * @param suffix - raw suffix from the StatItem
 * @param locale - active locale
 * @returns a display-ready, locale-aware suffix
 */
export function localizeSuffix(
  suffix: string | undefined,
  locale: AppLocale,
): string {
  if (!suffix) return '';

  const normalized = suffix.trim().toLowerCase();

  // Case 1: known multiplier words
  const multiplierMap: Record<string, { fa: string; en: string }> = {
    k: { fa: ' هزار', en: 'k' },
    m: { fa: ' میلیون', en: 'M' },
    b: { fa: ' میلیارد', en: 'B' },
  };

  if (multiplierMap[normalized]) {
    return multiplierMap[normalized][locale];
  }

  // Case 2: suffix contains digits (e.g. "/7", "24/7")
  if (/[0-9]/.test(suffix)) {
    return locale === 'fa' ? toPersianDigits(suffix) : suffix;
  }

  // Case 3: plain symbol, return as-is
  return suffix;
}
