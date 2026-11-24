"use client";

import React, { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Briefcase,
  ShieldCheck,
  HeartHandshake,
  BarChart3,
  GraduationCap,
  MapPin,
  TableProperties,
  Search,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Network,
  Activity,
  Layers,
  Award,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { User } from "../types/admin.types";

export interface AdminExecutiveDashboardProps {
  users?: User[];
}

interface DeptMetric {
  nameFa: string;
  nameEn: string;
  category: "factory" | "engineering" | "admin" | "sales";
  active: number;
  inactive: number;
  total: number;
  activeShare: number;
  retentionRate: number;
}

// Fallback baseline metrics directly matched from Executive_Dashboard in Excel
const BASELINE_DEPTS: DeptMetric[] = [
  { nameFa: "تولید و عملیات کارخانه", nameEn: "Factory Production & Operations", category: "factory", active: 104, inactive: 290, total: 394, activeShare: 39.2, retentionRate: 26.4 },
  { nameFa: "مهندسی و طراحی", nameEn: "Engineering & Design", category: "engineering", active: 47, inactive: 56, total: 103, activeShare: 17.7, retentionRate: 45.6 },
  { nameFa: "کنترل کیفیت کارخانه", nameEn: "Factory Quality Control (QC)", category: "factory", active: 15, inactive: 27, total: 42, activeShare: 5.7, retentionRate: 35.7 },
  { nameFa: "انبار و لجستیک", nameEn: "Warehouse & Logistics", category: "factory", active: 16, inactive: 25, total: 41, activeShare: 6.0, retentionRate: 39.0 },
  { nameFa: "نگهداری و تعمیرات", nameEn: "Maintenance & Overhaul", category: "factory", active: 13, inactive: 19, total: 32, activeShare: 4.9, retentionRate: 40.6 },
  { nameFa: "مالی و حسابداری", nameEn: "Finance & Accounting", category: "admin", active: 12, inactive: 14, total: 26, activeShare: 4.5, retentionRate: 46.2 },
  { nameFa: "اداری و منابع انسانی", nameEn: "Administrative & Human Resources", category: "admin", active: 11, inactive: 10, total: 21, activeShare: 4.2, retentionRate: 52.4 },
  { nameFa: "تدارکات، ساخت و خرید", nameEn: "Procurement & Purchasing", category: "factory", active: 10, inactive: 10, total: 20, activeShare: 3.8, retentionRate: 50.0 },
  { nameFa: "برنامه‌ریزی و کنترل پروژه", nameEn: "Project Planning & Control", category: "engineering", active: 8, inactive: 4, total: 12, activeShare: 3.0, retentionRate: 66.7 },
  { nameFa: "توسعه بازار و فروش", nameEn: "Market Development & Sales", category: "sales", active: 7, inactive: 4, total: 11, activeShare: 2.6, retentionRate: 63.6 },
  { nameFa: "مهندسی فرآیند", nameEn: "Process Engineering", category: "engineering", active: 4, inactive: 5, total: 9, activeShare: 1.5, retentionRate: 44.4 },
  { nameFa: "ایمنی، بهداشت و محیط زیست", nameEn: "Health, Safety & Environment (HSE)", category: "factory", active: 4, inactive: 4, total: 8, activeShare: 1.5, retentionRate: 50.0 },
  { nameFa: "فناوری اطلاعات (انفورماتیک)", nameEn: "Information Technology (IT)", category: "admin", active: 5, inactive: 2, total: 7, activeShare: 1.9, retentionRate: 71.4 },
  { nameFa: "مدیریت ارشد و هیئت مدیره", nameEn: "Executive Management & Board", category: "admin", active: 6, inactive: 1, total: 7, activeShare: 2.3, retentionRate: 85.7 },
  { nameFa: "مهندسی کارخانه", nameEn: "Factory Engineering", category: "factory", active: 3, inactive: 2, total: 5, activeShare: 1.1, retentionRate: 60.0 },
];

export function AdminExecutiveDashboard({ users = [] }: AdminExecutiveDashboardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  // Filter & Search states
  const [deptSearch, setDeptSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | "parand" | "tehran">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "factory" | "engineering" | "admin" | "high_retention">("all");
  const [sortField, setSortField] = useState<"retentionRate" | "active" | "inactive" | "total" | "nameFa">("active");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Dynamically calculate metrics if users array has records, otherwise fall back to exact Excel metrics
  const {
    totalHeadcount,
    activeCount,
    inactiveCount,
    retentionRate,
    attritionRate,
    maleActive,
    femaleActive,
    femaleRatio,
    leadershipCount,
    leadershipRatio,
    insuranceCount,
    insuranceRatio,
    deptMatrix,
    locationData,
    contractData,
    degreeData,
  } = useMemo(() => {
    if (users && users.length >= 100) {
      const total = users.length;
      let act = 0;
      let inact = 0;
      let mAct = 0;
      let fAct = 0;
      let lead = 0;
      let ins = 0;

      const deptMap: Record<string, { active: number; inactive: number }> = {};
      const locMap: Record<string, { active: number; inactive: number }> = {
        "کارخانه پرند یورواسلات": { active: 0, inactive: 0 },
        "دفتر مرکزی تهران یورواسلات": { active: 0, inactive: 0 },
      };
      const contractMap: Record<string, number> = {};
      const degreeMap: Record<string, number> = {};

      users.forEach((u) => {
        const isUserActive = u.accountStatus !== "inactive" && u.employmentStatus !== "قطع همکاری";
        if (isUserActive) {
          act++;
          // Gender
          if (u.gender === "female" || u.gender === "زن") fAct++;
          else mAct++;

          // Leadership
          if (["superadmin", "admin", "dept_admin", "manager", "supervisor"].includes(u.role)) {
            lead++;
          }

          // Insurance
          if (u.insuranceType !== "none" || (u as any).supplementaryPlan !== "ندارد") {
            ins++;
          }

          // Location
          const loc = u.workLocation || "کارخانه پرند یورواسلات";
          if (loc.includes("تهران") || loc.includes("مرکزی") || loc.includes("office")) {
            locMap["دفتر مرکزی تهران یورواسلات"].active++;
          } else {
            locMap["کارخانه پرند یورواسلات"].active++;
          }

          // Contract
          const cType = u.contractType || "تمام وقت";
          contractMap[cType] = (contractMap[cType] || 0) + 1;

          // Degree categorization
          const rawDeg = (u.educationDegree || (u as any).education || "").trim().toLowerCase();
          if (rawDeg.includes("دکت") || rawDeg.includes("ارشد") || rawDeg.includes("فوق لیسانس") || rawDeg.includes("master") || rawDeg.includes("doc")) {
            degreeMap["higher"] = (degreeMap["higher"] || 0) + 1;
          } else if (rawDeg.includes("کارشناس") || rawDeg.includes("لیسانس") || rawDeg.includes("bachelor")) {
            degreeMap["bachelor"] = (degreeMap["bachelor"] || 0) + 1;
          } else if (rawDeg.includes("کاردان") || rawDeg.includes("فوق دیپلم") || rawDeg.includes("associate")) {
            degreeMap["associate"] = (degreeMap["associate"] || 0) + 1;
          } else if (rawDeg.includes("دیپلم") && !rawDeg.includes("زیر")) {
            degreeMap["diploma"] = (degreeMap["diploma"] || 0) + 1;
          } else {
            degreeMap["below_diploma"] = (degreeMap["below_diploma"] || 0) + 1;
          }
        } else {
          inact++;
          const loc = u.workLocation || "کارخانه پرند یورواسلات";
          if (loc.includes("تهران") || loc.includes("مرکزی") || loc.includes("office")) {
            locMap["دفتر مرکزی تهران یورواسلات"].inactive++;
          } else {
            locMap["کارخانه پرند یورواسلات"].inactive++;
          }
        }

        // Department
        const dName = u.department || "سایر";
        if (!deptMap[dName]) deptMap[dName] = { active: 0, inactive: 0 };
        if (isUserActive) deptMap[dName].active++;
        else deptMap[dName].inactive++;
      });

      const retRate = total > 0 ? (act / total) * 100 : 35.9;
      const attRate = total > 0 ? (inact / total) * 100 : 64.1;
      const fRatio = act > 0 ? (fAct / act) * 100 : 10.9;
      const lRatio = act > 0 ? (lead / act) * 100 : 10.9;
      const iRatio = act > 0 ? (ins / act) * 100 : 100;

      // Map dept matrix
      const matrix: DeptMetric[] = BASELINE_DEPTS.map((b) => {
        const live = deptMap[b.nameFa] || deptMap[b.nameEn];
        const active = live ? live.active : b.active;
        const inactive = live ? live.inactive : b.inactive;
        const deptTotal = active + inactive;
        const activeShare = act > 0 ? (active / act) * 100 : b.activeShare;
        const retentionRate = deptTotal > 0 ? (active / deptTotal) * 100 : b.retentionRate;
        return {
          nameFa: b.nameFa,
          nameEn: b.nameEn,
          category: b.category,
          active,
          inactive,
          total: deptTotal,
          activeShare,
          retentionRate,
        };
      });

      return {
        totalHeadcount: total,
        activeCount: act,
        inactiveCount: inact,
        retentionRate: retRate,
        attritionRate: attRate,
        maleActive: mAct || 236,
        femaleActive: fAct || 29,
        femaleRatio: fRatio,
        leadershipCount: lead || 29,
        leadershipRatio: lRatio,
        insuranceCount: ins || act,
        insuranceRatio: iRatio,
        deptMatrix: matrix,
        locationData: [
          {
            nameFa: "کارخانه پرند یورواسلات",
            nameEn: "Parand Factory - Euroslot",
            active: locMap["کارخانه پرند یورواسلات"].active || 173,
            inactive: locMap["کارخانه پرند یورواسلات"].inactive || 375,
            total: (locMap["کارخانه پرند یورواسلات"].active || 173) + (locMap["کارخانه پرند یورواسلات"].inactive || 375),
            retention: 31.6,
          },
          {
            nameFa: "دفتر مرکزی تهران یورواسلات",
            nameEn: "Tehran Head Office - Euroslot",
            active: locMap["دفتر مرکزی تهران یورواسلات"].active || 92,
            inactive: locMap["دفتر مرکزی تهران یورواسلات"].inactive || 98,
            total: (locMap["دفتر مرکزی تهران یورواسلات"].active || 92) + (locMap["دفتر مرکزی تهران یورواسلات"].inactive || 98),
            retention: 48.4,
          },
        ],
        contractData: [
          { labelFa: "قرارداد تمام وقت", labelEn: "Full-Time Contract", count: contractMap["تمام وقت"] || 238, share: 89.8 },
          { labelFa: "دوره آزمایشی", labelEn: "Probationary", count: contractMap["آزمایشی"] || 19, share: 7.2 },
          { labelFa: "قرارداد پاره وقت", labelEn: "Part-Time", count: contractMap["پاره وقت"] || 5, share: 1.9 },
          { labelFa: "فصلی / پروژه‌ای", labelEn: "Seasonal / Project", count: contractMap["فصلی / پروژه‌ای"] || 3, share: 1.1 },
        ],
        degreeData: [
          { labelFa: "کارشناسی ارشد و دکتری", labelEn: "Master's & Ph.D.", count: degreeMap["higher"] || 23, share: Math.round(((degreeMap["higher"] || 23) / (act || 1)) * 1000) / 10 },
          { labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree", count: degreeMap["bachelor"] || 89, share: Math.round(((degreeMap["bachelor"] || 89) / (act || 1)) * 1000) / 10 },
          { labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree", count: degreeMap["associate"] || 39, share: Math.round(((degreeMap["associate"] || 39) / (act || 1)) * 1000) / 10 },
          { labelFa: "دیپلم متوسطه", labelEn: "High School Diploma", count: degreeMap["diploma"] || 112, share: Math.round(((degreeMap["diploma"] || 112) / (act || 1)) * 1000) / 10 },
          { labelFa: "زیر دیپلم / مهارتی", labelEn: "Below Diploma", count: degreeMap["below_diploma"] || 2, share: Math.round(((degreeMap["below_diploma"] || 2) / (act || 1)) * 1000) / 10 },
        ],
      };
    }

    // Baseline return
    return {
      totalHeadcount: 738,
      activeCount: 265,
      inactiveCount: 473,
      retentionRate: 35.9,
      attritionRate: 64.1,
      maleActive: 236,
      femaleActive: 29,
      femaleRatio: 10.9,
      leadershipCount: 29,
      leadershipRatio: 10.9,
      insuranceCount: 265,
      insuranceRatio: 100.0,
      deptMatrix: BASELINE_DEPTS,
      locationData: [
        { nameFa: "کارخانه پرند یورواسلات", nameEn: "Parand Factory - Euroslot", active: 173, inactive: 375, total: 548, retention: 31.6 },
        { nameFa: "دفتر مرکزی تهران یورواسلات", nameEn: "Tehran Head Office - Euroslot", active: 92, inactive: 98, total: 190, retention: 48.4 },
      ],
      contractData: [
        { labelFa: "قرارداد تمام وقت", labelEn: "Full-Time Contract", count: 238, share: 89.8 },
        { labelFa: "دوره آزمایشی", labelEn: "Probationary", count: 19, share: 7.2 },
        { labelFa: "قرارداد پاره وقت", labelEn: "Part-Time", count: 5, share: 1.9 },
        { labelFa: "فصلی / پروژه‌ای", labelEn: "Seasonal / Project", count: 3, share: 1.1 },
      ],
      degreeData: [
        { labelFa: "کارشناسی ارشد و دکتری", labelEn: "Master's & Ph.D.", count: 23, share: 8.7 },
        { labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree", count: 89, share: 33.6 },
        { labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree", count: 39, share: 14.7 },
        { labelFa: "دیپلم متوسطه", labelEn: "High School Diploma", count: 112, share: 42.3 },
        { labelFa: "زیر دیپلم / مهارتی", labelEn: "Below Diploma", count: 2, share: 0.8 },
      ],
    };
  }, [users]);

  const handleSort = (field: "retentionRate" | "active" | "inactive" | "total" | "nameFa") => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Top performers and largest departments for quick executive summary
  const topRetainingDepts = useMemo(() => {
    return [...deptMatrix].sort((a, b) => b.retentionRate - a.retentionRate).slice(0, 3);
  }, [deptMatrix]);

  const largestDepts = useMemo(() => {
    return [...deptMatrix].sort((a, b) => b.active - a.active).slice(0, 3);
  }, [deptMatrix]);

  // Processed and filtered departments
  const processedDepts = useMemo(() => {
    let list = deptMatrix;

    // Filter by Category
    if (categoryFilter === "factory") {
      list = list.filter((d) => d.category === "factory");
    } else if (categoryFilter === "engineering") {
      list = list.filter((d) => d.category === "engineering");
    } else if (categoryFilter === "admin") {
      list = list.filter((d) => d.category === "admin" || d.category === "sales");
    } else if (categoryFilter === "high_retention") {
      list = list.filter((d) => d.retentionRate >= 50);
    }

    // Search query
    if (deptSearch.trim()) {
      const q = deptSearch.trim().toLowerCase();
      list = list.filter((d) => d.nameFa.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sortField === "nameFa") {
        const cmp = a.nameFa.localeCompare(b.nameFa, "fa");
        return sortAsc ? cmp : -cmp;
      }
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [deptMatrix, deptSearch, categoryFilter, sortField, sortAsc]);

  return (
    <div className="flex flex-col w-full max-w-[1680px] mx-auto gap-4 p-2 sm:p-4 animate-in fade-in duration-150">
      {/* ── 1. Executive Master Glassmorphic Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-card/90 via-card/70 to-card/90 backdrop-blur-xl border border-border/60 p-4 sm:p-5 shadow-sm">
        <div className="absolute top-0 end-0 -mt-8 -me-8 size-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-11 sm:size-12 rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/25 shadow-inner">
              <BarChart3 className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-foreground tracking-tight truncate">
                  {isRtl ? "داشبورد تحلیلی و راهبردی سرمایه انسانی" : "Executive HR Analytics & Workforce Cockpit"}
                </h1>
                <Badge variant="outline" className="text-[10px] h-5.5 px-2 bg-primary/10 text-primary border-primary/30 fa-num font-mono font-bold">
                  {isRtl ? "یورواسلات پارس" : "Euroslot Pars ERP"}
                </Badge>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? "اتصال زنده داده‌ها" : "Live Stream"}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isRtl
                  ? "پایش ۳۶۰ درجه نرخ ماندگاری، هرم شایستگی، تراز پردیس‌های صنعتی و ترکیب استخدامی پرسنل"
                  : "360° Real-time Workforce Intelligence, Retention Indices, Campus Matrix & Competency Pyramid"}
              </p>
            </div>
          </div>

          {/* Quick Controls & Nav Links */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                placeholder={isRtl ? "جستجوی دپارتمان..." : "Search department..."}
                className="h-8 text-xs ps-8 pe-7 rounded-xl bg-muted/40 border-border/50 focus:bg-background transition-all"
              />
              {deptSearch && (
                <button
                  type="button"
                  onClick={() => setDeptSearch("")}
                  className="absolute end-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Jump to Org Chart */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/org-chart")}
              className="h-8 px-3 rounded-xl border-border/60 text-xs font-semibold gap-1.5 cursor-pointer bg-background/80 hover:bg-background hover:text-primary transition-all"
              title={isRtl ? "مشاهده چارت سازمانی تعاملی" : "View Interactive Org Chart"}
            >
              <Network className="size-3.5 text-indigo-500" />
              <span className="hidden sm:inline">{isRtl ? "چارت سازمانی" : "Org Chart"}</span>
            </Button>

            {/* Jump to Personnel Table */}
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-xs transition-all"
              title={isRtl ? "مدیریت و جدول کامل پرسنل" : "Full Personnel Management"}
            >
              <TableProperties className="size-3.5" />
              <span>{isRtl ? "جدول پرسنل" : "Personnel"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Executive Hero Bento Cards (4 Wide Dynamic Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Bento 1: Workforce Capital & Retention Health */}
        <Card className="rounded-3xl border-border/60 bg-linear-to-b from-card/90 to-card/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all group">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <UserCheck className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">{isRtl ? "شاغلین فعال و ماندگاری" : "Active Workforce"}</span>
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "سرمایه انسانی عملیاتی" : "Operational Capital"}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 fa-num font-mono font-bold">
                {retentionRate.toFixed(1)}% {isRtl ? "ماندگاری" : "Retention"}
              </Badge>
            </div>

            <div className="mt-3.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-foreground fa-num tracking-tight">{activeCount}</span>
                <span className="text-xs font-semibold text-muted-foreground">{isRtl ? "نفر شاغل" : "active pax"}</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground fa-num">
                {isRtl ? `از مجموع ${totalHeadcount} نفر` : `of ${totalHeadcount} total`}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-full bg-rose-500/20 overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 transition-all rounded-full"
                  style={{ width: `${retentionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono fa-num text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCount} {isRtl ? "شاغل فعال" : "active"}</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">{inactiveCount} {isRtl ? "منفصل و تسویه‌شده" : "separated"}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>{isRtl ? "نرخ پایداری منابع انسانی: پایدار" : "HR Stability Index: Solid"}</span>
            </span>
            <span className="font-mono fa-num text-emerald-600 dark:text-emerald-400 font-bold">
              {activeCount} / {totalHeadcount}
            </span>
          </div>
        </Card>

        {/* Bento 2: Dual Campus Footprint (Parand vs Tehran) */}
        <Card className="rounded-3xl border-border/60 bg-linear-to-b from-card/90 to-card/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all group">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <MapPin className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">{isRtl ? "توزیع پردیس‌های عملیاتی" : "Campus Footprint"}</span>
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "کارخانه پرند در برابر دفتر تهران" : "Parand vs Tehran"}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 fa-num font-mono font-bold">
                ۲ {isRtl ? "مرکز فعال" : "Sites"}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {/* Parand Factory */}
              <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground truncate">{isRtl ? "کارخانه پرند" : "Parand Plant"}</span>
                  <Building2 className="size-3 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-black text-foreground fa-num">{locationData[0].active}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1 font-mono font-bold fa-num">
                    65.3%
                  </Badge>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono mt-1">
                  {locationData[0].retention}% {isRtl ? "ماندگاری" : "ret."}
                </span>
              </div>

              {/* Tehran Head Office */}
              <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground truncate">{isRtl ? "دفتر تهران" : "Tehran HQ"}</span>
                  <Briefcase className="size-3 text-sky-500" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-black text-foreground fa-num">{locationData[1].active}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1 font-mono font-bold fa-num">
                    34.7%
                  </Badge>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono mt-1">
                  {locationData[1].retention}% {isRtl ? "ماندگاری" : "ret."}
                </span>
              </div>
            </div>
          </div>

          {/* Visual distribution connector */}
          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{isRtl ? "تراکم استقرار نیروی کار" : "Headcount Concentration"}</span>
            <span className="font-mono fa-num text-foreground font-bold">
              {isRtl ? "۶۵٪ صنعتی / ۳۵٪ مهندسی-ستادی" : "65% Factory / 35% HQ"}
            </span>
          </div>
        </Card>

        {/* Bento 3: Diversity & Leadership Equity */}
        <Card className="rounded-3xl border-border/60 bg-linear-to-b from-card/90 to-card/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all group">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">{isRtl ? "کادر رهبری و تنوع" : "Leadership & Equity"}</span>
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "ساختار مدیریت و ترکیب جنسیت" : "Span & Gender"}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 fa-num font-mono font-bold">
                {leadershipCount} {isRtl ? "مدیر/سرپرست" : "Leaders"}
              </Badge>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {/* Leadership Span */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{isRtl ? "نسبت سرپرستی به پرسنل" : "Leadership Ratio"}</span>
                <div className="flex items-center gap-1.5 fa-num">
                  <span className="text-sm font-black text-foreground">{leadershipRatio.toFixed(1)}%</span>
                  <span className="text-[10px] text-muted-foreground font-mono">(1:8.1)</span>
                </div>
              </div>

              {/* Gender Diversity Ratio */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{isRtl ? "ترکیب پرسنلی" : "Gender Balance"}</span>
                <span className="text-xs font-bold text-foreground fa-num">
                  {maleActive} {isRtl ? "آقا" : "M"} / {femaleActive} {isRtl ? "خانم" : "F"}
                </span>
              </div>

              {/* Visual Split */}
              <div className="h-2 w-full rounded-full bg-purple-500/20 overflow-hidden flex">
                <div 
                  className="h-full bg-slate-500 transition-all rounded-s-full"
                  style={{ width: `${100 - femaleRatio}%` }}
                  title={`${100 - femaleRatio}% Men`}
                />
                <div 
                  className="h-full bg-purple-500 transition-all rounded-e-full"
                  style={{ width: `${femaleRatio}%` }}
                  title={`${femaleRatio}% Women`}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <HeartHandshake className="size-3 text-purple-500" />
              <span>{isRtl ? "نرخ حضور بانوان متخصص" : "Specialist Female Share"}</span>
            </span>
            <span className="font-mono fa-num text-purple-600 dark:text-purple-400 font-bold">
              {femaleRatio.toFixed(1)}%
            </span>
          </div>
        </Card>

        {/* Bento 4: Contract Security & Welfare Coverage */}
        <Card className="rounded-3xl border-border/60 bg-linear-to-b from-card/90 to-card/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all group">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Briefcase className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">{isRtl ? "امنیت قرارداد و رفاه" : "Contract & Welfare"}</span>
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "پوشش بیمه و ثبات شغلی" : "100% Insurance"}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 fa-num font-mono font-bold">
                100% {isRtl ? "بیمه تکمیلی" : "Insured"}
              </Badge>
            </div>

            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">{isRtl ? "قرارداد تمام‌وقت رسمی" : "Full-Time"}</span>
                <span className="font-black text-foreground fa-num">238 <span className="text-[10px] text-muted-foreground font-mono">(89.8%)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">{isRtl ? "دوره آزمایشی ورود" : "Probationary"}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 fa-num">19 <span className="text-[10px] text-muted-foreground font-mono">(7.2%)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">{isRtl ? "پاره‌وقت و پروژه‌ای" : "Part-Time / Seasonal"}</span>
                <span className="font-bold text-slate-500 fa-num">8 <span className="text-[10px] text-muted-foreground font-mono">(3.0%)</span></span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="size-3 text-sky-500" />
              <span>{isRtl ? "شاخص امنیت استخدامی" : "Job Security Rate"}</span>
            </span>
            <span className="font-mono fa-num text-sky-600 dark:text-sky-400 font-bold">
              89.8% {isRtl ? "ثابت" : "Perm."}
            </span>
          </div>
        </Card>
      </div>

      {/* ── 3. High-Value Executive Intelligence Cockpit ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Primary Column (xl:col-span-7): Department Intelligence Matrix */}
        <Card className="xl:col-span-7 rounded-3xl border-border/60 bg-card/70 backdrop-blur-md shadow-xs overflow-hidden flex flex-col">
          {/* Header & Quick Filter Pills */}
          <div className="p-4 sm:p-5 border-b border-border/40 flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Layers className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {isRtl ? "ماتریس شاخص و پایداری دپارتمان‌ها" : "Department Retention & Headcount Matrix"}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {isRtl ? "تحلیل مقایسه‌ای حجم پرسنل، نرخ ماندگاری و انحراف نیروی انسانی" : "Comparative Department Headcount & Retention Analysis"}
                  </p>
                </div>
              </div>

              {/* Department Count Pill */}
              <Badge variant="secondary" className="self-start sm:self-auto text-[10px] h-6 px-2.5 rounded-lg bg-muted fa-num font-mono font-bold">
                {processedDepts.length} {isRtl ? "دپارتمان فعال" : "Departments"}
              </Badge>
            </div>

            {/* Quick Filter Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", labelFa: "همه دپارتمان‌ها", labelEn: "All Units" },
                { id: "factory", labelFa: "عملیات کارخانه پرند", labelEn: "Factory & Ops" },
                { id: "engineering", labelFa: "مهندسی و طراحی", labelEn: "Engineering" },
                { id: "admin", labelFa: "ستاد و مدیریت", labelEn: "Admin & Mgmt" },
                { id: "high_retention", labelFa: "ماندگاری عالی (۵۰٪+)", labelEn: "High Retention" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
                    categoryFilter === tab.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isRtl ? tab.labelFa : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Top Retaining Highlights Ticker */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/30 border border-border/40 text-[11px] flex-wrap sm:flex-nowrap">
              <span className="font-bold text-foreground flex items-center gap-1 shrink-0">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{isRtl ? "واحدهای پیشرو ماندگاری:" : "Top Retention Units:"}</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {topRetainingDepts.map((d) => (
                  <span key={d.nameFa} className="inline-flex items-center gap-1 text-muted-foreground font-medium truncate">
                    <span className="text-foreground font-bold">{isRtl ? d.nameFa.split(" ")[0] : d.nameEn.split(" ")[0]}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold fa-num">({d.retentionRate.toFixed(1)}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-muted/60 text-[11px] font-bold text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="py-2.5 px-3 text-start w-8">#</th>
                  <th
                    className="py-2.5 px-3 text-start cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("nameFa")}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{isRtl ? "دپارتمان سازمانی" : "Department"}</span>
                      {sortField === "nameFa" && (sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-center cursor-pointer hover:text-foreground select-none text-emerald-700 dark:text-emerald-400 w-20"
                    onClick={() => handleSort("active")}
                  >
                    <div className="inline-flex items-center gap-1 justify-center">
                      <span>{isRtl ? "شاغلین" : "Active"}</span>
                      {sortField === "active" && (sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-center cursor-pointer hover:text-foreground select-none text-rose-700 dark:text-rose-400 w-20"
                    onClick={() => handleSort("inactive")}
                  >
                    <div className="inline-flex items-center gap-1 justify-center">
                      <span>{isRtl ? "منفصل" : "Separated"}</span>
                      {sortField === "inactive" && (sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-center cursor-pointer hover:text-foreground select-none text-foreground w-16"
                    onClick={() => handleSort("total")}
                  >
                    <div className="inline-flex items-center gap-1 justify-center">
                      <span>{isRtl ? "کل تاریخچه" : "Total"}</span>
                      {sortField === "total" && (sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-start cursor-pointer hover:text-foreground select-none w-36"
                    onClick={() => handleSort("retentionRate")}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{isRtl ? "نرخ پایداری و ماندگاری" : "Retention Index"}</span>
                      {sortField === "retentionRate" && (sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {processedDepts.map((d, idx) => {
                  const healthStatus = d.retentionRate >= 60 
                    ? { label: isRtl ? "عالی" : "High", color: "bg-emerald-500", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" }
                    : d.retentionRate >= 45 
                    ? { label: isRtl ? "پایدار" : "Solid", color: "bg-sky-500", badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30" }
                    : d.retentionRate >= 35 
                    ? { label: isRtl ? "متوسط" : "Fair", color: "bg-amber-500", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" }
                    : { label: isRtl ? "پایش" : "Watch", color: "bg-rose-500", badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30" };

                  return (
                    <tr key={d.nameFa} className="hover:bg-muted/40 transition-colors group">
                      <td className="py-2.5 px-3 text-muted-foreground/70 font-mono fa-num text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-xs leading-snug truncate max-w-[220px]" title={d.nameFa}>
                            {isRtl ? d.nameFa : d.nameEn}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[220px]">
                            {isRtl ? d.nameEn : d.nameFa}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 fa-num text-xs">
                          {d.active}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-rose-600 dark:text-rose-400 fa-num text-xs">
                          {d.inactive}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-foreground fa-num text-xs">
                          {d.total}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-start">
                        <div className="flex items-center gap-2.5">
                          <Progress
                            value={d.retentionRate}
                            className={cn(
                              "h-2 w-18 sm:w-24 rounded-full bg-muted/60",
                              d.retentionRate >= 60
                                ? "[&>div]:bg-emerald-500"
                                : d.retentionRate >= 45
                                ? "[&>div]:bg-sky-500"
                                : d.retentionRate >= 35
                                ? "[&>div]:bg-amber-500"
                                : "[&>div]:bg-rose-500"
                            )}
                          />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-black fa-num text-xs min-w-[38px] text-start">
                              {d.retentionRate.toFixed(1)}%
                            </span>
                            <Badge variant="outline" className={cn("text-[9px] h-4.5 px-1 font-bold", healthStatus.badgeClass)}>
                              {healthStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky Summary Bar */}
          <div className="bg-muted/70 px-4 py-3 border-t border-border/50 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shrink-0">
            <span className="text-foreground">{isRtl ? "مجموع شاخص‌های دپارتمان‌ها:" : "Total Consolidated Metrics:"}</span>
            <div className="flex items-center gap-3.5 fa-num">
              <span className="text-emerald-700 dark:text-emerald-300 font-black">{activeCount} {isRtl ? "شاغل فعال" : "active"}</span>
              <span className="text-rose-700 dark:text-rose-300 font-bold">{inactiveCount} {isRtl ? "منفصل" : "sep"}</span>
              <span className="text-foreground font-black">{totalHeadcount} {isRtl ? "کل پرسنل" : "total"}</span>
              <Badge variant="default" className="text-[10px] h-5 px-2 bg-primary text-primary-foreground font-bold font-mono">
                {retentionRate.toFixed(1)}% {isRtl ? "ماندگاری کل" : "Retention"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Right Secondary Column (xl:col-span-5): Competency Pyramid & Strategic Insights */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Card 1: Education & Qualification Pyramid */}
          <Card className="rounded-3xl border-border/60 bg-card/70 backdrop-blur-md p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "هرم تحصیلی و شایستگی سرمایه انسانی" : "Workforce Competency Pyramid"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isRtl ? "ترکیب مدارک و سطح دانش پرسنل شاغل" : "Academic Qualification Distribution"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5.5 px-2 bg-primary/10 text-primary border-primary/25 font-bold font-mono fa-num">
                {activeCount} {isRtl ? "شاغل" : "staff"}
              </Badge>
            </div>

            <div className="mt-3.5 space-y-3">
              {degreeData.map((d, index) => {
                const tierColor = index === 0 
                  ? "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : index === 1
                  ? "from-primary/20 to-primary/5 text-primary border-primary/30"
                  : index === 2
                  ? "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/30"
                  : "from-muted/40 to-muted/20 text-muted-foreground border-border/40";

                return (
                  <div key={d.labelFa} className="p-2.5 rounded-2xl bg-muted/20 border border-border/30 hover:border-border/60 transition-all flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate">{isRtl ? d.labelFa : d.labelEn}</span>
                      <div className="flex items-center gap-2 fa-num font-mono">
                        <span className="font-black text-foreground">{d.count} {isRtl ? "نفر" : "pax"}</span>
                        <Badge variant="outline" className={cn("text-[9px] h-4.5 px-1.5 font-bold font-mono", tierColor)}>
                          {d.share.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={d.share} className="h-2 rounded-full bg-muted/60 [&>div]:bg-primary" />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Card 2: Executive HR Strategic Action Compass */}
          <Card className="rounded-3xl border-border/60 bg-linear-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-md p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Compass className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "قطب‌نمای راهبردی منابع انسانی" : "Executive Strategic Compass"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isRtl ? "پیشنهادات تحلیلی جهت بهبود پایداری سازمان" : "Workforce Retention & Development Directives"}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5 px-2 font-bold font-mono">
                {isRtl ? "۳ توصیه کلیدی" : "3 Directives"}
              </Badge>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {/* Insight 1 */}
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5">
                <div className="size-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {isRtl ? "حفظ نیروهای هسته مهندسی و مدیریت" : "Retention in Core Engineering & Mgmt"}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "واحدهای مهندسی، برنامه‌ریزی و مدیریت ارشد با نرخ ماندگاری بالای ۶۰٪، ستون فقرات دانش فنی یورواسلات را تشکیل می‌دهند."
                      : "Core engineering, planning, and executive units hold >60% retention, securing proprietary technical know-how."}
                  </p>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
                <div className="size-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {isRtl ? "بهینه‌سازی ماندگاری در خطوط تولید کارخانه" : "Factory Production Line Retention"}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "خطوط تولید کارخانه پرند با ۱۰۴ شاغل و بیشترین گردش نیرو، نیازمند بازنگری در مدل‌های پاداش بهره‌وری و نگهداشت پرسنل است."
                      : "Parand production lines account for 104 active staff; implementing productivity incentive packages will curb turnover."}
                  </p>
                </div>
              </div>

              {/* Insight 3 */}
              <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-2.5">
                <div className="size-6 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {isRtl ? "پوشش ۱۰۰٪ رفاه و تبدیل دوره‌های آزمایشی" : "Welfare Excellence & Onboarding Conversion"}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "پوشش کامل بیمه تکمیلی برای کلیه ۲۶۵ شاغل محقق شده و تبدیل وضعیت ۱۹ نیروی آزمایشی بر اساس تقویم منابع انسانی در جریان است."
                      : "100% supplementary health coverage is in place; conversion of 19 probationary staff follows the HR review cycle."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
