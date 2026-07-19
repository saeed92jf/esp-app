export function formatDuration(durationInSeconds: number): string {
  const m = Math.floor(durationInSeconds / 60);
  const s = Math.floor(durationInSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViews(views: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(views);
}

// ─── توابع تبدیل اعداد به حروف ──────────────────────────────────────────────

function getPersianWord(num: number): string {
  if (num === 0) return "صفر";
  if (num < 0) return "منفی " + getPersianWord(Math.abs(num));

  const ones = [
    "",
    "یک",
    "دو",
    "سه",
    "چهار",
    "پنج",
    "شش",
    "هفت",
    "هشت",
    "نه",
    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده",
  ];
  const tens = [
    "",
    "ده",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود",
  ];
  const hundreds = [
    "",
    "صد",
    "دویست",
    "سیصد",
    "چهارصد",
    "پانصد",
    "ششصد",
    "هفتصد",
    "هشتصد",
    "نهصد",
  ];

  if (num < 20) return ones[num];

  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return tens[t] + (o > 0 ? " و " + ones[o] : "");
  }

  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    return hundreds[h] + (rem > 0 ? " و " + getPersianWord(rem) : "");
  }

  return num.toString();
}

function toLatinDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 1584));
}

// ─── توابع تقویم شمسی ──────────────────────────────────────────────────────

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// تبدیل تاریخ شمسی به میلادی برای محاسبه دقیق زمان سپری شده
function jalaliToGregorian(jy: number, jm: number, jd: number) {
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4);
  for (let i = 0; i < jm - 1; ++i) days += j_days_in_month[i];
  days += jd - 1;
  let gy2 = gy + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    days--;
    gy2 += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy2 += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy2 += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0 ? 1 : 0;
  g_days_in_month[1] += leap;
  let gm = 0;
  while (gm < 12 && gd > g_days_in_month[gm]) {
    gd -= g_days_in_month[gm];
    gm++;
  }
  return [gy2, gm + 1, gd];
}

function parsePersianDateToTimestamp(dateStr: string): number | null {
  const normalized = toLatinDigits(dateStr.trim());

  // حالت متنی (مثل: 25 تیر 1405)
  const parts = normalized.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1];
    const year = parseInt(parts[2], 10);

    const monthIndex = PERSIAN_MONTHS.indexOf(monthName) + 1;
    if (monthIndex > 0 && !isNaN(day) && !isNaN(year)) {
      const [gy, gm, gd] = jalaliToGregorian(year, monthIndex, day);
      return new Date(gy, gm - 1, gd).getTime();
    }
  }

  // حالت عددی (مثل: 1405-04-25)
  const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (y > 1300 && y < 1500) {
      const [gy, gm, gd] = jalaliToGregorian(y, m, d);
      return new Date(gy, gm - 1, gd).getTime();
    }
  }

  return null;
}

// ─── تابع اصلی محاسبه زمان نسبی ─────────────────────────────────────────────

export function formatRelativeTime(
  timestamp: number | undefined | null,
  tr: any,
  sdate?: string,
): string {
  const isFa = tr("unknown") === "نامشخص";

  const processSdate = (str: string) => {
    if (!isFa) return str;
    const latinStr = toLatinDigits(str);
    // اگر از سمت سرور خودش "پیش" داشت، فقط اعدادش را فارسی کن
    if (/(پیش|دقیقه|ساعت|روز|ماه|سال)/.test(latinStr)) {
      return latinStr.replace(/\d+/g, (match) =>
        getPersianWord(parseInt(match, 10)),
      );
    }
    return str;
  };

  const format = (key: string, val: number) => {
    if (isFa) return tr(key, { value: getPersianWord(val) });
    return tr(key, { value: val });
  };

  let finalTimestamp = timestamp;

  // اگر تایم‌استمپ صفر یا نامعتبر بود (یعنی تاریخ شمسی بوده که در جاوااسکریپت پارس نشده)
  if (
    !finalTimestamp ||
    finalTimestamp === 0 ||
    finalTimestamp < 0 ||
    finalTimestamp > 2000000000000
  ) {
    if (sdate) {
      const latinSdate = toLatinDigits(sdate);

      if (latinSdate.includes("پیش")) {
        return processSdate(sdate);
      }

      // تبدیل "25 تیر 1405" به زمان استاندارد
      const parsedTs = parsePersianDateToTimestamp(sdate);
      if (parsedTs) {
        finalTimestamp = parsedTs;
      } else {
        return processSdate(sdate);
      }
    } else {
      return tr("unknown");
    }
  }

  const secondsPast = Math.floor((Date.now() - finalTimestamp) / 1000);

  // محاسبه بازه زمانی
  if (secondsPast < 0) return tr("justNow") || "همین الان";
  if (secondsPast < 60) return format("second", Math.max(1, secondsPast));

  const mins = Math.floor(secondsPast / 60);
  if (mins < 60) return format("minute", mins);

  const hours = Math.floor(mins / 60);
  if (hours < 24) return format("hour", hours);

  const days = Math.floor(hours / 24);
  if (days < 30) return format("day", days);

  const months = Math.floor(days / 30);
  if (months < 12) return format("month", months);

  const years = Math.floor(days / 365);
  return format("year", years);
}
