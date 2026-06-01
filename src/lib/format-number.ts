/**
 * Locale codes supported by the app.
 * Extend this union when adding new locales.
 */
export type AppLocale = 'fa' | 'en';

/**
 * Maps Latin digits (0-9) to Persian digits (۰-۹).
 * Index of the array equals the digit value.
 */
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Convert every Latin digit in a string to its Persian equivalent.
 * Non-digit characters (like "/", "+", ".") are left untouched.
 */
export function toPersianDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

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
