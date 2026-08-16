// src/components/aparat/channel-stats.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Film, UserPlus, Users, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

import type { ChannelStatsProps } from "../types";

export interface ExtendedChannelStatsProps extends ChannelStatsProps {
  syncStatus?: "loading" | "done" | "error";
}

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
  syncStatus,
}: ExtendedChannelStatsProps) {
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
            <div className="text-start flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </p>
                {/* Status Indicator specific for Video Card */}
                {stat.label === t('stats.videos') && syncStatus && (
                  <div className="flex items-center gap-1">
                    {syncStatus === "loading" && (
                      <span className="relative flex size-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                      </span>
                    )}
                    {syncStatus === "done" && (
                      <span className="text-emerald-500 text-[10px] shrink-0">✓</span>
                    )}
                    {syncStatus === "error" && (
                      <span className="text-rose-500 text-[10px] shrink-0">⚠</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-foreground mt-0.5 text-2xl font-bold flex items-center gap-2">
                {numberFormatter.format(stat.value)}
                {stat.label === t('stats.videos') && syncStatus === "loading" && (
                   <span className="text-[10px] text-muted-foreground font-normal whitespace-nowrap animate-pulse">{t("loading")}</span>
                )}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

