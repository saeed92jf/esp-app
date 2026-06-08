// src/utils/textDirection.ts

export type TextDirection = 'rtl' | 'ltr';

// Arabic + Persian + Hebrew letter ranges (any of these means RTL content).
const RTL_CHAR = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
// Latin letters (incl. accented) used to detect pure-English text.
const LTR_CHAR = /[A-Za-z\u00C0-\u024F]/;

/**
 * Detect the base writing direction of a string.
 *
 * Rule (per product requirement):
 *  - If the text contains ANY Persian/Arabic/Hebrew letter, treat the whole
 *    string as RTL — even when it also contains English words/numbers
 *    (mixed content stays right-aligned like Persian).
 *  - Return 'ltr' ONLY when the text is purely Latin (no RTL letter at all).
 *  - Empty/missing text defaults to 'rtl' (Persian-first UI).
 */
export function getTextDirection(
  text: string | null | undefined,
): TextDirection {
  if (!text) return 'rtl'; // Persian-first default for empty/missing text.

  let hasLtr = false;

  // Scan the entire string instead of stopping at the first strong char,
  // so a leading English word never flips a Persian title to LTR.
  for (const ch of text) {
    if (RTL_CHAR.test(ch)) return 'rtl'; // Any RTL letter => whole text is RTL.
    if (!hasLtr && LTR_CHAR.test(ch)) hasLtr = true;
  }

  // No RTL letter found: LTR only if there was real Latin text, else default.
  return hasLtr ? 'ltr' : 'rtl';
}

// Map of Western (0-9) and Arabic-Indic digits to Persian (Farsi) digits.
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Convert all Western (0-9) and Arabic-Indic (٠-٩) digits in a string to
 * Persian digits (۰-۹). Non-digit characters are left untouched.
 */
export function toPersianDigits(text: string | null | undefined): string {
  if (!text) return '';

  return text.replace(/[0-9\u0660-\u0669]/g, (digit) => {
    // Western digits: charCode - 48 (e.g. '0' => 0). Arabic-Indic: -0x0660.
    const code = digit.charCodeAt(0);
    const value = code <= 57 ? code - 48 : code - 0x0660;
    return PERSIAN_DIGITS[value];
  });
}

/**
 * Localize the display form of a title:
 *  - Persian/mixed (RTL) titles get Persian digits.
 *  - Pure-English (LTR) titles keep their Western digits.
 */
export function localizeTitle(
  text: string | null | undefined,
  dir: TextDirection = getTextDirection(text),
): string {
  if (!text) return '';
  return dir === 'rtl' ? toPersianDigits(text) : text;
}

/**
 * Attach a computed `titleDir` and a localized `displayTitle` to any object
 * that has a `title` field. Call this once during API normalization so every
 * consumer reads precomputed values instead of recomputing per render.
 */
export function withTitleDirection<T extends { title: string }>(
  item: T,
): T & { titleDir: TextDirection; displayTitle: string } {
  const titleDir = getTextDirection(item.title);
  return {
    ...item,
    titleDir,
    // Persian/mixed titles render with Persian numerals; English stays as-is.
    displayTitle: localizeTitle(item.title, titleDir),
  };
}
