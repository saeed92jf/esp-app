// src/services/dashboard.service.ts
import type { HttpClient } from './core/http';
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
  titleKey: string;
  timeKey: 'minutes' | 'hours' | 'days';
  count: number;
  status: 'success' | 'pending' | 'error';
}

export interface DashboardData {
  stats: StatCard[];
  chart: ChartPoint[];
  activities: ActivityItem[];
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IDashboardService {
  getByRole(role: UserRole): Promise<DashboardData>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MONTHS: ChartPoint[] = [
  {labelKey:'far',value:0},{labelKey:'ord',value:0},{labelKey:'kho',value:0},
  {labelKey:'tir',value:0},{labelKey:'mor',value:0},{labelKey:'sha',value:0},
];
const chart = (values: number[]): ChartPoint[] =>
  MONTHS.map((m, i) => ({ ...m, value: values[i] }));

const FAKE_DATA: Record<UserRole, DashboardData> = {
  admin: {
    stats: [
      { id:'users',  labelKey:'totalUsers',     value:'12,480', delta:'+8.2%',  trend:'up',      icon:'users'    },
      { id:'revenue',labelKey:'revenue',         value:'84.5M',  delta:'+12.5%', trend:'up',      icon:'wallet'   },
      { id:'orders', labelKey:'orders',           value:'3,127',  delta:'-2.1%',  trend:'down',    icon:'package'  },
      { id:'active', labelKey:'activeSessions',   value:'486',    delta:'+4.0%',  trend:'up',      icon:'activity' },
    ],
    chart: chart([42,55,48,70,65,82]),
    activities: [
      {id:'a1',titleKey:'newUser',    timeKey:'minutes',count:4,  status:'success'},
      {id:'a2',titleKey:'payment',    timeKey:'minutes',count:22, status:'success'},
      {id:'a3',titleKey:'ticket',     timeKey:'hours',  count:1,  status:'pending'},
      {id:'a4',titleKey:'deploy',     timeKey:'hours',  count:3,  status:'success'},
    ],
  },
  engineer: {
    stats: [
      { id:'projects',labelKey:'projects',       value:'8',  delta:'+1',   trend:'up',      icon:'package' },
      { id:'tickets', labelKey:'openTickets',     value:'14', delta:'-3',   trend:'down',    icon:'wrench'  },
      { id:'done',    labelKey:'completedTasks',  value:'57', delta:'+9',   trend:'up',      icon:'check'   },
      { id:'review',  labelKey:'pendingReview',   value:'5',  delta:'0',    trend:'neutral', icon:'clock'   },
    ],
    chart: chart([12,18,15,22,19,25]),
    activities: [
      {id:'e1',titleKey:'review',   timeKey:'minutes',count:12,status:'pending'},
      {id:'e2',titleKey:'deploy',   timeKey:'hours',  count:2, status:'success'},
      {id:'e3',titleKey:'taskDone', timeKey:'hours',  count:5, status:'success'},
      {id:'e4',titleKey:'ticket',   timeKey:'days',   count:1, status:'error'  },
    ],
  },
  staff: {
    stats: [
      { id:'today', labelKey:'tasksToday',    value:'11', delta:'+2', trend:'up',   icon:'check'    },
      { id:'done',  labelKey:'completedTasks',value:'38', delta:'+5', trend:'up',   icon:'activity' },
      { id:'tickets',labelKey:'openTickets',  value:'6',  delta:'-1', trend:'down', icon:'wrench'   },
      { id:'msgs',  labelKey:'messages',       value:'23', delta:'+7', trend:'up',   icon:'message'  },
    ],
    chart: chart([8,12,10,14,11,16]),
    activities: [
      {id:'s1',titleKey:'taskDone',timeKey:'minutes',count:8, status:'success'},
      {id:'s2',titleKey:'ticket',  timeKey:'minutes',count:35,status:'pending'},
      {id:'s3',titleKey:'newUser', timeKey:'hours',  count:2, status:'success'},
      {id:'s4',titleKey:'review',  timeKey:'hours',  count:4, status:'pending'},
    ],
  },
  customer: {
    stats: [
      { id:'orders',  labelKey:'myOrders', value:'6',    delta:'+1',   trend:'up',      icon:'package' },
      { id:'invoices',labelKey:'invoices', value:'4',    delta:'0',    trend:'neutral', icon:'file'    },
      { id:'support', labelKey:'support',  value:'2',    delta:'-1',   trend:'down',    icon:'wrench'  },
      { id:'wallet',  labelKey:'wallet',   value:'1.2M', delta:'+3.4%',trend:'up',      icon:'wallet'  },
    ],
    chart: chart([2,4,3,5,4,6]),
    activities: [
      {id:'c1',titleKey:'orderShipped',timeKey:'hours',count:3,status:'success'},
      {id:'c2',titleKey:'invoicePaid', timeKey:'days', count:1,status:'success'},
      {id:'c3',titleKey:'ticket',      timeKey:'days', count:2,status:'pending'},
      {id:'c4',titleKey:'payment',     timeKey:'days', count:4,status:'success'},
    ],
  },
};

export class FakeDashboardService implements IDashboardService {
  async getByRole(role: UserRole): Promise<DashboardData> {
    await wait(400);
    return FAKE_DATA[role] ?? FAKE_DATA.customer;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealDashboardService implements IDashboardService {
  constructor(private http: HttpClient) {}

  async getByRole(role: UserRole): Promise<DashboardData> {
    return this.http.get<DashboardData>(`/dashboard`, {
      params: { role },
      revalidate: 60, // ۱ دقیقه cache در Next.js
    });
  }
}
