// src/components/dashboard/stat-card.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Package,
  Users,
  Wallet,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { StatCard as StatCardType } from '../services/dashboard.service';

// Map serializable icon names to lucide components.
const ICONS = {
  users: Users,
  wallet: Wallet,
  package: Package,
  activity: Activity,
  wrench: Wrench,
  check: CheckCircle2,
  clock: Clock,
  file: FileText,
  message: MessageSquare,
} as const;

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

const TREND_COLOR = {
  up: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  down: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
  neutral: 'text-muted-foreground bg-muted/60',
} as const;

export function StatCard({ stat }: { stat: StatCardType }) {
  const t = useTranslations('Dashboard.commodities');
  const Icon = ICONS[stat.icon];
  const TrendIcon = TREND_ICON[stat.trend];

  return (
    <div className="relative overflow-hidden rounded-xl rounded-br-none border border-border/50 bg-card p-1.5 @[140px]:p-3 @sm:p-5 transition-all duration-300 h-full flex flex-col justify-between">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -end-4 -top-4 h-10 w-10 @[140px]:-end-6 @[140px]:-top-6 @[140px]:h-16 @[140px]:w-16 @sm:h-24 @sm:w-24 rounded-none bg-primary/5 transition-transform duration-500" />

      <div className="flex flex-wrap items-center justify-between gap-1 z-10">
        <span className="flex h-5 w-5 @[140px]:h-8 @[140px]:w-8 @sm:h-10 @sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 shrink-0">
          <Icon className="h-2.5 w-2.5 @[140px]:h-4 @[140px]:w-4 @sm:h-5 @sm:w-5" />
        </span>
        <span className={cn('flex items-center gap-0.5 @[140px]:gap-1 px-1 py-0.5 text-[8px] @[140px]:text-[10px] @sm:text-xs font-semibold', stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
          <TrendIcon className="h-2 w-2 @[140px]:h-2.5 @[140px]:w-2.5 @sm:h-3 @sm:w-3" />
          <span className="leading-none">{stat.delta}</span>
        </span>
      </div>

      <div className="mt-1 @[140px]:mt-3 @sm:mt-4 z-10">
        <p className="text-sm @[140px]:text-xl @sm:text-2xl font-bold tracking-tight text-foreground leading-none" dir="ltr">
          {stat.value}
        </p>
        <p className="block mt-0.5 @sm:mt-1 text-[8px] @[140px]:text-[10px] @sm:text-sm font-medium text-muted-foreground transition-colors duration-300 leading-tight">{t(stat.labelKey)}</p>
      </div>
    </div>
  );
}
