// src/utils/englishDate.ts

// نام ماه‌های میلادی
const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// نام ماه‌های شمسی برای تبدیل
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
  const baseDate = new Date(622, 2, 21);
  
  // اضافه کردن روزها به تاریخ مبنا
  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + persianDays);
  
  return resultDate;
}

/**
 * تشخیص فرمت تاریخ و تبدیل به آبجکت تاریخ میلادی
 */
function parseToGregorian(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // حذف بخش زمان
  let cleanDate = dateStr.split(' ')[0].split('T')[0];
  
  // حذف کاراکترهای غیرعددی برای اعداد فارسی
  cleanDate = cleanDate.replace(/[^\d\/\-]/g, '');
  
  // بررسی فرمت شمسی با اعداد انگلیسی (مثال: 1403/02/15)
  let persianPattern = /^(13|14)(\d{2})[/\-](\d{1,2})[/\-](\d{1,2})/;
  let match = cleanDate.match(persianPattern);
  
  if (match) {
    const year = parseInt(match[1] + match[2]);
    const month = parseInt(match[3]);
    const day = parseInt(match[4]);
    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return persianToGregorian(year, month, day);
    }
  }
  
  // بررسی فرمت شمسی با اعداد فارسی
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let persianNumberStr = cleanDate;
  for (let i = 0; i < persianDigits.length; i++) {
    persianNumberStr = persianNumberStr.replace(new RegExp(persianDigits[i], 'g'), i.toString());
  }
  
  match = persianNumberStr.match(/^(13|14)(\d{2})[/\-](\d{1,2})[/\-](\d{1,2})/);
  if (match) {
    const year = parseInt(match[1] + match[2]);
    const month = parseInt(match[3]);
    const day = parseInt(match[4]);
    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return persianToGregorian(year, month, day);
    }
  }
  
  // بررسی فرمت میلادی (مثال: 2024-05-15 یا 2024/05/15)
  const gregorianPattern = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/;
  const gregorianMatch = cleanDate.match(gregorianPattern);
  
  if (gregorianMatch) {
    const year = parseInt(gregorianMatch[1]);
    const month = parseInt(gregorianMatch[2]);
    const day = parseInt(gregorianMatch[3]);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * فرمت تاریخ انگلیسی (میلادی)
 * مثال: May 15, 2024
 */
export function formatEnglishDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  
  try {
    const gregorianDate = parseToGregorian(dateStr);
    
    if (gregorianDate && !isNaN(gregorianDate.getTime())) {
      return gregorianDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // اگر نتوانستیم تبدیل کنیم، خود تاریخ را برگردان
    return dateStr;
    
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr;
  }
}

/**
 * فرمت تعداد بازدید انگلیسی
 * مثال: 1.5M, 2.3K, 500
 */
export function formatEnglishViews(views: number): string {
  if (!views || isNaN(views)) return '0';
  
  if (views >= 1000000) {
    const millions = views / 1000000;
    if (millions >= 10) {
      return `${Math.round(millions)}M`;
    }
    const rounded = Math.round(millions * 10) / 10;
    return `${rounded}M`;
  }
  
  if (views >= 1000) {
    const thousands = views / 1000;
    if (thousands >= 10) {
      return `${Math.round(thousands)}K`;
    }
    const rounded = Math.round(thousands * 10) / 10;
    return `${rounded}K`;
  }
  
  return views.toString();
}

/**
 * فرمت مدت زمان انگلیسی
 * مثال: 2:05, 1:23:45
 */
export function formatEnglishDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * تست توابع - در کنسول اجرا کنید
 */
export function testEnglishFunctions() {
  console.log('=== Test English Functions ===');
  console.log('formatEnglishDate("1403/02/15"):', formatEnglishDate('1403/02/15')); // May 5, 2024
  console.log('formatEnglishDate("۱۴۰۳/۰۲/۱۵"):', formatEnglishDate('۱۴۰۳/۰۲/۱۵')); // May 5, 2024
  console.log('formatEnglishDate("2024-05-15"):', formatEnglishDate('2024-05-15')); // May 15, 2024
  console.log('formatEnglishDate("2024/05/15"):', formatEnglishDate('2024/05/15')); // May 15, 2024
  console.log('formatEnglishViews(1500000):', formatEnglishViews(1500000)); // 1.5M
  console.log('formatEnglishViews(2300):', formatEnglishViews(2300)); // 2.3K
  console.log('formatEnglishViews(500):', formatEnglishViews(500)); // 500
  console.log('formatEnglishDuration(125):', formatEnglishDuration(125)); // 2:05
  console.log('formatEnglishDuration(3665):', formatEnglishDuration(3665)); // 1:01:05
}