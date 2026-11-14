"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import {
  Coffee,
  Sparkle,
  Gauge,
  Package,
  TreeStructure,
  CurrencyDollar,
  Receipt,
  UsersThree,
  ClipboardText,
  Plant,
  ChartLineUp,
  ForkKnife,
  CookingPot,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Warning,
  Clock,
  Storefront,
  ShieldCheck,
  TrendUp,
  ArrowsClockwise,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

interface ModuleCard {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string; weight?: "bold" | "duotone" | "fill" | "regular" }>;
  badgeFa: string;
  badgeEn: string;
  category: "erp" | "pos";
  colorClass: string;
  bgLightClass: string;
  statsFa: string;
}

const ALL_MODULES: ModuleCard[] = [
  // ── Operations & Front-of-House ──
  {
    id: "pos",
    titleFa: "صندوق فروش لمسی (POS)",
    titleEn: "Touch POS Terminal",
    descFa: "ثبت فوق‌سریع سفارش، اتصال به چاپگر فیش، تسویه نقدی/کارتخوان و تخفیف‌های ویژه مشتریان وفادار.",
    descEn: "Ultra-fast order entry, receipt printer, cash/card checkout and customer loyalty discounts.",
    href: "/cafe",
    icon: Coffee,
    badgeFa: "عملیات زنده",
    badgeEn: "Live Ops",
    category: "pos",
    colorClass: "text-amber-500",
    bgLightClass: "bg-amber-500/10 border-amber-500/20",
    statsFa: "۲۸ سفارش امروز",
  },
  {
    id: "tables",
    titleFa: "مدیریت و نقشه میزها",
    titleEn: "Table Map & Seating",
    descFa: "پلان گرافیکی چیدمان سالن، تفکیک میزهای آزاد، اشغال و رزرو، با امکان صدور صورت‌حساب سر میز.",
    descEn: "Visual floor plan, occupied/vacant table statuses, and seat-level order billing.",
    href: "/cafe?tab=tables",
    icon: ForkKnife,
    badgeFa: "سالن و چیدمان",
    badgeEn: "Floor Plan",
    category: "pos",
    colorClass: "text-orange-500",
    bgLightClass: "bg-orange-500/10 border-orange-500/20",
    statsFa: "۴ میز فعال از ۸",
  },
  {
    id: "kds",
    titleFa: "مانیتور آشپزخانه و بار (KDS)",
    titleEn: "Kitchen & Bar Display (KDS)",
    descFa: "سیستم هوشمند صف‌بندی سفارشات با تفکیک بار گرم و بار سرد و ثبت زمان آماده‌سازی هر سفارش.",
    descEn: "Live order queue for hot bar & kitchen with real-time preparation timers.",
    href: "/cafe?tab=kds",
    icon: CookingPot,
    badgeFa: "آشپزخانه زنده",
    badgeEn: "Kitchen Display",
    category: "pos",
    colorClass: "text-rose-500",
    bgLightClass: "bg-rose-500/10 border-rose-500/20",
    statsFa: "۳ سفارش در حال آماده‌سازی",
  },
  {
    id: "chocolate",
    titleFa: "شبیه‌ساز ۳ بعدی بلوم چاکلت",
    titleEn: "3D Blue Chocolate Experience",
    descFa: "تجربه سینماتیک و سه‌بعدی آماده‌سازی نوشیدنی امضای کافه ژین با پودر آبی و شیر بخارداده‌شده.",
    descEn: "Cinematic 3D interactive preparation simulation of signature Blue Chocolate beverage.",
    href: "/cafe?tab=chocolate",
    icon: Sparkle,
    badgeFa: "نوشیدنی امضا",
    badgeEn: "Signature Drink",
    category: "pos",
    colorClass: "text-sky-500",
    bgLightClass: "bg-sky-500/10 border-sky-500/20",
    statsFa: "کیفیت Ultra HD",
  },

  // ── ZHEEN ERP Core Modules ──
  {
    id: "erpDashboard",
    titleFa: "داشبورد مدیریتی و شاخص‌های ERP",
    titleEn: "Executive ERP Dashboard",
    descFa: "نمای متمرکز مالی، اعلان‌های اضطراری انبار، پرسنل شیفت و میانبر به تمامی فرآیندهای عملیاتی.",
    descEn: "Centralized financial KPIs, urgent inventory alerts, shift staff, and quick operation shortcuts.",
    href: "/zheen-erp",
    icon: Gauge,
    badgeFa: "سامانه ERP",
    badgeEn: "ERP Dashboard",
    category: "erp",
    colorClass: "text-violet-500",
    bgLightClass: "bg-violet-500/10 border-violet-500/20",
    statsFa: "سود خالص: ۳۴٪",
  },
  {
    id: "inventory",
    titleFa: "انبارداری ۳ لایه و رهگیری مصرف",
    titleEn: "3-Tier Stock & FIFO Inventory",
    descFa: "تفکیک مواد خام، محصولات نیمه‌ساخته (BOM) و ملزومات مصرفی با محاسبه بهای تمام‌شده بر اساس FIFO.",
    descEn: "Raw materials, semi-finished products, packaging consumables with automated FIFO costing.",
    href: "/zheen-erp?tab=inventory",
    icon: Package,
    badgeFa: "انبار هوشمند",
    badgeEn: "Inventory",
    category: "erp",
    colorClass: "text-emerald-500",
    bgLightClass: "bg-emerald-500/10 border-emerald-500/20",
    statsFa: "۱۸ قلم کالا | ۲ هشدار کسری",
  },
  {
    id: "production",
    titleFa: "فرمولاسیون و تولید چندسطحی (BOM)",
    titleEn: "Multi-Level Recipes & BOM",
    descFa: "تعریف رسپی‌های مشتق، محاسبه اتلاف و ضایعات، اجرای بچ تولیدی و کسر خودکار مواد اولیه.",
    descEn: "Multi-tier recipes, yield & waste calculation, production batch execution with auto-deduction.",
    href: "/zheen-erp?tab=production",
    icon: TreeStructure,
    badgeFa: "فرمولاسیون",
    badgeEn: "Recipe BOM",
    category: "erp",
    colorClass: "text-cyan-500",
    bgLightClass: "bg-cyan-500/10 border-cyan-500/20",
    statsFa: "۶ رسپی فعال",
  },
  {
    id: "costing",
    titleFa: "بهای تمام‌شده و بسته‌بندی",
    titleEn: "12-Factor Costing & Packaging",
    descFa: "تفکیک دقیق هزینه ۱۲ گانه، مقایسه حاشیه سود مصرف داخل سالن در برابر بیرون‌بر و اسنپ‌فود.",
    descEn: "12-factor unit costing breakdown, Dine-in vs Takeaway vs Delivery profitability analysis.",
    href: "/zheen-erp?tab=costing",
    icon: CurrencyDollar,
    badgeFa: "بهای تمام‌شده",
    badgeEn: "Costing Engine",
    category: "erp",
    colorClass: "text-lime-500",
    bgLightClass: "bg-lime-500/10 border-lime-500/20",
    statsFa: "پایش بلادرنگ حاشیه سود",
  },
  {
    id: "expenses",
    titleFa: "هزینه‌های جاری و استهلاک تجهیزات",
    titleEn: "Operating Expenses & Assets",
    descFa: "ثبت هزینه‌های ثابت، اقساط وام، تعمیرات دوره‌ای دستگاه اسپرسو و آسیاب‌ها و محاسبه استهلاک.",
    descEn: "Fixed costs, loan installments, espresso machine maintenance routines and asset depreciation.",
    href: "/zheen-erp?tab=expenses",
    icon: Receipt,
    badgeFa: "مالی و تجهیزات",
    badgeEn: "Expenses & Assets",
    category: "erp",
    colorClass: "text-rose-500",
    bgLightClass: "bg-rose-500/10 border-rose-500/20",
    statsFa: "۴ دستگاه صنعتی ثبت‌شده",
  },
  {
    id: "hr",
    titleFa: "پرسنل، قراردادها و حقوق و دستمزد",
    titleEn: "Staff, Contracts & Payroll",
    descFa: "پرونده استخدامی باریستا و ویتر، هشدار انقضای قرارداد، شیفت‌بندی و محاسبه خودکار حقوق ماهیانه.",
    descEn: "Barista & waiter staff profiles, contract expiration alerts, shift scheduling, and wage calculation.",
    href: "/zheen-erp?tab=hr",
    icon: UsersThree,
    badgeFa: "منابع انسانی",
    badgeEn: "HR & Payroll",
    category: "erp",
    colorClass: "text-blue-500",
    bgLightClass: "bg-blue-500/10 border-blue-500/20",
    statsFa: "۵ پرسنل فعال | ۱ هشدار تمدید",
  },
  {
    id: "operations",
    titleFa: "چک‌لیست‌ها و عملیات روزانه",
    titleEn: "Daily Checklists & Operations",
    descFa: "چک‌لیست‌های افتتاحیه صبح، بک‌واش دستگاه، نظافت شبانه سالن و تأییدیه دیجیتال سرپرست شیفت.",
    descEn: "Opening checklist, grouphead backflush routines, closing duties and manager digital sign-off.",
    href: "/zheen-erp?tab=operations",
    icon: ClipboardText,
    badgeFa: "عملیات و نظافت",
    badgeEn: "Checklists",
    category: "erp",
    colorClass: "text-teal-500",
    bgLightClass: "bg-teal-500/10 border-teal-500/20",
    statsFa: "۷ از ۸ تسک تکمیل شده",
  },
  {
    id: "plants",
    titleFa: "مراقبت و برنامه آبیاری گیاهان",
    titleEn: "Café Plant Care & Schedule",
    descFa: "شناسنامه گل‌ها و گیاهان دکوراتیو کافه ژین، محاسبه هوشمند فواصل آبیاری و تاریخچه رسیدگی.",
    descEn: "Decorative plant profiles, smart watering interval calculation, overdue alerts and care log.",
    href: "/zheen-erp?tab=plants",
    icon: Plant,
    badgeFa: "فضای سبز",
    badgeEn: "Plant Care",
    category: "erp",
    colorClass: "text-green-500",
    bgLightClass: "bg-green-500/10 border-green-500/20",
    statsFa: "۴ گلدان | ۲ نیازمند آبیاری",
  },
  {
    id: "reports",
    titleFa: "گزارشات تحلیلی، سود و زیان",
    titleEn: "P&L Analytics & Sales Charts",
    descFa: "نمودار فروش ۷ روز گذشته، تفکیک درآمد بر اساس دسته‌بندی و گزارش جامع سود ناخالص و خالص.",
    descEn: "7-day revenue trend, category-wise sales distribution, and automated P&L statement.",
    href: "/zheen-erp?tab=reports",
    icon: ChartLineUp,
    badgeFa: "گزارشات هوشمند",
    badgeEn: "Reports",
    category: "erp",
    colorClass: "text-purple-500",
    bgLightClass: "bg-purple-500/10 border-purple-500/20",
    statsFa: "تحلیل سود ۳۰ روزه",
  },
];

export function CoffeeZheenHomeView() {
  const locale = useLocale();
  const isFa = locale === "fa";
  const [filter, setFilter] = useState<"all" | "erp" | "pos">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = ALL_MODULES.filter((m) => {
    const matchesFilter = filter === "all" || m.category === filter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesFilter;
    const title = (isFa ? m.titleFa : m.titleEn).toLowerCase();
    const desc = (isFa ? m.descFa : m.descEn).toLowerCase();
    return matchesFilter && (title.includes(query) || desc.includes(query));
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-panel/30 dark:bg-background pb-16">
      {/* ── Luxury Hero Section ── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-amber-500/[0.04] via-transparent to-background/50 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-3xl opacity-70"
        />

        <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 mb-5 shadow-xs">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span>
              {isFa
                ? "کافه ژین آنلاین • شیفت صبح فعال • سالن و صندوق باز است"
                : "Coffee Zheen Online • Morning Shift Active • POS Ready"}
            </span>
          </div>

          {/* Central Logo & Brand Title */}
          <div className="mb-4">
            <Logo compact={false} short={false} className="text-3xl sm:text-5xl" />
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground max-w-2xl mt-2 leading-snug">
            {isFa
              ? "سامانه یکپارچه مدیریت تخصصی و عملیات کافه ژین"
              : "Integrated Specialty Café ERP & Operations Platform"}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            {isFa
              ? "سیستم جامع مدیریت کافه ژین؛ اتصال بلادرنگ صندوق فروش (POS)، آشپزخانه (KDS)، انبارداری ۳ لایه با FIFO، فرمولاسیون و تولید چندسطحی، بهای تمام‌شده، پرسنل، هزینه‌ها و نگهداری تجهیزات."
              : "End-to-end management for Coffee Zheen: real-time POS, Kitchen KDS, 3-tier inventory with FIFO, multi-level BOM production, cost breakdown, HR, expenses and equipment maintenance."}
          </p>

          {/* Primary Action Buttons (low curve rounded-md per user preference) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/zheen-erp"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Gauge className="size-4.5" weight="bold" />
              <span>{isFa ? "ورود به سامانه ERP ژین" : "Open ZHEEN ERP"}</span>
              {isFa ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </Link>

            <Link
              href="/cafe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Coffee className="size-4.5" weight="bold" />
              <span>{isFa ? "صندوق و سفارشات (POS)" : "POS Terminal"}</span>
            </Link>

            <Link
              href="/cafe?tab=chocolate"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-card border border-border/80 text-foreground hover:bg-accent transition-colors"
            >
              <Sparkle className="size-4.5 text-sky-500" weight="fill" />
              <span>{isFa ? "بلوم چاکلت ۳ بعدی" : "3D Blue Chocolate"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Real-Time Operational KPI Metrics Strip ── */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card/90 backdrop-blur-md border border-border/70 rounded-md p-3 sm:p-4 shadow-sm persian-digits">
          <div className="flex items-center gap-3 p-2">
            <div className="size-10 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendUp className="size-5" weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">
                {isFa ? "فروش امروز (۲۸ فاکتور)" : "Today's Sales (28 orders)"}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-foreground">
                {isFa ? "۳,۸۵۰,۰۰۰ تومان" : "3,850,000 Toman"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-s border-border/40">
            <div className="size-10 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ForkKnife className="size-5" weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">
                {isFa ? "میزهای فعال سالن" : "Active Tables"}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-foreground">
                {isFa ? "۴ از ۸ میز (۵۰٪ اشغال)" : "4 of 8 (50% Occupied)"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-s border-border/40">
            <div className="size-10 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Warning className="size-5" weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">
                {isFa ? "هشدار کسری موجودی" : "Stock Shortage"}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-foreground">
                {isFa ? "۲ قلم زیر نقطه سفارش" : "2 Items Below Minimum"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-s border-border/40">
            <div className="size-10 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle className="size-5" weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">
                {isFa ? "چک‌لیست شیفت صبح" : "Opening Checklist"}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-foreground">
                {isFa ? "۷ از ۸ وظیفه تکمیل شد" : "7 of 8 Completed"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Controls ── */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isFa ? "ماژول‌های فعال کافه ژین" : "Coffee Zheen Active Modules"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isFa
                ? "دسترسی مستقیم و بدون واسطه به تمامی بخش‌های عملیاتی، صندوق و مدیریت ERP"
                : "Direct access to all operational POS, kitchen, and ERP management modules"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center p-0.5 rounded-md bg-muted/60 border border-border/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-[4px] transition-colors",
                  filter === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isFa ? "همه ماژول‌ها" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setFilter("erp")}
                className={cn(
                  "px-3 py-1 rounded-[4px] transition-colors",
                  filter === "erp"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isFa ? "سامانه ERP ژین" : "Zheen ERP"}
              </button>
              <button
                type="button"
                onClick={() => setFilter("pos")}
                className={cn(
                  "px-3 py-1 rounded-[4px] transition-colors",
                  filter === "pos"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isFa ? "صندوق و سالن" : "POS & Ops"}
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-48 sm:w-56">
              <MagnifyingGlass className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFa ? "جستجوی ماژول..." : "Search module..."}
                className="w-full h-8 ps-8 pe-3 rounded-md border border-border/70 bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Module Cards Grid ── */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group relative flex flex-col justify-between p-5 rounded-md border border-border/70 bg-card hover:bg-card/90 hover:border-amber-500/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={cn(
                        "size-11 rounded-md flex items-center justify-center border transition-transform duration-200 group-hover:scale-105",
                        module.bgLightClass,
                        module.colorClass
                      )}
                    >
                      <Icon className="size-6" weight="duotone" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                      {isFa ? module.badgeFa : module.badgeEn}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{isFa ? module.titleFa : module.titleEn}</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {isFa ? module.descFa : module.descEn}
                  </p>
                </div>

                {/* Card Footer: Metrics + Action link */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground/90 persian-digits truncate max-w-[170px]">
                    {module.statsFa}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform">
                    <span>{isFa ? "ورود به بخش" : "Open"}</span>
                    {isFa ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Quick Activity & System Audit Log ── */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-10">
        <div className="rounded-md border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4.5 text-amber-500" weight="bold" />
              <h3 className="text-sm font-bold text-foreground">
                {isFa ? "گزارش زنده رویدادهای کافه ژین" : "Live Café Event Log"}
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {isFa ? "همگام‌سازی خودکار انبار و صندوق" : "Auto Sync POS & ERP"}
            </span>
          </div>

          <div className="space-y-2 text-xs persian-digits">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">
                  {isFa ? "ثبت سفارش میز شماره ۳" : "Order Placed Table 3"}
                </span>
                <span className="text-muted-foreground">
                  {isFa ? "— ۲ فنجان اسپرسو دبل کلمبیا + ۱ ساقه شکلات ژین" : "— 2 Espresso Double + 1 Chocolate Stick"}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                {isFa ? "۱۰ دقیقه پیش" : "10m ago"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-foreground">
                  {isFa ? "کسر هوشمند انبار (FIFO)" : "FIFO Stock Deduction"}
                </span>
                <span className="text-muted-foreground">
                  {isFa ? "— ۴۰ گرم دانه اسپرسو برزیل سری #B24 کسر شد" : "— 40g Espresso Bean Batch #B24 deducted"}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                {isFa ? "۱۰ دقیقه پیش" : "10m ago"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-foreground">
                  {isFa ? "اجرای بچ تولید گاناش شکلات" : "BOM Batch Produced"}
                </span>
                <span className="text-muted-foreground">
                  {isFa ? "— ۵ کیلوگرم گاناش تولید و به موجودی نیمه‌ساخته افزوده شد" : "— 5kg Ganache added to semi-finished stock"}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                {isFa ? "۴۲ دقیقه پیش" : "42m ago"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-teal-500" />
                <span className="font-semibold text-foreground">
                  {isFa ? "تأییدیه شیفت صبح سرپرست" : "Manager Morning Sign-off"}
                </span>
                <span className="text-muted-foreground">
                  {isFa ? "— چک‌لیست کالیبراسیون آسیاب‌ها با موفقیت تأیید شد" : "— Grinder calibration checklist verified"}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                {isFa ? "۲ ساعت پیش" : "2h ago"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
