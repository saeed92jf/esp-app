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
  titleKey: string;
  timeKey: 'minutes' | 'hours' | 'days';
  count: number;
  status: 'success' | 'pending' | 'error';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'review' | 'event' | 'official' | 'fair';
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

export interface DashboardData {
  stats: StatCard[];

  chart: ChartPoint[];
  activities: ActivityItem[];
  calendarEvents: CalendarEvent[];
  checklist: ChecklistItem[];
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

const REAL_EVENTS: CalendarEvent[] = [
  {
    "id": "fair-2",
    "title": "نمایشگاه: سی و یکمین نمایشگاه بین المللی مواد شوینده،آرایشی،بهداشتی،سلولزی و ماشین آلات وابسته",
    "date": "1405-01-29",
    "type": "fair"
  },
  {
    "id": "fair-5",
    "title": "نمایشگاه: ششمین نمایشگاه توانمندی های صادراتی جمهوری اسلامی ایران (iran expo 2024)",
    "date": "1405-02-08",
    "type": "fair"
  },
  {
    "id": "fair-8",
    "title": "نمایشگاه: بیست و هشتمین نمایشگاه بین المللی نفت،گاز،پالایش و پتروشیمی ایران",
    "date": "1405-02-19",
    "type": "fair"
  },
  {
    "id": "fair-11",
    "title": "نمایشگاه: بیست و پنجمین نمایشگاه بین المللی تجهیزات پزشکی،دندانپزشکی، دارویی و آزمایشگاهی (ایران هلث)",
    "date": "1405-02-29",
    "type": "fair"
  },
  {
    "id": "fair-14",
    "title": "نمایشگاه: یازدهمین نمایشگاه بین المللی حمل و نقل ریلی، صنایع و تجهیزات وابسته",
    "date": "1405-02-29",
    "type": "fair"
  },
  {
    "id": "fair-17",
    "title": "نمایشگاه: بیست و سومین نمایشگاه بین المللی ورزش وتجهیزات ورزشی",
    "date": "1405-03-08",
    "type": "fair"
  },
  {
    "id": "fair-20",
    "title": "نمایشگاه: شانزدهمین نمایشگاه بین المللی درب و پنجره و صنایع وابسته",
    "date": "1405-03-08",
    "type": "fair"
  },
  {
    "id": "fair-23",
    "title": "نمایشگاه: هفتمین نمایشگاه بین المللی شیشه و تجهیزات وابسته",
    "date": "1405-03-08",
    "type": "fair"
  },
  {
    "id": "fair-26",
    "title": "نمایشگاه: سی و یکمین نمایشگاه بین المللی صنایع کشاورزی، مواد غذایی، ماشین آلات و صنایع وابسته",
    "date": "1405-03-19",
    "type": "fair"
  },
  {
    "id": "fair-29",
    "title": "نمایشگاه: نوزدهمین نمایشگاه بین المللی قطعات، لوازم و مجموعه های خودرو",
    "date": "1405-03-29",
    "type": "fair"
  },
  {
    "id": "fair-32",
    "title": "نمایشگاه: چهارمین نمایشگاه بین المللی خدمات، تقویت وتزئین خودرو",
    "date": "1405-03-29",
    "type": "fair"
  },
  {
    "id": "fair-35",
    "title": "نمایشگاه: بیست و هفتمین نمایشگاه بین المللی الکترونیک، کامپیوتر، تجارت الکترونیک ( الکامپ )",
    "date": "1405-04-09",
    "type": "fair"
  },
  {
    "id": "fair-38",
    "title": "نمایشگاه: سیزدهمین نمایشگاه بین المللی آسانسور و صنایع و تجهیزات وابسته",
    "date": "1405-04-18",
    "type": "fair"
  },
  {
    "id": "fair-41",
    "title": "نمایشگاه: نهمین نمایشگاه بین المللی لوله، اتصالات، شیرآلات بهداشتی، تجهیزات آشپزخانه حمام، سونا، استخر و خدمات وابسته",
    "date": "1405-04-18",
    "type": "fair"
  },
  {
    "id": "fair-44",
    "title": "نمایشگاه: بیست و سومین نمایشگاه بین المللی دام و طیور و صنایع وابسته",
    "date": "1405-04-30",
    "type": "fair"
  },
  {
    "id": "fair-47",
    "title": "نمایشگاه: سومین نمایشگاه تحول صنعت خودرو",
    "date": "1405-04-30",
    "type": "fair"
  },
  {
    "id": "fair-50",
    "title": "نمایشگاه: سی و سومین نمایشگاه بین المللی تخصصی صادراتی صنعت مبلمان",
    "date": "1405-05-09",
    "type": "fair"
  },
  {
    "id": "fair-53",
    "title": "نمایشگاه: هفتمین نمایشگاه بین المللی کاغذ، مقوا، کارتن، فرآورده های سلولزی و ماشین آلات مربوطه",
    "date": "1405-05-09",
    "type": "fair"
  },
  {
    "id": "fair-56",
    "title": "نمایشگاه: بیست و چهارمین نمایشگاه بین المللی لوازم خانگی",
    "date": "1405-05-19",
    "type": "fair"
  },
  {
    "id": "fair-59",
    "title": "نمایشگاه: شانزدهمین نمایشگاه بین المللی صنعت مالی",
    "date": "1405-05-19",
    "type": "fair"
  },
  {
    "id": "bahesab-1405-1-1",
    "title": "عید سعید فطر - عید نوروز - سال ۱۴۰۵ هجری شمسی",
    "date": "1405-01-01",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-2",
    "title": "تعطیل به مناسبت عید سعید فطر - عید نوروز",
    "date": "1405-01-02",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-3",
    "title": "عید نوروز",
    "date": "1405-01-03",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-4",
    "title": "عید نوروز",
    "date": "1405-01-04",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-12",
    "title": "روز جمهوری اسلامی ایران",
    "date": "1405-01-12",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-13",
    "title": "روز طبیعت",
    "date": "1405-01-13",
    "type": "official"
  },
  {
    "id": "bahesab-1405-1-25",
    "title": "شهادت امام جعفر صادق (ع)",
    "date": "1405-01-25",
    "type": "official"
  },
  {
    "id": "bahesab-1405-3-6",
    "title": "عید سعید قربان",
    "date": "1405-03-06",
    "type": "official"
  },
  {
    "id": "bahesab-1405-3-14",
    "title": "عید سعید غدیر خم ( ۱۰ هـ ق) - رحلت امام خمینی",
    "date": "1405-03-14",
    "type": "official"
  },
  {
    "id": "bahesab-1405-3-15",
    "title": "قیام خونین ۱۵ خرداد",
    "date": "1405-03-15",
    "type": "official"
  },
  {
    "id": "bahesab-1405-4-3",
    "title": "تاسوعای حسینی",
    "date": "1405-04-03",
    "type": "official"
  },
  {
    "id": "bahesab-1405-4-4",
    "title": "عاشورای حسینی",
    "date": "1405-04-04",
    "type": "official"
  },
  {
    "id": "bahesab-1405-5-13",
    "title": "اربعین حسینی",
    "date": "1405-05-13",
    "type": "official"
  },
  {
    "id": "bahesab-1405-5-21",
    "title": "رحلت حضرت رسول اکرم (ص) - شهادت امام حسن مجتبی (ع)",
    "date": "1405-05-21",
    "type": "official"
  },
  {
    "id": "bahesab-1405-5-22",
    "title": "شهادت امام رضا (ع)",
    "date": "1405-05-22",
    "type": "official"
  },
  {
    "id": "bahesab-1405-5-30",
    "title": "شهادت امام حسن عسکری (ع) - آغاز امامت حضرت ولیعصر (عج)",
    "date": "1405-05-30",
    "type": "official"
  },
  {
    "id": "bahesab-1405-6-8",
    "title": "ولادت حضرت رسول اکرم (ص) - ولادت امام جعفر صادق (ع)",
    "date": "1405-06-08",
    "type": "official"
  },
  {
    "id": "bahesab-1405-8-22",
    "title": "شهادت حضرت فاطمه زهرا (س)",
    "date": "1405-08-22",
    "type": "official"
  },
  {
    "id": "bahesab-1405-10-2",
    "title": "ولادت امام علی (ع) - روز پدر",
    "date": "1405-10-02",
    "type": "official"
  },
  {
    "id": "bahesab-1405-10-16",
    "title": "مبعث حضرت رسول اکرم (ص)",
    "date": "1405-10-16",
    "type": "official"
  },
  {
    "id": "bahesab-1405-11-4",
    "title": "ولادت حضرت قائم عجل الله تعالی فرجه",
    "date": "1405-11-04",
    "type": "official"
  },
  {
    "id": "bahesab-1405-11-22",
    "title": "پیروزی انقلاب اسلامی ایران",
    "date": "1405-11-22",
    "type": "official"
  },
  {
    "id": "bahesab-1405-12-9",
    "title": "شهادت حضرت علی (ع)",
    "date": "1405-12-09",
    "type": "official"
  },
  {
    "id": "bahesab-1405-12-19",
    "title": "عید سعید فطر",
    "date": "1405-12-19",
    "type": "official"
  },
  {
    "id": "bahesab-1405-12-20",
    "title": "تعطیل به مناسبت عید سعید فطر",
    "date": "1405-12-20",
    "type": "official"
  },
  {
    "id": "bahesab-1405-12-29",
    "title": "روز ملی شدن صنعت نفت ایران",
    "date": "1405-12-29",
    "type": "official"
  }
];

const FAKE_DATA: Record<UserRole, DashboardData> = {
  admin: {
    stats: [
      { id:'users',  labelKey:'totalUsers',     value:'12,480', delta:'+8.2%',  trend:'up',      icon:'users'    },
      { id:'revenue',labelKey:'revenue',         value:'84.5M',  delta:'+12.5%', trend:'up',      icon:'wallet'   },
      { id:'orders', labelKey:'orders',           value:'3,127',  delta:'-2.1%',  trend:'down',    icon:'package'  },
      { id:'active', labelKey:'activeSessions',   value:'486',    delta:'+4.0%',  trend:'up',      icon:'activity' },
      { id:'growth', labelKey:'growth',           value:'15.3%',  delta:'+1.2%',  trend:'up',      icon:'check'    },
      { id:'bounce', labelKey:'bounceRate',       value:'42%',    delta:'-5.4%',  trend:'down',    icon:'clock'    },
    ],
    chart: chart([42,55,48,70,65,82]),
    activities: [
      {id:'a1',titleKey:'newUser',    timeKey:'minutes',count:4,  status:'success'},
      {id:'a2',titleKey:'payment',    timeKey:'minutes',count:22, status:'success'},
      {id:'a3',titleKey:'ticket',     timeKey:'hours',  count:1,  status:'pending'},
      {id:'a4',titleKey:'deploy',     timeKey:'hours',  count:3,  status:'success'},
    ],
    calendarEvents: [...REAL_EVENTS],
    checklist: [
      { id: 'cl1', title: 'Review Q3 Financials', completed: true },
      { id: 'cl2', title: 'Approve new hires', completed: false },
      { id: 'cl3', title: 'Update security policies', completed: false }
    ],
  },
  engineer: {
    stats: [
      { id:'projects',labelKey:'projects',       value:'8',  delta:'+1',   trend:'up',      icon:'package' },
      { id:'tickets', labelKey:'openTickets',     value:'14', delta:'-3',   trend:'down',    icon:'wrench'  },
      { id:'done',    labelKey:'completedTasks',  value:'57', delta:'+9',   trend:'up',      icon:'check'   },
      { id:'review',  labelKey:'pendingReview',   value:'5',  delta:'0',    trend:'neutral', icon:'clock'   },
      { id:'bugs',    labelKey:'bugs',            value:'12', delta:'-2',   trend:'down',    icon:'message' },
      { id:'deploys', labelKey:'deploys',         value:'24', delta:'+4',   trend:'up',      icon:'activity'},
    ],
    chart: chart([12,18,15,22,19,25]),
    activities: [
      {id:'e1',titleKey:'review',   timeKey:'minutes',count:12,status:'pending'},
      {id:'e2',titleKey:'deploy',   timeKey:'hours',  count:2, status:'success'},
      {id:'e3',titleKey:'taskDone', timeKey:'hours',  count:5, status:'success'},
      {id:'e4',titleKey:'ticket',   timeKey:'days',   count:1, status:'error'  },
    ],
    calendarEvents: [...REAL_EVENTS],
    checklist: [
      { id: 'cl1', title: 'Fix auth bug #342', completed: true },
      { id: 'cl2', title: 'Write tests for dashboard', completed: false },
      { id: 'cl3', title: 'Update documentation', completed: false }
    ],
  },
  staff: {
    stats: [
      { id:'today', labelKey:'tasksToday',    value:'11', delta:'+2', trend:'up',   icon:'check'    },
      { id:'done',  labelKey:'completedTasks',value:'38', delta:'+5', trend:'up',   icon:'activity' },
      { id:'tickets',labelKey:'openTickets',  value:'6',  delta:'-1', trend:'down', icon:'wrench'   },
      { id:'msgs',  labelKey:'messages',       value:'23', delta:'+7', trend:'up',   icon:'message'  },
      { id:'meetings',labelKey:'meetings',     value:'4',  delta:'0',  trend:'neutral', icon:'users'},
      { id:'hours', labelKey:'hoursLogged',    value:'32', delta:'+4', trend:'up',   icon:'clock'    },
    ],
    chart: chart([8,12,10,14,11,16]),
    activities: [
      {id:'s1',titleKey:'taskDone',timeKey:'minutes',count:8, status:'success'},
      {id:'s2',titleKey:'ticket',  timeKey:'minutes',count:35,status:'pending'},
      {id:'s3',titleKey:'newUser', timeKey:'hours',  count:2, status:'success'},
      {id:'s4',titleKey:'review',  timeKey:'hours',  count:4, status:'pending'},
    ],
    calendarEvents: [...REAL_EVENTS],
    checklist: [
      { id: 'cl1', title: 'Respond to 5 tickets', completed: true },
      { id: 'cl2', title: 'Complete compliance training', completed: false }
    ],
  },
  customer: {
    stats: [
      { id:'orders',  labelKey:'myOrders', value:'6',    delta:'+1',   trend:'up',      icon:'package' },
      { id:'invoices',labelKey:'invoices', value:'4',    delta:'0',    trend:'neutral', icon:'file'    },
      { id:'support', labelKey:'support',  value:'2',    delta:'-1',   trend:'down',    icon:'wrench'  },
      { id:'wallet',  labelKey:'wallet',   value:'1.2M', delta:'+3.4%',trend:'up',      icon:'wallet'  },
      { id:'rewards', labelKey:'rewards',  value:'450',  delta:'+50',  trend:'up',      icon:'check'   },
      { id:'views',   labelKey:'views',    value:'12K',  delta:'+1K',  trend:'up',      icon:'activity'},
    ],
    chart: chart([2,4,3,5,4,6]),
    activities: [
      {id:'c1',titleKey:'orderShipped',timeKey:'hours',count:3,status:'success'},
      {id:'c2',titleKey:'invoicePaid', timeKey:'days', count:1,status:'success'},
      {id:'c3',titleKey:'ticket',      timeKey:'days', count:2,status:'pending'},
      {id:'c4',titleKey:'payment',     timeKey:'days', count:4,status:'success'},
    ],
    calendarEvents: [...REAL_EVENTS],
    checklist: [
      { id: 'cl1', title: 'Verify email address', completed: true },
      { id: 'cl2', title: 'Add payment method', completed: false },
      { id: 'cl3', title: 'Complete profile setup', completed: false }
    ],
  },
};

export class FakeDashboardService implements IDashboardService {
  async getByRole(role: UserRole, statCards?: string[], chartSource?: string): Promise<DashboardData> {
    await wait(400);
    const baseData = { ...(FAKE_DATA[role] ?? FAKE_DATA.customer) };

    try {
      // Fetch live stats
      const cards = statCards || ['gold', 'gasoline', 'wti', 'sekee', 'eur', 'btc'];
      const commRes = await fetch('/api/commodities');
      if (commRes.ok) {
        const commData = await commRes.json();
        
        baseData.stats = cards.map((id, index) => {
          const item = commData.find((c: any) => c.id === id);
          if (!item) return baseData.stats[index]; // fallback

          return {
            id: item.id,
            labelKey: item.id,
            value: Number(item.price).toLocaleString('en-US'),
            delta: `${item.percentChange}%`,
            trend: item.trend || 'neutral',
            icon: item.category === 'forex' || item.category === 'crypto' ? 'wallet' : 'activity',
          };
        });
      }

      // Fetch live chart
      const chartRes = await fetch(`/api/chart?source=${chartSource || 'wti'}`);
      if (chartRes.ok) {
        const chartData = await chartRes.json();
        if (chartData && chartData.length > 0) {
           baseData.chart = chartData;
        }
      }

    } catch (e) {
      console.error('Failed to fetch live dashboard stats', e);
    }

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
