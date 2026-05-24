// src/utils/persianDate.ts

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// تعداد روزهای ماه‌های شمسی
const persianMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

/**
 * تبدیل عدد به حروف فارسی
 */
export function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, d => persianDigits[parseInt(d)]);
}

/**
 * بررسی سال کبیسه شمسی
 */
function isPersianLeapYear(year: number): boolean {
  const remainder = year % 33;
  return remainder === 1 || remainder === 5 || remainder === 9 || remainder === 13 || remainder === 17 || remainder === 22 || remainder === 26 || remainder === 30;
}

/**
 * تبدیل تاریخ شمسی به میلادی
 */
function persianToGregorian(year: number, month: number, day: number): Date {
  // روزهای ماه‌های میلادی
  const gregorianMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // تعداد روزهای سال شمسی
  let persianDays = 0;
  
  // روزهای سال‌های گذشته
  for (let y = 1; y < year; y++) {
    persianDays += isPersianLeapYear(y) ? 366 : 365;
  }
  
  // روزهای ماه‌های گذشته در سال جاری
  for (let m = 1; m < month; m++) {
    persianDays += persianMonthDays[m - 1];
    if (m === 12 && isPersianLeapYear(year)) {
      persianDays += 1; // اسفند در سال کبیسه ۳۰ روز است
    }
  }
  
  // روزهای ماه جاری
  persianDays += day - 1;
  
  // تاریخ مبنا: ۱ فروردین ۱ شمسی = ۲۱ مارس ۶۲۲ میلادی
  const baseDate = new Date(622, 2, 21); // 21 March 622
  
  // اضافه کردن روزها به تاریخ مبنا
  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + persianDays);
  
  return resultDate;
}

/**
 * تشخیص فرمت تاریخ و تبدیل به آبجکت تاریخ
 */
function parseDate(dateStr: string): { year: number; month: number; day: number; type: 'gregorian' | 'persian' } | null {
  if (!dateStr) return null;
  
  // حذف بخش زمان
  const cleanDate = dateStr.split(' ')[0].split('T')[0];
  
  // بررسی فرمت شمسی (مثال: 1403/02/15 یا 1403-02-15)
  const persianPattern = /^(13|14)(\d{2})[/\-](\d{1,2})[/\-](\d{1,2})/;
  const persianMatch = cleanDate.match(persianPattern);
  
  if (persianMatch) {
    const year = parseInt(persianMatch[1] + persianMatch[2]);
    const month = parseInt(persianMatch[3]);
    const day = parseInt(persianMatch[4]);
    return { year, month, day, type: 'persian' };
  }
  
  // بررسی فرمت میلادی (مثال: 2024-05-15 یا 2024/05/15)
  const gregorianPattern = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/;
  const gregorianMatch = cleanDate.match(gregorianPattern);
  
  if (gregorianMatch) {
    const year = parseInt(gregorianMatch[1]);
    const month = parseInt(gregorianMatch[2]);
    const day = parseInt(gregorianMatch[3]);
    return { year, month, day, type: 'gregorian' };
  }
  
  return null;
}

/**
 * فرمت تاریخ فارسی کامل - ترتیب: روز ماه سال
 * مثال: ۱۵ اردیبهشت ۱۴۰۳
 */
export function formatPersianDate(dateStr: string): string {
  if (!dateStr) return 'نامشخص';
  
  try {
    const parsed = parseDate(dateStr);
    
    if (!parsed) {
      console.warn('Could not parse date:', dateStr);
      return dateStr;
    }
    
    let persianYear: number, persianMonth: number, persianDay: number;
    
    if (parsed.type === 'persian') {
      // تاریخ قبلاً شمسی است
      persianYear = parsed.year;
      persianMonth = parsed.month;
      persianDay = parsed.day;
    } else {
      // تبدیل میلادی به شمسی
      const date = new Date(parsed.year, parsed.month - 1, parsed.day);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      // محاسبه تقریبی تاریخ شمسی (ساده شده)
      const persian = gregorianToPersianApproximate(date);
      persianYear = persian.year;
      persianMonth = persian.month;
      persianDay = persian.day;
    }
    
    // اعتبارسنجی
    if (persianMonth < 1 || persianMonth > 12) {
      return dateStr;
    }
    
    const persianYearStr = toPersianNumber(persianYear);
    const persianMonthName = persianMonths[persianMonth - 1];
    const persianDayStr = toPersianNumber(persianDay);
    
    return `${persianDayStr} ${persianMonthName} ${persianYearStr}`;
    
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr;
  }
}

/**
 * تبدیل تقریبی میلادی به شمسی (با استفاده از Intl)
 */
function gregorianToPersianApproximate(date: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  
  const parts = formatter.formatToParts(date);
  
  let year = 0;
  let month = 0;
  let day = 0;
  
  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value);
    if (part.type === 'month') month = parseInt(part.value);
    if (part.type === 'day') day = parseInt(part.value);
  }
  
  return { year, month, day };
}

/**
 * فرمت تعداد بازدید فارسی
 */
export function formatPersianViews(views: number): string {
  if (!views || isNaN(views)) return '۰';
  
  if (views >= 1000000) {
    const millions = views / 1000000;
    let formatted: string;
    
    if (millions >= 10) {
      formatted = toPersianNumber(Math.round(millions));
    } else {
      formatted = toPersianNumber(Math.round(millions * 10) / 10);
      formatted = formatted.replace(/\.۰$/, '');
    }
    return `${formatted} میلیون`;
  }
  
  if (views >= 1000) {
    const thousands = views / 1000;
    let formatted: string;
    
    if (thousands >= 10) {
      formatted = toPersianNumber(Math.round(thousands));
    } else {
      formatted = toPersianNumber(Math.round(thousands * 10) / 10);
      formatted = formatted.replace(/\.۰$/, '');
    }
    return `${formatted} هزار`;
  }
  
  return toPersianNumber(views);
}

/**
 * فرمت مدت زمان فارسی
 */
export function formatPersianDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '۰:۰۰';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${toPersianNumber(hours)}:${toPersianNumber(minutes).padStart(2, '۰')}:${toPersianNumber(secs).padStart(2, '۰')}`;
  }
  return `${toPersianNumber(minutes)}:${toPersianNumber(secs).padStart(2, '۰')}`;
}

/**
 * تست توابع
 */
export function testPersianFunctions() {
  console.log('=== Test Persian Functions ===');
  
  // تست تاریخ‌های شمسی
  console.log('formatPersianDate("1403/02/15"):', formatPersianDate('1403/02/15')); // ۱۵ اردیبهشت ۱۴۰۳
  console.log('formatPersianDate("1403/12/29"):', formatPersianDate('1403/12/29')); // ۲۹ اسفند ۱۴۰۳
  
  // تست تاریخ‌های میلادی
  console.log('formatPersianDate("2024-05-15"):', formatPersianDate('2024-05-15')); // ۲۶ اردیبهشت ۱۴۰۳
  console.log('formatPersianDate("2024-03-20"):', formatPersianDate('2024-03-20')); // ۱ فروردین ۱۴۰۳
  
  // تست فرمت‌های مختلف
  console.log('formatPersianDate("1403/02/15 14:30:00"):', formatPersianDate('1403/02/15 14:30:00'));
  console.log('formatPersianDate("2024-05-15T12:00:00Z"):', formatPersianDate('2024-05-15T12:00:00Z'));
  
  // تست تعداد بازدید
  console.log('formatPersianViews(1500000):', formatPersianViews(1500000));
  console.log('formatPersianViews(2300):', formatPersianViews(2300));
  console.log('formatPersianViews(500):', formatPersianViews(500));
  
  // تست مدت زمان
  console.log('formatPersianDuration(125):', formatPersianDuration(125));
  console.log('formatPersianDuration(3665):', formatPersianDuration(3665));
}