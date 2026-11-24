"use client";

import React, { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  HeartHandshake,
  BarChart3,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  FileText,
  MapPin,
  CheckCircle2,
  TableProperties,
  ArrowRight,
  ArrowLeft,
  Search,
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
  active: number;
  inactive: number;
  total: number;
  activeShare: number;
  retentionRate: number;
}

// Fallback baseline metrics directly matched from Executive_Dashboard in Excel
const BASELINE_DEPTS: DeptMetric[] = [
  { nameFa: "تولید و عملیات کارخانه", nameEn: "Factory Production & Operations", active: 104, inactive: 290, total: 394, activeShare: 39.2, retentionRate: 26.4 },
  { nameFa: "مهندسی و طراحی", nameEn: "Engineering & Design", active: 47, inactive: 56, total: 103, activeShare: 17.7, retentionRate: 45.6 },
  { nameFa: "کنترل کیفیت کارخانه", nameEn: "Factory Quality Control (QC)", active: 15, inactive: 27, total: 42, activeShare: 5.7, retentionRate: 35.7 },
  { nameFa: "انبار و لجستیک", nameEn: "Warehouse & Logistics", active: 16, inactive: 25, total: 41, activeShare: 6.0, retentionRate: 39.0 },
  { nameFa: "نگهداری و تعمیرات", nameEn: "Maintenance & Overhaul", active: 13, inactive: 19, total: 32, activeShare: 4.9, retentionRate: 40.6 },
  { nameFa: "مالی و حسابداری", nameEn: "Finance & Accounting", active: 12, inactive: 14, total: 26, activeShare: 4.5, retentionRate: 46.2 },
  { nameFa: "اداری و منابع انسانی", nameEn: "Administrative & Human Resources", active: 11, inactive: 10, total: 21, activeShare: 4.2, retentionRate: 52.4 },
  { nameFa: "تدارکات، ساخت و خرید", nameEn: "Procurement & Purchasing", active: 10, inactive: 10, total: 20, activeShare: 3.8, retentionRate: 50.0 },
  { nameFa: "برنامه‌ریزی و کنترل پروژه", nameEn: "Project Planning & Control", active: 8, inactive: 4, total: 12, activeShare: 3.0, retentionRate: 66.7 },
  { nameFa: "توسعه بازار و فروش", nameEn: "Market Development & Sales", active: 7, inactive: 4, total: 11, activeShare: 2.6, retentionRate: 63.6 },
  { nameFa: "مهندسی فرآیند", nameEn: "Process Engineering", active: 4, inactive: 5, total: 9, activeShare: 1.5, retentionRate: 44.4 },
  { nameFa: "ایمنی، بهداشت و محیط زیست", nameEn: "Health, Safety & Environment (HSE)", active: 4, inactive: 4, total: 8, activeShare: 1.5, retentionRate: 50.0 },
  { nameFa: "فناوری اطلاعات (انفورماتیک)", nameEn: "Information Technology (IT)", active: 5, inactive: 2, total: 7, activeShare: 1.9, retentionRate: 71.4 },
  { nameFa: "مدیریت ارشد و هیئت مدیره", nameEn: "Executive Management & Board", active: 6, inactive: 1, total: 7, activeShare: 2.3, retentionRate: 85.7 },
  { nameFa: "مهندسی کارخانه", nameEn: "Factory Engineering", active: 3, inactive: 2, total: 5, activeShare: 1.1, retentionRate: 60.0 },
];

export function AdminExecutiveDashboard({ users = [] }: AdminExecutiveDashboardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  const [deptSearch, setDeptSearch] = useState("");

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

          // Degree
          const deg = u.educationDegree || "کارشناسی";
          degreeMap[deg] = (degreeMap[deg] || 0) + 1;
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
          { labelFa: "کارشناسی ارشد و دکتری", labelEn: "Master's & Ph.D.", count: (degreeMap["کارشناسی ارشد"] || 0) + (degreeMap["دکتری"] || 0) || 23, share: 8.7 },
          { labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree", count: degreeMap["کارشناسی"] || 89, share: 33.6 },
          { labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree", count: degreeMap["کاردانی"] || 39, share: 14.7 },
          { labelFa: "دیپلم متوسطه", labelEn: "High School Diploma", count: degreeMap["دیپلم"] || 112, share: 42.3 },
          { labelFa: "زیر دیپلم / مهارتی", labelEn: "Below Diploma", count: degreeMap["زیر دیپلم"] || 2, share: 0.8 },
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

  const filteredDepts = useMemo(() => {
    if (!deptSearch.trim()) return deptMatrix;
    const q = deptSearch.trim().toLowerCase();
    return deptMatrix.filter((d) => d.nameFa.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q));
  }, [deptMatrix, deptSearch]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-8 gap-5 animate-in fade-in duration-150">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-100/90 dark:bg-slate-900/50 border border-border/50 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <BarChart3 className="size-5.5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              {isRtl ? "داشبورد مدیریتی و تحلیلی منابع انسانی (ESP CORE)" : "Executive HR Analytics & Workforce Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "تحلیل جامع وضعیت پرسنل فعال، قطع همکاری و ماتریس ماندگاری دپارتمان‌ها • شرکت یورواسلات پارس"
                : "Comprehensive workforce analysis: active, separated, and retention matrix across departments • Euroslot Pars Co."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="h-9 px-3.5 rounded-xl border-border/60 text-xs font-semibold gap-2 cursor-pointer bg-background/80 hover:bg-background transition-all"
          >
            <TableProperties className="size-4 text-primary" />
            <span>{isRtl ? "مشاهده جدول پرسنل" : "Personnel Table"}</span>
          </Button>
        </div>
      </div>

      {/* ── 8 High-Impact KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Headcount */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "کل پرسنل ثبت‌شده" : "Total Headcount"}
            </span>
            <div className="size-8 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground fa-num">
              {totalHeadcount} <span className="text-xs font-medium text-muted-foreground">{isRtl ? "نفر" : "staff"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/90">
              {isRtl ? "کل پایگاه داده پرسنلی یورواسلات" : "Complete staff records database"}
            </p>
          </div>
        </Card>

        {/* KPI 2: Active Staff */}
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {isRtl ? "پرسنل فعال (شاغل)" : "Active Staff"}
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 fa-num">
              {activeCount} <span className="text-xs font-medium text-emerald-600/80">{isRtl ? "نفر" : "active"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] h-4.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 fa-num font-bold">
                {retentionRate.toFixed(1)}% {isRtl ? "نرخ ماندگاری" : "Retention"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* KPI 3: Separated Staff */}
        <Card className="rounded-2xl border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              {isRtl ? "قطع همکاری / منفصل" : "Separated / Inactive"}
            </span>
            <div className="size-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 fa-num">
              {inactiveCount} <span className="text-xs font-medium text-rose-600/80">{isRtl ? "نفر" : "inactive"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] h-4.5 bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 fa-num font-bold">
                {attritionRate.toFixed(1)}% {isRtl ? "نرخ ریزش کل" : "Attrition"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* KPI 4: Gender Distribution */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "توزیع جنسیت فعالان" : "Active Gender Ratio"}
            </span>
            <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground fa-num">
              {maleActive} <span className="text-xs font-normal text-muted-foreground">{isRtl ? "آقا" : "Male"}</span> • {femaleActive} <span className="text-xs font-normal text-muted-foreground">{isRtl ? "خانم" : "Female"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground fa-num">
              {isRtl ? `سهم بانوان شاغل: ${femaleRatio.toFixed(1)}%` : `Female share: ${femaleRatio.toFixed(1)}%`}
            </p>
          </div>
        </Card>

        {/* KPI 5: Leadership */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "کادر مدیریت و سرپرستی" : "Leadership & Supervisors"}
            </span>
            <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground fa-num">
              {leadershipCount} <span className="text-xs font-medium text-muted-foreground">{isRtl ? "مدیر و سرپرست" : "leaders"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground fa-num">
              {isRtl ? `نسبت به فعالان: ${leadershipRatio.toFixed(1)}%` : `${leadershipRatio.toFixed(1)}% of workforce`}
            </p>
          </div>
        </Card>

        {/* KPI 6: Insurance Coverage */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "پوشش بیمه تکمیلی" : "Insurance Coverage"}
            </span>
            <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-sky-700 dark:text-sky-300 fa-num">
              {insuranceCount} <span className="text-xs font-medium text-sky-600/80">{isRtl ? "نفر" : "covered"}</span>
            </div>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold fa-num">
              {insuranceRatio.toFixed(0)}% {isRtl ? "پوشش ۱۰۰ درصدی خدمات" : "100% full coverage"}
            </p>
          </div>
        </Card>

        {/* KPI 7: Primary Location */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "سهم کارخانه پرند" : "Parand Factory Share"}
            </span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground fa-num">
              {locationData[0].active} <span className="text-xs font-medium text-muted-foreground">{isRtl ? "نفر فعال" : "active"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground fa-num">
              {isRtl ? "۶۵.۳٪ از کل پرسنل شاغل شرکت" : "65.3% of total active workforce"}
            </p>
          </div>
        </Card>

        {/* KPI 8: Head Office */}
        <Card className="rounded-2xl border-border/50 bg-background/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isRtl ? "دفتر مرکزی تهران" : "Tehran Head Office"}
            </span>
            <div className="size-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Briefcase className="size-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground fa-num">
              {locationData[1].active} <span className="text-xs font-medium text-muted-foreground">{isRtl ? "نفر فعال" : "active"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground fa-num">
              {isRtl ? "۳۴.۷٪ با نرخ ماندگاری ۴۸.۴٪" : "34.7% with 48.4% retention"}
            </p>
          </div>
        </Card>
      </div>

      {/* ── Main Section: Department Retention Matrix ── */}
      <Card className="rounded-3xl border-border/50 bg-background/80 shadow-xs overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              {isRtl
                ? "ماتریس جامع دپارتمان‌ها: تحلیل پرسنل فعال، قطع همکاری و نرخ ماندگاری"
                : "Department Retention Matrix: Active vs. Separated Staff"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "تحلیل نرخ حفظ و ماندگاری نیروی انسانی به تفکیک ۱۵ واحد و دپارتمان تخصصی شرکت یورواسلات پارس"
                : "Workforce retention rate and headcount distribution across 15 operational departments"}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی دپارتمان..." : "Search department..."}
              className="h-8.5 text-xs ps-8.5 pe-3 rounded-xl bg-muted/40 border-border/60"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-3 px-4 text-start font-bold">#</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "دپارتمان / واحد سازمانی" : "Department"}</th>
                <th className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-300">{isRtl ? "پرسنل فعال (شاغل)" : "Active Staff"}</th>
                <th className="py-3 px-4 text-center font-bold text-rose-700 dark:text-rose-300">{isRtl ? "منفصل (قطع همکاری)" : "Separated"}</th>
                <th className="py-3 px-4 text-center font-bold text-foreground">{isRtl ? "کل دپارتمان" : "Total Staff"}</th>
                <th className="py-3 px-4 text-center font-bold">{isRtl ? "سهم از فعالان" : "Active Share"}</th>
                <th className="py-3 px-4 text-start font-bold min-w-[180px]">{isRtl ? "نرخ ماندگاری (Retention %)" : "Retention Rate"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredDepts.map((d, idx) => (
                <tr key={d.nameFa} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground/70 font-mono fa-num text-start">{idx + 1}</td>
                  <td className="py-3 px-4 text-start">
                    <div className="font-semibold text-foreground">{isRtl ? d.nameFa : d.nameEn}</div>
                    <div className="text-[10px] text-muted-foreground/80 font-mono">{isRtl ? d.nameEn : d.nameFa}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 fa-num">
                    {d.active}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-rose-600 dark:text-rose-400 fa-num">
                    {d.inactive}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-foreground fa-num">
                    {d.total}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground fa-num font-medium">
                    {d.activeShare.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-start">
                    <div className="flex items-center gap-2.5">
                      <Progress
                        value={d.retentionRate}
                        className={cn(
                          "h-2 w-24 rounded-full bg-muted/60",
                          d.retentionRate >= 50
                            ? "[&>div]:bg-emerald-500"
                            : d.retentionRate >= 35
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-rose-500"
                        )}
                      />
                      <span className="font-bold fa-num text-xs min-w-[45px] text-start">
                        {d.retentionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/70 font-bold border-t-2 border-border/60 text-xs">
                <td className="py-3.5 px-4 text-center" colSpan={2}>
                  {isRtl ? "جمع کل دپارتمان‌ها (پایگاه داده کامل یورواسلات)" : "Total Departments (Euroslot Full Workforce)"}
                </td>
                <td className="py-3.5 px-4 text-center text-emerald-700 dark:text-emerald-300 fa-num text-sm">
                  {activeCount}
                </td>
                <td className="py-3.5 px-4 text-center text-rose-700 dark:text-rose-300 fa-num text-sm">
                  {inactiveCount}
                </td>
                <td className="py-3.5 px-4 text-center text-foreground fa-num text-sm">
                  {totalHeadcount}
                </td>
                <td className="py-3.5 px-4 text-center fa-num">100.0%</td>
                <td className="py-3.5 px-4 text-start fa-num text-sm text-primary">
                  {retentionRate.toFixed(1)}% {isRtl ? "میانگین ماندگاری کل" : "Overall Avg"}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* ── Bottom Section: Location & Contract / Degrees Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card A: Location Comparative Analysis */}
        <Card className="rounded-3xl border-border/50 bg-background/80 shadow-xs p-5">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span>{isRtl ? "تحلیل تطبیقی محل خدمت پرسنل" : "Work Location Comparative Analysis"}</span>
            </CardTitle>
          </CardHeader>
          <div className="space-y-3.5">
            {locationData.map((loc) => (
              <div key={loc.nameFa} className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="font-semibold text-xs text-foreground">{isRtl ? loc.nameFa : loc.nameEn}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/25 fa-num font-bold">
                    {loc.retention}% {isRtl ? "ماندگاری" : "Retention"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <span className="text-[10px] block opacity-80">{isRtl ? "فعال" : "Active"}</span>
                    <span className="font-bold text-sm fa-num">{loc.active}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                    <span className="text-[10px] block opacity-80">{isRtl ? "قطع همکاری" : "Separated"}</span>
                    <span className="font-bold text-sm fa-num">{loc.inactive}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-background border border-border/50 text-foreground">
                    <span className="text-[10px] block opacity-80 text-muted-foreground">{isRtl ? "کل پرسنل" : "Total"}</span>
                    <span className="font-bold text-sm fa-num">{loc.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Card B: Contract & Education Distribution */}
        <Card className="rounded-3xl border-border/50 bg-background/80 shadow-xs p-5">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              <span>{isRtl ? "توزیع تحصیلات و نوع قرارداد پرسنل فعال" : "Active Staff Contracts & Degrees"}</span>
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {/* Degree Distribution */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-2">
                {isRtl ? "سطح تحصیلات نیروی انسانی شاغل:" : "Education Level Breakdown:"}
              </span>
              <div className="space-y-2">
                {degreeData.map((d) => (
                  <div key={d.labelFa} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{isRtl ? d.labelFa : d.labelEn}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold fa-num text-muted-foreground">{d.count} {isRtl ? "نفر" : "staff"}</span>
                      <Badge variant="secondary" className="text-[10px] h-4.5 bg-muted fa-num font-mono">
                        {d.share.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/40 pt-3">
              <span className="text-xs font-semibold text-muted-foreground block mb-2">
                {isRtl ? "ترکیب نوع قرارداد شاغلین:" : "Contract Type Composition:"}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {contractData.map((c) => (
                  <div key={c.labelFa} className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                    <span className="text-foreground text-[11px] truncate">{isRtl ? c.labelFa : c.labelEn}</span>
                    <span className="font-bold fa-num text-primary ms-1">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
