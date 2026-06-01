import type { LucideIcon } from 'lucide-react';

/**
 * A single statistic item shown in the StatsSection.
 * - id: stable unique key used for React lists
 * - value: the target numeric value to count up to
 * - suffix: optional unit appended after the number (e.g. "k", "+", "/7")
 * - labelKey: i18n key resolved via next-intl (namespace "Stats")
 * - icon: optional Lucide icon component rendered above the number
 */
export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  labelKey: string;
  icon?: LucideIcon;
}
