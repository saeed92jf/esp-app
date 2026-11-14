// src/components/brand/logo.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Distinctive Brand Logo (COFFEE ZHEEN / کافه ژین)
// Modern Specialty Café & Roastery Branding

'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';

interface LogoProps {
  /** Extra classes — set font-size here to scale the whole logo */
  className?: string;
  /** Show optional subtitle underneath */
  showText?: boolean;
  /** Minimal compact version for navbar or small badges */
  compact?: boolean;
  /** Abbreviated brand name */
  short?: boolean;
  /** Custom subtitle class */
  subtitleClassName?: string;
  /** Custom badge text (defaults to 'CAFÉ') */
  badgeText?: string;
}

/** Unified brand word component */
function BrandWord({ text }: { text: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center leading-none select-none bg-clip-text text-transparent uppercase font-sans font-bold',
        'bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#71717a] dark:from-[#fafafa] dark:via-[#e4e4e7] dark:to-[#a1a1aa]'
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
  badgeText = 'CAFÉ',
}: LogoProps) {
  const locale = useLocale();

  const leadWord = 'COFFEE';
  const trailWord = 'ZHEEN';
  const fullName = `${leadWord} ${trailWord}`;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-stretch justify-center select-none w-fit group',
        className
      )}
      role="img"
      aria-label={`${fullName} ${badgeText}`}
      dir="ltr"
    >
      {/* Container for the main brand text + badge */}
      <div className="inline-flex items-center justify-start leading-none w-full gap-[0.25em]">
        {/* Subtle coffee icon glyph */}
        <div className="inline-flex items-center justify-center text-amber-500/90 dark:text-amber-400 drop-shadow-[0_1px_3px_rgba(245,158,11,0.25)]">
          <Coffee className="size-[1.1em] stroke-[2.2]" />
        </div>

        {/* Uniform weight typography across the entire name */}
        <div
          className={cn(
            'inline-flex items-center justify-center font-sans font-extrabold tracking-[0.07em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-none whitespace-nowrap'
          )}
        >
          <BrandWord text={leadWord} />
          <span className="inline-block w-[0.24em]">&nbsp;</span>
          <BrandWord text={trailWord} />

          <span 
            className="ms-[0.3em] inline-flex items-center justify-center font-sans font-bold uppercase tracking-[0.08em] leading-none px-[0.32em] py-[0.14em] rounded-[4px] text-white border border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-700 shadow-xs select-none self-center text-[0.7em]"
          >
            {badgeText}
          </span>
        </div>
      </div>

      {/* Subtitle */}
      {showText && !compact && (
        <div
          className={cn(
            'flex justify-between items-center w-full mt-[0.45em] mb-[0.1em] text-[0.26em] sm:text-[0.28em] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 dark:text-muted-foreground/70 select-none font-sans leading-none',
            subtitleClassName
          )}
          aria-label="Specialty Coffee & Artisan Roastery"
        >
          {"Specialty Coffee & Artisan Roastery".split('').map((char, idx) => (
            char === ' ' ? (
              <span key={idx} className="inline-block w-[0.25em] shrink-0" aria-hidden="true" />
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
