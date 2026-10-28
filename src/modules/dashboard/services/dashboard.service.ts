// src/modules/dashboard/services/dashboard.service.ts
import type { HttpClient } from '@/services/core/http';
import type { UserRole } from '@/types/auth';

// ─── Types (از fake-dashboard.ts استخراج شد) ─────────────────────────────────

export type Trend    = 'up' | 'down' | 'neutral';
export type IconName = 'users'|'wallet'|'package'|'activity'|'wrench'|'check'|'clock'|'file'|'message';

export interface StatCard {
  id: string;
  labelKey: string;
  value: string;
  delta: string;
  trend: Trend;
  icon: IconName;
}

export interface ChartPoint  { labelKey: string; value: number; }
export interface ActivityItem {
  id: string;
  titleKey?: string;
  title?: string;
  timeKey: 'minutes' | 'hours' | 'days';
  count: number;
  status: 'success' | 'pending' | 'error';
}

export interface CalendarEvent {
  id: string;
  titleKey?: string;
  title?: string;
  date: string;
  type: 'meeting' | 'deadline' | 'review' | 'event' | 'official' | 'fair';
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdBy: 'manager' | 'user';
  creatorName: string;
  assignedToName: string;
  dueDate?: string;
  completedAt?: string;
  completionExplanation?: string;
  isManagerDefined: boolean;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  notificationSent?: boolean;
  emailSent?: boolean;
}

export type ChecklistPeriod = 'daily' | 'weekly' | 'monthly' | 'periodic';

export interface DetailedChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  period: ChecklistPeriod;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate?: string;
}

export interface DailyRoutine {
  id: string;
  title: string;
  timeSlot?: string;
  period?: 'morning' | 'midday' | 'evening';
  streakDays?: number;
  completedToday?: boolean;
  category?: string;
  color?: 'purple' | 'emerald' | 'rose' | 'orange' | 'blue' | 'amber' | string;
  highlight?: boolean;
  completedDays?: Record<string, boolean>;
  weekKey?: string;
  createdAtDate?: string;
  scope?: 'week' | 'month' | 'year' | 'custom';
  weekKeys?: string[];
  monthKey?: string;
  yearKey?: string;
  customWeekNumbers?: number[];
  monthWeekIndices?: number[];
}

export interface DashboardNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'emerald' | 'rose' | 'purple' | 'slate';
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  isInternal: boolean;
  category: string;
  description?: string;
  createdAt: string;
}

export interface DashboardNotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'manager_task' | 'event' | 'routine' | 'system';
  date: string;
  read: boolean;
  taskId?: string;
  emailPreview?: {
    subject: string;
    from: string;
    to: string;
    body: string;
    sentAt: string;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  createdAt?: string;
  createdBy?: 'admin' | 'user';
}

export interface DashboardData {
  stats: StatCard[];
  allStats?: StatCard[];

  chart: ChartPoint[];
  activities: ActivityItem[];
  calendarEvents: CalendarEvent[];
  checklist: ChecklistItem[];
  tasks?: DashboardTask[];
  detailedChecklist?: DetailedChecklistItem[];
  routines?: DailyRoutine[];
  notes?: DashboardNote[];
  customLinks?: CustomLink[];
  notifications?: DashboardNotificationItem[];
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IDashboardService {
  getByRole(role: UserRole, statCards?: string[], chartSource?: string): Promise<DashboardData>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MONTHS: ChartPoint[] = [
  {labelKey:'far',value:0},{labelKey:'ord',value:0},{labelKey:'kho',value:0},
  {labelKey:'tir',value:0},{labelKey:'mor',value:0},{labelKey:'sha',value:0},
];
const chart = (values: number[]): ChartPoint[] =>
  MONTHS.map((m, i) => ({ ...m, value: values[i] }));

import calendarEventsMock from "@/data/mock/calendar-events.json";
import dashboardDataMock from "@/data/mock/dashboard-data.json";
import dashboardSamplesMock from "@/data/mock/dashboard-samples.json";

const REAL_EVENTS: CalendarEvent[] = calendarEventsMock as unknown as CalendarEvent[];

export const SAMPLE_TASKS: DashboardTask[] = dashboardSamplesMock.tasks as unknown as DashboardTask[];
export const SAMPLE_DETAILED_CHECKLIST: DetailedChecklistItem[] = dashboardSamplesMock.detailedChecklist as unknown as DetailedChecklistItem[];
export const SAMPLE_ROUTINES: DailyRoutine[] = dashboardSamplesMock.routines as unknown as DailyRoutine[];
export const SAMPLE_NOTES: DashboardNote[] = dashboardSamplesMock.notes as unknown as DashboardNote[];
export const SAMPLE_CUSTOM_LINKS: CustomLink[] = dashboardSamplesMock.customLinks as unknown as CustomLink[];
export const SAMPLE_NOTIFICATIONS: DashboardNotificationItem[] = dashboardSamplesMock.notifications as unknown as DashboardNotificationItem[];

const FAKE_DATA: Record<UserRole, DashboardData> = dashboardDataMock as unknown as Record<UserRole, DashboardData>;

export class FakeDashboardService implements IDashboardService {
  async getByRole(role: UserRole, statCards?: string[], chartSource?: string): Promise<DashboardData> {
    const baseData = { ...(FAKE_DATA[role] ?? FAKE_DATA.customer) };
    const cards = statCards || ['gold', 'gasoline', 'wti', 'btc', 'eur'];
    
    // Set default fallback stats so StatsOverviewWidget has the initial shape
    // (Live data will be overlaid dynamically by StatsOverviewWidget via useCommodities hook)
    const ALL_STATS_DEFS = [
      { id: 'gold',     labelKey: 'gold'     },
      { id: 'silver',   labelKey: 'silver'   },
      { id: 'copper',   labelKey: 'copper'   },
      { id: 'aluminum', labelKey: 'aluminum' },
      { id: 'wti',      labelKey: 'wti'      },
      { id: 'brent',    labelKey: 'brent'    },
      { id: 'gasoline', labelKey: 'gasoline' },
      { id: 'eur',      labelKey: 'eur'      },
      { id: 'btc',      labelKey: 'btc'      },
      { id: 'eth',      labelKey: 'eth'      },
    ];

    const allStatsMapped = ALL_STATS_DEFS.map((def) => {
      return {
        id: def.id,
        labelKey: def.labelKey,
        value: '—',
        delta: '—',
        trend: 'neutral',
        icon: def.id === 'btc' || def.id === 'eth' || def.id === 'eur' ? 'wallet' : 'activity',
      } as StatCard;
    });

    baseData.allStats = allStatsMapped;
    baseData.stats = cards
      .map((id) => allStatsMapped.find((s) => s.id === id) || null)
      .filter(Boolean) as StatCard[];

    while (baseData.stats.length < 5 && baseData.stats.length < allStatsMapped.length) {
      const unused = allStatsMapped.find((s) => !baseData.stats.some((b) => b.id === s.id));
      if (unused) baseData.stats.push(unused);
      else break;
    }

    baseData.tasks = SAMPLE_TASKS;
    baseData.detailedChecklist = SAMPLE_DETAILED_CHECKLIST;
    baseData.routines = SAMPLE_ROUTINES;
    baseData.notes = SAMPLE_NOTES;
    baseData.customLinks = SAMPLE_CUSTOM_LINKS;
    baseData.notifications = SAMPLE_NOTIFICATIONS;

    return baseData;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealDashboardService implements IDashboardService {
  constructor(private http: HttpClient) {}

  async getByRole(role: UserRole, statCards?: string[], chartSource?: string): Promise<DashboardData> {
    return this.http.get<DashboardData>(`/dashboard`, {
      params: { role, statCards: statCards?.join(','), chartSource },
      revalidate: 60, // ۱ دقیقه cache در Next.js
    });
  }
}

export function addUserNotification(item: {
  title: string;
  description: string;
  type?: 'manager_task' | 'event' | 'routine' | 'system';
}) {
  if (typeof window === "undefined") return;
  const newNotif: DashboardNotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: item.title,
    description: item.description,
    type: item.type || 'system',
    date: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
  try {
    const raw = localStorage.getItem("esp_dashboard_notifications");
    const list: DashboardNotificationItem[] = raw ? JSON.parse(raw) : [...SAMPLE_NOTIFICATIONS];
    list.unshift(newNotif);
    localStorage.setItem("esp_dashboard_notifications", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("esp_notification_added", { detail: newNotif }));
  } catch (err) {
    console.error("Failed to add user notification:", err);
  }
}
