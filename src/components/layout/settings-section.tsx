// src/components/layout/settings-section.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Check, Monitor, Moon, Sun, Palette } from 'lucide-react';

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
    <div className="space-y-3">
      {/* ---- Theme switcher: segmented control ---- */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">{t('theme')}</p>
        <div className="bg-background/80 dark:bg-background/40 border border-border/50 flex gap-1 rounded-lg p-1">
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
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                <Icon className="size-3.5" />
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Primary color swatches ---- */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Palette className="size-3" />
          <span>{t('color')}</span>
        </div>
        <div className="flex items-center justify-between gap-2 px-1">
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
                style={{ backgroundColor: preset.hex }}
                className={cn(
                  'ring-offset-background relative flex size-7 items-center justify-center rounded-full transition-all hover:scale-110 shadow-xs',
                  active && 'ring-ring ring-2 ring-offset-2 scale-105',
                )}
              >
                {active ? (
                  <Check className="size-3.5 text-white drop-shadow-xs" strokeWidth={3} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

