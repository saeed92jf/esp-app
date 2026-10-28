// src/modules/dashboard/config/modules-registry.ts
import * as React from "react";
import {
  CheckSquare,
  CheckCircle2,
  Flame,
  FileText,
  Link as LinkIcon,
  Calendar,
  ArrowRightLeft,
  Activity,
  BarChart3,
  Clock,
  TrendingUp,
  Wrench,
  LayoutDashboard,
  Layers,
  Sparkles,
  FolderKanban,
} from "lucide-react";

export type TabId = "tasks" | "custom" | "administrative" | "market";

export type ModuleCategory = "tasks" | "tools" | "market" | "administrative";

export interface DashboardModuleMeta {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  icon: React.ElementType;
  category: ModuleCategory;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
}

export const MODULES_REGISTRY: DashboardModuleMeta[] = [
  {
    id: "projects",
    titleFa: "مدیریت پروژه‌ها",
    titleEn: "Projects Management",
    descFa: "میز کار پروژه‌ها، وضعیت پیشرفت، سازمان‌ها و ورود به فضای کار",
    descEn: "Projects workspace, physical progress, clients and timeline",
    icon: FolderKanban,
    category: "tasks",
    minW: 4,
    minH: 6,
    defaultW: 12,
    defaultH: 9,
  },
  {
    id: "tasks",
    titleFa: "مدیریت وظایف",
    titleEn: "Tasks Management",
    descFa: "میز کار تسک‌ها، پیگیری گزارش مدیر، کامنت‌ها و پیوست فایل",
    descEn: "Task board, manager tasks, collaboration and file attachments",
    icon: CheckSquare,
    category: "tasks",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "checklist",
    titleFa: "چک‌لیست دوره‌ای",
    titleEn: "Periodic Checklist",
    descFa: "چک‌لیست روزانه، هفتگی، ماهانه و دوره‌ای با درصد پیشرفت",
    descEn: "Daily, weekly, monthly and periodic checklist with progress",
    icon: CheckCircle2,
    category: "tasks",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "routines",
    titleFa: "روتین",
    titleEn: "Routine",
    descFa: "پیگیری روتین‌های روزانه بر اساس ساعات کاری و روزهای متوالی",
    descEn: "Daily work routines, time slots and habit streaks",
    icon: Flame,
    category: "tasks",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "notes",
    titleFa: "یادداشت‌های سریع",
    titleEn: "Quick Notes",
    descFa: "ثبت و دسته‌بندی یادداشت‌ها با تگ رنگی، پین‌کردن و جستجو",
    descEn: "Notes with color tags, pin-to-top and instant search",
    icon: FileText,
    category: "tools",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
  {
    id: "custom-links",
    titleFa: "لینک‌های کاربردی",
    titleEn: "Useful Links",
    descFa: "دسترسی سریع به بخش‌های داخلی سامانه و سایت‌های خارجی دلخواه",
    descEn: "Quick internal routes and external custom web links",
    icon: LinkIcon,
    category: "tools",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
  {
    id: "calendar",
    titleFa: "تقویم و رویدادها",
    titleEn: "Calendar & Events",
    descFa: "تقویم جلالی و میلادی با نمایش مناسبت‌ها و رویدادهای سازمانی",
    descEn: "Jalali and Gregorian calendar with event schedule",
    icon: Calendar,
    category: "administrative",
    minW: 3,
    minH: 7,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "unit-converter",
    titleFa: "مبدل واحدهای مهندسی",
    titleEn: "Unit Converter",
    descFa: "تبدیل تخصصی واحدهای فشار، دما، طول، وزن و دبی",
    descEn: "Engineering units conversion for pressure, temp, flow, etc.",
    icon: ArrowRightLeft,
    category: "tools",
    minW: 3,
    minH: 7,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "events-manager",
    titleFa: "رویدادها و نمایشگاه‌ها",
    titleEn: "Annual Events",
    descFa: "مدیریت رویدادهای سالانه صنعتی و تقویم نمایشگاه‌ها با جستجو",
    descEn: "Industrial exhibitions and corporate calendar with search",
    icon: Calendar,
    category: "administrative",
    minW: 6,
    minH: 8,
    defaultW: 12,
    defaultH: 10,
  },
  {
    id: "commodities",
    titleFa: "نرخ لحظه‌ای کالاها",
    titleEn: "Commodities Rates",
    descFa: "قیمت لحظه‌ای فلزات، نفت، انرژی و نرخ برابری ارزها",
    descEn: "Live prices for metals, oil, energy and currencies",
    icon: Activity,
    category: "market",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
  {
    id: "chart",
    titleFa: "نمودار روند بازار",
    titleEn: "Market Trends Chart",
    descFa: "نمودار تحلیل تغییرات قیمت و روندهای تکنیکال بازار",
    descEn: "Technical price trends and financial charts",
    icon: BarChart3,
    category: "market",
    minW: 4,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
  {
    id: "world-clock",
    titleFa: "ساعت جهانی پایتخت‌ها",
    titleEn: "World Clock",
    descFa: "نمایش اختلاف زمانی و ساعت رسمی مراکز مهم تجاری دنیا",
    descEn: "Global time zones and commercial hubs",
    icon: Clock,
    category: "administrative",
    minW: 3,
    minH: 5,
    defaultW: 6,
    defaultH: 6,
  },
  {
    id: "stats-overview",
    titleFa: "خلاصه آمار و عملکرد",
    titleEn: "Stats Overview",
    descFa: "شاخص‌های کلیدی عملکرد، پروژه‌ها و گزارش‌های کلی",
    descEn: "Key performance indicators and overall metrics",
    icon: BarChart3,
    category: "market",
    minW: 3,
    minH: 4,
    defaultW: 12,
    defaultH: 5,
  },
  {
    id: "bourse",
    titleFa: "بورس",
    titleEn: "Bourse",
    descFa: "آخرین قیمت و تغییرات نمادهای منتخب پتروشیمی و پالایشگاهی در بورس تهران",
    descEn: "Stock prices for petrochemical and refinery companies on TSE",
    icon: TrendingUp,
    category: "market",
    minW: 4,
    minH: 6,
    defaultW: 6,
    defaultH: 9,
  },
  {
    id: "engineering-tools",
    titleFa: "ابزارهای مهندسی",
    titleEn: "Engineering Tools",
    descFa: "محاسبات فنی، جداول استاندارد و ابزارهای پرکاربرد مهندسی",
    descEn: "Technical calculations and engineering references",
    icon: Wrench,
    category: "tools",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
  {
    id: "sources",
    titleFa: "منابع اطلاعاتی",
    titleEn: "Information Sources",
    descFa: "فهرست مراجع معتبر، کاتالوگ‌ها و منابع استخراج داده‌ها",
    descEn: "Trusted data sources, catalogs and references",
    icon: FileText,
    category: "administrative",
    minW: 3,
    minH: 5,
    defaultW: 6,
    defaultH: 7,
  },
  {
    id: "activity",
    titleFa: "فعالیت‌های اخیر",
    titleEn: "Recent Activity",
    descFa: "گزارش آخرین رخدادها، تغییرات و سابقه فعالیت کاربران",
    descEn: "Feed of recent team and system activities",
    icon: Activity,
    category: "tasks",
    minW: 3,
    minH: 6,
    defaultW: 6,
    defaultH: 8,
  },
];

export const MODULE_MAP = new Map<string, DashboardModuleMeta>(
  MODULES_REGISTRY.map((m) => [m.id, m])
);

export function getModuleMeta(id: string): DashboardModuleMeta | undefined {
  return MODULE_MAP.get(id);
}

export const DASHBOARD_TABS: TabId[] = [
  "tasks",
  "administrative",
  "market",
  "custom",
];

export const DEFAULT_TAB_WIDGETS: Record<TabId, string[]> = {
  tasks: ["projects", "tasks"],
  administrative: ["events-manager", "world-clock"],
  market: ["commodities", "bourse", "stats-overview", "chart"],
  custom: ["unit-converter", "calendar"],
};

export const DEFAULT_TAB_LAYOUTS: Record<TabId, Record<string, any[]>> = {
  tasks: {
    lg: [
      { i: "projects", x: 0, y: 0, w: 12, h: 9, minW: 6, minH: 6 },
      { i: "tasks", x: 0, y: 9, w: 12, h: 9, minW: 6, minH: 6 },
    ],
    md: [
      { i: "projects", x: 0, y: 0, w: 10, h: 9, minW: 5, minH: 6 },
      { i: "tasks", x: 0, y: 9, w: 10, h: 9, minW: 5, minH: 6 },
    ],
    sm: [
      { i: "projects", x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
      { i: "tasks", x: 0, y: 9, w: 6, h: 9, minW: 4, minH: 6 },
    ],
  },
  custom: {
    lg: [
      { i: "unit-converter", x: 0, y: 0, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "calendar", x: 6, y: 0, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "notes", x: 0, y: 9, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "custom-links", x: 6, y: 9, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "commodities", x: 0, y: 17, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "chart", x: 6, y: 17, w: 6, h: 8, minW: 4, minH: 6 },
    ],
    md: [
      { i: "unit-converter", x: 0, y: 0, w: 5, h: 9, minW: 3, minH: 7 },
      { i: "calendar", x: 5, y: 0, w: 5, h: 9, minW: 3, minH: 7 },
      { i: "notes", x: 0, y: 9, w: 5, h: 8, minW: 3, minH: 6 },
      { i: "custom-links", x: 5, y: 9, w: 5, h: 8, minW: 3, minH: 6 },
      { i: "commodities", x: 0, y: 17, w: 5, h: 8, minW: 3, minH: 6 },
      { i: "chart", x: 5, y: 17, w: 5, h: 8, minW: 4, minH: 6 },
    ],
    sm: [
      { i: "unit-converter", x: 0, y: 0, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "calendar", x: 0, y: 9, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "notes", x: 0, y: 18, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "custom-links", x: 0, y: 26, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "commodities", x: 0, y: 34, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "chart", x: 0, y: 42, w: 6, h: 8, minW: 4, minH: 6 },
    ],
  },
  administrative: {
    lg: [
      { i: "events-manager", x: 0, y: 0, w: 12, h: 10, minW: 6, minH: 8 },
      { i: "world-clock", x: 0, y: 10, w: 12, h: 7, minW: 4, minH: 5 },
      { i: "calendar", x: 0, y: 17, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "custom-links", x: 6, y: 17, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "unit-converter", x: 0, y: 26, w: 6, h: 8, minW: 3, minH: 7 },
      { i: "sources", x: 6, y: 26, w: 6, h: 7, minW: 4, minH: 5 },
    ],
    md: [
      { i: "events-manager", x: 0, y: 0, w: 10, h: 10, minW: 5, minH: 8 },
      { i: "world-clock", x: 0, y: 10, w: 10, h: 7, minW: 4, minH: 5 },
      { i: "calendar", x: 0, y: 17, w: 5, h: 9, minW: 3, minH: 7 },
      { i: "custom-links", x: 5, y: 17, w: 5, h: 8, minW: 3, minH: 6 },
      { i: "unit-converter", x: 0, y: 26, w: 5, h: 8, minW: 3, minH: 7 },
      { i: "sources", x: 5, y: 26, w: 5, h: 7, minW: 4, minH: 5 },
    ],
    sm: [
      { i: "events-manager", x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 8 },
      { i: "world-clock", x: 0, y: 12, w: 6, h: 7, minW: 3, minH: 5 },
      { i: "calendar", x: 0, y: 19, w: 6, h: 9, minW: 3, minH: 7 },
      { i: "custom-links", x: 0, y: 28, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "unit-converter", x: 0, y: 36, w: 6, h: 8, minW: 3, minH: 7 },
      { i: "sources", x: 0, y: 44, w: 6, h: 7, minW: 3, minH: 5 },
    ],
  },
  market: {
    lg: [
      { i: "commodities", x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
      { i: "bourse", x: 6, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
      { i: "stats-overview", x: 0, y: 9, w: 12, h: 5, minW: 4, minH: 4 },
      { i: "chart", x: 0, y: 14, w: 12, h: 8, minW: 4, minH: 6 },
      { i: "engineering-tools", x: 0, y: 22, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "world-clock", x: 6, y: 22, w: 6, h: 6, minW: 3, minH: 5 },
    ],
    md: [
      { i: "commodities", x: 0, y: 0, w: 5, h: 9, minW: 4, minH: 6 },
      { i: "bourse", x: 5, y: 0, w: 5, h: 9, minW: 4, minH: 6 },
      { i: "stats-overview", x: 0, y: 9, w: 10, h: 5, minW: 4, minH: 4 },
      { i: "chart", x: 0, y: 14, w: 10, h: 8, minW: 4, minH: 6 },
      { i: "engineering-tools", x: 0, y: 22, w: 5, h: 8, minW: 3, minH: 6 },
      { i: "world-clock", x: 5, y: 22, w: 5, h: 6, minW: 3, minH: 5 },
    ],
    sm: [
      { i: "commodities", x: 0, y: 0, w: 6, h: 9, minW: 3, minH: 6 },
      { i: "bourse", x: 0, y: 9, w: 6, h: 9, minW: 3, minH: 6 },
      { i: "stats-overview", x: 0, y: 18, w: 6, h: 5, minW: 3, minH: 4 },
      { i: "chart", x: 0, y: 23, w: 6, h: 8, minW: 4, minH: 6 },
      { i: "engineering-tools", x: 0, y: 31, w: 6, h: 8, minW: 3, minH: 6 },
      { i: "world-clock", x: 0, y: 39, w: 6, h: 6, minW: 3, minH: 5 },
    ],
  },
};
