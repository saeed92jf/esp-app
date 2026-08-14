// src/components/layout/settings-section.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Check, Monitor, Moon, Sun, Palette, User } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { PRIMARY_COLORS } from '@/config/settings';
import { usePrimaryColor } from '@/hooks/use-primary-color';

const MODE_OPTIONS = [
  { value: 'system', labelKey: 'system', icon: Monitor },
  { value: 'user', labelKey: 'user', icon: User },
] as const;

const THEME_OPTIONS = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
] as const;

/**
 * SettingsSection
 * Compact appearance controls embedded at the bottom of the side menu:
 *  - Mode switcher (system / user).
 *  - Theme switcher (light / dark) - locked in system mode.
 *  - Primary color picker rendered as colored swatches.
 */
export function SettingsSection() {
  const t = useTranslations('Settings');
  const tColors = useTranslations('Settings.colors');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { colorId, setColor } = usePrimaryColor();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode = theme === 'system' ? 'system' : 'user';

  const handleModeChange = (newMode: 'system' | 'user') => {
    if (newMode === 'system') {
      setTheme('system');
    } else {
      // Switch to user mode by explicitly setting to the current resolved theme
      setTheme(resolvedTheme || 'light');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (mode === 'system') {
      toast.info(t('themeLocked'));
      return;
    }
    setTheme(newTheme);
  };

  return (
    <div className="space-y-4">
      {/* ---- Mode switcher ---- */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">{t('mode')}</p>
        <div className="bg-background/80 dark:bg-background/40 border border-border/50 flex gap-1 rounded-lg p-1">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && mode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleModeChange(opt.value as 'system' | 'user')}
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

      {/* ---- Theme switcher ---- */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">{t('theme')}</p>
        <div className={cn("bg-background/80 dark:bg-background/40 border border-border/50 flex gap-1 rounded-lg p-1", mode === 'system' && "opacity-60")}>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            // The active theme is based on resolvedTheme so it reflects reality even in system mode
            const active = mounted && resolvedTheme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleThemeChange(opt.value as 'light' | 'dark')}
                aria-pressed={active}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  mode === 'system' && "cursor-not-allowed"
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


