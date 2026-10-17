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
          <span 
            className="ms-[0.25em] inline-flex items-center justify-center font-sans font-bold uppercase tracking-[0.06em] leading-none px-[0.26em] py-[0.08em] rounded-none text-white border border-white/20 dark:border-transparent bg-gradient-logo shadow-2xs select-none self-center"
            style={{
              backgroundImage: 'var(--gradient-logo)'
            }}
          >
            CORE
          </span>
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
