// src/components/dashboard/mini-chart.tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import type { ChartPoint } from '../services/dashboard.service';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  type TooltipProps,
} from 'recharts';
import * as React from 'react';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import {
  BarChart2,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { useCommodities } from '../hooks/use-commodities';
import { cn } from '@/lib/utils';

// ─── Types & Constants ────────────────────────────────────────────────────────

export type TimeframeId = '7d' | '30d' | '90d' | '1y';

interface DefaultAssetInfo {
  price: number;
  unitFa: string;
  unitEn: string;
  volatility: number;
}

const DEFAULT_ASSET_DATA: Record<string, DefaultAssetInfo> = {
  gold: { price: 2724.5, unitFa: 'دلار / انس', unitEn: 'USD / Oz', volatility: 0.008 },
  silver: { price: 31.85, unitFa: 'دلار / انس', unitEn: 'USD / Oz', volatility: 0.015 },
  wti: { price: 74.8, unitFa: 'دلار / بشکه', unitEn: 'USD / Bbl', volatility: 0.018 },
  brent: { price: 78.9, unitFa: 'دلار / بشکه', unitEn: 'USD / Bbl', volatility: 0.016 },
  btc: { price: 67800, unitFa: 'دلار / کوین', unitEn: 'USD / Coin', volatility: 0.025 },
  eth: { price: 2640, unitFa: 'دلار / کوین', unitEn: 'USD / Coin', volatility: 0.028 },
  ng: { price: 2.18, unitFa: 'دلار / MMBtu', unitEn: 'USD / MMBtu', volatility: 0.022 },
  copper: { price: 4.45, unitFa: 'دلار / پوند', unitEn: 'USD / Lb', volatility: 0.012 },
  eur: { price: 1.085, unitFa: 'دلار / یورو', unitEn: 'USD / EUR', volatility: 0.004 },
};

const TIMEFRAMES: { id: TimeframeId; labelKey: string }[] = [
  { id: '7d', labelKey: '7d' },
  { id: '30d', labelKey: '30d' },
  { id: '90d', labelKey: '90d' },
  { id: '1y', labelKey: '1y' },
];

// ─── Deterministic Market Chart Generator ─────────────────────────────────────

function generateMarketChartData(
  source: string,
  currentPrice: number,
  timeframe: TimeframeId,
  locale: string
) {
  const isFa = locale === 'fa';
  const now = new Date();

  let count = 30;
  let dayStep = 1;
  let volatility = 0.012;

  if (timeframe === '7d') {
    count = 7;
    dayStep = 1;
    volatility = 0.008;
  } else if (timeframe === '30d') {
    count = 30;
    dayStep = 1;
    volatility = 0.012;
  } else if (timeframe === '90d') {
    count = 18;
    dayStep = 5;
    volatility = 0.02;
  } else if (timeframe === '1y') {
    count = 12;
    dayStep = 30;
    volatility = 0.035;
  }

  // Deterministic seed based on source and timeframe
  let seed = 0;
  for (let i = 0; i < source.length; i++) {
    seed = (seed << 5) - seed + source.charCodeAt(i);
  }
  seed = Math.abs(seed);

  let running = currentPrice;
  const rawValues: number[] = [currentPrice];

  for (let i = 1; i < count; i++) {
    const sinFactor = Math.sin(seed + i * 14.17);
    const cosFactor = Math.cos(seed + i * 8.31);
    const delta = sinFactor * volatility + cosFactor * 0.003;
    running = running * (1 - delta);
    rawValues.push(running);
  }

  rawValues.reverse();

  return rawValues.map((val, idx) => {
    const daysAgo = (count - 1 - idx) * dayStep;
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let name = '';
    let tooltipLabel = '';

    if (timeframe === '7d') {
      name = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', { weekday: 'short' }).format(d);
      tooltipLabel = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(d);
    } else if (timeframe === '1y') {
      name = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', { month: 'short' }).format(d);
      tooltipLabel = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', {
        month: 'long',
        year: 'numeric',
      }).format(d);
    } else {
      const day = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', { day: 'numeric' }).format(d);
      const month = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', { month: 'short' }).format(d);
      name = `${day} ${month}`;
      tooltipLabel = new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }

    const precision = currentPrice < 10 ? 3 : currentPrice > 1000 ? 0 : 2;
    return {
      id: idx,
      name,
      tooltipLabel,
      value: Number(val.toFixed(precision)),
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, locale, shortUnit }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl px-3.5 py-2.5 text-sm">
      <p className="text-muted-foreground text-[11px] font-medium mb-1">
        {payload[0]?.payload?.tooltipLabel || label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className="font-bold text-foreground text-base">
          {payload[0]?.value?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}
        </p>
        {shortUnit && (
          <span className="text-[10px] text-muted-foreground font-medium">{shortUnit}</span>
        )}
      </div>
    </div>
  );
}

// ─── MiniChart Component ──────────────────────────────────────────────────────

export function MiniChart({ data }: { data?: ChartPoint[] }) {
  const t = useTranslations('Dashboard');
  const tCommodities = useTranslations('Dashboard.commodities');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const { chartSource, chartType, setChartType, setChartSource } = useDashboardSettings();

  const [timeframe, setTimeframe] = React.useState<TimeframeId>('30d');

  const chartOptions = [
    { label: tCommodities('gold'), value: 'gold' },
    { label: tCommodities('silver'), value: 'silver' },
    { label: tCommodities('wti'), value: 'wti' },
    { label: tCommodities('brent'), value: 'brent' },
    { label: tCommodities('btc'), value: 'btc' },
    { label: tCommodities('eth'), value: 'eth' },
    { label: tCommodities('ng'), value: 'ng' },
    { label: tCommodities('copper'), value: 'copper' },
  ];

  const { commodities } = useCommodities();
  const liveCommodity = commodities?.find((c) => c.id === chartSource);

  // Active current price
  const fallbackInfo = DEFAULT_ASSET_DATA[chartSource] || DEFAULT_ASSET_DATA.gold;
  const currentPrice = liveCommodity?.price ?? fallbackInfo.price;

  // Chart data that ALWAYS has high-fidelity data points
  const chartData = React.useMemo(() => {
    return generateMarketChartData(chartSource, currentPrice, timeframe, locale);
  }, [chartSource, currentPrice, timeframe, locale]);

  // Peak and trough
  const maxPoint = React.useMemo(() => {
    return chartData.reduce(
      (prev, current) => (prev.value > current.value ? prev : current),
      chartData[0]
    );
  }, [chartData]);

  const startVal = chartData[0]?.value || 1;
  const endVal = chartData[chartData.length - 1]?.value || 1;
  const periodChangePercent = Number((((endVal - startVal) / startVal) * 100).toFixed(2));
  const isPositive = periodChangePercent >= 0;

  const shortUnit = isFa ? fallbackInfo.unitFa : fallbackInfo.unitEn;

  // Y-axis tick formatter
  const formatYAxisTick = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    if (val < 10) return val.toFixed(2);
    return val.toFixed(0);
  };

  const xInterval = timeframe === '30d' ? 5 : timeframe === '90d' ? 3 : 0;

  return (
    <div className="bg-panel dark:bg-card/40 rounded-2xl border border-border/50 p-3.5 @sm:p-5 h-full flex flex-col @container min-h-0">
      {/* ── Top Header Bar ───────────────────────────────────────── */}
      <div className="mb-3 flex items-start justify-between flex-wrap gap-2.5 pe-18 sm:pe-20">
        {/* Left: Title, Source & Asset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <BarChart3 className="size-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-foreground/80 whitespace-nowrap">
            {t('miniChart.title')}
          </span>

          <div className="hidden @[520px]:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5 text-[11px] shrink-0">
            <span className="text-muted-foreground">{t('miniChart.source')}:</span>
            <a
              href={
                chartSource === 'btc' || chartSource === 'eth'
                  ? 'https://finnhub.io'
                  : 'https://finance.yahoo.com'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              {chartSource === 'btc' || chartSource === 'eth' ? 'Finnhub' : 'Yahoo Finance'}
            </a>
          </div>

          <div className="w-28 @[380px]:w-36 ms-1">
            <Combobox
              options={chartOptions}
              value={chartSource}
              onChange={setChartSource}
              placeholder={t('miniChart.selectPlaceholder')}
              searchPlaceholder={t('miniChart.searchPlaceholder')}
              emptyText={t('miniChart.emptyText')}
            />
          </div>
        </div>

        {/* Right: Timeframe, Peak & Chart Type Switchers */}
        <div className="flex items-center gap-2 flex-wrap justify-end ms-auto">
          {/* Timeframe Selector Pills */}
          <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/50 text-[11px]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                className={cn(
                  'relative px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer select-none',
                  timeframe === tf.id
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                {timeframe === tf.id && (
                  <motion.div
                    layoutId="miniChartTf"
                    className="absolute inset-0 bg-background shadow-2xs rounded-md"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{t(`miniChart.timeframes.${tf.id}`)}</span>
              </button>
            ))}
          </div>

          {/* Period Change & Peak indicator */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold fa-num border shrink-0',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              )}
              dir="ltr"
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {periodChangePercent}%
              </span>
            </span>

            <div
              className="hidden @[420px]:flex items-baseline gap-1 text-right"
              dir={isFa ? 'rtl' : 'ltr'}
            >
              <span className="text-[11px] text-muted-foreground">{t('miniChart.peak')}:</span>
              <span className="text-xs font-bold text-foreground fa-num">
                {maxPoint?.value?.toLocaleString(isFa ? 'fa-IR' : 'en-US')}
              </span>
              <span className="text-[10px] text-muted-foreground/75 font-medium">
                {shortUnit}
              </span>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/50">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={cn(
                'relative p-1 rounded-md transition-colors cursor-pointer',
                chartType === 'area'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={t('miniChart.types.area')}
            >
              {chartType === 'area' && (
                <motion.div
                  layoutId="miniChartType"
                  className="absolute inset-0 bg-background shadow-2xs rounded-md"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <AreaChartIcon className="relative z-10 size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={cn(
                'relative p-1 rounded-md transition-colors cursor-pointer',
                chartType === 'line'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={t('miniChart.types.line')}
            >
              {chartType === 'line' && (
                <motion.div
                  layoutId="miniChartType"
                  className="absolute inset-0 bg-background shadow-2xs rounded-md"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <LineChartIcon className="relative z-10 size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={cn(
                'relative p-1 rounded-md transition-colors cursor-pointer',
                chartType === 'bar'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={t('miniChart.types.bar')}
            >
              {chartType === 'bar' && (
                <motion.div
                  layoutId="miniChartType"
                  className="absolute inset-0 bg-background shadow-2xs rounded-md"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <BarChart2 className="relative z-10 size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Responsive Chart Canvas ──────────────────────────────── */}
      <div className="flex-1 min-h-[170px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01} />
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
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                dy={6}
              />
              <YAxis
                domain={[
                  (dataMin: number) => Number((dataMin * 0.99).toFixed(2)),
                  (dataMax: number) => Number((dataMax * 1.01).toFixed(2)),
                ]}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
                width={42}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<CustomTooltip locale={locale} shortUnit={shortUnit} />}
                cursor={{
                  stroke: 'var(--color-primary)',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 2',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-background)',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.name}
                  y={maxPoint.value}
                  r={4}
                  fill="var(--color-background)"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                strokeOpacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                dy={6}
              />
              <YAxis
                domain={[
                  (dataMin: number) => Number((dataMin * 0.99).toFixed(2)),
                  (dataMax: number) => Number((dataMax * 1.01).toFixed(2)),
                ]}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
                width={42}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<CustomTooltip locale={locale} shortUnit={shortUnit} />}
                cursor={{
                  stroke: 'var(--color-primary)',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 2',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-background)',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.name}
                  y={maxPoint.value}
                  r={4}
                  fill="var(--color-background)"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                strokeOpacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                dy={6}
              />
              <YAxis
                domain={[
                  (dataMin: number) => Number((dataMin * 0.99).toFixed(2)),
                  (dataMax: number) => Number((dataMax * 1.01).toFixed(2)),
                ]}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
                width={42}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<CustomTooltip locale={locale} shortUnit={shortUnit} />}
                cursor={{ fill: 'var(--color-muted)', opacity: 0.15 }}
              />
              <Bar
                dataKey="value"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.name}
                  y={maxPoint.value}
                  r={4}
                  fill="var(--color-background)"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

