// lib/data/stats.ts

// Single source of truth for stats data.
// labelKey maps to a key under the "Stats" namespace in fa.json/en.json.
export const STATS = [
  { id: 'users', value: 12000, suffix: 'k', labelKey: 'users' },
  { id: 'projects', value: 350, suffix: '+', labelKey: 'projects' },
  { id: 'satisfaction', value: 98, suffix: '%', labelKey: 'satisfaction' },
  { id: 'support', value: 24, suffix: '/7', labelKey: 'support' },
] as const;

export type StatItem = (typeof STATS)[number];
