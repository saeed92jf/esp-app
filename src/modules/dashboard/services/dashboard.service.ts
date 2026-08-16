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
  type: 'meeting' | 'deadline' | 'review' | 'event';
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
    "id": "birth-1",
    "title": "تولد مهرداد طاهری‌پور",
    "date": "1405-05-05",
    "type": "birthday"
  },
  {
    "id": "birth-2",
    "title": "تولد داریوش مولایی",
    "date": "1405-05-01",
    "type": "birthday"
  },
  {
    "id": "birth-3",
    "title": "تولد مرتضی شفیعی",
    "date": "1405-06-25",
    "type": "birthday"
  },
  {
    "id": "birth-4",
    "title": "تولد عبدالحسين نادري",
    "date": "1405-09-04",
    "type": "birthday"
  },
  {
    "id": "birth-5",
    "title": "تولد مهدی پناهی",
    "date": "1405-05-25",
    "type": "birthday"
  },
  {
    "id": "birth-6",
    "title": "تولد ساسان نادری",
    "date": "1405-03-28",
    "type": "birthday"
  },
  {
    "id": "birth-7",
    "title": "تولد امین نریمان‌زاده",
    "date": "1405-06-30",
    "type": "birthday"
  },
  {
    "id": "birth-8",
    "title": "تولد پیمان شریفی",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-9",
    "title": "تولد علیرضا داوودی",
    "date": "1405-05-06",
    "type": "birthday"
  },
  {
    "id": "birth-10",
    "title": "تولد رضا صیادی",
    "date": "1405-02-05",
    "type": "birthday"
  },
  {
    "id": "birth-11",
    "title": "تولد محمد سعیدخانی",
    "date": "1405-06-22",
    "type": "birthday"
  },
  {
    "id": "birth-12",
    "title": "تولد مرتضی سعیدی",
    "date": "1405-09-23",
    "type": "birthday"
  },
  {
    "id": "birth-13",
    "title": "تولد مهدی تمادی",
    "date": "1405-01-04",
    "type": "birthday"
  },
  {
    "id": "birth-14",
    "title": "تولد کامران مولایی",
    "date": "1405-09-08",
    "type": "birthday"
  },
  {
    "id": "birth-15",
    "title": "تولد دانیال مولایی",
    "date": "1405-08-18",
    "type": "birthday"
  },
  {
    "id": "birth-16",
    "title": "تولد میلاد طاهری‌پور",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-17",
    "title": "تولد صبا آرمین‌فر",
    "date": "1405-02-12",
    "type": "birthday"
  },
  {
    "id": "birth-18",
    "title": "تولد میلاد چرمچی",
    "date": "1405-02-12",
    "type": "birthday"
  },
  {
    "id": "birth-19",
    "title": "تولد حسین غلام‌شاهی",
    "date": "1405-05-03",
    "type": "birthday"
  },
  {
    "id": "birth-20",
    "title": "تولد سعید جلیلی",
    "date": "1405-05-25",
    "type": "birthday"
  },
  {
    "id": "birth-21",
    "title": "تولد حسن حمرایی",
    "date": "1405-04-06",
    "type": "birthday"
  },
  {
    "id": "birth-22",
    "title": "تولد پژمان معتمدی‌راد",
    "date": "1405-06-30",
    "type": "birthday"
  },
  {
    "id": "birth-23",
    "title": "تولد پریسا صلاح‌پور",
    "date": "1405-02-09",
    "type": "birthday"
  },
  {
    "id": "birth-24",
    "title": "تولد مهدی صارمی",
    "date": "1405-01-24",
    "type": "birthday"
  },
  {
    "id": "birth-25",
    "title": "تولد علیرضا معصومیان",
    "date": "1405-03-31",
    "type": "birthday"
  },
  {
    "id": "birth-26",
    "title": "تولد رضا شریفی",
    "date": "1405-08-09",
    "type": "birthday"
  },
  {
    "id": "birth-27",
    "title": "تولد مهدی عباسی",
    "date": "1405-08-16",
    "type": "birthday"
  },
  {
    "id": "birth-28",
    "title": "تولد محمد حسینی‌فرد",
    "date": "1405-12-28",
    "type": "birthday"
  },
  {
    "id": "birth-29",
    "title": "تولد پدرام نویدی",
    "date": "1405-04-05",
    "type": "birthday"
  },
  {
    "id": "birth-30",
    "title": "تولد امین نویدیان‌فر",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-31",
    "title": "تولد سعید علیخانی",
    "date": "1405-09-19",
    "type": "birthday"
  },
  {
    "id": "birth-32",
    "title": "تولد سجاد جوکار",
    "date": "1405-12-20",
    "type": "birthday"
  },
  {
    "id": "birth-33",
    "title": "تولد محمد علیخانی",
    "date": "1405-02-11",
    "type": "birthday"
  },
  {
    "id": "birth-34",
    "title": "تولد تینا نژادحسن",
    "date": "1405-06-26",
    "type": "birthday"
  },
  {
    "id": "birth-35",
    "title": "تولد زهرا حسنی",
    "date": "1405-05-22",
    "type": "birthday"
  },
  {
    "id": "birth-36",
    "title": "تولد میثم امانت",
    "date": "1405-02-13",
    "type": "birthday"
  },
  {
    "id": "birth-37",
    "title": "تولد آرش همرنگ",
    "date": "1405-08-19",
    "type": "birthday"
  },
  {
    "id": "birth-39",
    "title": "تولد محمد فلاحی",
    "date": "1405-07-15",
    "type": "birthday"
  },
  {
    "id": "birth-40",
    "title": "تولد میلاد فرهی",
    "date": "1405-07-12",
    "type": "birthday"
  },
  {
    "id": "birth-41",
    "title": "تولد پریا خرم",
    "date": "1405-04-01",
    "type": "birthday"
  },
  {
    "id": "birth-42",
    "title": "تولد پریسا آجرلو",
    "date": "1405-01-18",
    "type": "birthday"
  },
  {
    "id": "birth-43",
    "title": "تولد علی یوسفی",
    "date": "1405-06-30",
    "type": "birthday"
  },
  {
    "id": "birth-44",
    "title": "تولد سینا جهانبخش",
    "date": "1405-03-28",
    "type": "birthday"
  },
  {
    "id": "birth-45",
    "title": "تولد سعید اکبری",
    "date": "1405-12-06",
    "type": "birthday"
  },
  {
    "id": "birth-46",
    "title": "تولد حسین طیار",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-48",
    "title": "تولد کسری نجار",
    "date": "1405-12-25",
    "type": "birthday"
  },
  {
    "id": "birth-49",
    "title": "تولد مرتضی خوب بخت",
    "date": "1405-03-12",
    "type": "birthday"
  },
  {
    "id": "birth-50",
    "title": "تولد حامد نیکخو",
    "date": "1405-10-06",
    "type": "birthday"
  },
  {
    "id": "birth-52",
    "title": "تولد محسن سپهری",
    "date": "1405-12-20",
    "type": "birthday"
  },
  {
    "id": "birth-53",
    "title": "تولد مهراب پسیان",
    "date": "1405-03-13",
    "type": "birthday"
  },
  {
    "id": "birth-54",
    "title": "تولد امیر فراهانی",
    "date": "1405-12-01",
    "type": "birthday"
  },
  {
    "id": "birth-55",
    "title": "تولد فاطمه کلهر",
    "date": "1405-05-02",
    "type": "birthday"
  },
  {
    "id": "birth-56",
    "title": "تولد مژگان دبیری",
    "date": "1405-05-02",
    "type": "birthday"
  },
  {
    "id": "birth-57",
    "title": "تولد علی فرهنگ",
    "date": "1405-06-10",
    "type": "birthday"
  },
  {
    "id": "birth-58",
    "title": "تولد محمدرضا فرهادی",
    "date": "1405-04-06",
    "type": "birthday"
  },
  {
    "id": "birth-59",
    "title": "تولد موسی فرشاد",
    "date": "1405-03-07",
    "type": "birthday"
  },
  {
    "id": "birth-60",
    "title": "تولد صبا کبریایی",
    "date": "1405-11-01",
    "type": "birthday"
  },
  {
    "id": "birth-61",
    "title": "تولد فرزاد شیرینی‌زاده",
    "date": "1405-01-17",
    "type": "birthday"
  },
  {
    "id": "birth-62",
    "title": "تولد بهرام رخسایی",
    "date": "1405-10-20",
    "type": "birthday"
  },
  {
    "id": "birth-63",
    "title": "تولد حسن نیکخو",
    "date": "1405-05-07",
    "type": "birthday"
  },
  {
    "id": "birth-65",
    "title": "تولد پانته آ داودی",
    "date": "1405-02-18",
    "type": "birthday"
  },
  {
    "id": "birth-67",
    "title": "تولد تارا داوری",
    "date": "1405-07-18",
    "type": "birthday"
  },
  {
    "id": "birth-71",
    "title": "تولد حسین برپروشان",
    "date": "1405-03-15",
    "type": "birthday"
  },
  {
    "id": "birth-72",
    "title": "تولد امیرمحمد ساسان پور",
    "date": "1405-07-30",
    "type": "birthday"
  },
  {
    "id": "birth-73",
    "title": "تولد نرگس کاشانی",
    "date": "1405-03-31",
    "type": "birthday"
  },
  {
    "id": "birth-76",
    "title": "تولد نادر جودکی",
    "date": "1405-02-06",
    "type": "birthday"
  },
  {
    "id": "birth-77",
    "title": "تولد علیرضا گنجوی",
    "date": "1405-03-02",
    "type": "birthday"
  },
  {
    "id": "birth-78",
    "title": "تولد جابر ده نمکی",
    "date": "1405-11-25",
    "type": "birthday"
  },
  {
    "id": "birth-79",
    "title": "تولد امین بهرامی",
    "date": "1405-06-02",
    "type": "birthday"
  },
  {
    "id": "birth-80",
    "title": "تولد آرمین حاج‌آقایی",
    "date": "1405-05-17",
    "type": "birthday"
  },
  {
    "id": "birth-81",
    "title": "تولد ابوالفضل خواجه‌ای",
    "date": "1405-06-21",
    "type": "birthday"
  },
  {
    "id": "birth-82",
    "title": "تولد محمد سعادت‌خواه",
    "date": "1405-04-15",
    "type": "birthday"
  },
  {
    "id": "birth-83",
    "title": "تولد شهرام سهرابی",
    "date": "1405-09-26",
    "type": "birthday"
  },
  {
    "id": "birth-84",
    "title": "تولد علی باقری",
    "date": "1405-10-27",
    "type": "birthday"
  },
  {
    "id": "birth-85",
    "title": "تولد علی حاجیوند",
    "date": "1405-05-04",
    "type": "birthday"
  },
  {
    "id": "birth-86",
    "title": "تولد کیوان امیری",
    "date": "1405-04-19",
    "type": "birthday"
  },
  {
    "id": "birth-87",
    "title": "تولد آرمین نخعی",
    "date": "1405-03-08",
    "type": "birthday"
  },
  {
    "id": "birth-88",
    "title": "تولد عرفان عبداللهی",
    "date": "1405-02-09",
    "type": "birthday"
  },
  {
    "id": "birth-89",
    "title": "تولد حسن نادری",
    "date": "1405-06-26",
    "type": "birthday"
  },
  {
    "id": "birth-90",
    "title": "تولد فرشاد مرادی",
    "date": "1405-09-27",
    "type": "birthday"
  },
  {
    "id": "birth-91",
    "title": "تولد امیر خیرآبادی",
    "date": "1405-10-16",
    "type": "birthday"
  },
  {
    "id": "birth-92",
    "title": "تولد سینا سلیمانی",
    "date": "1405-06-29",
    "type": "birthday"
  },
  {
    "id": "birth-93",
    "title": "تولد سلمان کوراوند",
    "date": "1405-01-29",
    "type": "birthday"
  },
  {
    "id": "birth-94",
    "title": "تولد کیوان محمدی",
    "date": "1405-05-31",
    "type": "birthday"
  },
  {
    "id": "birth-95",
    "title": "تولد مهدی بهشتی",
    "date": "1405-11-05",
    "type": "birthday"
  },
  {
    "id": "birth-96",
    "title": "تولد عاطفه موسوی",
    "date": "1405-08-13",
    "type": "birthday"
  },
  {
    "id": "birth-97",
    "title": "تولد منصور نیازی",
    "date": "1405-07-11",
    "type": "birthday"
  },
  {
    "id": "birth-98",
    "title": "تولد رضا سعادتی‌خواه",
    "date": "1405-04-15",
    "type": "birthday"
  },
  {
    "id": "birth-99",
    "title": "تولد میلاد هاشمی",
    "date": "1405-06-17",
    "type": "birthday"
  },
  {
    "id": "birth-100",
    "title": "تولد احمد نظرپور",
    "date": "1405-09-15",
    "type": "birthday"
  },
  {
    "id": "birth-101",
    "title": "تولد ایوب مرادی",
    "date": "1405-11-22",
    "type": "birthday"
  },
  {
    "id": "birth-102",
    "title": "تولد ابوالفضل کریمی",
    "date": "1405-09-04",
    "type": "birthday"
  },
  {
    "id": "birth-103",
    "title": "تولد مرتضی شاکری",
    "date": "1405-02-25",
    "type": "birthday"
  },
  {
    "id": "birth-104",
    "title": "تولد سینا علی ویسی",
    "date": "1405-04-01",
    "type": "birthday"
  },
  {
    "id": "birth-105",
    "title": "تولد مجید کارچانی",
    "date": "1405-07-01",
    "type": "birthday"
  },
  {
    "id": "birth-106",
    "title": "تولد روح اله حقی اردی",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-107",
    "title": "تولد محمد انقانی",
    "date": "1405-06-29",
    "type": "birthday"
  },
  {
    "id": "birth-108",
    "title": "تولد محمد حاتمی",
    "date": "1405-01-14",
    "type": "birthday"
  },
  {
    "id": "birth-109",
    "title": "تولد شهریار نادری",
    "date": "1405-07-15",
    "type": "birthday"
  },
  {
    "id": "birth-110",
    "title": "تولد بهزاد مرادی",
    "date": "1405-03-20",
    "type": "birthday"
  },
  {
    "id": "birth-111",
    "title": "تولد علی عسکر قمری",
    "date": "1405-12-01",
    "type": "birthday"
  },
  {
    "id": "birth-112",
    "title": "تولد حمیدرضا ربیعی",
    "date": "1405-06-28",
    "type": "birthday"
  },
  {
    "id": "birth-113",
    "title": "تولد داود فراهانی",
    "date": "1405-05-20",
    "type": "birthday"
  },
  {
    "id": "birth-114",
    "title": "تولد حسین نادری",
    "date": "1405-06-26",
    "type": "birthday"
  },
  {
    "id": "birth-115",
    "title": "تولد سلیمان تبرته فراهانی",
    "date": "1405-05-10",
    "type": "birthday"
  },
  {
    "id": "birth-116",
    "title": "تولد موسی کارچانی",
    "date": "1405-03-04",
    "type": "birthday"
  },
  {
    "id": "birth-117",
    "title": "تولد حمید نیک پندار",
    "date": "1405-01-22",
    "type": "birthday"
  },
  {
    "id": "birth-118",
    "title": "تولد امیر باجلانی فر",
    "date": "1405-08-22",
    "type": "birthday"
  },
  {
    "id": "birth-119",
    "title": "تولد هادی سلطان پور",
    "date": "1405-06-29",
    "type": "birthday"
  },
  {
    "id": "birth-120",
    "title": "تولد اسماعیل عظیمی",
    "date": "1405-05-16",
    "type": "birthday"
  },
  {
    "id": "birth-121",
    "title": "تولد رضا ربیعی",
    "date": "1405-02-28",
    "type": "birthday"
  },
  {
    "id": "birth-122",
    "title": "تولد حمید عظیمی",
    "date": "1405-06-27",
    "type": "birthday"
  },
  {
    "id": "birth-123",
    "title": "تولد شهاب سنجابی",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-124",
    "title": "تولد بهروز مرادی",
    "date": "1405-04-13",
    "type": "birthday"
  },
  {
    "id": "birth-125",
    "title": "تولد حمید احمدی سر چقائی",
    "date": "1405-11-11",
    "type": "birthday"
  },
  {
    "id": "birth-126",
    "title": "تولد سعید شمسی",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-127",
    "title": "تولد سهراب نعمتی",
    "date": "1405-03-10",
    "type": "birthday"
  },
  {
    "id": "birth-128",
    "title": "تولد اکبر شفیعی",
    "date": "1405-04-10",
    "type": "birthday"
  },
  {
    "id": "birth-129",
    "title": "تولد مهدی انقانی",
    "date": "1405-03-22",
    "type": "birthday"
  },
  {
    "id": "birth-130",
    "title": "تولد فریدون آذین مهر",
    "date": "1405-10-28",
    "type": "birthday"
  },
  {
    "id": "birth-131",
    "title": "تولد هادی پایمرد",
    "date": "1405-07-23",
    "type": "birthday"
  },
  {
    "id": "birth-132",
    "title": "تولد امید نادری",
    "date": "1405-08-28",
    "type": "birthday"
  },
  {
    "id": "birth-133",
    "title": "تولد مرتضی حیدرزاده",
    "date": "1405-01-15",
    "type": "birthday"
  },
  {
    "id": "birth-134",
    "title": "تولد سجاد درخشان کلیانی",
    "date": "1405-08-18",
    "type": "birthday"
  },
  {
    "id": "birth-135",
    "title": "تولد مصطفی انقانی",
    "date": "1405-05-01",
    "type": "birthday"
  },
  {
    "id": "birth-136",
    "title": "تولد محمد ملکی نورین",
    "date": "1405-04-27",
    "type": "birthday"
  },
  {
    "id": "birth-137",
    "title": "تولد یزدان بالی",
    "date": "1405-02-21",
    "type": "birthday"
  },
  {
    "id": "birth-138",
    "title": "تولد حشمت اله قادری",
    "date": "1405-01-23",
    "type": "birthday"
  },
  {
    "id": "birth-139",
    "title": "تولد ولی اله عباسی",
    "date": "1405-11-02",
    "type": "birthday"
  },
  {
    "id": "birth-140",
    "title": "تولد سید مهدی افضل آبادی",
    "date": "1405-04-01",
    "type": "birthday"
  },
  {
    "id": "birth-141",
    "title": "تولد مهدی زارعی",
    "date": "1405-02-29",
    "type": "birthday"
  },
  {
    "id": "birth-142",
    "title": "تولد علی مهدوی",
    "date": "1405-12-18",
    "type": "birthday"
  },
  {
    "id": "birth-143",
    "title": "تولد امید علی سعدی",
    "date": "1405-07-07",
    "type": "birthday"
  },
  {
    "id": "birth-144",
    "title": "تولد محسن درویش سرلک",
    "date": "1405-12-20",
    "type": "birthday"
  },
  {
    "id": "birth-145",
    "title": "تولد آرش امانی",
    "date": "1405-05-17",
    "type": "birthday"
  },
  {
    "id": "birth-146",
    "title": "تولد سعید کارچانی",
    "date": "1405-06-01",
    "type": "birthday"
  },
  {
    "id": "birth-147",
    "title": "تولد جمال مهدوی",
    "date": "1405-07-09",
    "type": "birthday"
  },
  {
    "id": "birth-148",
    "title": "تولد مسعود نادبی زاده",
    "date": "1405-04-08",
    "type": "birthday"
  },
  {
    "id": "birth-149",
    "title": "تولد جبار مجیدی",
    "date": "1405-08-09",
    "type": "birthday"
  },
  {
    "id": "birth-150",
    "title": "تولد مهدی بخشی صوفلو",
    "date": "1405-03-13",
    "type": "birthday"
  },
  {
    "id": "birth-151",
    "title": "تولد محمد کرمی",
    "date": "1405-11-27",
    "type": "birthday"
  },
  {
    "id": "birth-152",
    "title": "تولد امید مهدوی",
    "date": "1405-10-03",
    "type": "birthday"
  },
  {
    "id": "birth-153",
    "title": "تولد محمود فتاحی",
    "date": "1405-02-01",
    "type": "birthday"
  },
  {
    "id": "birth-154",
    "title": "تولد سیف اله محمدزاده",
    "date": "1405-03-01",
    "type": "birthday"
  },
  {
    "id": "birth-155",
    "title": "تولد اصغر زندی آتش بار",
    "date": "1405-06-15",
    "type": "birthday"
  },
  {
    "id": "birth-156",
    "title": "تولد حجت اله کارچانی",
    "date": "1405-06-20",
    "type": "birthday"
  },
  {
    "id": "birth-157",
    "title": "تولد مهدی هاشمی",
    "date": "1405-06-07",
    "type": "birthday"
  },
  {
    "id": "birth-158",
    "title": "تولد مهدی سعادت نژاد",
    "date": "1405-03-31",
    "type": "birthday"
  },
  {
    "id": "birth-159",
    "title": "تولد غلامحسین حسنی",
    "date": "1405-03-08",
    "type": "birthday"
  },
  {
    "id": "birth-160",
    "title": "تولد کامران محمدی",
    "date": "1405-06-30",
    "type": "birthday"
  },
  {
    "id": "birth-161",
    "title": "تولد فرهاد حقی اردی",
    "date": "1405-08-09",
    "type": "birthday"
  },
  {
    "id": "birth-162",
    "title": "تولد بهروز نظام پور",
    "date": "1405-03-16",
    "type": "birthday"
  },
  {
    "id": "birth-163",
    "title": "تولد عین اله مرتضی ناسی",
    "date": "1405-06-25",
    "type": "birthday"
  },
  {
    "id": "birth-164",
    "title": "تولد رضا تاج آبادی",
    "date": "1405-11-15",
    "type": "birthday"
  },
  {
    "id": "birth-165",
    "title": "تولد حسین جهان تاب",
    "date": "1405-09-16",
    "type": "birthday"
  },
  {
    "id": "birth-166",
    "title": "تولد کامبیز نظامپور",
    "date": "1405-04-04",
    "type": "birthday"
  },
  {
    "id": "birth-167",
    "title": "تولد واحد آقا مرادی",
    "date": "1405-12-01",
    "type": "birthday"
  },
  {
    "id": "birth-168",
    "title": "تولد حسین محرم",
    "date": "1405-05-01",
    "type": "birthday"
  },
  {
    "id": "birth-169",
    "title": "تولد محسن برزگر لالو",
    "date": "1405-04-24",
    "type": "birthday"
  },
  {
    "id": "birth-170",
    "title": "تولد مهدی نعمتی",
    "date": "1405-01-23",
    "type": "birthday"
  },
  {
    "id": "birth-171",
    "title": "تولد محمد فراهانی",
    "date": "1405-11-22",
    "type": "birthday"
  },
  {
    "id": "birth-172",
    "title": "تولد مسعود شریفی",
    "date": "1405-06-28",
    "type": "birthday"
  },
  {
    "id": "birth-173",
    "title": "تولد شهریار علیزاده ترازوج",
    "date": "1405-10-05",
    "type": "birthday"
  },
  {
    "id": "birth-174",
    "title": "تولد فیض علی علیزاده ترازوج",
    "date": "1405-03-02",
    "type": "birthday"
  },
  {
    "id": "birth-175",
    "title": "تولد مجتبی آزادبخت",
    "date": "1405-04-16",
    "type": "birthday"
  },
  {
    "id": "birth-176",
    "title": "تولد محمد کاظمی",
    "date": "1405-08-12",
    "type": "birthday"
  },
  {
    "id": "birth-177",
    "title": "تولد عرفان آزادبخت",
    "date": "1405-07-10",
    "type": "birthday"
  },
  {
    "id": "birth-178",
    "title": "تولد نعمت محرم",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-179",
    "title": "تولد امید بیگلری",
    "date": "1405-09-06",
    "type": "birthday"
  },
  {
    "id": "birth-180",
    "title": "تولد سعید مرادی",
    "date": "1405-10-22",
    "type": "birthday"
  },
  {
    "id": "birth-181",
    "title": "تولد رضا غمگسار",
    "date": "1405-12-06",
    "type": "birthday"
  },
  {
    "id": "birth-182",
    "title": "تولد شیدا برزگر",
    "date": "1405-01-20",
    "type": "birthday"
  },
  {
    "id": "birth-183",
    "title": "تولد جمشید حنیفه زاده",
    "date": "1405-04-30",
    "type": "birthday"
  },
  {
    "id": "birth-184",
    "title": "تولد اصغر گل پذیر",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-185",
    "title": "تولد امید شهروز",
    "date": "1405-10-10",
    "type": "birthday"
  },
  {
    "id": "birth-186",
    "title": "تولد مهدی علی مددی",
    "date": "1405-05-12",
    "type": "birthday"
  },
  {
    "id": "birth-187",
    "title": "تولد داریوش فیضی",
    "date": "1405-04-07",
    "type": "birthday"
  },
  {
    "id": "birth-188",
    "title": "تولد عبدالحسین مؤمن قادی",
    "date": "1405-06-06",
    "type": "birthday"
  },
  {
    "id": "birth-189",
    "title": "تولد فرهاد سالاروند",
    "date": "1405-11-28",
    "type": "birthday"
  },
  {
    "id": "birth-190",
    "title": "تولد فاطمه تیزمغز",
    "date": "1405-05-11",
    "type": "birthday"
  },
  {
    "id": "birth-191",
    "title": "تولد فاطمه جلالی",
    "date": "1405-12-11",
    "type": "birthday"
  },
  {
    "id": "birth-192",
    "title": "تولد مهدی مهدوی",
    "date": "1405-03-12",
    "type": "birthday"
  },
  {
    "id": "birth-193",
    "title": "تولد سجاد عزیزی",
    "date": "1405-05-15",
    "type": "birthday"
  },
  {
    "id": "birth-194",
    "title": "تولد شهریار خالوند",
    "date": "1405-10-14",
    "type": "birthday"
  },
  {
    "id": "birth-195",
    "title": "تولد میثم ابراهیمی",
    "date": "1405-01-23",
    "type": "birthday"
  },
  {
    "id": "birth-196",
    "title": "تولد مهران پاشایی ربیع",
    "date": "1405-05-04",
    "type": "birthday"
  },
  {
    "id": "birth-197",
    "title": "تولد امید کارچانی",
    "date": "1405-07-24",
    "type": "birthday"
  },
  {
    "id": "birth-198",
    "title": "تولد عارف کارچانی",
    "date": "1405-12-11",
    "type": "birthday"
  },
  {
    "id": "birth-199",
    "title": "تولد محمدصادق حمیدی نیک",
    "date": "1405-04-17",
    "type": "birthday"
  },
  {
    "id": "birth-200",
    "title": "تولد مهیار فراهانی",
    "date": "1405-05-09",
    "type": "birthday"
  },
  {
    "id": "birth-201",
    "title": "تولد سعید معصومی",
    "date": "1405-06-22",
    "type": "birthday"
  },
  {
    "id": "birth-202",
    "title": "تولد ساناز پناه پور",
    "date": "1405-01-26",
    "type": "birthday"
  },
  {
    "id": "birth-203",
    "title": "تولد رضا عبدی",
    "date": "1405-04-12",
    "type": "birthday"
  },
  {
    "id": "birth-204",
    "title": "تولد رسول طبقی سردهائی",
    "date": "1405-06-07",
    "type": "birthday"
  },
  {
    "id": "birth-205",
    "title": "تولد بهادر تبار کسانی",
    "date": "1405-01-08",
    "type": "birthday"
  },
  {
    "id": "birth-206",
    "title": "تولد عابد محمدی",
    "date": "1405-04-16",
    "type": "birthday"
  },
  {
    "id": "birth-207",
    "title": "تولد محمدرضا هیودی",
    "date": "1405-04-26",
    "type": "birthday"
  },
  {
    "id": "birth-208",
    "title": "تولد امید کارچانی",
    "date": "1405-04-01",
    "type": "birthday"
  },
  {
    "id": "birth-209",
    "title": "تولد محسن خرسند",
    "date": "1405-12-15",
    "type": "birthday"
  },
  {
    "id": "birth-210",
    "title": "تولد علی اشرف نادری",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-211",
    "title": "تولد کورش بگ زاده",
    "date": "1405-08-29",
    "type": "birthday"
  },
  {
    "id": "birth-212",
    "title": "تولد محمد ماهرویی",
    "date": "1405-09-16",
    "type": "birthday"
  },
  {
    "id": "birth-213",
    "title": "تولد مهرداد عرب",
    "date": "1405-10-17",
    "type": "birthday"
  },
  {
    "id": "birth-214",
    "title": "تولد بهرام مهدوی",
    "date": "1405-11-18",
    "type": "birthday"
  },
  {
    "id": "birth-215",
    "title": "تولد علی اصغر خدارحمی",
    "date": "1405-01-15",
    "type": "birthday"
  },
  {
    "id": "birth-216",
    "title": "تولد حسین عزیزی پور",
    "date": "1405-02-03",
    "type": "birthday"
  },
  {
    "id": "birth-217",
    "title": "تولد فرهاد چراغ پور",
    "date": "1405-12-28",
    "type": "birthday"
  },
  {
    "id": "birth-218",
    "title": "تولد صنعان اکبری",
    "date": "1405-03-13",
    "type": "birthday"
  },
  {
    "id": "birth-219",
    "title": "تولد علی لک",
    "date": "1405-10-01",
    "type": "birthday"
  },
  {
    "id": "birth-220",
    "title": "تولد حجت اله طاهری شمس آبادی",
    "date": "1405-07-22",
    "type": "birthday"
  },
  {
    "id": "birth-221",
    "title": "تولد بهروز امینی فرد بروجنی",
    "date": "1405-12-11",
    "type": "birthday"
  },
  {
    "id": "birth-222",
    "title": "تولد پیمان تقی پور بیرگانی",
    "date": "1405-10-20",
    "type": "birthday"
  },
  {
    "id": "birth-223",
    "title": "تولد علی رامتین",
    "date": "1405-05-10",
    "type": "birthday"
  },
  {
    "id": "birth-224",
    "title": "تولد وحید کرد زنگنه",
    "date": "1405-06-27",
    "type": "birthday"
  },
  {
    "id": "birth-225",
    "title": "تولد سید محسن افضل آبادی",
    "date": "1405-11-25",
    "type": "birthday"
  },
  {
    "id": "birth-226",
    "title": "تولد امین امرایی",
    "date": "1405-05-02",
    "type": "birthday"
  },
  {
    "id": "birth-227",
    "title": "تولد عزت اله علی ویسی",
    "date": "1405-03-01",
    "type": "birthday"
  },
  {
    "id": "birth-228",
    "title": "تولد محمد اسدی",
    "date": "1405-02-20",
    "type": "birthday"
  },
  {
    "id": "birth-229",
    "title": "تولد سجاد گودرزی",
    "date": "1405-08-16",
    "type": "birthday"
  },
  {
    "id": "birth-230",
    "title": "تولد فرشید وثوقی خوانشیر",
    "date": "1405-02-30",
    "type": "birthday"
  },
  {
    "id": "birth-231",
    "title": "تولد یوسف خانعلی زاده",
    "date": "1405-03-04",
    "type": "birthday"
  },
  {
    "id": "birth-232",
    "title": "تولد محمد نادری کیا",
    "date": "1405-01-03",
    "type": "birthday"
  },
  {
    "id": "birth-233",
    "title": "تولد علی کریمی",
    "date": "1405-03-10",
    "type": "birthday"
  },
  {
    "id": "birth-234",
    "title": "تولد سعید معتمد علیخانی",
    "date": "1405-04-22",
    "type": "birthday"
  },
  {
    "id": "birth-235",
    "title": "تولد علیرضا شیرازی",
    "date": "1405-06-20",
    "type": "birthday"
  },
  {
    "id": "birth-236",
    "title": "تولد حسین وفا",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-237",
    "title": "تولد بهرام تکاور",
    "date": "1405-06-28",
    "type": "birthday"
  },
  {
    "id": "birth-238",
    "title": "تولد محمدمهدی قمری",
    "date": "1405-09-05",
    "type": "birthday"
  },
  {
    "id": "birth-239",
    "title": "تولد حمید احمدی",
    "date": "1405-09-24",
    "type": "birthday"
  },
  {
    "id": "birth-240",
    "title": "تولد حسین عبدی",
    "date": "1405-07-11",
    "type": "birthday"
  },
  {
    "id": "birth-241",
    "title": "تولد فرهاد نادری",
    "date": "1405-02-11",
    "type": "birthday"
  },
  {
    "id": "birth-242",
    "title": "تولد سید علی موسوی زاده",
    "date": "1405-09-08",
    "type": "birthday"
  },
  {
    "id": "birth-243",
    "title": "تولد حمید شیرازی",
    "date": "1405-07-15",
    "type": "birthday"
  },
  {
    "id": "birth-244",
    "title": "تولد حمیدرضا رحمتی",
    "date": "1405-05-08",
    "type": "birthday"
  },
  {
    "id": "birth-245",
    "title": "تولد هادی اکبری",
    "date": "1405-06-31",
    "type": "birthday"
  },
  {
    "id": "birth-246",
    "title": "تولد محمدرضا برهانی",
    "date": "1405-12-21",
    "type": "birthday"
  },
  {
    "id": "birth-247",
    "title": "تولد حسین مومن قادی",
    "date": "1405-10-09",
    "type": "birthday"
  },
  {
    "id": "birth-248",
    "title": "تولد محمدرضا رستمی خاصلوئی",
    "date": "1405-11-01",
    "type": "birthday"
  },
  {
    "id": "birth-249",
    "title": "تولد سید مهدی یوسف زاده",
    "date": "1405-08-29",
    "type": "birthday"
  },
  {
    "id": "birth-250",
    "title": "تولد سحر مهدوی",
    "date": "1405-05-13",
    "type": "birthday"
  },
  {
    "id": "birth-251",
    "title": "تولد امید پورامیدی",
    "date": "1405-06-18",
    "type": "birthday"
  },
  {
    "id": "birth-252",
    "title": "تولد سید امیر موسوی زاده",
    "date": "1405-03-15",
    "type": "birthday"
  },
  {
    "id": "birth-253",
    "title": "تولد محمدرضا برمکی تقی دزج",
    "date": "1405-03-20",
    "type": "birthday"
  },
  {
    "id": "birth-254",
    "title": "تولد امیرحسین خیرآبادی",
    "date": "1405-06-23",
    "type": "birthday"
  },
  {
    "id": "birth-255",
    "title": "تولد فرهاد مرادزاده",
    "date": "1405-06-01",
    "type": "birthday"
  },
  {
    "id": "birth-256",
    "title": "تولد امیر عینی",
    "date": "1405-02-11",
    "type": "birthday"
  },
  {
    "id": "birth-257",
    "title": "تولد عادل اسفندیاری",
    "date": "1405-09-30",
    "type": "birthday"
  },
  {
    "id": "birth-258",
    "title": "تولد یوسف پنجه کوبی",
    "date": "1405-12-15",
    "type": "birthday"
  },
  {
    "id": "birth-259",
    "title": "تولد احمد رمضانپور",
    "date": "1405-08-09",
    "type": "birthday"
  },
  {
    "id": "birth-260",
    "title": "تولد ایمان بگدلی",
    "date": "1405-11-12",
    "type": "birthday"
  },
  {
    "id": "birth-261",
    "title": "تولد مهدی امان اله نژاد",
    "date": "1405-11-16",
    "type": "birthday"
  },
  {
    "id": "birth-262",
    "title": "تولد رسول سرخانی کرد کندی",
    "date": "1405-04-24",
    "type": "birthday"
  },
  {
    "id": "birth-264",
    "title": "تولد ابوالقاسم زبردستی",
    "date": "1405-05-28",
    "type": "birthday"
  },
  {
    "id": "birth-265",
    "title": "تولد سهیل فتاحی",
    "date": "1405-03-24",
    "type": "birthday"
  },
  {
    "id": "birth-266",
    "title": "تولد محسن فدایی",
    "date": "1405-08-23",
    "type": "birthday"
  },
  {
    "id": "birth-267",
    "title": "تولد محمد زارعی",
    "date": "1405-07-01",
    "type": "birthday"
  },
  {
    "id": "birth-268",
    "title": "تولد بهمن محمودی",
    "date": "1405-01-12",
    "type": "birthday"
  },
  {
    "id": "birth-269",
    "title": "تولد حمیدرضا فیض آبادی",
    "date": "1405-03-01",
    "type": "birthday"
  },
  {
    "id": "birth-270",
    "title": "تولد علی اخلاقی داریونی",
    "date": "1405-04-08",
    "type": "birthday"
  },
  {
    "id": "birth-271",
    "title": "تولد عباس دارابی",
    "date": "1405-06-20",
    "type": "birthday"
  },
  {
    "id": "birth-272",
    "title": "تولد جمیل رستمی",
    "date": "1405-09-13",
    "type": "birthday"
  },
  {
    "id": "birth-273",
    "title": "تولد همایون قمری",
    "date": "1405-01-01",
    "type": "birthday"
  },
  {
    "id": "birth-274",
    "title": "تولد بابک صیامی کیوی",
    "date": "1405-01-20",
    "type": "birthday"
  },
  {
    "id": "birth-275",
    "title": "تولد امیرحسین اسلامی",
    "date": "1405-02-04",
    "type": "birthday"
  },
  {
    "id": "birth-276",
    "title": "تولد فرهاد علیزاده ترازوج",
    "date": "1405-04-23",
    "type": "birthday"
  },
  {
    "id": "birth-277",
    "title": "تولد دانیال یدالهی آستانه",
    "date": "1405-08-14",
    "type": "birthday"
  },
  {
    "id": "birth-278",
    "title": "تولد داریوش شفیعی",
    "date": "1405-03-04",
    "type": "birthday"
  },
  {
    "id": "birth-279",
    "title": "تولد میلاد هنرمند چوبری",
    "date": "1405-05-17",
    "type": "birthday"
  },
  {
    "id": "birth-280",
    "title": "تولد سهراب رستم زاده",
    "date": "1405-07-22",
    "type": "birthday"
  },
  {
    "id": "birth-281",
    "title": "تولد میثم رضاخان نژاد",
    "date": "1405-05-08",
    "type": "birthday"
  },
  {
    "id": "birth-282",
    "title": "تولد حسین تنها",
    "date": "1405-04-01",
    "type": "birthday"
  },
  {
    "id": "birth-283",
    "title": "تولد سعید صفری",
    "date": "1405-07-29",
    "type": "birthday"
  },
  {
    "id": "birth-284",
    "title": "تولد ابوالفضل تنها",
    "date": "1405-11-06",
    "type": "birthday"
  },
  {
    "id": "birth-286",
    "title": "تولد مرتضی شفیعی",
    "date": "1405-06-25",
    "type": "birthday"
  },
  {
    "id": "birth-287",
    "title": "تولد حلا حدادی",
    "date": "1405-08-17",
    "type": "birthday"
  },
  {
    "id": "birth-288",
    "title": "تولد آیسو حسین زاده",
    "date": "1405-11-08",
    "type": "birthday"
  },
  {
    "id": "beytoote-1405-1-1",
    "title": "جشن نوروز/جشن سال نو - عید سعید فطر [ ۱ شوال ] - روز جهانی نوروز [ March 21 ]",
    "date": "1405-01-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-2",
    "title": "عیدنوروز - تعطیل به مناسبت عید سعید فطر [ ۲ شوال ]",
    "date": "1405-01-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-3",
    "title": "عیدنوروز - روز جهانی هواشناسی [ March 23 ]",
    "date": "1405-01-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-4",
    "title": "عیدنوروز",
    "date": "1405-01-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-6",
    "title": "روز امید، روز شادباش نویسی - زادروز اَشو زرتشت، اَبَراِنسان بزرگ تاریخ",
    "date": "1405-01-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-7",
    "title": "روز جهانی تئاتر [ March 27 ]",
    "date": "1405-01-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-10",
    "title": "جشن آبانگاه",
    "date": "1405-01-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-12",
    "title": "روز جمهوری اسلامی",
    "date": "1405-01-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-13",
    "title": "جشن سیزده به در",
    "date": "1405-01-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-17",
    "title": "سروش روز،جشن سروشگان",
    "date": "1405-01-17",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-18",
    "title": "روز جهانی بهداشت [ April 7 ]",
    "date": "1405-01-18",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-19",
    "title": "فروردین روز،جشن فروردینگان",
    "date": "1405-01-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-23",
    "title": "روز دندانپزشک",
    "date": "1405-01-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-25",
    "title": "روز بزرگداشت عطار نیشابوری - شهادت امام جعفر صادق (ع) [ ۲۵ شوال ]",
    "date": "1405-01-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-29",
    "title": "روز ارتش جمهوری اسلامی ایران",
    "date": "1405-01-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-30",
    "title": "ولادت حضرت معصومه (س)، روز دختران [ ۱ ذوالقعده ] - روز علوم آزمایشگاهی، زاد روز حکیم سید اسماعیل جرجانی",
    "date": "1405-01-30",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-1",
    "title": "روز بزرگداشت سعدی",
    "date": "1405-02-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-2",
    "title": "جشن گیاه آوری؛ روز زمین [ April 22 ]",
    "date": "1405-02-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-3",
    "title": "روزبزرگداشت شیخ بهایی؛ روزملی کارآفرینی؛ روز معماری",
    "date": "1405-02-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-6",
    "title": "فاجعه‌ی انفجارِ بندر عباس [ 1404 خورشیدی]",
    "date": "1405-02-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-7",
    "title": "روز جهانی طراحی و گرافیک [ April 27 ]",
    "date": "1405-02-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-9",
    "title": "ولادت امام رضا (ع) [ ۱۱ ذوالقعده ] - روز ملی روانشناس و مشاور",
    "date": "1405-02-09",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-10",
    "title": "جشن چهلم نوروز؛ روز ملی خلیج فارس",
    "date": "1405-02-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-11",
    "title": "روزجهانی کارگر [ May 1 ]",
    "date": "1405-02-11",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-12",
    "title": "روز معلم",
    "date": "1405-02-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-15",
    "title": "جشن میانه بهار/جشن بهاربد؛ روز شیراز - روز جهانی ماما [ May 5 ]",
    "date": "1405-02-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-18",
    "title": "روز جهانی صلیب سرخ و هلال احمر [ May 8 ]",
    "date": "1405-02-18",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-22",
    "title": "زادروز مریم میرزاخانی ریاضیدان ایرانی، روز جهانی زن در ریاضیات - روز جهانی پرستار [ May 12 ]",
    "date": "1405-02-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-25",
    "title": "روز بزرگداشت فردوسی",
    "date": "1405-02-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-27",
    "title": "روز ارتباطات و روابط عمومی - شهادت امام محمد تقی (ع) [ ۳۰ ذوالقعده ]",
    "date": "1405-02-27",
    "type": "official"
  },
  {
    "id": "beytoote-1405-2-28",
    "title": "روز بزرگداشت حکیم عمر خیام- روز جهانی موزه و میراث فرهنگی [May 18 ]",
    "date": "1405-02-28",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-1",
    "title": "روز بهره وری و بهینه سازی مصرف - روز بزرگداشت ملاصدرا",
    "date": "1405-03-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-2",
    "title": "فروریختن ساختمان متروپل در آبادان",
    "date": "1405-03-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-3",
    "title": "فتح خرمشهر در عملیات بیت المقدس و روز مقاومت، ایثار و پیروزی - شهادت امام محمد باقر (ع) [ ۷ ذوالحجه ]",
    "date": "1405-03-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-4",
    "title": "روز دزفول، روز مقاومت و پایداری",
    "date": "1405-03-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-5",
    "title": "روز عرفه [ ۹ ذوالحجه ]",
    "date": "1405-03-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-6",
    "title": "خرداد روز،جشن خردادگان - عید سعید قربان [ ۱۰ ذوالحجه ]",
    "date": "1405-03-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-10",
    "title": "روز جهانی بدون دخانیات [ May 31 ]",
    "date": "1405-03-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-11",
    "title": "ولادت امام علی النقی (ع) [ ۱۵ ذوالحجه ]",
    "date": "1405-03-11",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-14",
    "title": "رحلت حضرت امام خمینی - عید سعید غدیر خم [ ۱۸ ذوالحجه ]",
    "date": "1405-03-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-15",
    "title": "قیام 15 خرداد - روز جهانی محیط زیست [ June 5 ]",
    "date": "1405-03-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-16",
    "title": "ولادت امام موسی کاظم (ع) [ ۲۰ ذوالحجه ]",
    "date": "1405-03-16",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-20",
    "title": "روز جهانی صنایع دستی [ June 10 ]",
    "date": "1405-03-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-22",
    "title": "روز جهانی مبارزه با کار کودکان [ June 12 ]",
    "date": "1405-03-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-24",
    "title": "روز جهانی اهدای خون [ June 14 ]",
    "date": "1405-03-24",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-25",
    "title": "روز ملی گل وگیاه",
    "date": "1405-03-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-26",
    "title": "روز جهانی پدر [ June 16 ]",
    "date": "1405-03-26",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-27",
    "title": "روز جهانی بیابان زدایی [ June 17 ]",
    "date": "1405-03-27",
    "type": "official"
  },
  {
    "id": "beytoote-1405-3-31",
    "title": "سالروز زلزله رودبار و منجیل [1369خورشیدی]",
    "date": "1405-03-31",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-1",
    "title": "جشن آب پاشونک، جشن آغاز تابستان",
    "date": "1405-04-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-3",
    "title": "تاسوعای حسینی [ ۹ محرم ]",
    "date": "1405-04-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-4",
    "title": "عاشورای حسینی [ ۱۰ محرم ]",
    "date": "1405-04-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-5",
    "title": "روز جهانی مبارزه با مواد مخدر [ June 26 ]",
    "date": "1405-04-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-6",
    "title": "شهادت امام زین العابدین (ع) [ ۱۲ محرم ]",
    "date": "1405-04-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-7",
    "title": "انفجار دفتر حزب جمهوری اسلامی؛ روز قوه قضاییه",
    "date": "1405-04-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-8",
    "title": "روز مبارزه با سلاح های شیمیایی و میکروبی",
    "date": "1405-04-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-10",
    "title": "روز صنعت و معدن - زادروز بابک خرمدین، سپه‌سالار دلاور ایران - روز بزرگداشت صائب تبریزی",
    "date": "1405-04-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-12",
    "title": "شلیک به پرواز 655 ایران ایر توسط ناو وینسنس [ 1367 خورشیدی ]",
    "date": "1405-04-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-13",
    "title": "جشن تیرگان، بزرگداشت کمان کشیدن جان‌فدای ایران، آرش کمانگیر بر فراز البرز",
    "date": "1405-04-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-14",
    "title": "روز قلم",
    "date": "1405-04-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-15",
    "title": "جشن خام خواری",
    "date": "1405-04-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-22",
    "title": "زادروز محمد خوارزمی، ریاضیدان و فیلسوف ایرانی و روز ملی فناوری اطلاعات",
    "date": "1405-04-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-25",
    "title": "روز بهزیستی و تامین اجتماعی",
    "date": "1405-04-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-4-27",
    "title": "اعلام پذیرش قطعنامه 598 شورای امنیت از سوی ایران [ 1367 خورشیدی ]",
    "date": "1405-04-27",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-7",
    "title": "اَمرداد روز،جشن اَمردادگان",
    "date": "1405-05-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-8",
    "title": "روز بزرگداشت شیخ شهاب الدین سهروردی",
    "date": "1405-05-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-10",
    "title": "جشن چله تابستان - آغاز هفته جهانی شیردهی [ August 1 ]",
    "date": "1405-05-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-13",
    "title": "اربعین حسینی [ ۲۰ صفر ]",
    "date": "1405-05-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-14",
    "title": "سالروز صدور فرمان مشروطیت",
    "date": "1405-05-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-17",
    "title": "روز خبرنگار",
    "date": "1405-05-17",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-21",
    "title": "رحلت رسول اکرم؛شهادت امام حسن مجتبی (ع) [ ۲۸ صفر ]",
    "date": "1405-05-21",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-22",
    "title": "شهادت امام رضا (ع) [ ۳۰ صفر ] - روز جهانی چپ دست ها [ August 13 ]",
    "date": "1405-05-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-23",
    "title": "هجرت پیامبر اکرم از مکه به مدینه [ ۱ ربیع الاول ]",
    "date": "1405-05-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-28",
    "title": "سالروز وقایع ۲۸ مرداد پس از برکناری محمد مصدق‌السلطنه - سالروز فاجعه آتش زدن سینما رکس آبادان - روز جهانی عکاسی [ August 19 ]",
    "date": "1405-05-28",
    "type": "official"
  },
  {
    "id": "beytoote-1405-5-30",
    "title": "شهادت امام حسن عسکری (ع) [ ۸ ربیع الاول ]",
    "date": "1405-05-30",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-1",
    "title": "روز بزرگداشت ابوعلی سینا و روز پزشک",
    "date": "1405-06-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-2",
    "title": "آغاز هفته دولت",
    "date": "1405-06-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-3",
    "title": "میلاد رسول اکرم به روایت اهل سنت [ ۱۲ ربیع الاول ]",
    "date": "1405-06-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-4",
    "title": "زادروز کوروش بزرگ - شهریور روز،جشن شهریورگان",
    "date": "1405-06-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-5",
    "title": "روز بزرگداشت محمدبن زکریای رازی و روز داروساز",
    "date": "1405-06-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-8",
    "title": "انفجار در دفتر نخست‌وزیری جمهوری اسلامی ایران، روز مبارزه با تروریسم - میلاد رسول اکرم و امام جعفر صادق (ع) [ ۱۷ ربیع الاول ]",
    "date": "1405-06-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-11",
    "title": "روز ملی صنعت چاپ",
    "date": "1405-06-11",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-12",
    "title": "سالروز شهادت رئیسعلی دلواری، سردار بزرگ میهن و فرمانده قیام جنوب علیه اشغالگران انگلیسی",
    "date": "1405-06-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-13",
    "title": "روز بزرگداشت ابوریحان بیرونی",
    "date": "1405-06-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-19",
    "title": "روز جهانی پیشگیری از خودکشی [ September 10 ]",
    "date": "1405-06-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-20",
    "title": "حمله به برج‌های دوقلوی مرکز تجارت جهانی [ September 11 ]",
    "date": "1405-06-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-21",
    "title": "روز سینما",
    "date": "1405-06-21",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-27",
    "title": "روز شعر و ادب پارسی و روز بزرگداشت استاد شهریار",
    "date": "1405-06-27",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-29",
    "title": "ولادت امام حسن عسکری (ع) [ ۸ ربیع الثانی ]",
    "date": "1405-06-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-30",
    "title": "روز جهانی صلح [ September 21 ]",
    "date": "1405-06-30",
    "type": "official"
  },
  {
    "id": "beytoote-1405-6-31",
    "title": "آغاز هفته دفاع مقدس - وفات حضرت معصومه (س) [ ۱۰ ربیع الثانی ]",
    "date": "1405-06-31",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-1",
    "title": "آغاز حمله مغول به ایران در پاییز 598 خورشیدی",
    "date": "1405-07-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-4",
    "title": "روز گرامیداشت سربازان وطن",
    "date": "1405-07-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-5",
    "title": "روز جهانی جهانگردی [ September 27 ]",
    "date": "1405-07-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-7",
    "title": "روز آتش نشانی و ایمنی - سقوط هواپیمای حامل جمعی از فرماندهان جنگ (کلاهدوز، نامجو، فلاحی، فکوری، جهان آرا) در سال 1360 - روز بزرگداشت شمس تبریزی",
    "date": "1405-07-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-8",
    "title": "روزبزرگداشت مولوی - روز جهانی ناشنوایان [ September 30 ] - روز جهانی ترجمه و مترجم [ September 30 ]",
    "date": "1405-07-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-9",
    "title": "روز جهانی سالمندان [ October 1 ]",
    "date": "1405-07-09",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-10",
    "title": "مهر روز،جشن مهرگان",
    "date": "1405-07-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-12",
    "title": "آغاز هفته جهانی فضا [ October 4 ]",
    "date": "1405-07-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-13",
    "title": "روز جهانی معلم [ October 5 ]",
    "date": "1405-07-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-14",
    "title": "روز دامپزشکی",
    "date": "1405-07-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-16",
    "title": "روز ملی کودک",
    "date": "1405-07-16",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-17",
    "title": "روز جهانی پست [ October 9 ]",
    "date": "1405-07-17",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-18",
    "title": "روز جهانی مبارزه با حکم اعدام [ October 10 ]",
    "date": "1405-07-18",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-19",
    "title": "روز جهانی دختر [ October 11 ]",
    "date": "1405-07-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-20",
    "title": "روز بزرگداشت حافظ",
    "date": "1405-07-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-21",
    "title": "روز پیروزی کاوه و فریدون بر ضحاک",
    "date": "1405-07-21",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-22",
    "title": "روز جهانی استاندارد [ October 14 ]",
    "date": "1405-07-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-23",
    "title": "روز جهانی عصای سفید [ October 15 ]",
    "date": "1405-07-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-24",
    "title": "ولادت حضرت زینب (س) و روز پرستار و بهورز [ ۵ جمادی الاول ] - روز جهانی غذا [ October 16 ]",
    "date": "1405-07-24",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-25",
    "title": "روز جهانی ریشه کنی فقر [ October 17 ]",
    "date": "1405-07-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-26",
    "title": "روز تربیت بدنی و ورزش",
    "date": "1405-07-26",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-28",
    "title": "زادروز ستارخان ملقب به سردار ملی و از سرداران جنبش مشروطه ایران",
    "date": "1405-07-28",
    "type": "official"
  },
  {
    "id": "beytoote-1405-7-29",
    "title": "روز ملی کوهنورد",
    "date": "1405-07-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-1",
    "title": "روز آمار و برنامه ریزی - روز بزرگداشت ابوالفضل بیهقی، تاریخ‌نگار و نویسنده ایرانی",
    "date": "1405-08-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-7",
    "title": "سالروز ورود کوروش بزرگ به بابل در سال 539 پیش از میلاد",
    "date": "1405-08-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-8",
    "title": "روز ملی محیط بان",
    "date": "1405-08-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-10",
    "title": "آبان روز، جشن آبانگان",
    "date": "1405-08-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-14",
    "title": "روز ملّی مازندران",
    "date": "1405-08-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-15",
    "title": "جشن میانه پاییز",
    "date": "1405-08-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-18",
    "title": "روز ملی کیفیت",
    "date": "1405-08-18",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-22",
    "title": "شهادت حضرت فاطمه زهرا (س) [ ۳ جمادی الثانیه ]",
    "date": "1405-08-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-23",
    "title": "روز جهانی دیابت [ November 14 ]",
    "date": "1405-08-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-24",
    "title": "روز کتاب و کتابخوانی",
    "date": "1405-08-24",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-26",
    "title": "روز جهانی دانش آموز [ November 17 ]",
    "date": "1405-08-26",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-28",
    "title": "روز جهانی آقایان [ November 19 ]",
    "date": "1405-08-28",
    "type": "official"
  },
  {
    "id": "beytoote-1405-8-29",
    "title": "روز جهانی کودک [ November 20 ]",
    "date": "1405-08-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-1",
    "title": "آذر جشن",
    "date": "1405-09-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-4",
    "title": "روز جهانی مبارزه با خشونت علیه زنان [ November 25 ]",
    "date": "1405-09-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-5",
    "title": "روز بسیج مستضعفان",
    "date": "1405-09-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-7",
    "title": "سالروز عملیات مروارید و روز نیروی دریایی ارتش",
    "date": "1405-09-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-9",
    "title": "جشن آذرگان ،آذر روز - ولادت حضرت فاطمه زهرا (س) و روز مادر [ ۲۰ جمادی الثانیه ]",
    "date": "1405-09-09",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-10",
    "title": "روز جهانی ایدز [ December 1 ]",
    "date": "1405-09-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-12",
    "title": "روز جهانی معلولان (کم‌توانان) [ December 3 ]",
    "date": "1405-09-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-13",
    "title": "روز صنعت بیمه",
    "date": "1405-09-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-15",
    "title": "روز حسابدار",
    "date": "1405-09-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-19",
    "title": "روز جهانی حقوق بشر [ December 10 ]",
    "date": "1405-09-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-20",
    "title": "ولادت امام محمد باقر (ع) [ ۱ رجب ] - روز جهانی کوهستان [ December 11 ]",
    "date": "1405-09-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-21",
    "title": "سالروز نجات آذربایجان",
    "date": "1405-09-21",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-22",
    "title": "شهادت امام علی النقی (ع) [ ۳ رجب ]",
    "date": "1405-09-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-25",
    "title": "روز پژوهش و فناوری",
    "date": "1405-09-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-29",
    "title": "ولادت امام محمد تقی (ع) [ ۱۰ رجب ]",
    "date": "1405-09-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-9-30",
    "title": "جشن شب یلدا، شب چلّه",
    "date": "1405-09-30",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-1",
    "title": "روز میلاد خورشید؛ جشن خرم روز، نخستین جشن دیگان",
    "date": "1405-01-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-2",
    "title": "ولادت امام علی (ع) و روز پدر [ ۱۳ رجب ]",
    "date": "1405-01-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-3",
    "title": "سالروز عملیات کربلای 4 [1365 خورشیدی]",
    "date": "1405-01-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-4",
    "title": "وفات حضرت زینب (س) [ ۱۵ رجب ] - جشن کریسمس [ December 25 ] - روز بزرگداشت دوستی [ December 25 ]",
    "date": "1405-01-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-5",
    "title": "زمین لرزه ی بم [1382 خورشیدی] - سالروز شهادت اَشو زرتشت، اَبَراِنسان بزرگ تاریخ",
    "date": "1405-01-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-8",
    "title": "دی به آذر روز، دومین جشن دیگان - روز بزرگداشت یعقوب لیث صفاری (رادمان پورماهک) نخستین پادشاه ایرانی پس از اسلام",
    "date": "1405-01-08",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-9",
    "title": "اعدام میهن‌پرستان آذری در تبریز توسط قوای اشغالگر روس [1290 خورشیدی]",
    "date": "1405-01-09",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-11",
    "title": "جشن آغاز سال نو میلادی [ January 1 ]",
    "date": "1405-01-11",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-12",
    "title": "روز حافظ",
    "date": "1405-01-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-13",
    "title": "شهادت سردار حاج قاسم سلیمانی [1398 خورشیدی]",
    "date": "1405-01-13",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-14",
    "title": "شهادت امام موسی کاظم (ع) [ ۲۵ رجب ]",
    "date": "1405-01-14",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-15",
    "title": "دی به مهر روز، سومین جشن دیگان",
    "date": "1405-01-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-16",
    "title": "مبعث رسول اکرم (ص) [ ۲۷ رجب ] - غرق شدن کشتی سانچی [1396 خورشیدی]",
    "date": "1405-01-16",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-18",
    "title": "شلیک به پرواز 752 هواپیمایی اوکراین [1398 خورشیدی]",
    "date": "1405-01-18",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-19",
    "title": "درگذشت اکبر هاشمی رفسنجانی [1395 خورشیدی]",
    "date": "1405-01-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-20",
    "title": "قتل امیرکبیر به دستور ناصرالدین شاه قاجار [1230 خورشیدی]",
    "date": "1405-01-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-22",
    "title": "ولادت سالار شهیدان، امام حسین (ع) و روز پاسدار [ ۳ شعبان ]",
    "date": "1405-01-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-23",
    "title": "دی به دین روز، چهارمین جشن دیگان - ولادت حضرت ابوالفضل العباس (ع) و روز جانباز [ ۴ شعبان ]",
    "date": "1405-01-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-24",
    "title": "ولادت امام زین العابدین (ع) [ ۵ شعبان ]",
    "date": "1405-01-24",
    "type": "official"
  },
  {
    "id": "beytoote-1405-1-30",
    "title": "ولادت حضرت علی اکبر (ع) و روز جوان [ ۱۱ شعبان ] - آتش‌سوزی و فروریختن ساختمان پلاسکو [1395 خورشیدی]",
    "date": "1405-01-30",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-1",
    "title": "زادروز فردوسی",
    "date": "1405-11-01",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-2",
    "title": "بهمن روز، جشن بهمنگان",
    "date": "1405-11-02",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-4",
    "title": "ولادت حضرت قائم عجل الله تعالی فرجه و جشن نیمه شعبان [ ۱۵ شعبان ]",
    "date": "1405-11-04",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-5",
    "title": "جشن نوسره",
    "date": "1405-11-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-6",
    "title": "بزرگداشت صفی‌الدین اُرمَوی و روز موسیقی ایرانی",
    "date": "1405-11-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-10",
    "title": "جشن سده، گرامیداشتِ کشف آتش به دستِ هوشنگ شاه",
    "date": "1405-11-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-12",
    "title": "بازگشت امام خمینی (ره) به ایران",
    "date": "1405-11-12",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-15",
    "title": "جشن میانه زمستان",
    "date": "1405-11-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-19",
    "title": "روز نیروی هوایی",
    "date": "1405-11-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-22",
    "title": "پیروزی انقلاب اسلامی - حمله به سفارت روسیه و قتل گریبایدوف سفیر روسیه تزاری در ایران [ February 11 ]",
    "date": "1405-11-22",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-25",
    "title": "جشن ولنتاین [ February 14 ]",
    "date": "1405-11-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-11-29",
    "title": "جشن سپندارمذگان و روز عشق - فاجعه انفجار قطار نیشابور [1382 خورشیدی]",
    "date": "1405-11-29",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-3",
    "title": "ولادت امام حسن مجتبی (ع) [ ۱۵ رمضان ]",
    "date": "1405-12-03",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-5",
    "title": "جشن سپندارمذگان و روز عشق - روز بزرگداشت خواجه نصیر الدین طوسی و روز مهندس",
    "date": "1405-12-05",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-6",
    "title": "شب قدر [ ۱۸ رمضان ]",
    "date": "1405-12-06",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-7",
    "title": "ضربت خوردن حضرت علی (ع) [ ۱۹ رمضان ] - سالروز استقلال کانون وکلای دادگستری و روز وکیل مدافع",
    "date": "1405-12-07",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-9",
    "title": "شهادت حضرت علی (ع) [ ۲۱ رمضان ]",
    "date": "1405-12-09",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-10",
    "title": "شب قدر [ ۲۲ رمضان ]",
    "date": "1405-12-10",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-15",
    "title": "روز درختکاری",
    "date": "1405-12-15",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-17",
    "title": "روزجهانی زنان [ March 8 ]",
    "date": "1405-12-17",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-19",
    "title": "عید سعید فطر [ ۱ شوال ]",
    "date": "1405-12-19",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-20",
    "title": "تعطیل به مناسبت عید سعید فطر [ ۲ شوال ]",
    "date": "1405-12-20",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-23",
    "title": "روز جهانی عدد پی π [ March 14 ]",
    "date": "1405-12-23",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-25",
    "title": "پایان سرایش شاهنامه - روز بزرگداشت اختر چرخ ادب، پروین اعتصامی",
    "date": "1405-12-25",
    "type": "official"
  },
  {
    "id": "beytoote-1405-12-29",
    "title": "روز ملی شدن صنعت نفت ایران - روز جهانی شادی [ March 20 ]",
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
