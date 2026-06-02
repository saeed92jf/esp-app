// src/components/layout/settings-section.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Check, Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRIMARY_COLORS } from '@/config/settings';
import { usePrimaryColor } from '@/hooks/use-primary-color';

// Theme options rendered as a 3-way segmented control.
// `value` matches the next-themes API ('light' | 'dark' | 'system').
const THEME_OPTIONS = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
] as const;

/**
 * SettingsSection
 * Compact appearance controls embedded at the bottom of the side menu:
 *  - Theme switcher (light / dark / system) via next-themes.
 *  - Primary color picker rendered as colored swatches.
 *
 * Theme-dependent UI is gated behind `mounted` to prevent a
 * hydration mismatch (the server can't know the resolved theme).
 */
export function SettingsSection() {
  const t = useTranslations('Settings');
  const tColors = useTranslations('Settings.colors');
  const { theme, setTheme } = useTheme();
  const { colorId, setColor } = usePrimaryColor();

  // next-themes is client-only; render the active state post-mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-3 px-4 py-3">
      {/* ---- Section label ---- */}
      <p className="text-muted-foreground text-xs font-medium">{t('title')}</p>

      {/* ---- Theme switcher: segmented control ---- */}
      <div className="bg-muted/60 flex gap-1 rounded-lg p-1">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = mounted && theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-pressed={active}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              <span>{t(opt.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* ---- Primary color swatches ---- */}
      <div className="flex items-center gap-2">
        {PRIMARY_COLORS.map((preset) => {
          const active = colorId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setColor(preset.id)}
              aria-pressed={active}
              aria-label={tColors(preset.labelKey)}
              title={tColors(preset.labelKey)}
              // Inline HSL preview keeps the swatch in sync with the token.
              style={{ backgroundColor: `hsl(${preset.hsl})` }}
              className={cn(
                'ring-offset-background relative flex size-7 items-center justify-center rounded-full transition-transform hover:scale-110',
                active && 'ring-ring ring-2 ring-offset-2',
              )}
            >
              {active ? (
                <Check className="size-4 text-white" strokeWidth={3} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
