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
import type { StatCard as StatCardType } from '@/lib/fake-dashboard';

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
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-muted-foreground',
} as const;

export function StatCard({ stat }: { stat: StatCardType }) {
  const t = useTranslations('Dashboard.stats');
  const Icon = ICONS[stat.icon];
  const TrendIcon = TREND_ICON[stat.trend];

  return (
    <div className="group bg-card relative overflow-hidden rounded-xl border p-5 transition-shadow hover:shadow-md">
      {/* Decorative gradient blob in the corner */}
      <div className="bg-primary/5 pointer-events-none absolute -inset-e-6 -top-6 h-20 w-20 rounded-full transition-transform group-hover:scale-125" />
      <div className="flex items-center justify-between">
        <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            TREND_COLOR[stat.trend],
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          <span dir="ltr">{stat.delta}</span>
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight" dir="ltr">
          {stat.value}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{t(stat.labelKey)}</p>
      </div>
    </div>
  );
}
