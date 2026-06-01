import { Users, Award, Briefcase, Clock } from 'lucide-react';
import type { StatItem } from '@/types/stats';

/**
 * Static statistics data for the StatsSection.
 * Marked `as const` so the array is readonly and tuple-typed,
 * which matches the `readonly StatItem[]` prop on StatsSection.
 */
export const STATS: readonly StatItem[] = [
  { id: 'clients', value: 1200, suffix: '+', labelKey: 'clients', icon: Users },
  {
    id: 'projects',
    value: 350,
    suffix: '+',
    labelKey: 'projects',
    icon: Briefcase,
  },
  { id: 'awards', value: 28, labelKey: 'awards', icon: Award },
  { id: 'support', value: 24, suffix: '/7', labelKey: 'support', icon: Clock },
] as const;
