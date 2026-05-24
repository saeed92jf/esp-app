'use client';

import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightText({ text, query, className = '' }: HighlightTextProps) {
  if (!query || query.length < 2 || !text) {
    return <span className={className}>{text}</span>;
  }
  
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span className={className}>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-warning-400/60 text-warning-900 dark:text-warning-100 px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  } catch {
    return <span className={className}>{text}</span>;
  }
}