import statsMock from "@/data/mock/stats.json";
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

// ─── Fake ─────────────────────────────────────────────────────────────────────

const FAKE_STATS: StatItem[] = statsMock.map((s) => ({ ...s, icon: s.id === 'clients' ? Users : s.id === 'projects' ? Briefcase : s.id === 'awards' ? Award : Clock })) as StatItem[];

export class FakeStatsService implements IStatsService {
  async getHomeStats(): Promise<StatItem[]> {
    return FAKE_STATS;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealStatsService implements IStatsService {
  constructor(private http: HttpClient) {}

  async getHomeStats(): Promise<StatItem[]> {
    return this.http.get<StatItem[]>('/stats/home', {
      auth: false,
      revalidate: 86_400, // ۲۴ ساعت — آمار خیلی کم تغییر می‌کند
    });
  }
}
