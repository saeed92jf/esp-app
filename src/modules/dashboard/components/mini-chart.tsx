// src/components/dashboard/mini-chart.tsx
'use client';

import { useTranslations } from 'next-intl';
import type { ChartPoint } from '../services/dashboard.service';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl px-3.5 py-2.5 text-sm">
      <p className="text-muted-foreground text-[11px] font-medium mb-1">{label}</p>
      <p className="font-bold text-foreground text-base">
        {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
}

// ─── MiniChart ────────────────────────────────────────────────────────────────

export function MiniChart({ data }: { data: ChartPoint[] }) {
  const t = useTranslations('Dashboard');

  const chartData = data.map((p) => ({
    name: t(`months.${p.labelKey}`),
    value: p.value,
  }));

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 h-full flex flex-col  "
    >
      <div className="mb-3 @sm:mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm @sm:text-base">{t('chartTitle')}</h3>
          <p className="text-muted-foreground text-[10px] @sm:text-xs mt-0.5">{t('chartSubtitle')}</p>
        </div>
        {/* Peak indicator */}
        <div
          className="text-right ltr:pr-8 rtl:pl-8"
        >
          <p className="text-lg @sm:text-2xl font-bold text-primary">{max.toLocaleString()}</p>
          <p className="text-[9px] @sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('peak')}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#colorValue)"
              dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-background)', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
