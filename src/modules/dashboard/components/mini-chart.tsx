// src/components/dashboard/mini-chart.tsx
'use client';

import { useTranslations } from 'next-intl';
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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl px-3.5 py-2.5 text-sm">
      <p className="text-muted-foreground text-[11px] font-medium mb-1">{payload[0]?.payload?.tooltipLabel || label}</p>
      <p className="font-bold text-foreground text-base">
        {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
}

const CustomTick = (props: any) => {
  const { x, y, payload, chartData } = props;
  const match = chartData.find((c: any) => c.name === payload.value);
  if (!match) return null;

  return (
    <g transform={`translate(${x},${y})`} className="group cursor-default">
      <text 
        x={0} 
        y={0} 
        dy={14} 
        textAnchor="middle" 
        fill={match.isNewMonth ? "var(--color-primary)" : "var(--color-muted-foreground)"} 
        fontSize={11} 
        fontWeight={match.isNewMonth ? "bold" : "normal"}
        fontFamily="inherit"
      >
        {match.dayStr}
        {match.isNewMonth && <title>{match.monthStr}</title>}
      </text>
      {match.isNewMonth && (
        <circle cx={0} cy={22} r={2.5} fill="var(--color-primary)" className="opacity-80 group-hover:opacity-100 transition-opacity">
          <title>{match.monthStr}</title>
        </circle>
      )}
    </g>
  );
};

// ─── MiniChart ────────────────────────────────────────────────────────────────

export function MiniChart({ data }: { data: ChartPoint[] }) {
  const t = useTranslations('Dashboard');
  const tCommodities = useTranslations('Dashboard.commodities');
  const { chartSource, chartType, setChartType } = useDashboardSettings();

  let lastMonth = -1;
  const chartData = data.map((p) => {
    let d: Date;
    try {
      d = new Date(p.labelKey);
      if (isNaN(d.getTime())) throw new Error();
    } catch {
      // Fallback for fake data
      return { name: p.labelKey, dayStr: p.labelKey, monthStr: '', isNewMonth: false, tooltipLabel: p.labelKey, value: p.value };
    }

    const m = d.getMonth();
    const isNewMonth = m !== lastMonth;
    lastMonth = m;
    
    const dayStr = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(d);
    const monthStr = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(d);

    return {
      name: p.labelKey,
      dayStr,
      monthStr,
      isNewMonth,
      tooltipLabel: `${dayStr} ${monthStr}`,
      value: p.value,
    };
  });

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 h-full flex flex-col  "
    >
      <div className="mb-3 @sm:mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm @sm:text-base flex items-center gap-2">
            <span>{tCommodities(chartSource)}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">روند یک ماهه</span>
          </h3>
          <p className="text-muted-foreground text-[10px] @sm:text-xs mt-1 font-medium">
            {chartSource === 'wti' || chartSource === 'brent' ? 'واحد: دلار / بشکه' : 
             chartSource === 'gold' || chartSource === 'silver' ? 'واحد: دلار / انس' : 
             'واحد: دلار / کوین'}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Peak indicator */}
          <div className="text-right flex items-baseline gap-1.5">
            <p className="text-lg @sm:text-2xl font-bold text-primary">{max.toLocaleString('en-US')}</p>
            <p className="text-[9px] @sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('peak')}</p>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            <button 
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'area' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <AreaChartIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
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
              dataKey="name"
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
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="name" tick={<CustomTick chartData={chartData} />} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-background)', strokeWidth: 2 }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="name" tick={<CustomTick chartData={chartData} />} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
