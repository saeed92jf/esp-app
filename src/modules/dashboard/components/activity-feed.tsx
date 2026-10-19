// src/components/dashboard/activity-feed.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container min-h-0">
      <div className="flex items-center gap-2 px-1 mb-3 shrink-0 border-b border-border/40 pb-2.5 pe-18 sm:pe-20">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <Activity className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-sm sm:text-base text-foreground/80">{t('title')}</h3>
      </div>
      <ul className="segmented-list padded-ends flex-1 overflow-y-auto pe-1 custom-scrollbar min-h-0">
        {items.map((item, index) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <li
              key={item.id}
              className="segmented-item flex items-start gap-2 @sm:gap-3 p-2.5 @sm:p-3 bg-background cursor-default group border-none"
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

