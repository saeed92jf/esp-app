// src/modules/search/data/search-items.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Search Corpus & Indexed Items

import { ENGINEERING_TERMS_FA } from "@/modules/home/data/engineering-dictionary.fa";
import { ENGINEERING_TERMS_EN } from "@/modules/home/data/engineering-dictionary.en";
import type { SearchItem } from "../types/search.types";

/**
 * Static baseline search items covering modules, tools, projects, tasks, videos, and standards.
 */
export const CORE_SEARCH_ITEMS: SearchItem[] = [
  // ─── 1. MODULES & TOOLS ──────────────────────────────────────────────────────
  {
    id: "mod-esp-flow",
    title: "سامانه طراحی و محاسبات فرایندی ESP-Flow",
    titleEn: "ESP-Flow: Interactive Process & Vessel Design Flow",
    category: "modules",
    href: "/ESP-Flow",
    snippet: "محیط یکپارچه طراحی تعاملی دیاگرام، محاسبات مخازن تحت فشار طبق ASME Section VIII، متریال، هندسه و تجهیزات فرایندی.",
    snippetEn: "Interactive process flow diagram environment, ASME Section VIII pressure vessel design, materials, geometry, and process equipment.",
    breadcrumbs: ["سامانه پارس", "ابزارها و محاسبات", "ESP-Flow"],
    breadcrumbsEn: ["ESP Platform", "Tools & Calculations", "ESP-Flow"],
    iconName: "Cpu",
    badge: "ماژول اصلی",
    badgeEn: "Core Tool",
    metadata: {
      categoryName: "طراحی مکانیک و فرایند",
      standard: "ASME Sec VIII Div 1",
    },
    keywords: [
      "esp flow", "esp-flow", "process flow", "diagram", "simulation", "vessel",
      "pressure vessel", "asme", "asme sec viii", "asme section 8", "shell",
      "head", "nozzle", "jacket", "material", "vacuum", "steam", "operating pressure",
      "design pressure", "temperature", "flange", "support", "skirt", "saddle", "weights",
      "ای اس پی فلو", "جریان فرایند", "شبیه سازی", "دیاگرام مهندسی", "مخزن", "مخازن",
      "مخازن تحت فشار", "طراحی مخزن", "جکت", "شل", "هد", "نازل", "متریال", "فشار طراحی",
      "دمای طراحی", "استاندارد ازمی", "ازمه", "پوسته", "عدسی", "ساپورت"
    ],
  },
  {
    id: "mod-weight-flow",
    title: "محاسبه‌گر اوزان و ضخامت مخازن (Weight-Flow)",
    titleEn: "Vessel Weight & Thickness Calculator (Weight-Flow)",
    category: "modules",
    href: "/Weight-Flow",
    snippet: "ماژول تخصصی محاسبه وزن خالی، وزن تست هیدرواستاتیک و وزن عملیاتی مخازن، وزن کلاهک، پوسته، نازل‌ها و زنگوله‌ها.",
    snippetEn: "Dedicated module for empty weight, hydrostatic test weight, operating weight, head weight, shell, nozzles, and saddles.",
    breadcrumbs: ["سامانه پارس", "ابزارها و محاسبات", "Weight-Flow"],
    breadcrumbsEn: ["ESP Platform", "Tools & Calculations", "Weight-Flow"],
    iconName: "ChartPolar",
    badge: "محاسبات وزن",
    badgeEn: "Weight Tool",
    metadata: {
      categoryName: "محاسبات سازه و وزن",
      standard: "ASME & Weight Codes",
    },
    keywords: [
      "weight", "vessel weight", "thickness", "operating weight", "empty weight",
      "hydrostatic weight", "shell weight", "head weight", "nozzle weight",
      "وزن", "محاسبه وزن مخزن", "ضخامت مخزن", "وزن عملیاتی", "وزن خالی", "وزن تست",
      "وزن تست هیدرواستاتیک", "وزن شل", "وزن هد", "وزن کلاهک", "وزن نازل"
    ],
  },
  {
    id: "mod-dictionary",
    title: "واژه‌نامه تخصصی مهندسی و اصطلاحات صنعتی",
    titleEn: "Engineering Dictionary & Technical Glossary",
    category: "modules",
    href: "/#dictionary",
    snippet: "بیش از ۲۰۰۰ اصطلاح تخصصی مهندسی مکانیک، نفت، گاز، پتروشیمی، متریال، استانداردها و اصطلاحات کارگاهی با ارجاع دقیق به استانداردها.",
    snippetEn: "Over 2,000 engineering terms in mechanical, oil & gas, petrochemical, materials, and standards with exact code references.",
    breadcrumbs: ["سامانه پارس", "دانش و مراجع", "واژه‌نامه تخصصی"],
    breadcrumbsEn: ["ESP Platform", "Knowledge & References", "Dictionary"],
    iconName: "BookOpenText",
    badge: "مرجع واژگان",
    badgeEn: "Glossary",
    metadata: {
      categoryName: "دانش مهندسی",
      standard: "ASME / API / ASTM",
    },
    keywords: [
      "dictionary", "glossary", "terms", "engineering terms", "definitions",
      "standards", "abbreviations", "materials", "equipment", "jargon",
      "واژه نامه", "دیکشنری", "اصطلاحات", "اصطلاحات مهندسی", "تعاریف", "استانداردها",
      "مخفف ها", "متریال", "تجهیزات", "اصطلاحات کارگاهی", "واژگان تخصصی"
    ],
  },
  {
    id: "mod-aparat",
    title: "ویدیوها و دوره‌های آموزشی مهندسی (آپارات)",
    titleEn: "Engineering Video Tutorials & Webinars (Aparat)",
    category: "modules",
    href: "/aparat",
    snippet: "مجموعه ویدیوهای آموزشی تخصصی طراحی مخازن تحت فشار، شبیه‌سازی ESP-Flow، تحلیل تنش و استانداردهای صنعتی بین‌المللی.",
    snippetEn: "Comprehensive video tutorials on pressure vessel design, ESP-Flow simulation, stress analysis, and international codes.",
    breadcrumbs: ["سامانه پارس", "رسانه و آموزش", "ویدیوها"],
    breadcrumbsEn: ["ESP Platform", "Media & Learning", "Videos"],
    iconName: "VideoCamera",
    badge: "ویدیوهای آموزشی",
    badgeEn: "Video Tutorials",
    metadata: {
      categoryName: "آموزش و مالتی مدیا",
    },
    keywords: [
      "videos", "aparat", "tutorials", "webinars", "training", "learning", "video guide",
      "ویدیو", "ویدیوها", "آپارات", "آموزش", "وبینار", "فیلم آموزشی", "ویدیو آموزشی"
    ],
  },
  {
    id: "mod-dashboard",
    title: "میز کار و داشبورد مرکزی مدیریت",
    titleEn: "Central Management Dashboard & Workspace",
    category: "modules",
    href: "/dashboard",
    snippet: "مشاهده شاخص‌های کلیدی عملکرد، پروژه‌های فعال، وضعیت تسک‌ها، رویدادهای تقویم و گزارش‌های سیستمی.",
    snippetEn: "View key performance indicators, active projects, task statuses, calendar events, and system reports.",
    breadcrumbs: ["سامانه پارس", "مدیریت", "داشبورد مرکزی"],
    breadcrumbsEn: ["ESP Platform", "Management", "Dashboard"],
    iconName: "PresentationChart",
    badge: "داشبورد",
    badgeEn: "Dashboard",
    metadata: {
      categoryName: "مدیریت و گزارشات",
    },
    keywords: [
      "dashboard", "kpi", "overview", "analytics", "stats", "reports", "projects summary",
      "داشبورد", "میز کار", "گزارشات", "آمار", "شاخص ها", "نمای کلی", "پروژه ها"
    ],
  },
  {
    id: "mod-admin",
    title: "پنل مدیریت کاربران و تنظیمات سیستم (Admin)",
    titleEn: "System Administration & User Management Panel",
    category: "modules",
    href: "/admin",
    snippet: "مدیریت دسترسی کاربران، تایید درخواست‌ها، گزارش‌های فعالیت تیم، چارت سازمانی و سطوح دسترسی ماژول‌ها.",
    snippetEn: "Manage user permissions, approve requests, review team activity logs, organizational charts, and module access levels.",
    breadcrumbs: ["سامانه پارس", "مدیریت", "پنل ادمین"],
    breadcrumbsEn: ["ESP Platform", "Management", "Admin Panel"],
    iconName: "Fingerprint",
    badge: "پنل ادمین",
    badgeEn: "Admin",
    metadata: {
      categoryName: "مدیریت سیستم",
    },
    keywords: [
      "admin", "administration", "users", "permissions", "access control", "roles", "audit",
      "ادمین", "مدیریت سیستم", "کاربران", "دسترسی ها", "نقش ها", "تایید درخواست", "گزارش فعالیت"
    ],
  },
  {
    id: "mod-team",
    title: "معرفی اعضای تیم و چارت سازمانی",
    titleEn: "Engineering Team & Organizational Structure",
    category: "modules",
    href: "/team",
    snippet: "آشنایی با مهندسان، مدیران پروژه، متخصصان طراحی فرایند و سازه، و تیم فنی سامانه یکپارچه مهندسی.",
    snippetEn: "Meet the engineers, project managers, process and structural specialists, and technical platform team.",
    breadcrumbs: ["سامانه پارس", "سازمان", "اعضای تیم"],
    breadcrumbsEn: ["ESP Platform", "Organization", "Team"],
    iconName: "UsersThree",
    badge: "تیم تخصصی",
    badgeEn: "Team",
    metadata: {
      categoryName: "منابع انسانی",
    },
    keywords: [
      "team", "engineers", "staff", "organization", "members", "profiles",
      "تیم", "اعضای تیم", "مهندسان", "پرسنل", "چارت سازمانی", "همکاران"
    ],
  },
  {
    id: "mod-sitemap",
    title: "سایت‌مپ و نقشه تعاملی سامانه",
    titleEn: "Interactive Platform Sitemap & Module Index",
    category: "modules",
    href: "/sitemap",
    snippet: "نمای گرافیکی و ساختار درختی تمام بخش‌ها، ابزارهای مهندسی، صفحات سازمانی و قابلیت‌های سامانه.",
    snippetEn: "Visual tree structure and index of all sections, engineering tools, corporate pages, and features.",
    breadcrumbs: ["سامانه پارس", "ناوبری", "نقشه سایت"],
    breadcrumbsEn: ["ESP Platform", "Navigation", "Sitemap"],
    iconName: "TreeStructure",
    badge: "نقشه سایت",
    badgeEn: "Sitemap",
    metadata: {
      categoryName: "ساختار سامانه",
    },
    keywords: [
      "sitemap", "map", "navigation", "tree", "pages index", "modules list",
      "نقشه سایت", "سایت مپ", "ساختار درختی", "صفحات", "راهنمای ناوبری"
    ],
  },

  // ─── 2. TASKS & PROJECTS ─────────────────────────────────────────────────────
  {
    id: "proj-ammonia-vessel",
    title: "پروژه طراحی مخزن تحت فشار آمونیاک پتروشیمی (TK-101)",
    titleEn: "Petrochemical Ammonia Pressure Vessel Project (TK-101)",
    category: "tasks",
    href: "/dashboard?tab=projects&id=tk-101",
    snippet: "طراحی مکانیکی مخزن افقی آمونیاک با فشار طراحی 21.5 بار، متریال SA-516 Gr 70 HIC، ضخامت پوسته 38 میلی‌متر طبق ASME Section VIII Div 1.",
    snippetEn: "Mechanical design of horizontal ammonia vessel at 21.5 bar design pressure, SA-516 Gr 70 HIC material, 38mm shell thickness per ASME Sec VIII Div 1.",
    breadcrumbs: ["پروژه‌ها", "مخازن تحت فشار", "TK-101 آمونیاک"],
    breadcrumbsEn: ["Projects", "Pressure Vessels", "TK-101 Ammonia"],
    iconName: "Archive",
    badge: "پروژه فعال",
    badgeEn: "Active Project",
    metadata: {
      date: "1403/07/15",
      standard: "ASME VIII Div 1",
      status: "در حال ساخت",
      categoryName: "پروژه‌های مهندسی",
    },
    keywords: [
      "project", "ammonia vessel", "tk-101", "pressure vessel project", "horizontal vessel",
      "sa-516", "ammonia", "petrochemical", "asme design",
      "پروژه", "پروژه مخزن", "مخزن آمونیاک", "پتروشیمی", "طراحی مخزن افقی", "پروژه های مهندسی"
    ],
  },
  {
    id: "proj-heat-exchanger",
    title: "پروژه طراحی مبدل حرارتی پوسته و لوله (E-205 TEMA AES)",
    titleEn: "Shell & Tube Heat Exchanger Project (E-205 TEMA AES)",
    category: "tasks",
    href: "/dashboard?tab=projects&id=e-205",
    snippet: "محاسبات حرارتی و مکانیکی مبدل با تیوب شیت شناور (Floating Head)، متریال تیوب‌ها Inconel 625 و پوسته کربن استیل مطابق با استاندارد TEMA R.",
    snippetEn: "Thermal and mechanical calculations for floating head exchanger with Inconel 625 tubes and carbon steel shell per TEMA R.",
    breadcrumbs: ["پروژه‌ها", "مبدل‌های حرارتی", "E-205 TEMA AES"],
    breadcrumbsEn: ["Projects", "Heat Exchangers", "E-205 TEMA AES"],
    iconName: "Kanban",
    badge: "پروژه فعال",
    badgeEn: "Active Project",
    metadata: {
      date: "1403/08/01",
      standard: "TEMA R / ASME VIII",
      status: "بررسی طراحی",
      categoryName: "پروژه‌های مهندسی",
    },
    keywords: [
      "heat exchanger project", "shell and tube", "tema", "e-205", "floating head", "inconel",
      "پروژه مبدل", "مبدل حرارتی", "پوسته و لوله", "پروژه تما", "تیوب شیت", "اینکونل"
    ],
  },
  {
    id: "proj-lpg-spherical",
    title: "پروژه مخازن کروی ذخیره گاز مایع LPG (S-301)",
    titleEn: "LPG Spherical Gas Storage Tank Project (S-301)",
    category: "tasks",
    href: "/dashboard?tab=projects&id=s-301",
    snippet: "محاسبات ضخامت صفحات کروی، تحلیل تنش ستون‌های ساپورت و طراحی اتصالات بادبندی تحت بارهای زلزله شدید طبق API 620 و ASME.",
    snippetEn: "Spherical plate thickness calculation, support column stress analysis, and bracing connections under seismic loads per API 620 & ASME.",
    breadcrumbs: ["پروژه‌ها", "مخازن ذخیره", "S-301 کروی"],
    breadcrumbsEn: ["Projects", "Storage Tanks", "S-301 Spherical"],
    iconName: "ListChecks",
    badge: "پروژه نظارتی",
    badgeEn: "Supervised Project",
    metadata: {
      date: "1403/06/20",
      standard: "API 620 / ASME VIII",
      status: "تست نهایی",
      categoryName: "پروژه‌های مهندسی",
    },
    keywords: [
      "spherical tank", "lpg", "gas storage", "api 620", "s-301", "sphere",
      "مخزن کروی", "مخازن کروی", "ذخیره گاز", "گاز مایع", "مخزن گاز", "پروژه کروی"
    ],
  },
  {
    id: "task-hydrostatic-test",
    title: "تسک آماده‌سازی و بازرسی آزمون هیدرواستاتیک مخزن TK-101",
    titleEn: "Hydrostatic Test Preparation & Inspection Task (TK-101)",
    category: "tasks",
    href: "/dashboard?tab=tasks&id=t-104",
    snippet: "بررسی گیج‌های فشار کالیبره، تعیین فشار تست هیدرواستاتیک (1.3 برابر فشار طراحی ضربدر نسبت تنش مجاز) و هماهنگی تست NDT جوش‌ها.",
    snippetEn: "Verify calibrated pressure gauges, set hydrostatic test pressure (1.3x design pressure ratio), and coordinate weld NDT tests.",
    breadcrumbs: ["تسک‌ها", "بازرسی فنی", "تست هیدرواستاتیک"],
    breadcrumbsEn: ["Tasks", "Inspection", "Hydrostatic Test"],
    iconName: "ListChecks",
    badge: "تسک در انتظار",
    badgeEn: "Pending Task",
    metadata: {
      date: "امروز",
      standard: "ASME UG-99",
      status: "در حال اقدام",
      categoryName: "فعالیت‌های فنی",
    },
    keywords: [
      "task", "hydrostatic test", "hydrotest", "inspection", "ndt", "quality", "asme ug-99",
      "تسک", "تست هیدرواستاتیک", "هیدروتست", "بازرسی", "تست جوش", "کنترل کیفیت", "آزمون فشار"
    ],
  },
  {
    id: "task-datasheet-material",
    title: "تسک نهایی‌سازی دیتاشیت متریال ورق فولادی SA-516 Gr 70",
    titleEn: "Finalize Material Datasheet Task for SA-516 Gr 70 Plate",
    category: "tasks",
    href: "/dashboard?tab=tasks&id=t-105",
    snippet: "تایید الزامات تکمیلی S83 (HIC test)، تست ضربه شارپی در منفی 46 درجه و ارائه مدارک بازرسی MTC تایپ 3.1 طبق EN 10204.",
    snippetEn: "Approve S83 HIC test requirements, Charpy V-notch impact test at -46C, and MTC 3.1 inspection certification per EN 10204.",
    breadcrumbs: ["تسک‌ها", "متریال و خرید", "دیتاشیت متریال"],
    breadcrumbsEn: ["Tasks", "Materials", "Material Datasheet"],
    iconName: "Kanban",
    badge: "تسک فنی",
    badgeEn: "Technical Task",
    metadata: {
      date: "دیروز",
      standard: "ASTM A516 / EN 10204",
      status: "تایید شده",
      categoryName: "فعالیت‌های فنی",
    },
    keywords: [
      "task", "material datasheet", "sa-516", "impact test", "mtc", "hic test",
      "تسک", "دیتاشیت متریال", "ورق فولادی", "تست ضربه", "گواهی تست", "آزمایشگاه متریال"
    ],
  },

  // ─── 3. VIDEOS & TUTORIALS ───────────────────────────────────────────────────
  {
    id: "vid-asme-vessel-design",
    title: "ویدیو آموزشی: راهنمای گام‌به‌گام طراحی مخازن تحت فشار ASME",
    titleEn: "Video: Comprehensive ASME Section VIII Pressure Vessel Design",
    category: "videos",
    href: "/aparat?v=asme-vessel-guide",
    snippet: "آموزش کامل محاسبه ضخامت پوسته استوانه‌ای، انواع عدسی‌ها (2:1 Ellipsoidal، Torispherical)، محاسبات نازل و اتصالات فلنجی.",
    snippetEn: "Complete guide on calculating cylindrical shell thickness, head types, nozzle reinforcement, and flange connections.",
    breadcrumbs: ["آموزش‌ها", "ویدیوها", "طراحی ASME"],
    breadcrumbsEn: ["Tutorials", "Videos", "ASME Design"],
    iconName: "VideoCamera",
    badge: "ویدیوی HD",
    badgeEn: "HD Video",
    metadata: {
      duration: "42:15",
      views: "1,840",
      standard: "ASME VIII Div 1",
      author: "تیم مهندسی پارس",
      categoryName: "ویدیوهای آموزشی",
    },
    keywords: [
      "video", "asme video", "vessel design video", "tutorial", "shell thickness video",
      "ویدیو", "ویدیو مخزن", "فیلم آموزش طراحی مخازن", "آموزش ازمی", "ویدیو آموزشی", "طراحی پوسته"
    ],
  },
  {
    id: "vid-espflow-modeling",
    title: "ویدیو آموزشی: مدلسازی سیستم‌های فرایندی در پلتفرم ESP-Flow",
    titleEn: "Video: Modeling Industrial Process Systems in ESP-Flow",
    category: "videos",
    href: "/aparat?v=espflow-quickstart",
    snippet: "نحوه رسم دیاگرام‌های تعاملی، ایجاد نودهای تجهیزات، اتصال جریان‌ها، تنظیم داده‌های عملیاتی و استخراج گزارشات نهایی.",
    snippetEn: "How to draw interactive flowcharts, create equipment nodes, connect streams, configure operating data, and export reports.",
    breadcrumbs: ["آموزش‌ها", "ویدیوها", "راهنمای ESP-Flow"],
    breadcrumbsEn: ["Tutorials", "Videos", "ESP-Flow Guide"],
    iconName: "PlayCircle",
    badge: "راهنمای نرم‌افزار",
    badgeEn: "App Guide",
    metadata: {
      duration: "28:50",
      views: "2,420",
      author: "سعید جلیلی فرد",
      categoryName: "ویدیوهای آموزشی",
    },
    keywords: [
      "video", "esp-flow video", "modeling video", "flowchart guide", "diagram tutorial",
      "ویدیو ای اس پی فلو", "فیلم کار با esp-flow", "آموزش نرم افزار", "ویدیو دیاگرام"
    ],
  },
  {
    id: "vid-saddle-stress",
    title: "ویدیو آموزشی: تحلیل تنش و طراحی ساپورت زین (Saddle) طبق متد Zick",
    titleEn: "Video: Stress Analysis & Saddle Support Design Using Zick's Method",
    category: "videos",
    href: "/aparat?v=zick-saddle-analysis",
    snippet: "تحلیل تنش‌های خمشی طولی، تنش‌های مماسی برشی، تنش محیطی در محل زین و بررسی ورق تقویتی (Wear Plate) مخازن افقی.",
    snippetEn: "Analysis of longitudinal bending stress, tangential shear stress, and circumferential stress with wear plate per Zick.",
    breadcrumbs: ["آموزش‌ها", "ویدیوها", "ساپورت زین"],
    breadcrumbsEn: ["Tutorials", "Videos", "Saddle Supports"],
    iconName: "VideoCamera",
    badge: "تحلیل سازه",
    badgeEn: "Structural Analysis",
    metadata: {
      duration: "34:10",
      views: "980",
      standard: "Zick / ASME",
      categoryName: "ویدیوهای آموزشی",
    },
    keywords: [
      "video", "saddle video", "zick method", "wear plate", "horizontal vessel support",
      "ویدیو ساپورت زین", "آموزش روش زیک", "تحلیل تنش زین", "فیلم سدل مخزن افقی"
    ],
  },

  // ─── 4. STANDARDS & ENGINEERING DOCUMENTS ────────────────────────────────────
  {
    id: "doc-asme-bpvc-viii",
    title: "استاندارد مرجع ASME BPVC Section VIII Division 1",
    titleEn: "ASME Boiler & Pressure Vessel Code Section VIII Div 1",
    category: "dictionary",
    href: "/#dictionary?term=asme-bpvc",
    snippet: "قوانین ساخت مخازن تحت فشار، فرمول‌های محاسبه حداقل ضخامت پوسته و عدسی‌ها، ضرایب اتصال جوش (Joint Efficiency) و بازرسی UG.",
    snippetEn: "Rules for construction of pressure vessels, minimum thickness formulas for shells and heads, joint efficiency, and UG inspection.",
    breadcrumbs: ["مستندات", "استانداردها", "ASME Section VIII"],
    breadcrumbsEn: ["Documents", "Standards", "ASME Section VIII"],
    iconName: "Article",
    badge: "استاندارد بین‌المللی",
    badgeEn: "International Standard",
    metadata: {
      standard: "ASME BPVC VIII-1",
      categoryName: "استانداردهای مهندسی",
    },
    keywords: [
      "asme", "asme bpvc", "section viii", "div 1", "joint efficiency", "ug-27", "pressure code",
      "استاندارد ازمی", "کد مخازن", "ازمی سکشن ۸", "ضریب جوش", "ضخامت شل و هد", "استاندارد مهندسی"
    ],
  },
  {
    id: "doc-api-650",
    title: "استاندارد مرجع API 650: مخازن جوشی ذخیره نفت و فراورده‌ها",
    titleEn: "API Standard 650: Welded Tanks for Oil Storage",
    category: "dictionary",
    href: "/#dictionary?term=api-650",
    snippet: "الزامات طراحی، متریال، ساخت و تست مخازن اتمسفریک ذخیره نفت، روش 1-Foot Method برای ضخامت کورس‌ها و بار باد و زلزله.",
    snippetEn: "Design, materials, fabrication, and testing requirements for atmospheric oil storage tanks and 1-Foot Method.",
    breadcrumbs: ["مستندات", "استانداردها", "API 650"],
    breadcrumbsEn: ["Documents", "Standards", "API 650"],
    iconName: "Article",
    badge: "استاندارد API",
    badgeEn: "API Code",
    metadata: {
      standard: "API 650",
      categoryName: "استانداردهای مهندسی",
    },
    keywords: [
      "api 650", "api", "oil tank", "storage tank code", "atmospheric tank",
      "استاندارد api 650", "مخازن ذخیره نفت", "کد api", "مخزن اتمسفریک", "طراحی مخزن ذخیره"
    ],
  },
  {
    id: "doc-tema-standards",
    title: "استاندارد ساخت مبدل‌های حرارتی پوسته و لوله (TEMA)",
    titleEn: "TEMA Standards for Tubular Exchangers (Class R, B, C)",
    category: "dictionary",
    href: "/#dictionary?term=tema",
    snippet: "استانداردهای انجمن سازندگان مبدل‌های لوله‌ای شامل کلاس‌های TEMA R (پالایشگاهی)، TEMA B (شیمیایی) و TEMA C (صنعتی عام).",
    snippetEn: "Standards of the Tubular Exchanger Manufacturers Association covering TEMA R (Refinery), TEMA B, and TEMA C.",
    breadcrumbs: ["مستندات", "استانداردها", "TEMA"],
    breadcrumbsEn: ["Documents", "Standards", "TEMA"],
    iconName: "Article",
    badge: "استاندارد TEMA",
    badgeEn: "TEMA Standard",
    metadata: {
      standard: "TEMA 10th Ed.",
      categoryName: "استانداردهای مهندسی",
    },
    keywords: [
      "tema", "tema standards", "heat exchanger code", "tubular exchanger", "tema r", "baffles",
      "استاندارد تما", "استاندارد مبدل", "کلاس تما r", "بافل ها", "تیوب باندل"
    ],
  },
];

/**
 * Builds the fully integrated dictionary search items from the rich engineering dictionary.
 */
function buildDictionarySearchItems(): SearchItem[] {
  return ENGINEERING_TERMS_FA.map((term) => {
    const enMatch = ENGINEERING_TERMS_EN.find((e) => e.id === term.id);
    const keywords = [
      term.term,
      term.secondaryTerm || "",
      term.abbreviation || "",
      term.categoryName,
      ...(term.standards || []),
      ...(term.tags || []),
      ...(enMatch ? [enMatch.term, enMatch.abbreviation || "", ...(enMatch.tags || [])] : []),
    ].filter(Boolean);

    return {
      id: `dict-${term.id}`,
      title: `${term.term} ${term.secondaryTerm ? `(${term.secondaryTerm})` : ""}`,
      titleEn: enMatch ? enMatch.term : term.secondaryTerm,
      category: "dictionary" as const,
      href: `/#dictionary?term=${encodeURIComponent(term.id)}`,
      snippet: term.shortDesc + (term.keyTip ? ` نکته کلیدی: ${term.keyTip}` : ""),
      snippetEn: enMatch ? enMatch.shortDesc : undefined,
      breadcrumbs: ["واژه‌نامه تخصصی", term.categoryName, term.term],
      breadcrumbsEn: ["Engineering Dictionary", term.category, enMatch?.term || term.term],
      iconName: "BookOpenText",
      badge: term.abbreviation || term.categoryName,
      badgeEn: term.abbreviation || "Dictionary",
      metadata: {
        standard: term.standards?.[0],
        categoryName: term.categoryName,
      },
      keywords,
    };
  });
}

/**
 * Combined all searchable items across all domains.
 */
export const ALL_SEARCH_ITEMS: SearchItem[] = [
  ...CORE_SEARCH_ITEMS,
  ...buildDictionarySearchItems(),
];

/**
 * Comprehensive Lexicon of Natural Google-Style Search Suggestions (Bilingual)
 */
export const SEARCH_SUGGESTIONS_LEXICON: string[] = [
  // Persian Phrases
  "مخازن تحت فشار ASME",
  "طراحی مخزن افقی",
  "طراحی مخزن عمودی",
  "محاسبه ضخامت پوسته مخزن",
  "محاسبه ضخامت عدسی بیضوی",
  "محاسبات وزن مخازن تحت فشار",
  "شبیه‌سازی فرایندی ESP-Flow",
  "مبدل حرارتی پوسته و لوله",
  "مخازن ذخیره اتمسفریک API 650",
  "تست هیدرواستاتیک مخازن",
  "ورق فولادی SA-516 Gr 70",
  "فولاد دابلکس Duplex 2205",
  "تحلیل تنش ساپورت سدل طبق زیک",
  "ضرایب اتصال جوش Joint Efficiency",
  "طراحی نازل و ورق تقویتی",
  "آرشیو استانداردهای مهندسی",
  "ویدیوهای آموزشی طراحی مخازن",
  "واژه‌نامه تخصصی مهندسی مکانیک",
  "پروژه مخزن آمونیاک پتروشیمی",
  "پروژه مبدل حرارتی TEMA",
  "پروژه مخازن کروی گاز مایع",
  "چک‌لیست کنترل کیفیت و بازرسی NDT",
  "تست مقاومت به هیدروژن HIC Test",
  "فشار طراحی و دمای عملیاتی",
  "تحلیل بارهای باد و زلزله روی مخزن",
  "خوردگی مجاز Corrosion Allowance",

  // English Phrases
  "pressure vessel design asme",
  "vessel thickness calculation",
  "esp flow process simulation",
  "shell and tube heat exchanger",
  "vessel weight calculator",
  "hydrostatic test pressure",
  "asme section viii division 1",
  "api 650 storage tanks",
  "sa-516 gr 70 steel plate",
  "duplex 2205 stainless steel",
  "zick method saddle support",
  "nozzle reinforcement calculation",
  "joint efficiency calculation",
  "engineering dictionary terms",
  "petrochemical ammonia vessel project",
  "corrosion allowance asme",
  "design pressure and temperature",
  "tema heat exchanger standards",
  "astm standards library",
];
