import { NAVIGATION } from "@/config/navigation";

export type RouteAccess = "public" | "auth" | "admin";
export type RenderType = "SSR" | "CSR" | "HYBRID";
export type RouteCategory =
  | "core"
  | "engineering"
  | "projectManagement"
  | "knowledge"
  | "admin"
  | "auth"
  | "legal";

export interface SitemapRouteItem {
  id: string;
  path: string;
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
  category: RouteCategory;
  access: RouteAccess;
  renderType: RenderType;
  status: "200 OK" | "LIVE";
  parentPath?: string;
  isLeaf?: boolean;
}

/**
 * System Core, Auth, Admin and Legal routes that exist outside NAVIGATION groups.
 */
const SYSTEM_STATIC_ROUTES: SitemapRouteItem[] = [
  // Core
  {
    id: "route-home",
    path: "/",
    titleEn: "Home Portal",
    titleFa: "صفحه اصلی سامانه",
    descEn: "Landing portal, hero flow, quick actions and corporate engineering overview.",
    descFa: "درگاه ورودی، جریان معرفی، دسترسی‌های سریع و معرفی سامانه مهندسی.",
    category: "core",
    access: "public",
    renderType: "HYBRID",
    status: "200 OK",
  },
  {
    id: "route-dashboard",
    path: "/dashboard",
    titleEn: "Executive Dashboard",
    titleFa: "داشبورد مدیریتی",
    descEn: "Unified overview of activities, project statistics, and operational KPIs.",
    descFa: "نمای متمرکز فعالیت‌ها، آمار پروژه‌ها و شاخص‌های کلیدی عملکرد سازمان.",
    category: "core",
    access: "auth",
    renderType: "CSR",
    status: "200 OK",
  },
  {
    id: "route-profile",
    path: "/dashboard/profile",
    titleEn: "Profile & Identity",
    titleFa: "پروفایل و هویت کاربری",
    descEn: "User account management, security credentials, and organization data.",
    descFa: "مدیریت حساب کاربری، مشخصات پرسنلی، امنیت و اطلاعات سازمان.",
    category: "core",
    access: "auth",
    renderType: "CSR",
    status: "200 OK",
    parentPath: "/dashboard",
  },
  // Administration
  {
    id: "route-admin",
    path: "/admin",
    titleEn: "Administration & User Access",
    titleFa: "مدیریت سیستم و دسترسی‌ها",
    descEn: "Applicant queue, organizational approval pipeline, RBAC and system audit logs.",
    descFa: "صف متقاضیان، فرآیند تأیید سازمانی، مدیریت نقش‌ها و گزارش لاگ‌های امنیتی.",
    category: "admin",
    access: "admin",
    renderType: "CSR",
    status: "200 OK",
  },
  // Search
  {
    id: "route-search",
    path: "/search",
    titleEn: "Global System Search",
    titleFa: "موتور جستجوی جامع سامانه",
    descEn: "Full-text indexing, fuzzy filtering across all modules, standards and docs.",
    descFa: "جستجوی جامع متنی و بلادرنگ در تمامی ماژول‌ها، استانداردها و اسناد.",
    category: "core",
    access: "public",
    renderType: "CSR",
    status: "200 OK",
  },
  // Auth
  {
    id: "route-login",
    path: "/login",
    titleEn: "Sign In",
    titleFa: "ورود به حساب",
    descEn: "Authentication gateway, credentials verification and session initiation.",
    descFa: "درگاه احراز هویت، ورود کاربران و اعتبارسنجی نشست امنیتی.",
    category: "auth",
    access: "public",
    renderType: "CSR",
    status: "200 OK",
  },
  {
    id: "route-register",
    path: "/register",
    titleEn: "User Registration",
    titleFa: "ثبت‌نام کاربر جدید",
    descEn: "New applicant account creation and organizational onboarding.",
    descFa: "ایجاد حساب کاربری جدید و درخواست عضویت در سازمان.",
    category: "auth",
    access: "public",
    renderType: "CSR",
    status: "200 OK",
  },
  {
    id: "route-forgot-password",
    path: "/forgot-password",
    titleEn: "Password Recovery",
    titleFa: "بازیابی رمز عبور",
    descEn: "Secure account recovery and identity verification flow.",
    descFa: "فرآیند امن بازیابی رمز عبور و تأیید هویت کاربری.",
    category: "auth",
    access: "public",
    renderType: "CSR",
    status: "200 OK",
  },
  // Legal & Utility
  {
    id: "route-terms",
    path: "/terms",
    titleEn: "Terms of Service",
    titleFa: "قوانین و مقررات استفاده",
    descEn: "Platform usage terms, regulatory compliance and operational policies.",
    descFa: "شرایط بهره‌برداری از سامانه، مقررات قانونی و خط‌مشی‌های عملیاتی.",
    category: "legal",
    access: "public",
    renderType: "SSR",
    status: "200 OK",
  },
  {
    id: "route-privacy",
    path: "/privacy",
    titleEn: "Privacy Policy",
    titleFa: "حریم خصوصی و حفاظت داده",
    descEn: "Data protection standards, telemetry confidentiality and user privacy rights.",
    descFa: "استانداردهای حفاظت داده، محرمانگی اطلاعات و حقوق کاربران.",
    category: "legal",
    access: "public",
    renderType: "SSR",
    status: "200 OK",
  },
  {
    id: "route-sitemap",
    path: "/sitemap",
    titleEn: "System Sitemap",
    titleFa: "نقشه جامع سامانه",
    descEn: "Interactive terminal architecture tree of all platform endpoints and modules.",
    descFa: "نمای درختی و تعاملی کلیه مسیرها، ماژول‌ها و دسترسی‌های سامانه.",
    category: "legal",
    access: "public",
    renderType: "SSR",
    status: "200 OK",
  },
];

/**
 * Metadata dictionary for navigation items to enrich automatic discovery with bilingual descriptions.
 */
const NAV_ITEM_METADATA: Record<
  string,
  {
    titleEn: string;
    titleFa: string;
    descEn: string;
    descFa: string;
    renderType: RenderType;
  }
> = {
  "/ESP-Flow": {
    titleEn: "ESP-Flow Engineering",
    titleFa: "شبیه‌سازی و طراحی ESP-Flow",
    descEn: "Process diagram simulation, node-based ASME pressure vessel computation.",
    descFa: "شبیه‌سازی فرایندی و محاسبات تحت فشار ASME در محیط نود-بیس.",
    renderType: "CSR",
  },
  "/dashboard/projects": {
    titleEn: "Project Management & VDIS",
    titleFa: "مدیریت پروژه‌ها و ترنسمیتال VDIS",
    descEn: "Multi-tier WBS, transmittal approvals, RACI team and engineering risks.",
    descFa: "مدیریت ساختار شکست کار WBS، تأیید ترنسمیتال‌ها و ماتریس ریسک.",
    renderType: "CSR",
  },
  "/dashboard/tasks": {
    titleEn: "Task Tracker & Kanban",
    titleFa: "مدیریت وظایف و تسک‌ها",
    descEn: "Interactive agile sprint tracking, priority workflows and assignee boards.",
    descFa: "رهگیری چابک اسپرینت‌ها، اولویت‌بندی کارها و بردهای اسکرام.",
    renderType: "CSR",
  },
  "/dictionary": {
    titleEn: "Engineering Dictionary",
    titleFa: "واژه‌نامه تخصصی مهندسی",
    descEn: "Multilingual engineering lexicon, material properties, and ASME/API terms.",
    descFa: "مرجع واژگان تخصصی مهندسی، مشخصات متریال و استانداردهای صنعتی.",
    renderType: "CSR",
  },
  "/did-you-know": {
    titleEn: "Engineering Knowledge (Did You Know?)",
    titleFa: "دانستنی‌های مهندسی (آیا می‌دانید؟)",
    descEn: "Empirical formulas, practical engineering tips, and calculation rules of thumb.",
    descFa: "فرمول‌های تجربی، نکات کلیدی طراحی صنعتی و استانداردهای کاربردی.",
    renderType: "CSR",
  },
  "/aparat": {
    titleEn: "Educational Video Archive",
    titleFa: "ویدیوهای آموزشی و تخصصی",
    descEn: "Curated engineering webinars, tutorials, and equipment manufacturing video courses.",
    descFa: "آرشیو ویدئوهای آموزشی، دوره‌های تخصصی و فرآیندهای ساخت تجهیزات.",
    renderType: "CSR",
  },
};

/**
 * Automatically generates the complete, dynamic sitemap by combining:
 * 1. Live NAVIGATION groups and leaf items defined in @/config/navigation
 * 2. System core, administrative, auth, and legal routes
 *
 * Any new items added to NAVIGATION are instantly discovered without manual updates.
 */
export function getProjectSitemapRoutes(): SitemapRouteItem[] {
  const dynamicNavRoutes: SitemapRouteItem[] = [];

  for (const group of NAVIGATION) {
    const category: RouteCategory =
      group.id === "engineering"
        ? "engineering"
        : group.id === "projectManagement"
        ? "projectManagement"
        : group.id === "knowledge"
        ? "knowledge"
        : "core";

    for (const item of group.items) {
      const meta = NAV_ITEM_METADATA[item.href];
      const isSubDashboard = item.href.startsWith("/dashboard/");

      dynamicNavRoutes.push({
        id: `nav-${item.href.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
        path: item.href,
        titleEn: meta?.titleEn ?? item.labelKey,
        titleFa: meta?.titleFa ?? item.labelKey,
        descEn: meta?.descEn ?? "Engineering platform route module.",
        descFa: meta?.descFa ?? "مسیر فعال ماژول سامانه‌ای.",
        category,
        access: item.public ? "public" : "auth",
        renderType: meta?.renderType ?? "CSR",
        status: "200 OK",
        parentPath: isSubDashboard ? "/dashboard" : undefined,
        isLeaf: true,
      });
    }
  }

  // Deduplicate against static routes (dynamic items override static placeholders if same path)
  const dynamicPaths = new Set(dynamicNavRoutes.map((r) => r.path));
  const filteredStatic = SYSTEM_STATIC_ROUTES.filter((r) => !dynamicPaths.has(r.path));

  // Merge and sort in standard logical order: Core -> Engineering -> PM -> Knowledge -> Admin -> Auth -> Legal
  const categoryOrder: Record<RouteCategory, number> = {
    core: 1,
    engineering: 2,
    projectManagement: 3,
    knowledge: 4,
    admin: 5,
    auth: 6,
    legal: 7,
  };

  const allRoutes = [...filteredStatic, ...dynamicNavRoutes];

  allRoutes.sort((a, b) => {
    const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (catDiff !== 0) return catDiff;
    return a.path.localeCompare(b.path);
  });

  return allRoutes;
}
