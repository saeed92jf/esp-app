// src/utils/aparatUtils.tsx

import { VideoItem, Category, VideoListItem } from '@/types';

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatViews(views: number): string {
  if (!views || isNaN(views)) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

// Persian (Jalali) month names, index 0 = Farvardin.
const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

// English (Gregorian) month names, index 0 = January.
const englishMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Persian digit glyphs, index = digit value.
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Convert any number/numeric string into a string with Persian digits.
 * Only ASCII digits are mapped; other characters are preserved.
 */
function toPersianNumber(num: number | string): string {
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

/**
 * Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to Western (0-9)
 * so the raw value can be parsed by numeric regexes.
 */
function toEnglishDigits(text: string): string {
  return text
    .replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06f0).toString()) // Persian
    .replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString()); // Arabic-Indic
}

/**
 * Smart date formatter. Detects whether the incoming date is Jalali (Shamsi)
 * or Gregorian, then prints it in the matching calendar/locale:
 *
 *   - Shamsi    -> Persian month + Persian digits  ("۱۵ اردیبهشت ۱۴۰۳")
 *   - Gregorian -> English month + English digits   ("May 15, 2024")
 *
 * Aparat sends Shamsi dates with Latin digits (e.g. "1403/02/15"), so in
 * practice this almost always takes the Shamsi branch. The Gregorian branch
 * only fires when a non-13xx/14xx year actually arrives.
 *
 * Returns the original string if it cannot be parsed.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'نامشخص';

  try {
    // Drop any time portion ("2024-05-15 12:00" / "2024-05-15T12:00").
    let clean = dateStr.split(' ')[0].split('T')[0];

    // Convert Persian/Arabic digits to Western so the regex can match.
    clean = toEnglishDigits(clean);

    // Keep only digits and date separators.
    clean = clean.replace(/[^\d/\-]/g, '');

    // Generic "year sep month sep day" match (year is always 4 digits).
    const match = clean.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/);
    if (!match) return dateStr;

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    // Basic sanity check on month/day ranges.
    if (month < 1 || month > 12 || day < 1 || day > 31) return dateStr;

    // Years 1300-1499 are treated as Shamsi (Aparat uses Latin-digit Shamsi).
    const isShamsi = match[1].startsWith('13') || match[1].startsWith('14');

    if (isShamsi) {
      // Shamsi -> Persian month name + Persian digits.
      return `${toPersianNumber(day)} ${persianMonths[month - 1]} ${toPersianNumber(year)}`;
    }

    // Gregorian -> English month name + English digits.
    return `${englishMonths[month - 1]} ${day}, ${year}`;
  } catch {
    return dateStr;
  }
}

// Group videos by the category name attached during fetch. Categories keep
// their original order; anything without a category falls into "Uncategorized".
export function groupVideosByCategory(
  videos: VideoListItem[],
): Record<string, VideoListItem[]> {
  const grouped: Record<string, VideoListItem[]> = {};

  for (const video of videos) {
    // categoryName is set client-side by useAparatChannel; no casts needed.
    const key =
      video.categoryName && video.categoryName.trim().length > 0
        ? video.categoryName
        : 'Uncategorized';

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(video);
  }

  return grouped;
}

export function sortCategoryNames(categoryNames: string[]): string[] {
  return categoryNames.sort((a, b) => {
    if (a === 'All Videos') return -1;
    if (b === 'All Videos') return 1;
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });
}
