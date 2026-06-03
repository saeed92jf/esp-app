// src/components/dashboard/dashboard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { DASHBOARD_BY_ROLE } from '@/lib/fake-dashboard';
import { StatCard } from './stat-card';
import { MiniChart } from './mini-chart';
import { ActivityFeed } from './activity-feed';

export function Dashboard() {
  const t = useTranslations('Dashboard');
  const { user } = useSimpleAuth();

  // Rendered inside an authenticated area; bail out safely while hydrating.
  if (!user) return null;

  const data = DASHBOARD_BY_ROLE[user.role];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Greeting header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('greeting', { name: user.fullName })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(`roleSummary.${user.role}`)}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Chart (2/3) + activity feed (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiniChart data={data.chart} />
        </div>
        <ActivityFeed items={data.activities} />
      </div>
    </div>
  );
}
