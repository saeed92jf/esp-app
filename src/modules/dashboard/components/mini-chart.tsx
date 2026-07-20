// src/components/dashboard/mini-chart.tsx
'use client';

import { useTranslations } from 'next-intl';
import type { ChartPoint } from '@/lib/fake-dashboard';

export function MiniChart({ data }: { data: ChartPoint[] }) {
  const t = useTranslations('Dashboard');
  // Normalize bar heights against the largest value; guard against 0.
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{t('chartTitle')}</h3>
        <span className="text-muted-foreground text-xs">
          {t('chartSubtitle')}
        </span>
      </div>
      {/* CSS-only bar chart: bar height encodes value as a % of max */}
      <div className="flex h-40 items-end gap-2">
        {data.map((p) => (
          <div
            key={p.labelKey}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className="from-primary/40 to-primary w-full rounded-t-md bg-linear-to-t transition-[height] duration-500 hover:opacity-80"
                style={{ height: `${(p.value / max) * 100}%` }}
                title={String(p.value)}
              />
            </div>
            <span className="text-muted-foreground text-[10px]">
              {t(`months.${p.labelKey}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
