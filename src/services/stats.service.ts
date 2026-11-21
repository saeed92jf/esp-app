// src/services/stats.service.ts
import type { HttpClient } from './core/http';
import type { LucideIcon } from 'lucide-react';
import { Users, Award, Briefcase, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  labelKey: string;
  icon?: LucideIcon;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IStatsService {
  /** آمار صفحه Home (کلاینت‌ها، پروژه‌ها، جوایز، پشتیبانی) */
  getHomeStats(): Promise<StatItem[]>;
}

const DEFAULT_HOME_STATS: StatItem[] = [
  { id: 'clients', value: 1200, suffix: '+', labelKey: 'clients', icon: Users },
  { id: 'projects', value: 350, suffix: '+', labelKey: 'projects', icon: Briefcase },
  { id: 'awards', value: 28, labelKey: 'awards', icon: Award },
  { id: 'support', value: 24, suffix: '/7', labelKey: 'support', icon: Clock },
];

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealStatsService implements IStatsService {
  constructor(private http: HttpClient) {}

  async getHomeStats(): Promise<StatItem[]> {
    try {
      return await this.http.get<StatItem[]>('/stats/home', {
        auth: false,
        revalidate: 86_400, // ۲۴ ساعت
      });
    } catch {
      return DEFAULT_HOME_STATS;
    }
  }
}
