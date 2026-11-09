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
  /** Abbreviated brand name (ESP CORE instead of EUROSLOT PARS CORE) */
  short?: boolean;
  /** Custom subtitle class */
  subtitleClassName?: string;
}

/** Unified brand word component */
function BrandWord({ text }: { text: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center leading-none select-none bg-clip-text text-transparent uppercase font-sans font-bold',
        'bg-gradient-to-br from-[#444444] to-[#111111] dark:from-[#f4f4f5] dark:to-[#d4d4d8]'
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
  short = false,
  subtitleClassName,
}: LogoProps) {
  const locale = useLocale();
  // Logo is always displayed in English (LTR) regardless of the locale
  const isRtl = false;
  const rawId = React.useId();
  const gradientId = `core-logo-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const leadWord = short ? 'ESP' : 'EUROSLOT';
  const trailWord = short ? '' : 'PARS';
  const fullName = trailWord ? `${leadWord} ${trailWord}` : leadWord;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-stretch justify-center select-none w-fit',
        className
      )}
      role="img"
      aria-label={`${fullName} CORE`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Container for the main brand text + core */}
      <div className="inline-flex items-center justify-center leading-none w-full">
        {/* Uniform weight typography across the entire name in sans-serif */}
        <div
          className={cn(
            'inline-flex items-center justify-center font-sans font-bold tracking-[0.06em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] leading-none w-full whitespace-nowrap'
          )}
        >
          <BrandWord text={leadWord} />
          {trailWord && (
            <>
              <span className="inline-block w-[0.24em]">&nbsp;</span>
              <BrandWord text={trailWord} />
            </>
          )}
          <svg
            viewBox="0 0 2190.64 897.7"
            className="ms-[0.28em] h-[0.8em] w-auto inline-block self-center shrink-0 align-middle select-none"
            aria-label="CORE"
            role="img"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary-400, #38bdf8)" />
                <stop offset="50%" stopColor="var(--color-primary-500, #0284c7)" />
                <stop offset="100%" stopColor="var(--color-primary-600, #0369a1)" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradientId})`}
              fillRule="evenodd"
              d="M371.81,825.28c-163.24-47.55-282.11-198.11-282.11-375.63-.33-174.49,114.65-328.22,282.12-377.21,26.94-7.12,54.68-12.67,82.41-14.26H69.9v781.37h385.11c-28.52-1.6-56.26-6.37-83.2-14.27ZM1616.76,337.9c0-7.12-.8-14.25-1.59-21.39-14.27-75.27-95.1-73.69-95.1-73.69h-65.78v194.14h65.78c68.95,0,89.55-41.2,95.1-70.52,3.16-15.85,1.59-28.54,1.59-28.54ZM2120.73,272.94V58.18h-505.56c22.97,4.75,217.14,50.71,217.14,264.68,0,0-8.74,208.41-166.43,252.79l163.24,263.9h291.61v-203.68h-227.43v-85.59h227.43v-190.97h-227.43v-86.37h227.43ZM1009.73,52.63c-51.51,0-100.64,9.91-145.71,27.83-45.07,17.93-86.08,43.88-121.34,75.98,62.17,55.73,104.92,129.86,122.03,211.58h-252.78c-29.61-55.65-87.52-90.4-150.55-90.34-32.49,0-63.4,8.72-89.55,24.57-51.24,31.44-82.46,87.27-82.41,147.4,0,61.81,33.28,116.48,82.41,146.6,26.15,15.85,57.06,25.37,89.55,25.37,62.6,0,115.69-33.29,145.8-82.41h255.96c-19.01,79.24-61.81,148.98-120.45,202.08,70.52,64.16,164.03,103.79,267.04,103.79,218.72,0,396.21-177.53,396.21-395.43S1228.44,52.63,1009.73,52.63ZM1009.73,604.98c-85.59,0-155.33-69.74-155.33-155.33,0-86.38,69.75-156.12,155.33-156.12s155.31,69.74,155.31,156.12-68.94,155.33-155.31,155.33ZM1454.28,614.47v225.06h122.83l-122.83-225.06Z"
            />
          </svg>
        </div>
      </div>

      {/* Optional Subtitle - Exactly matching the main text width */}
      {showText && !compact && (
        <div
          className={cn(
            'flex justify-between items-center w-full mt-[0.5em] mb-[0.15em] text-[0.26em] sm:text-[0.3em] font-semibold uppercase text-muted-foreground dark:text-muted-foreground/90 select-none font-sans leading-none',
            subtitleClassName
          )}
          aria-label="Central Operations & Resource Environment"
        >
          {"Central Operations & Resource Environment".split('').map((char, idx) => (
            char === ' ' ? (
              <span key={idx} className="inline-block w-[0.3em] shrink-0" aria-hidden="true" />
            ) : (
              <span key={idx} className="inline-block leading-none" aria-hidden="true">
                {char}
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
}
