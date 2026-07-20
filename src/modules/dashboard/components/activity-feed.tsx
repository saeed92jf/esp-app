// src/components/dashboard/activity-feed.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/lib/fake-dashboard';

// Status -> dot color.
const DOT = {
  success: 'bg-emerald-500',
  pending: 'bg-amber-500',
  error: 'bg-rose-500',
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const t = useTranslations('Dashboard.activity');

  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="mb-4 font-semibold">{t('title')}</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                DOT[item.status],
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{t(`items.${item.titleKey}`)}</p>
              <p className="text-muted-foreground text-xs">
                {/* timeKey + count, e.g. "4 minutes ago" */}
                {t(`time.${item.timeKey}`, { count: item.count })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
