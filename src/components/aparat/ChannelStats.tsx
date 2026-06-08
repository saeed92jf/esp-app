// src/components/aparat/channel-stats.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Film, UserPlus, Users, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

import type { ChannelStatsProps } from '@/types';

// Shape of a single stat card, derived from props at render time.
interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  // Tailwind utility for the icon tint, mapped to theme tokens.
  iconClass: string;
}

export function ChannelStats({
  videoCount,
  followerCount,
  followedCount,
}: ChannelStatsProps) {
  // Translations under the "Aparat" namespace.
  const t = useTranslations('Aparat');
  // Active locale (e.g. "fa" / "en") used for number formatting.
  const locale = useLocale();

  // Locale-aware number formatter: produces Persian digits for "fa".
  const numberFormatter = new Intl.NumberFormat(locale);

  const stats: StatItem[] = [
    {
      label: t('stats.videos'),
      value: videoCount,
      icon: Film,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: t('stats.followers'),
      value: followerCount,
      // Semantic "success" tone for followers.
      icon: Users,
      iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('stats.following'),
      value: followedCount,
      icon: UserPlus,
      iconClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="group flex-row items-center gap-3 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
          >
            {/* Icon badge */}
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                stat.iconClass,
              )}
            >
              <Icon className="size-6" />
            </div>

            {/* Label + value */}
            <div className="text-start">
              <p className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </p>
              <p className="text-foreground mt-0.5 text-2xl font-bold">
                {numberFormatter.format(stat.value)}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
