// src/modules/bug-reports/components/BugReportsDashboard.tsx
"use client";

import React from "react";
import { useLocale } from "next-intl";
import {
  Bug,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flame,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BugReportsAnalytics, BugReport } from "../types";

interface BugReportsDashboardProps {
  analytics: BugReportsAnalytics | null;
  recentReports: BugReport[];
  onSelectReport: (report: BugReport) => void;
  onOpenNewReport: () => void;
  onViewAll: () => void;
}

export function BugReportsDashboard({
  analytics,
  recentReports,
  onSelectReport,
  onOpenNewReport,
  onViewAll,
}: BugReportsDashboardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const total = analytics?.total ?? 0;
  const newCount = analytics?.new ?? 0;
  const inProgress = analytics?.inProgress ?? 0;
  const resolved = analytics?.resolved ?? 0;
  const critical = analytics?.critical ?? 0;

  const statCards = [
    {
      titleFa: "کل تیکت‌ها",
      titleEn: "Total Tickets",
      value: total,
      icon: Bug,
      color: "text-foreground",
      bg: "bg-foreground/[0.04]",
      border: "border-border/60",
    },
    {
      titleFa: "گزارش‌های جدید",
      titleEn: "New Reports",
      value: newCount,
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-500/[0.08]",
      border: "border-amber-500/20",
    },
    {
      titleFa: "در حال پیگیری",
      titleEn: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-sky-500",
      bg: "bg-sky-500/[0.08]",
      border: "border-sky-500/20",
    },
    {
      titleFa: "رفع‌شده و بسته",
      titleEn: "Resolved / Closed",
      value: resolved,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/[0.08]",
      border: "border-emerald-500/20",
    },
    {
      titleFa: "موارد بحرانی",
      titleEn: "Critical Issues",
      value: critical,
      icon: Flame,
      color: "text-red-500",
      bg: "bg-red-500/[0.08]",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between shadow-2xs",
                s.bg,
                s.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isRtl ? s.titleFa : s.titleEn}
                </span>
                <Icon className={cn("size-4", s.color)} />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight mt-3 text-foreground">
                {s.value.toLocaleString(isRtl ? "fa-IR" : "en-US")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Category/Severity Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity & Status Breakdowns */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span>{isRtl ? "توزیع سطح بحرانی (Severity)" : "Severity Breakdown"}</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: "Critical", labelFa: "بحرانی", color: "bg-red-500", count: analytics?.bySeverity?.Critical || 0 },
                { name: "High", labelFa: "مهم و بالا", color: "bg-amber-500", count: analytics?.bySeverity?.High || 0 },
                { name: "Medium", labelFa: "متوسط", color: "bg-sky-500", count: analytics?.bySeverity?.Medium || 0 },
                { name: "Low", labelFa: "پایین", color: "bg-emerald-500", count: analytics?.bySeverity?.Low || 0 },
              ].map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground/80">{isRtl ? item.labelFa : item.name}</span>
                      <span className="font-mono text-muted-foreground">{item.count} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-300", item.color)}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>{isRtl ? "بیشترین خطاهای ماژول‌ها" : "Top Issues by Module"}</span>
            </h3>

            <div className="space-y-2">
              {Object.entries(analytics?.byModule || {}).length === 0 ? (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  {isRtl ? "اطلاعاتی ثبت نشده است" : "No records yet"}
                </div>
              ) : (
                Object.entries(analytics?.byModule || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([mod, count]) => (
                    <div key={mod} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 text-xs">
                      <span className="font-semibold text-foreground uppercase">{mod}</span>
                      <span className="font-mono font-bold text-primary">{count}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Bug className="size-4 text-primary" />
              <span>{isRtl ? "آخرین گزارش‌های ثبت‌شده" : "Recent Bug Reports"}</span>
            </h3>
            <button
              onClick={onViewAll}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isRtl ? "مشاهده همه" : "View All"}</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>

          <div className="divide-y divide-border/50">
            {recentReports.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShieldCheck className="size-10 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "در حال حاضر هیچ خطایی ثبت نشده است." : "No bug reports recorded yet."}
                </p>
              </div>
            ) : (
              recentReports.slice(0, 6).map((report) => (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-muted/40 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0 pe-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {report.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {report.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                      <span>{report.category}</span>
                      <span>•</span>
                      <span>{report.reporterName}</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        report.severity === "Critical"
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : report.severity === "High"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {report.severity}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

