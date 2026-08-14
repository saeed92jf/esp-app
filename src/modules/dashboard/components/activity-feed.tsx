// src/components/dashboard/activity-feed.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '../services/dashboard.service';

// Status -> dot color & label.
const STATUS_CONFIG = {
  success: {
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/40',
    badge: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15',
  },
  pending: {
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/40',
    badge: 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15',
  },
  error: {
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/40',
    badge: 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/15',
  },
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const t = useTranslations('Dashboard.activity');

  return (
    <div className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 @md:p-6 h-full flex flex-col  ">
      <h3 className="mb-3 @sm:mb-4 font-semibold text-base @sm:text-lg shrink-0">{t('title')}</h3>
      <ul className="space-y-2 @sm:space-y-3 flex-1 overflow-y-auto pe-1 custom-scrollbar">
        {items.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <li
              key={item.id}
              className="group flex items-start gap-2 @sm:gap-3 p-2 @sm:p-2.5 rounded-xl hover:bg-muted/40 transition-all duration-300 cursor-default"
            >
              {/* Animated status dot */}
              <span className="relative mt-1.5 shrink-0">
                <span
                  className={cn(
                    'block h-2.5 w-2.5 rounded-full',
                    cfg.dot,
                  )}
                />
                {item.status === 'pending' && (
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full animate-ping opacity-60',
                      cfg.dot,
                    )}
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs @sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  {t(`items.${item.titleKey}`)}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {t(`time.${item.timeKey}`, { count: item.count })}
                </p>
              </div>

              {/* Status badge */}
              <span className={cn('text-[9px] @sm:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md shrink-0 mt-0.5', cfg.badge)}>
                {item.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
