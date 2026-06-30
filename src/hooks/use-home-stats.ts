// src/hooks/use-home-stats.ts
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services';
import type { StatItem } from '@/services';

/**
 * جایگزین import مستقیم STATS از '@/data/stats'.
 * چون آمار صفحه اصلی به‌ندرت تغییر می‌کند، یک fallback استاتیک نگه می‌داریم
 * تا اولین رندر هرگز خالی نباشد (بدون پرش layout).
 */
const FALLBACK: StatItem[] = [];

export function useHomeStats(): { stats: StatItem[]; loading: boolean } {
  const [stats, setStats] = useState<StatItem[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.stats
      .getHomeStats()
      .then((result) => { if (!cancelled) setStats(result); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}
