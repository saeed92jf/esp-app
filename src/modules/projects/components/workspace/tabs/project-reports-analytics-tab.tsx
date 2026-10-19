// src/modules/projects/components/workspace/tabs/project-reports-analytics-tab.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ProjectItem } from "../../../types/projects.types";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Calendar,
  Layers,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectReportsAnalyticsTabProps {
  project: ProjectItem;
}

export function ProjectReportsAnalyticsTab({
  project,
}: ProjectReportsAnalyticsTabProps) {
  const t = useTranslations("Projects");

  const vdisDocs = project.vdisDocuments || [];
  const totalDocs = vdisDocs.length;
  const approvedDocs = vdisDocs.filter(
    (d) => d.status === "code_1_approved" || d.status === "code_2_approved_comm"
  ).length;
  const pendingDocs = vdisDocs.filter(
    (d) => d.status === "pending_approval" || d.status === "draft"
  ).length;
  const transmittedDocs = vdisDocs.filter(
    (d) => d.status === "transmitted"
  ).length;
  const rejectedDocs = vdisDocs.filter(
    (d) => d.status === "code_3_rejected" || d.status === "rejected_by_manager"
  ).length;

  const approvalRate =
    totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  // S-Curve points calculation for SVG visual display
  const sCurvePoints = [
    { month: "ماه ۱", planned: 5, actual: 4 },
    { month: "ماه ۲", planned: 15, actual: 12 },
    { month: "ماه ۳", planned: 28, actual: 25 },
    { month: "ماه ۴", planned: 45, actual: 42 },
    { month: "ماه ۵", planned: 65, actual: project.progressPercent },
    { month: "ماه ۶ (برنامه)", planned: 82, actual: null },
    { month: "ماه ۷ (برنامه)", planned: 95, actual: null },
    { month: "ماه ۸ (تحویل)", planned: 100, actual: null },
  ];

  // Calculate SPI (Schedule Performance Index)
  const spi =
    project.plannedProgressPercent > 0
      ? (project.progressPercent / project.plannedProgressPercent).toFixed(2)
      : "1.00";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg text-foreground">
            {t("reports.title")}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("reports.subtitle")}
        </p>
      </div>

      {/* KPI Cards: SPI, CPI, VDIS Approval, Schedule Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SPI Index */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {t("reports.timeEfficiency")}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                Number(spi) >= 0.95
                  ? "border-emerald-500/30 text-emerald-500"
                  : "border-rose-500/30 text-rose-500"
              }`}
            >
              {Number(spi) >= 0.95 ? "طبق برنامه" : "تاخیر جزئی"}
            </Badge>
          </div>
          <div className="font-bold text-2xl font-mono text-foreground fa-num">
            {spi}
          </div>
          <p className="text-[11px] text-muted-foreground">
            نسبت ارزش کسب شده به برنامه‌ای (EV/PV)
          </p>
        </div>

        {/* CPI Index */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {t("reports.costEfficiency")}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-500/30 text-emerald-500"
            >
              کنترل بهینه
            </Badge>
          </div>
          <div className="font-bold text-2xl font-mono text-emerald-500 fa-num">
            1.04
          </div>
          <p className="text-[11px] text-muted-foreground">
            عملکرد مدیریت هزینه در محدوده بودجه مصوب
          </p>
        </div>

        {/* VDIS Approval Rate */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
              {t("reports.vdisApprovalRate")}
            </span>
            <span className="text-[10px] font-mono fa-num text-muted-foreground">
              {approvedDocs} از {totalDocs} سند
            </span>
          </div>
          <div className="font-bold text-2xl font-mono text-purple-500 fa-num">
            %{approvalRate}
          </div>
          <Progress value={approvalRate} className="h-1.5" />
        </div>

        {/* Schedule Delivery Progress */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              پیشرفت فیزیکی کل
            </span>
            <span className="text-[10px] font-mono text-muted-foreground fa-num">
              هدف: %{project.plannedProgressPercent}
            </span>
          </div>
          <div className="font-bold text-2xl font-mono text-foreground fa-num">
            %{project.progressPercent}
          </div>
          <Progress value={project.progressPercent} className="h-1.5" />
        </div>
      </div>

      {/* S-Curve Chart Visual Container */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t("reports.sCurveTitle")}
            </h3>
            <p className="text-xs text-muted-foreground">
              منحنی S تجمیعی پیشرفت برنامه‌ای (Planned S-Curve) در مقابل پیشرفت واقعی (Actual Progress)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-500 rounded-full inline-block" />
              <span>پیشرفت برنامه‌ای (Planned)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
              <span>پیشرفت واقعی (Actual)</span>
            </div>
          </div>
        </div>

        {/* SVG Graphic S-Curve */}
        <div className="w-full h-64 bg-background/50 rounded-lg border border-border/40 p-4 relative flex flex-col justify-between">
          {/* Grid lines */}
          <div className="absolute inset-x-8 inset-y-6 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
          </div>

          <svg className="w-full h-44 overflow-visible">
            {/* Planned Line (Blue, dashed forward) */}
            <path
              d="M 20 160 C 80 150, 140 125, 220 95 C 300 65, 380 30, 480 15 C 540 10, 600 8, 680 8"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />

            {/* Actual Line (Emerald, solid up to month 5) */}
            <path
              d="M 20 160 C 80 152, 140 128, 220 100 C 290 74, 350 48, 420 38"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Actual Current Point Marker */}
            <circle cx="420" cy="38" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Month Axis Labels */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 px-2 fa-num">
            {sCurvePoints.map((p, i) => (
              <span key={i} className="text-center">
                {p.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VDIS Status Breakdown & Phase Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VDIS Documents Distribution */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-purple-500" />
            وضعیت اسناد و ترنسمیتال‌های VDIS
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">تایید شده توسط کارفرما (Code 1 / Code 2)</span>
              <span className="font-semibold text-emerald-500 fa-num">{approvedDocs} سند</span>
            </div>
            <Progress
              value={totalDocs ? (approvedDocs / totalDocs) * 100 : 0}
              className="h-1.5"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ارسال شده و منتظر پاسخ کارفرما</span>
              <span className="font-semibold text-blue-500 fa-num">{transmittedDocs} سند</span>
            </div>
            <Progress
              value={totalDocs ? (transmittedDocs / totalDocs) * 100 : 0}
              className="h-1.5"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">در حال بررسی مدیران بالادستی / پیش‌نویس</span>
              <span className="font-semibold text-amber-500 fa-num">{pendingDocs} سند</span>
            </div>
            <Progress
              value={totalDocs ? (pendingDocs / totalDocs) * 100 : 0}
              className="h-1.5"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">رد شده یا عودت جهت اصلاح</span>
              <span className="font-semibold text-rose-500 fa-num">{rejectedDocs} سند</span>
            </div>
            <Progress
              value={totalDocs ? (rejectedDocs / totalDocs) * 100 : 0}
              className="h-1.5"
            />
          </div>
        </div>

        {/* Phase-by-Phase Progress Summary */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            پیشرفت تفکیکی فازهای پروژه
          </h3>

          <div className="space-y-3">
            {(project.phases || []).map((phase) => (
              <div key={phase.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{phase.name}</span>
                  <span className="font-mono text-muted-foreground fa-num">
                    %{phase.progressPercent}
                  </span>
                </div>
                <Progress value={phase.progressPercent} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
