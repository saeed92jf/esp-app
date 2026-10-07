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

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

export interface DashboardData {
  stats: StatCard[];
  allStats?: StatCard[];

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
    "id": "fair-1",
    "title": "نمایشگاه: هشتمین نمایشگاه بین المللی توانمندی های صادراتی جمهوری اسلامی ایران (iran expo) (به تعویق افتاد)",
    "date": "1405-01-28",
    "type": "fair"
  },
  {
    "id": "fair-2",
    "title": "نمایشگاه: چهارمین نمایشگاه بین المللی تجارت با اوراسیا (به تعویق افتاد)",
    "date": "1405-01-28",
    "type": "fair"
  },
  {
    "id": "fair-3",
    "title": "نمایشگاه: رویداد کارو مهارت ایرانی (به تعویق افتاد)",
    "date": "1405-02-08",
    "type": "fair"
  },
  {
    "id": "fair-4",
    "title": "نمایشگاه: سی امین نمایشگاه بین المللی نفت گاز پالایش و پتروشیمی (به تعویق افتاد )",
    "date": "1405-02-19",
    "type": "fair"
  },
  {
    "id": "fair-5",
    "title": "نمایشگاه: رویداد ایران زیرساخت",
    "date": "1405-03-10",
    "type": "fair"
  },
  {
    "id": "fair-6",
    "title": "نمایشگاه: بیست و پنجمین نمایشگاه بین المللی ورزش وتجهیزات ورزشی (به تعویق افتاد)",
    "date": "1405-03-19",
    "type": "fair"
  },
  {
    "id": "fair-7",
    "title": "نمایشگاه: سی و سومین نمایشگاه بین المللی صنایع کشاورزی مواد غذایی ماشین آلات و صنایع وابسته",
    "date": "1405-03-28",
    "type": "fair"
  },
  {
    "id": "fair-8",
    "title": "نمایشگاه: بیست و هفتمین نمایشگاه بین المللی تجهیزات پزشکی دندانپزشکی دارویی و آزمایشگاهی (ایران هلث)",
    "date": "1405-04-09",
    "type": "fair"
  },
  {
    "id": "fair-9",
    "title": "نمایشگاه: رویداد بین المللی محصولات نهایی پلاستیک (پلیمر)",
    "date": "1405-04-09",
    "type": "fair"
  },
  {
    "id": "fair-10",
    "title": "نمایشگاه: رویداد اکسفا",
    "date": "1405-04-19",
    "type": "fair"
  },
  {
    "id": "fair-11",
    "title": "نمایشگاه: سی و سومین نمایشگاه بین المللی مواد شوینده آرایشی بهداشتی سلولزی و ماشین آلات وابسته",
    "date": "1405-04-19",
    "type": "fair"
  },
  {
    "id": "fair-12",
    "title": "نمایشگاه: چهارمین نمایشگاه تخصصی رستوران فست فود آشپزخانه صنعتی کترینگ و صنایع وابسته",
    "date": "1405-04-19",
    "type": "fair"
  },
  {
    "id": "fair-13",
    "title": "نمایشگاه: دوازدهمین نمایشگاه بین المللی کیف کفش و چرم و صنایع وابسته",
    "date": "1405-04-19",
    "type": "fair"
  },
  {
    "id": "fair-14",
    "title": "نمایشگاه: بیست و یکمین نمایشگاه بین المللی قطعات لوازم و مجموعه های خودرو",
    "date": "1405-04-29",
    "type": "fair"
  },
  {
    "id": "fair-15",
    "title": "نمایشگاه: هجدهمین نمایشگاه بین المللی درب و پنجره و صنایع وابسته",
    "date": "1405-04-30",
    "type": "fair"
  },
  {
    "id": "fair-16",
    "title": "نمایشگاه: سی و پنجمین نمایشگاه بین المللی تخصصی صادراتی صنعت مبلمان",
    "date": "1405-05-08",
    "type": "fair"
  },
  {
    "id": "fair-17",
    "title": "نمایشگاه: نمایشگاه فرآورده های پروتئینی",
    "date": "1405-05-17",
    "type": "fair"
  },
  {
    "id": "fair-18",
    "title": "نمایشگاه: بیست و ششمین نمایشگاه بین المللی صنعت ساختمان",
    "date": "1405-05-27",
    "type": "fair"
  },
  {
    "id": "fair-19",
    "title": "نمایشگاه: بیست و نهمین نمایشگاه بین المللی الکترونیک کامپیوتر تجارت الکترونیک",
    "date": "1405-06-06",
    "type": "fair"
  },
  {
    "id": "fair-20",
    "title": "نمایشگاه: سی و سومین نمایشگاه فرش دستباف ایران",
    "date": "1405-06-06",
    "type": "fair"
  },
  {
    "id": "fair-21",
    "title": "نمایشگاه: سی و دومین نمایشگاه بین المللی لوستر چراغ های روشنایی و تزئینی",
    "date": "1405-06-06",
    "type": "fair"
  },
  {
    "id": "fair-22",
    "title": "نمایشگاه: بیستمین نمایشگاه بین المللی ایران پلاست",
    "date": "1405-06-17",
    "type": "fair"
  },
  {
    "id": "fair-23",
    "title": "نمایشگاه: بیست و پنجمین نمایشگاه بین المللی محصولات مواداولیه و ماشین آلات شیرینی و شکلات",
    "date": "1405-06-27",
    "type": "fair"
  },
  {
    "id": "fair-24",
    "title": "نمایشگاه: هجدهمین نمایشگاه بین المللی صنعت غلات آرد و نان",
    "date": "1405-06-27",
    "type": "fair"
  },
  {
    "id": "fair-25",
    "title": "نمایشگاه: سیزدهمین نمایشگاه بین المللی نوشیدنی ها چای قهوه و صنایع وابسته",
    "date": "1405-06-27",
    "type": "fair"
  },
  {
    "id": "fair-26",
    "title": "نمایشگاه: یازدهمین نمایشگاه بین المللی تجهیزات و فناوری های نوین بهداشت کار ایمنی آتش نشانی مدیریت بحران و امداد و نجات",
    "date": "1405-07-06",
    "type": "fair"
  },
  {
    "id": "fair-27",
    "title": "نمایشگاه: بیست و پنجمین نمایشگاه بین المللی تاسیسات و سیستم های سرمایشی و گرمایشی و تهویه مطبوع",
    "date": "1405-07-06",
    "type": "fair"
  },
  {
    "id": "fair-28",
    "title": "نمایشگاه: هجدهمین نمایشگاه بین المللی کف پوش ها موکت فرش ماشینی و صنایع وابسته",
    "date": "1405-07-16",
    "type": "fair"
  },
  {
    "id": "fair-29",
    "title": "نمایشگاه: بیست و ششمین نمایشگاه بین المللی لوازم خانگی و ظروف",
    "date": "1405-07-16",
    "type": "fair"
  },
  {
    "id": "fair-30",
    "title": "نمایشگاه: بیست و پنجمین نمایشگاه بین المللی دام و طیور و صنایع وابسته",
    "date": "1405-07-26",
    "type": "fair"
  },
  {
    "id": "fair-31",
    "title": "نمایشگاه: چهاردهمین نمایشگاه بین المللی پوشاک ایران",
    "date": "1405-07-26",
    "type": "fair"
  },
  {
    "id": "fair-32",
    "title": "نمایشگاه: سی و دومین نمایشگاه بین المللی ماشین آلات مواداولیه منسوجات خانگی ماشین های گلدوزی و محصولات نساجی",
    "date": "1405-07-26",
    "type": "fair"
  },
  {
    "id": "fair-33",
    "title": "نمایشگاه: بیست و ششمین نمایشگاه بین المللی صنعت تهران",
    "date": "1405-08-06",
    "type": "fair"
  },
  {
    "id": "fair-34",
    "title": "نمایشگاه: بیستمین نمایشگاه بین المللی معدن صنایع معدنی ماشین آلات و تجهیزات معدن راهسازی و صنایع وابسته",
    "date": "1405-08-06",
    "type": "fair"
  },
  {
    "id": "fair-35",
    "title": "نمایشگاه: هفدهمین نمایشگاه بین المللی فناوری نانو",
    "date": "1405-08-06",
    "type": "fair"
  },
  {
    "id": "fair-36",
    "title": "نمایشگاه: بیست و ششمین نمایشگاه بین المللی صنعت برق و انرژی های تجدید پذیر",
    "date": "1405-08-16",
    "type": "fair"
  },
  {
    "id": "fair-37",
    "title": "نمایشگاه: هفتمین نمایشگاه لیزرفوتونیک و کوانتوم",
    "date": "1405-08-26",
    "type": "fair"
  },
  {
    "id": "fair-38",
    "title": "نمایشگاه: بیست و سومین نمایشگاه بین المللی متالورژی (ایران متافو)",
    "date": "1405-08-26",
    "type": "fair"
  },
  {
    "id": "fair-39",
    "title": "نمایشگاه: بیست و دومین نمایشگاه بین المللی تبلیغات برند سازی خدمات بازاریابی و زنجیره صادرات",
    "date": "1405-09-06",
    "type": "fair"
  },
  {
    "id": "fair-40",
    "title": "نمایشگاه: دهمین نمایشگاه بین المللی شیلات آبزیان ماهیگیری غذاهای دریایی و صنایع وابسته",
    "date": "1405-09-06",
    "type": "fair"
  },
  {
    "id": "fair-41",
    "title": "نمایشگاه: هفدهمین نمایشگاه بین المللی قیر آسفالت عایق ها بتن سیمان و ماشین آلات وابسته",
    "date": "1405-09-06",
    "type": "fair"
  },
  {
    "id": "fair-42",
    "title": "نمایشگاه: بیست وششمین نمایشگاه بین المللی رنگ رزین پوشش صنعتی موادکامپوزیت و صنعت آبکاری",
    "date": "1405-09-06",
    "type": "fair"
  },
  {
    "id": "fair-43",
    "title": "نمایشگاه: هشتمین نمایشگاه بین المللی مراکز خرید مجتمع تجاری رویکردهای نوین صنعت خرده فروشی وصنایع وابسته (ریتیل شو)",
    "date": "1405-09-16",
    "type": "fair"
  },
  {
    "id": "fair-44",
    "title": "نمایشگاه: سی و سومین نمایشگاه بین المللی چاپ بسته بندی و ماشین آلات وابسته",
    "date": "1405-09-16",
    "type": "fair"
  },
  {
    "id": "fair-45",
    "title": "نمایشگاه: ششمین نمایشگاه بین المللی ایران ژئو",
    "date": "1405-09-16",
    "type": "fair"
  },
  {
    "id": "fair-46",
    "title": "نمایشگاه: بیست و هفتمین نمایشگاه بین المللی پژوهش فناوری و فن بازار",
    "date": "1405-09-26",
    "type": "fair"
  },
  {
    "id": "fair-47",
    "title": "نمایشگاه: هفتمین نمایشگاه بین المللی حمل و نقل لجستیک و صنایع وابسته",
    "date": "1405-09-26",
    "type": "fair"
  },
  {
    "id": "fair-48",
    "title": "نمایشگاه: چهاردهمین نمایشگاه تجهیزات و مواد آزمایشگاهی ساخت ایران",
    "date": "1405-09-26",
    "type": "fair"
  },
  {
    "id": "fair-49",
    "title": "نمایشگاه: ششمین نمایشگاه مدیریت پسماند بازیافت ماشین آلات و تجهیزات وابسته",
    "date": "1405-10-05",
    "type": "fair"
  },
  {
    "id": "fair-50",
    "title": "نمایشگاه: نهمین نمایشگاه بین المللی شیشه و صنایع وابسته",
    "date": "1405-10-05",
    "type": "fair"
  },
  {
    "id": "fair-51",
    "title": "نمایشگاه: بیست و چهارمین نمایشگاه بین المللی چوب مواد اولیه ماشین آلات یراق آلات تجهیزات مبلمان و صنایع وابسته",
    "date": "1405-10-05",
    "type": "fair"
  },
  {
    "id": "fair-52",
    "title": "نمایشگاه: دهمین نمایشگاه بین المللی لوله اتصالات شیرآلات بهداشتی تجهیزات آشپزخانه حمام سونا استخر و خدمات وابسته",
    "date": "1405-10-15",
    "type": "fair"
  },
  {
    "id": "fair-53",
    "title": "نمایشگاه: بیست و ششمین نمایشگاه بین المللی مخابرات فناوری اطلاعات و اقتصاد دیجیتال (ایران تلکام)",
    "date": "1405-10-15",
    "type": "fair"
  },
  {
    "id": "fair-54",
    "title": "نمایشگاه: سومین نمایشگاه بین المللی تخصصی گوهرسنگ ها ماشین آلات و صنایع وابسته",
    "date": "1405-10-15",
    "type": "fair"
  },
  {
    "id": "fair-55",
    "title": "نمایشگاه: سی امین نمایشگاه بین المللی کاشی و سرامیک چینی و بهداشتی",
    "date": "1405-10-15",
    "type": "fair"
  },
  {
    "id": "fair-56",
    "title": "نمایشگاه: یازدهمین نمایشگاه بین المللی ماشین آلات و ادوات کشاورزی نهاده ها و سیستم های نوین آبیاری",
    "date": "1405-10-24",
    "type": "fair"
  },
  {
    "id": "fair-57",
    "title": "نمایشگاه: هشتمین نمایشگاه بین المللی ایران سبز",
    "date": "1405-10-24",
    "type": "fair"
  },
  {
    "id": "fair-58",
    "title": "نمایشگاه: پنجمین نمایشگاه تحول خودرو",
    "date": "1405-10-24",
    "type": "fair"
  },
  {
    "id": "fair-59",
    "title": "نمایشگاه: هفدهمین نمایشگاه بین المللی خانه مدرن معماری داخلی و دکوراسیون (میدکس)",
    "date": "1405-11-04",
    "type": "fair"
  },
  {
    "id": "fair-60",
    "title": "نمایشگاه: بیست و دومین نمایشگاه بین المللی صنعت آب و تأسیسات آب و فاضلاب",
    "date": "1405-11-04",
    "type": "fair"
  },
  {
    "id": "fair-61",
    "title": "نمایشگاه: نوزدهمین نمایشگاه بین المللی گردشگری و صنایع وابسته تهران",
    "date": "1405-11-14",
    "type": "fair"
  },
  {
    "id": "fair-62",
    "title": "نمایشگاه: سی و هشتمین نمایشگاه صنایع دستی",
    "date": "1405-11-14",
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
      { id:'gold',     labelKey:'gold',     value:'—', delta:'—', trend:'neutral', icon:'activity' },
      { id:'wti',      labelKey:'wti',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'btc',      labelKey:'btc',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'eur',      labelKey:'eur',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'gasoline', labelKey:'gasoline', value:'—', delta:'—', trend:'neutral', icon:'activity' },
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
      { id:'gold',     labelKey:'gold',     value:'—', delta:'—', trend:'neutral', icon:'activity' },
      { id:'wti',      labelKey:'wti',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'btc',      labelKey:'btc',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'eur',      labelKey:'eur',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'gasoline', labelKey:'gasoline', value:'—', delta:'—', trend:'neutral', icon:'activity' },
    ],
    chart: chart([12,18,15,22,19,25]),
    activities: [],
    calendarEvents: [...REAL_EVENTS],
    checklist: [],
  },
  staff: {
    stats: [
      { id:'today',    labelKey:'tasksToday',    value:'11', delta:'+2', trend:'up',      icon:'check'    },
      { id:'done',     labelKey:'completedTasks', value:'38', delta:'+5', trend:'up',     icon:'activity' },
      { id:'tickets',  labelKey:'openTickets',    value:'6',  delta:'-1', trend:'down',   icon:'wrench'   },
      { id:'msgs',     labelKey:'messages',       value:'23', delta:'+7', trend:'up',     icon:'message'  },
      { id:'meetings', labelKey:'meetings',       value:'4',  delta:'0',  trend:'neutral',icon:'users'    },
      { id:'hours',    labelKey:'hoursLogged',    value:'32', delta:'+4', trend:'up',     icon:'clock'    },
    ],
    chart: chart([8,12,10,14,11,16]),
    activities: [],
    calendarEvents: [...REAL_EVENTS],
    checklist: [],
  },
  customer: {
    stats: [
      { id:'gold',     labelKey:'gold',     value:'—', delta:'—', trend:'neutral', icon:'activity' },
      { id:'wti',      labelKey:'wti',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'btc',      labelKey:'btc',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'eur',      labelKey:'eur',      value:'—', delta:'—', trend:'neutral', icon:'wallet'   },
      { id:'gasoline', labelKey:'gasoline', value:'—', delta:'—', trend:'neutral', icon:'activity' },
    ],
    chart: chart([2,4,3,5,4,6]),
    activities: [],
    calendarEvents: [...REAL_EVENTS],
    checklist: [],
  },
};

export class FakeDashboardService implements IDashboardService {
  async getByRole(role: UserRole, statCards?: string[], chartSource?: string): Promise<DashboardData> {
    await wait(400);
    const baseData = { ...(FAKE_DATA[role] ?? FAKE_DATA.customer) };
    const cards = statCards || ['gold', 'gasoline', 'wti', 'btc', 'eur'];

    // ── Live commodities (Finnhub + Yahoo Finance) ─────────────────────────
    try {
      const commRes = await Promise.race([
        fetch(`/api/commodities?t=${Date.now()}`, { cache: 'no-store' }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
      ]);

      if (commRes.ok) {
        const commData = await commRes.json();

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
          const item = commData.find((c: any) => c.id === def.id);
          if (!item || item.error) {
            return { id: def.id, labelKey: def.labelKey, value: '—', delta: '—', trend: 'neutral', icon: 'activity' } as StatCard;
          }

          let formattedValue: string;
          const p = item.price as number;
          if (p >= 1_000_000) {
            formattedValue = (p / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
          } else if (p >= 1_000) {
            formattedValue = p.toLocaleString('en-US', { maximumFractionDigits: 1 });
          } else if (p >= 1) {
            formattedValue = p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else {
            formattedValue = p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
          }

          const pctRaw = Number(item.percentChange ?? 0);
          return {
            id: def.id,
            labelKey: def.labelKey,
            value: formattedValue,
            delta: `${pctRaw >= 0 ? '+' : ''}${pctRaw.toFixed(2)}%`,
            trend: item.trend || 'neutral',
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
      }
    } catch {
      // Silently use fallback data when APIs are unreachable
    }

    // ── Live chart (Yahoo Finance) ──────────────────────────────────────────
    try {
      const chartRes = await Promise.race([
        fetch(`/api/chart?source=${chartSource || 'wti'}&t=${Date.now()}`, { cache: 'no-store' }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
      ]);

      if (chartRes.ok) {
        const chartData = await chartRes.json();
        if (chartData && chartData.length > 0) {
          baseData.chart = chartData;
        }
      }
    } catch {
      // Silently use fallback chart data
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
