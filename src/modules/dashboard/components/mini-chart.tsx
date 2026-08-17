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
  type TooltipProps,
} from 'recharts';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import { BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, locale, shortUnit }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl px-3.5 py-2.5 text-sm">
      <p className="text-muted-foreground text-[11px] font-medium mb-1">{payload[0]?.payload?.tooltipLabel || label}</p>
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

const CustomTick = (props: any) => {
  const { x, y, payload, chartData } = props;
  const match = chartData[payload.value];
  if (!match) return null;

  if (match.isNewMonth) {
    return (
      <g transform={`translate(${x},${y})`} className="group cursor-default z-10">
        {/* Triangle pointing down */}
        <polygon points="-4,-2 4,-2 0,3" fill="var(--color-primary)" />
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="var(--color-primary)" 
          fontSize={10} 
          fontWeight="bold"
          fontFamily="inherit"
        >
          {match.monthStr}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`} className="group cursor-default">
      <text 
        x={0} 
        y={0} 
        dy={14} 
        textAnchor="middle" 
        fill="var(--color-muted-foreground)" 
        fontSize={11} 
        fontFamily="inherit"
      >
        {match.dayStr}
      </text>
    </g>
  );
};

// ─── MiniChart ────────────────────────────────────────────────────────────────

export function MiniChart({ data }: { data: ChartPoint[] }) {
  const t = useTranslations('Dashboard');
  const tCommodities = useTranslations('Dashboard.commodities');
  const locale = useLocale();
  const { chartSource, chartType, setChartType } = useDashboardSettings();

  let lastMonth = -1;
  const chartData = data.map((p, index) => {
    let d: Date;
    try {
      d = new Date(p.labelKey);
      if (isNaN(d.getTime())) throw new Error();
    } catch {
      // Fallback for fake data
      return { id: index, name: p.labelKey, dayStr: p.labelKey, monthStr: '', isNewMonth: false, tooltipLabel: p.labelKey, value: p.value };
    }

    const currentMonth = locale === 'fa' 
      ? new Intl.DateTimeFormat('fa-IR', { month: 'numeric' }).format(d)
      : d.getMonth();
      
    const isNewMonth = currentMonth !== lastMonth;
    lastMonth = currentMonth as any;
    
    const dayStr = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { day: 'numeric' }).format(d);
    const monthStr = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { month: locale === 'fa' ? 'long' : 'short' }).format(d);

    return {
      id: index,
      name: p.labelKey,
      dayStr,
      monthStr,
      isNewMonth,
      tooltipLabel: `${dayStr} ${monthStr}`,
      value: p.value,
    };
  });

  const max = Math.max(...data.map((d) => d.value), 1);
  
  const unitText = chartSource === 'wti' || chartSource === 'brent' 
    ? t('miniChart.unitDollarPerBarrel') 
    : chartSource === 'gold' || chartSource === 'silver' 
    ? t('miniChart.unitDollarPerOunce') 
    : t('miniChart.unitDollarPerCoin');
    
  const shortUnit = unitText.replace('واحد: ', '').replace('Unit: ', '');

  return (
    <div
      className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 h-full flex flex-col  "
    >
      <div className="mb-3 @sm:mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm @sm:text-base flex items-center gap-2">
            <span>{tCommodities(chartSource)}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t('miniChart.monthlyTrend')}</span>
          </h3>
          <p className="text-muted-foreground text-[10px] @sm:text-xs mt-1 font-medium">
            {unitText}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Peak indicator */}
          <div className="text-right flex items-baseline gap-1.5">
            <p className="text-lg @sm:text-2xl font-bold text-primary">{max.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</p>
            <span className="text-[10px] text-muted-foreground font-medium me-1">{shortUnit}</span>
            <p className="text-[9px] @sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('peak')}</p>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            <button 
              onClick={() => setChartType('area')}
              className={`relative p-1.5 rounded-md transition-colors ${chartType === 'area' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {chartType === 'area' && (
                <motion.div
                  layoutId="miniChartTab"
                  className="absolute inset-0 bg-background shadow-sm rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <AreaChartIcon className="relative z-10 w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`relative p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {chartType === 'line' && (
                <motion.div
                  layoutId="miniChartTab"
                  className="absolute inset-0 bg-background shadow-sm rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <LineChartIcon className="relative z-10 w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`relative p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {chartType === 'bar' && (
                <motion.div
                  layoutId="miniChartTab"
                  className="absolute inset-0 bg-background shadow-sm rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <BarChart2 className="relative z-10 w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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
              dataKey="id"
              tick={<CustomTick chartData={chartData} />}
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
            <Tooltip content={<CustomTooltip locale={locale} shortUnit={shortUnit} />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
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
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="id" tick={<CustomTick chartData={chartData} />} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomTooltip locale={locale} shortUnit={shortUnit} />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-background)', strokeWidth: 2 }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="id" tick={<CustomTick chartData={chartData} />} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomTooltip locale={locale} shortUnit={shortUnit} />} cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
