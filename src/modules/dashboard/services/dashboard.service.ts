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
