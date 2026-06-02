'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrimaryColor } from '@/hooks/use-primary-color';

// Compact color swatch row, meant to live inside the sidebar.
export function PrimaryColorSwitcher({ className }: { className?: string }) {
  const t = useTranslations('Settings');
  const { colorId, setColor, presets } = usePrimaryColor();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {presets.map((preset) => {
        const active = colorId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => setColor(preset.id)}
            aria-pressed={active}
            aria-label={t(preset.labelKey)}
            title={t(preset.labelKey)}
            style={{ backgroundColor: preset.hsl }}
            className={cn(
              'flex size-6 items-center justify-center rounded-full transition-transform',
              'ring-offset-background hover:scale-110',
              active && 'ring-foreground ring-2 ring-offset-2',
            )}
          >
            {/* Check mark for the active swatch. White reads well on all 5 presets. */}
            {active && <Check className="size-3.5 text-white" />}
          </button>
        );
      })}
    </div>
  );
}
