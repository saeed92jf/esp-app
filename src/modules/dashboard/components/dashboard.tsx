// src/components/dashboard/dashboard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { StatCard } from './stat-card';
import { MiniChart } from './mini-chart';
import { ActivityFeed } from './activity-feed';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const t = useTranslations('Dashboard');
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard(user?.role);

  if (!user) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="bg-destructive/10 text-destructive rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">{error?.message ?? 'خطا در بارگذاری داشبورد'}</p>
          <button onClick={refetch} className="text-primary mt-2 text-sm underline">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('greeting', { name: user.fullName })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t(`roleSummary.${user.role}`)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiniChart data={data.chart} />
        </div>
        <ActivityFeed items={data.activities} />
      </div>
    </div>
  );
}
