// src/components/brand/logo.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LogoMark } from './logo-mark';

interface LogoProps {
  /** Extra classes — set font-size here to scale the whole logo (e.g. "text-2xl md:text-4xl"). */
  className?: string;
  /** Show the wordmark text next to the icon mark. */
  showText?: boolean;
}

/**
 * Brand logo — single source of truth for header, footer and home page.
 *
 * Icon: <LogoMark /> is an inlined, theme-aware SVG (every shape uses
 * `fill="currentColor"`), so it always paints with the surrounding text color.
 * Here the wrapper carries `text-primary`, so the icon renders in the theme's
 * primary color regardless of the colors in the original logo.svg file.
 *
 * Wordmark: split into two i18n-driven segments ("lead" + "trail"); the locale
 * file decides which segment gets the primary color via "appName.accent". This
 * highlights a different part per language without ever splitting inside a word
 * (so Persian letter-joining stays intact):
 *   - fa: "وب اپلیکیشن" (primary) + "یورو اسلات پارس"
 *   - en: "ESP" + "web.app" (primary)
 */
export function Logo({ className, showText = true }: LogoProps) {
  const t = useTranslations('Common');

  // Two explicit wordmark segments + which one is the accent ('lead' | 'trail')
  const lead = t('appName.lead');
  const trail = t('appName.trail');
  const accent = t('appName.accent');

  // Full readable name for the accessibility label
  const fullName = `${lead} ${trail}`;

  return (
    <span
      className={cn('text-primary inline-flex items-center gap-2', className)}
      role="img"
      aria-label={fullName}
    >
      {/* Icon mark — inherits primary color from the wrapper via currentColor.
          Size follows the current font-size (1em) so it stays in sync with the
          wordmark when you scale the whole logo through `className`. */}
      <LogoMark className="h-[1em] w-[1em] shrink-0" />

      {showText && (
        // Wordmark: leading-tight avoids vertical clipping; no letter-spacing
        // so Persian letters stay joined. Segments render in document order,
        // so RTL/LTR direction is handled by the surrounding layout.
        <span className="text-[0.9em] leading-tight font-extrabold md:text-[0.65em]">
          <span
            className={accent === 'lead' ? 'text-primary' : 'text-foreground'}
          >
            {lead}
          </span>
          {/* Plain space between the two segments */}
          <span className="text-foreground"> </span>
          <span
            className={accent === 'trail' ? 'text-primary' : 'text-foreground'}
          >
            {trail}
          </span>
        </span>
      )}
    </span>
  );
}
