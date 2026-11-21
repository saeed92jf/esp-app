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
      "vessel",
      "pressure vessel",
      "asme",
      "asme sec viii",
      "shell",
      "head",
      "nozzle",
      "jacket",
      "material",
      "design pressure",
      "temperature",
      "calculation",
    ],
    fa: [
      "ای اس پی فلو",
      "جریان فرایند",
      "شبیه سازی",
      "دیاگرام مهندسی",
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
      "محاسبات مهندسی",
    ],
    descriptionEn: "ASME Section VIII Pressure Vessel Design & Interactive Flow",
    descriptionFa: "طراحی و محاسبات جامع مخازن تحت فشار استاندارد ASME",
  },
  "/ESP-Flow": {
    en: [
      "esp flow",
      "process flow",
      "diagram",
      "engineering flow",
      "simulation",
      "vessel",
      "pressure vessel",
      "asme",
      "asme sec viii",
      "calculation",
    ],
    fa: [
      "ای اس پی فلو",
      "جریان فرایند",
      "شبیه سازی",
      "دیاگرام مهندسی",
      "مخزن",
      "مخازن تحت فشار",
      "محاسبات مهندسی",
    ],
    descriptionEn: "ASME Section VIII Pressure Vessel Design & Interactive Flow",
    descriptionFa: "طراحی و محاسبات جامع مخازن تحت فشار استاندارد ASME",
  },
  "/projects": {
    en: ["esp projects", "projects", "management", "project list", "deadlines", "engineering portfolio", "vdis"],
    fa: ["ای اس پی پروجکتس", "پروژه‌ها", "مدیریت پروژه", "لیست پروژه‌ها", "پروژه‌های مهندسی", "ترنسمیتال"],
    descriptionEn: "Engineering Projects Portfolio & Management",
    descriptionFa: "مدیریت و پیگیری پروژه‌های مهندسی و صنعتی",
  },
  "/tasks": {
    en: ["esp tasks", "tasks", "todo", "activities", "checklist", "assignments", "kanban", "board"],
    fa: ["ای اس پی تسکس", "وظایف", "تسک‌ها", "کارها", "چک‌لیست", "اقدامات", "کانبان", "برد وظایف"],
    descriptionEn: "Task Tracking, Kanban Board & Workflow",
    descriptionFa: "مدیریت وظایف، بردهای کانبان و پیشرفت کارها",
  },
  "/assets": {
    en: ["esp asset", "assets", "machinery", "equipment", "plant assets", "asset registry", "specifications"],
    fa: ["ای اس پی اسست", "تجهیزات", "ماشین‌آلات", "شناسنامه تجهیزات", "دارایی‌ها", "پلنت"],
    descriptionEn: "Industrial Machinery & Asset Management Registry",
    descriptionFa: "شناسنامه ماشین‌آلات و تجهیزات صنعتی کارخانه",
  },
  "/warehouse": {
    en: ["esp warehouse", "warehouse", "inventory", "stock", "raw materials", "spare parts", "parts", "logistics"],
    fa: ["ای اس پی ویرهاوس", "انبار", "انبارداری", "موجودی", "قطعات", "متریال خام", "لجستیک", "پارت"],
    descriptionEn: "Warehouse Inventory, Parts & Materials Storage",
    descriptionFa: "انبارداری و مدیریت موجودی قطعات و متریال صنعتی",
  },
  "/customers": {
    en: ["esp atlas", "esp customers", "customers", "clients", "petrochemical", "refinery", "holdings", "plants", "licensors"],
    fa: ["ای اس پی اطلس", "مشتریان", "کارفرمایان", "پتروشیمی", "پالایشگاه", "هلدینگ", "لایسنسور", "پلنت"],
    descriptionEn: "Petrochemical, Refinery & Industrial Clients Directory",
    descriptionFa: "بانک اطلاعات جامع مجتمع‌ها، مشتریان و هلدینگ‌های صنعتی",
  },
  "/directory": {
    en: ["esp directory", "directory", "personnel", "staff", "employees", "organization", "phonebook", "contacts"],
    fa: ["ای اس پی دایرکتوری", "همکاران", "پرسنل", "کارکنان", "راهنمای سازمانی", "دفترچه تلفن", "سازمان"],
    descriptionEn: "Personnel Directory & Organizational Structure",
    descriptionFa: "اطلاعات پرسنلی و راهنمای سازمانی همکاران",
  },
  "/engineering/esp-coding": {
    en: ["esp coding", "coding", "classification", "catalog", "equipment codification", "mesc"],
    fa: ["ای اس پی کدینگ", "کدگذاری", "کدینگ", "طبقه‌بندی قطعات", "کاتالوگ تجهیزات"],
    descriptionEn: "Equipment Classification & Codification System",
    descriptionFa: "سیستم طبقه‌بندی و کدگذاری مهندسی تجهیزات و قطعات",
  },
  "/datasheet-ai": {
    en: ["esp datasheet", "datasheet", "ai datasheet", "specification extraction", "ocr", "document intelligence"],
    fa: ["ای اس پی دیتاشیت", "دیتاشیت", "استخراج مشخصات", "هوش مصنوعی", "تحلیل اسناد"],
    descriptionEn: "AI-Powered Technical Specification Extraction",
    descriptionFa: "استخراج هوشمند مشخصات فنی از دیتاشیت با هوش مصنوعی",
  },
  "/community": {
    en: ["community", "q&a", "questions", "answers", "forum", "stackoverflow", "knowledge", "discussion"],
    fa: ["تالار گفتگو", "پرسش و پاسخ", "انجمن", "سوالات فنی", "پاسخ‌ها", "کامیونیتی"],
    descriptionEn: "Collaborative Engineering Community & Q&A Forum",
    descriptionFa: "تالار گفتگو و پرسش و پاسخ تخصصی مهندسی",
  },
  "/profile": {
    en: ["profile", "user", "account", "settings", "personnel", "avatar"],
    fa: ["پروفایل", "حساب کاربری", "اطلاعات پرسنلی", "تنظیمات کاربر", "مشخصات"],
    descriptionEn: "Personnel Profile & Account Management",
    descriptionFa: "پروفایل پرسنلی و مدیریت حساب کاربری",
  },
  "/dictionary": {
    en: [
      "dictionary",
      "glossary",
      "engineering dictionary",
      "terminology",
      "standards",
      "materials",
      "asme",
      "astm",
    ],
    fa: [
      "دیکشنری",
      "واژه‌نامه",
      "اصطلاحات مهندسی",
      "دیکشنری تخصصی",
      "استانداردها",
      "متریال",
      "واژگان فنی",
    ],
    descriptionEn: "Engineering & Technical Terms Dictionary",
    descriptionFa: "مرجع واژگان تخصصی مهندسی، متریال و استانداردها",
  },
  "/did-you-know": {
    en: [
      "did you know",
      "engineering facts",
      "science",
      "formulas",
      "insights",
      "tips",
    ],
    fa: [
      "آیا می‌دانید",
      "دانستنی‌های مهندسی",
      "نکات علمی",
      "فرمول‌ها",
      "رازهای مهندسی",
    ],
    descriptionEn: "Engineering Facts, Empirical Formulas & Knowledge Cards",
    descriptionFa: "دانستنی‌های مهندسی، نکات علمی و فرمول‌های تجربی",
  },
  "/aparat": {
    en: ["videos", "recordings", "clips", "training", "tutorials", "aparat", "education"],
    fa: ["ویدیوها", "فیلم‌ها", "آموزش‌های ویدیویی", "آپارات", "دوره‌های آموزشی"],
    descriptionEn: "Educational Video Archive & Engineering Courses",
    descriptionFa: "آرشیو ویدئوهای آموزشی و دوره‌های تخصصی مهندسی",
  },
  "/sitemap": {
    en: ["sitemap", "map", "structure", "navigation", "flowchart", "architecture"],
    fa: ["نقشه سایت", "ساختار سامانه", "درخت ناوبری", "مسیرها"],
    descriptionEn: "Interactive System Sitemap & Tree Hierarchy",
    descriptionFa: "نمای درختی و تعاملی دسترسی به کلیه بخش‌های سامانه",
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
};

export const NAV_SEARCH_SOURCE: NavSearchSource[] = NAVIGATION.flatMap(
  (group) =>
    group.items.map((item) => {
      const bilingual =
        BILINGUAL_KEYWORDS[item.href] ||
        BILINGUAL_KEYWORDS[item.href.toLowerCase()] || { en: [], fa: [] };
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
  return (
    BILINGUAL_KEYWORDS[href] ??
    BILINGUAL_KEYWORDS[href.toLowerCase()] ?? { en: [], fa: [] }
  );
}
