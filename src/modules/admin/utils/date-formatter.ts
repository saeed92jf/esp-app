/**
 * Date formatting and bidirectional Jalali <-> Gregorian conversion utilities
 * tailored for admin requests and applicant profiles in bilingual (FA/EN) mode.
 */

export function toAsciiDigits(val: string): string {
  if (!val) return "";
  return val
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

/**
 * Astronomical Jalali to Gregorian conversion (Borkowski algorithm)
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    days -= v;
  }
  return [gy, gm, gd];
}

/**
 * Astronomical Gregorian to Jalali conversion (Borkowski algorithm)
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

/**
 * Formats a submission timestamp (e.g. req.requestedAt) according to locale:
 * - Persian mode (isRtl): Solar Hijri date, e.g. "۱۴۰۵/۰۸/۰۵"
 * - English mode (!isRtl): Gregorian date with English digits, e.g. "2026/10/26"
 */
export function formatRequestSubmissionDate(
  dateStr: string | null | undefined,
  isRtl: boolean
): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (isRtl) {
      return d.toLocaleDateString("fa-IR");
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Converts stored date string (e.g. birthDate, joinDate) to the active locale format.
 * - In English mode (!isRtl): If date is Jalali (year < 1700), converts to Gregorian "YYYY/MM/DD" with Latin digits.
 * - In Persian mode (isRtl): If date is Gregorian (year >= 1700), converts to Jalali "YYYY/MM/DD".
 */
export function formatDateFieldForLocale(
  dateStr: string | null | undefined,
  isRtl: boolean
): string {
  if (!dateStr) return "";
  const cleaned = toAsciiDigits(dateStr.trim()).replace(/-/g, "/");
  const parts = cleaned.split("/").map((p) => parseInt(p, 10));

  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const [y, m, d] = parts;
    if (!isRtl) {
      // English mode: needs Gregorian (>= 1700) with English digits
      if (y < 1700 && y > 1200) {
        try {
          const [gy, gm, gd] = jalaliToGregorian(y, m, d);
          return `${gy}/${String(gm).padStart(2, "0")}/${String(gd).padStart(2, "0")}`;
        } catch {
          return cleaned;
        }
      }
      return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
    } else {
      // Persian mode: needs Jalali (< 1700)
      if (y >= 1700) {
        try {
          const [jy, jm, jd] = gregorianToJalali(y, m, d);
          return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
        } catch {
          return cleaned;
        }
      }
      return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
    }
  }

  // 4-digit year (e.g. graduationYear)
  if (parts.length === 1 && !isNaN(parts[0]) && cleaned.length === 4) {
    const y = parts[0];
    if (!isRtl && y < 1700 && y > 1200) {
      return String(y + 621);
    }
    if (isRtl && y >= 1700) {
      return String(y - 621);
    }
    return String(y);
  }

  return cleaned;
}
