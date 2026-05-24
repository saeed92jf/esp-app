'use client';

import { useState, useEffect } from 'react';
import { detectLanguage, getDirectionByLanguage, getFontClassByLanguage } from '@/utils/languageDetector';

export function useLanguageDetection(text: string) {
  const [language, setLanguage] = useState<'persian' | 'english' | 'mixed' | 'unknown'>('unknown');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [fontClass, setFontClass] = useState<string>('');
  
  useEffect(() => {
    const detected = detectLanguage(text);
    setLanguage(detected);
    setDirection(getDirectionByLanguage(text));
    setFontClass(getFontClassByLanguage(text));
  }, [text]);
  
  return { language, direction, fontClass };
}