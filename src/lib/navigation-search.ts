// src/lib/navigation-search.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rich Bilingual Navigation & Tools Search Index

import type { LucideIcon } from "lucide-react";
import { NAVIGATION, type NavColor } from "@/config/navigation";

export interface NavSearchSource {
  href: string;
  labelKey: string;
  sectionLabelKey: string;
  icon?: LucideIcon;
  color?: NavColor;
  keywordsEn?: string[];
  keywordsFa?: string[];
}

export interface NavSearchItem {
  href: string;
  title: string;
  section: string;
  icon?: LucideIcon;
  color?: NavColor;
  keywords: string[];
  description?: string;
}

/**
 * Normalizes text for robust Persian and English search
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u200C\u200D]/g, " ") // replace zero-width non-joiners with space
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[\u064B-\u065F]/g, "") // strip Arabic diacritics / tashkeel
    .trim();
}

/**
 * Comprehensive bilingual keywords for all engineering & app modules
 */
const BILINGUAL_KEYWORDS: Record<
  string,
  { en: string[]; fa: string[]; descriptionEn?: string; descriptionFa?: string }
> = {
  "/esp-flow": {
    en: [
      "esp flow",
      "process flow",
      "diagram",
      "engineering flow",
      "simulation",
      "claude flow",
      "vessel",
      "pressure vessel",
      "asme",
      "asme sec viii",
      "asme section 8",
      "general data",
      "geometry",
      "shell",
      "head",
      "nozzle",
      "jacket",
      "material",
      "vacuum",
      "steam",
      "operating pressure",
      "design pressure",
      "temperature",
      "flange",
      "support",
      "skirt",
      "saddle",
      "weights",
      "calculation",
      "flowchart",
      "diagram",
      "mechanical engineering",
    ],
    fa: [
      "ای اس پی فلو",
      "جریان فرایند",
      "شبیه سازی",
      "دیاگرام مهندسی",
      "کلود فلو",
      "مخزن",
      "مخازن",
      "مخازن تحت فشار",
      "طراحی مخزن",
      "جکت",
      "شل",
      "هد",
      "نازل",
      "متریال",
      "فشار طراحی",
      "دمای طراحی",
      "استاندارد ازمی",
      "ازمه",
      "وزن",
      "محاسبات مهندسی",
      "نمودار",
      "تحت فشار",
      "پوسته",
      "عدسی",
      "ساپورت",
      "پایپینگ",
    ],
    descriptionEn: "ASME Section VIII Pressure Vessel Design & Interactive Flow",
    descriptionFa: "طراحی و محاسبات جامع مخازن تحت فشار استاندارد ASME",
  },

  "/weight-flow": {
    en: [
      "weight flow",
      "weights",
      "vessel weight",
      "center of gravity",
      "cg",
      "empty weight",
      "operating weight",
      "hydrotest weight",
    ],
    fa: [
      "محاسبه وزن",
      "توزیع وزن",
      "مرکز ثقل",
      "وزن خالی",
      "وزن عملیاتی",
      "تست هیدروستاتیک",
      "هیدروتست",
    ],
    descriptionEn: "Vessel Weight, CG & Hydrostatic Test Calculations",
    descriptionFa: "محاسبات توزیع وزن، مرکز ثقل و تست هیدرواستاتیک مخازن",
  },
  "/standards": {
    en: [
      "standards",
      "api standards",
      "asme",
      "astm",
      "din",
      "tema",
      "codes",
      "engineering codes",
    ],
    fa: ["استانداردها", "استاندارد api", "ازمی", "کدهای مهندسی", "آیین‌نامه‌ها"],
    descriptionEn: "API, ASME & TEMA Engineering Standards Library",
    descriptionFa: "مرجع و آرشیو استانداردهای مهندسی API، ASME و TEMA",
  },
  "/dashboard": {
    en: [
      "dashboard",
      "home",
      "overview",
      "kpi",
      "stats",
      "metrics",
      "analytics",
      "performance",
    ],
    fa: ["داشبورد", "میز کار", "آمار کلی", "شاخص‌ها", "نمای کلی", "گزارشات"],
    descriptionEn: "Main Dashboard & Overview Analytics",
    descriptionFa: "داشبورد مرکزی، شاخص‌های کلیدی و آمار عملکرد",
  },
  "/campaigns": {
    en: ["campaigns", "marketing", "ads", "advertising", "promotions"],
    fa: ["کمپین‌ها", "بازاریابی", "تبلیغات", "پروموشن"],
  },
  "/social": {
    en: ["social", "media", "instagram", "linkedin", "telegram", "publishing"],
    fa: ["شبکه‌های اجتماعی", "سوشال مدیا", "انتشار محتوا", "پست‌ها"],
  },
  "/email": {
    en: ["email", "newsletter", "mailing", "inbox", "outbox"],
    fa: ["ایمیل", "خبرنامه", "ارسال ایمیل", "پیام‌ها"],
  },
  "/analytics": {
    en: ["analytics", "charts", "graphs", "reports", "insights", "traffic"],
    fa: ["تحلیل و آمار", "نمودارها", "گزارش‌های تحلیلی", "تحلیل بازدید"],
  },
  "/projects": {
    en: ["projects", "management", "project list", "deadlines", "engineering"],
    fa: ["پروژه‌ها", "مدیریت پروژه", "لیست پروژه‌ها", "پروژه‌های مهندسی"],
  },
  "/tasks": {
    en: ["tasks", "todo", "activities", "checklist", "assignments"],
    fa: ["وظایف", "تسک‌ها", "کارها", "چک‌لیست", "اقدامات"],
  },
  "/calendar": {
    en: ["calendar", "schedule", "events", "meetings", "timeline"],
    fa: ["تقویم", "برنامه‌ریزی", "جلسات", "رویدادها", "زمان‌بندی"],
  },
  "/reports": {
    en: ["reports", "export", "pdf", "excel", "summary", "print"],
    fa: ["گزارش‌ها", "خروجی", "چاپ", "خلاصه وضعیت", "فایل اکسل"],
  },
  "/board": {
    en: ["board", "kanban", "scrum", "cards", "pipeline"],
    fa: ["برد کانبان", "برد وظایف", "کارت‌ها", "اسکرام"],
  },
  "/documents": {
    en: ["documents", "docs", "files", "archive", "storage", "pdf"],
    fa: ["اسناد", "فایل‌ها", "بایگانی اسناد", "مدارک فنی", "آرشیو"],
  },
  "/contracts": {
    en: ["contracts", "agreements", "legal", "signatures", "clients"],
    fa: ["قراردادها", "توافق‌نامه‌ها", "قرارداد مشتریان", "امضا"],
  },
  "/invoices": {
    en: ["invoices", "billing", "receipts", "financial", "payment", "accounting"],
    fa: ["فاکتورها", "صورتحساب", "مالی", "حسابداری", "پرداخت‌ها", "قبض"],
  },
  "/letters": {
    en: ["letters", "correspondence", "secretariat", "incoming", "outgoing"],
    fa: ["نامه‌ها", "مکاتبات", "دبیرخانه", "نامه‌های اداری"],
  },
  "/staff": {
    en: ["staff", "employees", "personnel", "team", "members", "users"],
    fa: ["کارکنان", "پرسنل", "کارمندان", "اعضای تیم", "کاربران"],
  },
  "/departments": {
    en: ["departments", "organization", "units", "divisions", "teams"],
    fa: ["دپارتمان‌ها", "بخش‌ها", "واحدهای سازمانی", "تیم‌ها"],
  },
  "/attendance": {
    en: ["attendance", "timesheet", "clock in", "leaves", "vacation"],
    fa: ["حضور و غیاب", "تردد", "مرخصی‌ها", "ساعت کاری"],
  },
  "/payroll": {
    en: ["payroll", "salary", "wages", "payslip", "compensation"],
    fa: ["حقوق و دستمزد", "فیش حقوقی", "محاسبه حقوق", "مزایا"],
  },
  "/image-gallery": {
    en: ["image gallery", "photos", "pictures", "album", "media"],
    fa: ["گالری تصاویر", "عکس‌ها", "تصاویر پروژه", "آلبوم"],
  },
  "/videos": {
    en: ["videos", "recordings", "clips", "training", "tutorials"],
    fa: ["ویدیوها", "فیلم‌ها", "آموزش‌های ویدیویی", "کلیپ‌ها"],
  },
  "/audio": {
    en: ["audio", "voice", "recordings", "sound", "podcast"],
    fa: ["صوت", "فایل‌های صوتی", "صدای ضبط‌شده", "پادکست"],
  },
  "/media-library": {
    en: ["media library", "all media", "assets", "resources", "files"],
    fa: ["کتابخانه چندرسانه‌ای", "رسانه‌ها", "فایل‌های مدیا", "آرشیو"],
  },
};

export const NAV_SEARCH_SOURCE: NavSearchSource[] = NAVIGATION.flatMap(
  (group) =>
    group.items.map((item) => {
      const bilingual = BILINGUAL_KEYWORDS[item.href] || { en: [], fa: [] };
      return {
        href: item.href,
        labelKey: item.labelKey,
        sectionLabelKey: group.labelKey,
        icon: item.icon ?? group.icon,
        color: item.color ?? group.color,
        keywordsEn: bilingual.en,
        keywordsFa: bilingual.fa,
      };
    }),
);

export function getBilingualKeywords(href: string) {
  return BILINGUAL_KEYWORDS[href] ?? { en: [], fa: [] };
}
