'use client';

import React from 'react';
import { detectLanguage, getDirectionByLanguage } from '@/utils/languageDetector';

interface AutoTextProps {
  text: string;
  className?: string;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
  dir?: 'rtl' | 'ltr' | 'auto';
}

export function AutoText({ text, className = '', as: Component = 'span', children, dir = 'auto' }: AutoTextProps) {
  const displayText = children || text;
  const detectedLang = detectLanguage(typeof displayText === 'string' ? displayText : '');
  const direction = dir === 'auto' ? getDirectionByLanguage(typeof displayText === 'string' ? displayText : '') : dir;
  
  let fontClass = '';
  switch (detectedLang) {
    case 'persian':
      fontClass = 'font-persian';
      break;
    case 'english':
      fontClass = 'font-english';
      break;
    case 'mixed':
      fontClass = 'font-mixed';
      break;
    default:
      fontClass = 'font-persian';
  }
  
  return (
    <Component 
      className={`${fontClass} ${className}`}
      dir={direction}
      lang={detectedLang === 'persian' ? 'fa' : 'en'}
    >
      {displayText}
    </Component>
  );
}