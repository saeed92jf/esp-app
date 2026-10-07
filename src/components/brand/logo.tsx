// src/components/brand/logo.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Distinctive Brand Logo (EUROSLOT PARS ▼ / یورواسلات پارس ▼)
// Mathematically Centered Name with Uniform Weight & Floating Adjacent Primary Triangle

'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Extra classes — set font-size here to scale the whole logo (e.g. "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"). */
  className?: string;
  /** Show optional subtitle underneath */
  showText?: boolean;
  /** Minimal compact version for navbar or small badges */
  compact?: boolean;
}

/** Unified brand word component */
function BrandWord({ text }: { text: string }) {
  return (
    <span
      className={cn(
        'inline select-none bg-clip-text text-transparent',
        'bg-gradient-to-br from-[#555555] to-[#111111] dark:from-[#b3b3b3] dark:to-[#ffffff]'
      )}
    >
      {text}
    </span>
  );
}

export function Logo({
  className,
  showText = true,
  compact = false,
}: LogoProps) {
  const locale = useLocale();
  // Logo is always displayed in English (LTR) regardless of the locale
  const isRtl = false;

  const leadWord = 'EUROSLOT';
  const trailWord = 'PARS';
  const fullName = `${leadWord} ${trailWord}`;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center select-none cursor-default',
        className
      )}
      role="img"
      aria-label={`${fullName} core`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Container for the main brand text + core */}
      <div className="inline-flex items-center justify-center leading-none">
        {/* Uniform weight typography across the entire name */}
        <div
          className={cn(
            'inline-flex items-center justify-center font-semibold tracking-[-0.025em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]',
            isRtl ? 'font-sans tracking-normal text-[0.75em] leading-normal pb-[0.1em]' : 'lowercase font-sans italic leading-none'
          )}
          style={{
            fontFamily: isRtl
              ? "'Shabnam', 'Google Sans', sans-serif"
              : "'Open Sans', sans-serif",
          }}
        >
          <BrandWord text={leadWord} />
          <span className="inline-block w-[0.24em]">&nbsp;</span>
          <BrandWord text={trailWord} />
          <span className="inline-block w-[0.24em]">&nbsp;</span>
          <span 
            className="bg-clip-text text-transparent pe-[0.05em]"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--color-primary-400, #60a5fa) 0%, var(--color-primary-500, #3b82f6) 40%, var(--color-primary-700, #1d4ed8) 100%)'
            }}
          >
            core
          </span>
        </div>
      </div>

      {/* Optional Subtitle */}
      {showText && !compact && (
        <div
          className={cn(
            'flex justify-between w-full px-[0.5em] mt-[0.6em] mb-[0.2em] py-[0.15em] text-[0.18em] font-medium uppercase text-muted-foreground/80',
            isRtl && 'font-normal text-[0.2em]'
          )}
        >
          {"Central Operations & Resource Environment".split('').map((char, idx) => (
            <span key={idx} className={char === ' ' ? 'w-[0.4em]' : ''}>
              {char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
