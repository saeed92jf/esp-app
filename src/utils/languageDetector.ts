// src/utils/languageDetector.ts

/**
 * تشخیص کاراکتر فارسی
 */
export const isPersianChar = (char: string): boolean => {
  const persianRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRegex.test(char);
};

/**
 * تشخیص کاراکتر انگلیسی
 */
export const isEnglishChar = (char: string): boolean => {
  const englishRegex = /[a-zA-Z]/;
  return englishRegex.test(char);
};

/**
 * تشخیص زبان متن (فارسی یا انگلیسی)
 * @returns 'persian' | 'english' | 'mixed' | 'unknown'
 */
export const detectLanguage = (text: string): 'persian' | 'english' | 'mixed' | 'unknown' => {
  if (!text) return 'unknown';
  
  let persianCount = 0;
  let englishCount = 0;
  let totalCount = 0;
  
  for (const char of text) {
    if (isPersianChar(char)) {
      persianCount++;
      totalCount++;
    } else if (isEnglishChar(char)) {
      englishCount++;
      totalCount++;
    }
  }
  
  if (totalCount === 0) return 'unknown';
  
  const persianRatio = persianCount / totalCount;
  const englishRatio = englishCount / totalCount;
  
  if (persianRatio > 0.7) return 'persian';
  if (englishRatio > 0.7) return 'english';
  if (persianRatio > 0 && englishRatio > 0) return 'mixed';
  
  return 'unknown';
};

/**
 * دریافت کلاس CSS مناسب برای متن
 */
export const getFontClassByLanguage = (text: string): string => {
  const lang = detectLanguage(text);
  
  switch (lang) {
    case 'persian':
      return 'font-persian text-right';
    case 'english':
      return 'font-english text-left';
    case 'mixed':
      return 'font-mixed text-right';
    default:
      return 'font-persian text-right';
  }
};

/**
 * دریافت direction مناسب برای متن
 */
export const getDirectionByLanguage = (text: string): 'rtl' | 'ltr' => {
  const lang = detectLanguage(text);
  return lang === 'english' ? 'ltr' : 'rtl';
};