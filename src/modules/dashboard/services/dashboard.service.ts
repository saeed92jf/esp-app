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
  timeSlot: string;
  period: 'morning' | 'midday' | 'evening';
  streakDays: number;
  completedToday: boolean;
  category?: string;
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

const SAMPLE_TASKS: DashboardTask[] = [
  {
    id: "task-m1",
    title: "بازرسی و کنترل کیفیت خروجی پمپ‌های ESP ایستگاه اهواز",
    description: "بررسی تلرانس‌های مکانیکی، بالانس دینامیکی روتورها و تست هیدرواستاتیک پوسته‌ها قبل از بسته‌بندی نهایی.",
    status: "in_progress",
    priority: "urgent",
    category: "کنترل کیفیت",
    createdBy: "manager",
    creatorName: "مهندس شریفی (مدیر فنی)",
    assignedToName: "سعید جلیلی",
    dueDate: "1405/02/10",
    isManagerDefined: true,
    notificationSent: true,
    emailSent: true,
    comments: [
      {
        id: "c1",
        authorName: "مهندس شریفی",
        authorRole: "مدیر فنی",
        content: "سعید جان، گزارش تست ارتعاشات را به همراه تاییدیه آزمایشگاه متالورژی لطفاً ضمیمه کن.",
        createdAt: "1405/02/05 - 10:30"
      },
      {
        id: "c2",
        authorName: "سعید جلیلی",
        authorRole: "کارشناس ارشد مهندسی",
        content: "سلام مهندس، سنسورهای پایش لرزش کالیبره شدند و تست مرحله اول موفقیت‌آمیز بود. فایل نتایج ضمیمه شد.",
        createdAt: "1405/02/05 - 14:15"
      }
    ],
    attachments: [
      {
        id: "att-1",
        name: "Inspection_Sheet_Pump_ESP_Rev2.pdf",
        size: "1.8 MB",
        type: "application/pdf",
        uploadedAt: "1405/02/05"
      }
    ]
  },
  {
    id: "task-m2",
    title: "ارزیابی فنی پروپوزال فلومترهای مغناطیسی پروژه عسلویه",
    description: "تطبیق مشخصات فنی کاتالوگ با Data Sheet استاندارد کارفرما (POGC) و اعلام نظر نهایی.",
    status: "pending",
    priority: "high",
    category: "ابزار دقیق",
    createdBy: "manager",
    creatorName: "دکتر رادمنش (مدیر پروژه‌ها)",
    assignedToName: "سعید جلیلی",
    dueDate: "1405/02/15",
    isManagerDefined: true,
    notificationSent: true,
    emailSent: true,
    comments: [],
    attachments: [
      {
        id: "att-2",
        name: "POGC_Flowmeter_Spec_V3.pdf",
        size: "3.2 MB",
        type: "application/pdf",
        uploadedAt: "1405/02/06"
      }
    ]
  },
  {
    id: "task-u1",
    title: "به‌روزرسانی نمودارهای سایزینگ ماژول ESP-Flow",
    description: "افزودن منحنی‌های راندمان برای گاز مایع و بررسی ضرایب تصحیح ویسکوزیته سیال.",
    status: "completed",
    priority: "medium",
    category: "توسعه نرم‌افزار",
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "سعید جلیلی",
    dueDate: "1405/02/02",
    completedAt: "1405/02/02",
    completionExplanation: "تمامی منحنی‌ها با شبیه‌ساز عددی و دیتاست‌های صنعتی تطبیق و تست شدند.",
    isManagerDefined: false,
    comments: [],
    attachments: []
  },
  {
    id: "task-m3",
    title: "تنظیم گزارش عدم انطباق (NCR) کابل‌های قدرت ارسالی",
    description: "ثبت گزارش رسمی عدم انطباق برای روکش کابل‌های تغذیه ارسالی از تامین‌کننده و هماهنگی جهت بازگشت محموله.",
    status: "in_progress",
    priority: "high",
    category: "تامین و بازرگانی",
    createdBy: "manager",
    creatorName: "مهندس شریفی (مدیر فنی)",
    assignedToName: "سعید جلیلی",
    dueDate: "1405/02/08",
    isManagerDefined: true,
    notificationSent: true,
    emailSent: true,
    comments: [],
    attachments: []
  }
];

const SAMPLE_DETAILED_CHECKLIST: DetailedChecklistItem[] = [
  { id: "dcl-1", title: "بررسی پارامترهای تله‌متری پمپ‌های چاه شماره ۴ و ۷", completed: true, period: "daily", category: "پایش", priority: "high", createdAt: "1405/02/01" },
  { id: "dcl-2", title: "پشتیبان‌گیری از دیتابیس محاسبات هیدرولیک", completed: false, period: "daily", category: "داده‌ها", priority: "medium", createdAt: "1405/02/02" },
  { id: "dcl-3", title: "ثبت ساعات کارکرد تجهیزات پایلوت در کارگاه", completed: false, period: "daily", category: "کارگاه", priority: "low", createdAt: "1405/02/03" },
  { id: "dcl-4", title: "جلسه هماهنگی تیم مهندسی مکانیک و ابزار دقیق", completed: true, period: "weekly", category: "جلسات", priority: "high", createdAt: "1405/02/01" },
  { id: "dcl-5", title: "بررسی موجودی قطعات یدکی پمپ ESP در انبار مرکزی", completed: false, period: "weekly", category: "انبار", priority: "medium", createdAt: "1405/02/02" },
  { id: "dcl-6", title: "ارسال گزارش هفتگی پیشرفت به کارفرما", completed: false, period: "weekly", category: "گزارشات", priority: "high", createdAt: "1405/02/03" },
  { id: "dcl-7", title: "کالیبراسیون دوره‌ای سنسورهای فشار و جریان", completed: false, period: "monthly", category: "تجهیزات", priority: "high", createdAt: "1405/02/01" },
  { id: "dcl-8", title: "بررسی و تسویه فاکتورهای آزمایشگاه‌های متالورژی همکار", completed: true, period: "monthly", category: "مالی", priority: "medium", createdAt: "1405/02/01" },
  { id: "dcl-9", title: "ممیزی دوره‌ای استانداردهای HSE کارخانه", completed: false, period: "periodic", category: "ایمنی", priority: "urgent", createdAt: "1405/01/15" },
  { id: "dcl-10", title: "تمدید لایسنس نرم‌افزارهای شبیه‌سازی مهندسی", completed: true, period: "periodic", category: "نرم‌افزار", priority: "medium", createdAt: "1405/01/20" }
];

const SAMPLE_ROUTINES: DailyRoutine[] = [
  { id: "r-1", title: "بررسی ایمیل‌ها و اولویت‌بندی پیام‌های دریافتی کارفرما", timeSlot: "08:15", period: "morning", streakDays: 12, completedToday: true, category: "مکاتبات" },
  { id: "r-2", title: "بررسی نرخ‌های لحظه‌ای ارز، فلزات و انرژی برای محاسبات هزینه", timeSlot: "08:45", period: "morning", streakDays: 8, completedToday: true, category: "بازار" },
  { id: "r-3", title: "پایش زنده نتایج تست بنچ پمپ ESP در آزمایشگاه", timeSlot: "11:30", period: "midday", streakDays: 15, completedToday: false, category: "تست فنی" },
  { id: "r-4", title: "استندآپ ۱۰ دقیقه‌ای تیم فنی و هماهنگی کارها", timeSlot: "12:00", period: "midday", streakDays: 5, completedToday: true, category: "تیم" },
  { id: "r-5", title: "ثبت گزارش روزانه اقدامات مهندسی در پرتال سازمانی", timeSlot: "16:15", period: "evening", streakDays: 9, completedToday: false, category: "گزارشات" },
  { id: "r-6", title: "بررسی و نهایی‌سازی چک‌لیست و اولویت‌های فردا", timeSlot: "16:45", period: "evening", streakDays: 14, completedToday: false, category: "برنامه‌ریزی" }
];

const SAMPLE_NOTES: DashboardNote[] = [
  {
    id: "n-1",
    title: "فرمول‌های تصحیح ویسکوزیته در سیالات چندفازی",
    content: "در دبی‌های بالاتر از ۱۲۰۰ بشکه، ضریب اصلاح ویسکوزیته باید با فرمول Beggs-Brill محاسبه شود تا افت هد پمپ دقیق محاسبه گردد.",
    color: "blue",
    isPinned: true,
    tags: ["محاسبات", "ESP-Flow", "هیدرولیک"],
    createdAt: "1405/02/01"
  },
  {
    id: "n-2",
    title: "نکات جلسه هیئت مدیره در خصوص توسعه خط پمپ",
    content: "تاکید بر تحویل به‌موقع سفارش‌های ایستگاه اهواز و آغاز فاز طراحی روتورهای مقاوم در برابر H2S بالا.",
    color: "yellow",
    isPinned: true,
    tags: ["جلسه", "توسعه", "مدیریت"],
    createdAt: "1405/02/03"
  },
  {
    id: "n-3",
    title: "تلفن‌های تماس سوپروایزر چاه میدان نفتی آزادگان",
    content: "مهندس ناصری: ۰۹۱۲۳۴۵۶۷۸۹ - هماهنگی آزمایش نمونه نفت خام و تحویل بسته‌های مانیتورینگ دمای پایین چاه.",
    color: "emerald",
    isPinned: false,
    tags: ["تماس", "آزادگان"],
    createdAt: "1405/02/04"
  },
  {
    id: "n-4",
    title: "درایو اشتراکی نقشه‌های CAD پوسته پمپ",
    content: "فایل‌های سه‌بعدی مرحله نهایی در مسیر شِر شبکه /Engineering/Drawings/ESP_Rev4 قرار گرفت.",
    color: "purple",
    isPinned: false,
    tags: ["CAD", "نقشه"],
    createdAt: "1405/02/05"
  }
];

const SAMPLE_CUSTOM_LINKS: CustomLink[] = [
  { id: "lnk-1", title: "شبیه‌ساز و سایزینگ پمپ (ESP-Flow)", url: "/esp-flow", isInternal: true, category: "ابزارهای مهندسی", description: "ماژول طراحی هیدرولیک و آنالیز چاه", createdAt: "1405/01/10" },
  { id: "lnk-2", title: "مدیریت پروژه‌ها و قراردادها", url: "/projects", isInternal: true, category: "اداری و مالی", description: "سیستم رصد پیشرفت و مدارک فنی", createdAt: "1405/01/10" },
  { id: "lnk-3", title: "سامانه حضور و غیاب پرسنل", url: "/attendance", isInternal: true, category: "منابع انسانی", description: "ثبت تردد، مرخصی‌ها و ماموریت‌ها", createdAt: "1405/01/10" },
  { id: "lnk-4", title: "آرشیو اسناد و استانداردهای مهندسی", url: "/documents", isInternal: true, category: "مستندات", description: "دسترسی به مدارک API و IPS", createdAt: "1405/01/10" },
  { id: "lnk-5", title: "پرتال خبری شبکه نفت و انرژی (شانا)", url: "https://shana.ir", isInternal: false, category: "پرتال‌های خارجی", description: "اخبار رسمی صنعت نفت و گاز ایران", createdAt: "1405/01/12" },
  { id: "lnk-6", title: "سامانه معاملاتی تتر لند (نرخ لحظه‌ای ارز)", url: "https://tetherland.com", isInternal: false, category: "مالی و ارزی", description: "مرجع استعلام نرخ تتر و ارزهای دیجیتال", createdAt: "1405/01/15" },
  { id: "lnk-7", title: "سامانه جامع تجارت ایران (NTSW)", url: "https://ntsw.ir", isInternal: false, category: "بازرگانی", description: "ثبت سفارشات مواد اولیه و قطعات وارداتی", createdAt: "1405/01/15" }
];

const SAMPLE_NOTIFICATIONS: DashboardNotificationItem[] = [
  {
    id: "notif-1",
    title: "تسک سازمانی جدید از طرف مهندس شریفی",
    description: "بازرسی و کنترل کیفیت خروجی پمپ‌های ESP ایستگاه اهواز برای شما تعریف شد.",
    type: "manager_task",
    date: "امروز - ۰۹:۱۵",
    read: false,
    taskId: "task-m1",
    emailPreview: {
      subject: "[Euroslot Pars] تسک جدید: بازرسی و کنترل کیفیت خروجی پمپ‌های ESP اهواز",
      from: "sharifi@euroslotpars.com (مدیر فنی)",
      to: "saeed.jalili@euroslotpars.com",
      sentAt: "1405/02/05 - 09:15",
      body: "جناب آقای مهندس سعید جلیلی، با سلام؛ تسک فوق توسط مدیریت فنی برای شما تخصیص یافت. لطفاً با توجه به زمان‌بندی تحویل ایستگاه اهواز، کنترل کیفیت قطعات را در اولویت کاری قرار دهید."
    }
  },
  {
    id: "notif-2",
    title: "رویداد مهم تقویم کاری امروز",
    description: "جلسه فنی با نمایندگان شرکت مناطق نفت‌خیز جنوب، ساعت ۱۴:۰۰ در سالن کنفرانس.",
    type: "event",
    date: "امروز - ۰۸:۰۰",
    read: false
  },
  {
    id: "notif-3",
    title: "یادآوری روتین روزانه",
    description: "ثبت گزارش روزانه اقدامات مهندسی در سیستم تا پایان ساعت کاری الزامی است.",
    type: "routine",
    date: "امروز - ۱۶:۰۰",
    read: true
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
      { id: 'cl1', title: 'Review Q3 Financials', completed: true, createdAt: '1402/07/15', createdBy: 'admin' },
      { id: 'cl2', title: 'Approve new hires', completed: false, createdAt: '1402/07/16', createdBy: 'user' },
      { id: 'cl3', title: 'Update security policies', completed: false, createdAt: '1402/07/17', createdBy: 'admin' }
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
