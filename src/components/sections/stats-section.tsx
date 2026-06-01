'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useInView } from '@/hooks/use-in-view';
import { useCountUp } from '@/hooks/use-count-up';
import {
  formatNumber,
  localizeSuffix,
  type AppLocale,
} from '@/lib/format-number';
import type { StatItem } from '@/types/stats';

/**
 * Props for the StatsSection.
 * `stats` is readonly so consumers can pass `as const` arrays directly.
 */
export interface StatsSectionProps {
  stats: readonly StatItem[];
}

/**
 * Single animated stat card. Extracted into its own component so each
 * card can own its `useCountUp` state without breaking the rules of hooks.
 */
function StatCard({ stat, active }: { stat: StatItem; active: boolean }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('Home.stats');

  // Count up only when the section is in view
  const count = useCountUp(stat.value, { active });

  const Icon = stat.icon;
  const formatted = formatNumber(count, locale);
  const suffix = localizeSuffix(stat.suffix, locale);

  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      {Icon ? (
        <Icon className="text-primary size-8 md:size-10" aria-hidden="true" />
      ) : null}

      {/*
        dir="ltr" keeps the visual order "number then unit" in every locale,
        while flex-wrap + break-words prevent long Persian text from overflowing.
      */}
      <div
        dir="ltr"
        className="text-foreground flex flex-wrap items-baseline justify-center gap-0.5 font-bold"
      >
        <span className="text-3xl tabular-nums sm:text-4xl md:text-5xl">
          {formatted}
        </span>
        {suffix ? (
          <span className="text-xl sm:text-2xl md:text-3xl">{suffix}</span>
        ) : null}
      </div>

      <p className="text-muted-foreground min-w-0 text-sm wrap-break-word sm:text-base">
        {t(stat.labelKey)}
      </p>
    </div>
  );
}

/**
 * StatsSection
 * A self-contained, client-side section that animates numeric stats
 * when it scrolls into view. All formatting and animation logic is
 * encapsulated here; the parent only provides the `stats` array.
 */
export function StatsSection({ stats }: StatsSectionProps) {
  // Trigger animation once, when ~30% of the section is visible
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.3,
    once: true,
  });

  return (
    <section
      ref={ref}
      className="w-full py-16 md:py-24"
      aria-label="statistics"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:gap-12">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} active={inView} />
        ))}
      </div>
    </section>
  );
}
