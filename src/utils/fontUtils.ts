// src/utils/fontUtils.ts
export const isPersian = (text: string): boolean => {
  const persianRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRegex.test(text);
};

export const isEnglish = (text: string): boolean => {
  const englishRegex = /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()]+$/;
  return englishRegex.test(text);
};

export const getFontClass = (text: string): string => {
  if (!text) return 'english-text';
  return isPersian(text) ? 'persian-text' : 'english-text';
};

export const getDirection = (text: string): 'rtl' | 'ltr' => {
  return isPersian(text) ? 'rtl' : 'ltr';
};