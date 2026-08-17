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
  showText = false,
  compact = false,
}: LogoProps) {
  const locale = useLocale();
  const t = useTranslations('Common.brand');
  const isRtl = locale === 'fa';

  const leadWord = t('euroslot');
  const trailWord = t('pars');
  const fullName = `${leadWord} ${trailWord}`;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center select-none cursor-default',
        className
      )}
      role="img"
      aria-label={`${fullName} ▼`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Relative container ensuring the brand name is 100% mathematically centered on screen */}
      <div className="relative inline-flex items-center justify-center leading-none">
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
        </div>

        {/* Inverted Triangle floating adjacent to the centered name */}
        <span
          className={cn(
            'absolute top-1/2 inline-flex items-center justify-center pointer-events-none select-none',
            isRtl ? 'start-full me-[0.05em] -translate-y-[30%]' : 'start-full ms-0 -translate-y-[10%]'
          )}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-[0.55em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Dynamic Site Primary Theme Gradient */}
              <linearGradient
                id="tri-site-primary-grad-centered"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary-400, #60a5fa)"
                />
                <stop
                  offset="40%"
                  stopColor="var(--color-primary-500, #3b82f6)"
                />
                <stop
                  offset="75%"
                  stopColor="var(--color-primary-600, #2563eb)"
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary-700, #1d4ed8)"
                />
              </linearGradient>
            </defs>
            <path
              d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z"
              fill="url(#tri-site-primary-grad-centered)"
            />
          </svg>
        </span>
      </div>

      {/* Optional Subtitle */}
      {showText && !compact && (
        <span
          className={cn(
            'mt-[0.25em] text-[0.22em] font-medium tracking-wider text-muted-foreground/90 uppercase text-center',
            isRtl && 'tracking-normal font-normal text-[0.26em]'
          )}
        >
          {t('engineeringPlatform')}
        </span>
      )}
    </div>
  );
}
