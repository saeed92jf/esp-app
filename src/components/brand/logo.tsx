// src/components/brand/logo.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Extra classes — set font-size here to scale the whole logo (e.g. "text-2xl md:text-4xl"). */
  className?: string;
  /** Show the wordmark text next to the icon mark. */
  showText?: boolean;
  /** Override the wordmark. Defaults to Common.appName from i18n. */
  label?: string;
  /** Override the single glyph inside the square. Defaults per-locale config below. */
  mark?: string;
}

/**
 * Per-locale glyph settings for the square mark.
 * Persian and Latin letters have different optical centers and ideal sizes,
 * so x/y/fontSize are tuned independently here. Adjust freely per language.
 */
const GLYPH_CONFIG: Record<
  string,
  { char: string; x: number; y: number; fontSize: number }
> = {
  // Latin "E": sits dead-center, slightly larger cap height looks balanced
  en: { char: 'E', x: 24, y: 25, fontSize: 24 },
  // Persian "و": nudged up/right a touch and sized down to feel centered
  fa: { char: 'و', x: 24, y: 18, fontSize: 26 },
};

// Fallback used when the active locale has no entry above
const DEFAULT_GLYPH = GLYPH_CONFIG.en;

/**
 * Brand logo — single source of truth for header, footer and home page.
 * Wordmark and the in-square glyph are locale-aware via next-intl, so they
 * switch automatically when the active language changes. The whole logo
 * scales from the parent's font-size (h-[1em]), keeping it responsive.
 */
export function Logo({ className, showText = true, label, mark }: LogoProps) {
  const t = useTranslations('Common');
  const locale = useLocale();

  // Wordmark text: pulled from i18n unless explicitly overridden
  const text = label ?? t('appName');

  // Resolve per-locale glyph settings (char + position + size)
  const glyphConfig = GLYPH_CONFIG[locale] ?? DEFAULT_GLYPH;

  // Allow overriding just the character via prop, keep this locale's positioning
  const glyphChar = mark ?? glyphConfig.char;

  return (
    <span
      className={cn('text-primary inline-flex items-center gap-2', className)}
      role="img"
      aria-label={text}
    >
      {/* Icon mark: height follows current font-size; gradient uses currentColor (theme-aware) */}
      <svg
        viewBox="0 0 48 48"
        className="h-[1em] w-auto shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="logoGrad"
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="url(#logoGrad)"
        />
        {/* Locale-aware glyph: position/size come from GLYPH_CONFIG for this locale */}
        <text
          x={glyphConfig.x}
          y={glyphConfig.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={glyphConfig.fontSize}
          fontWeight="700"
          className="font-sans select-none"
        >
          {glyphChar}
        </text>
      </svg>

      {showText && (
        // Wordmark: smaller on desktop (md+) to keep header compact; no letter-spacing
        // so Persian letters stay joined; leading-tight avoids vertical clipping
        <span className="text-foreground text-[0.8em] leading-tight font-bold md:text-[0.62em]">
          {text}
        </span>
      )}
    </span>
  );
}
