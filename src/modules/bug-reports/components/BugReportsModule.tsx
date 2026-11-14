// src/modules/bug-reports/components/BugReportsModule.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  Bug,
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  User,
  Shield,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import { BugReportsDashboard } from "./BugReportsDashboard";
import { BugReportsList } from "./BugReportsList";
import { BugReportDetailView } from "./BugReportDetailView";
import { BugReportSubmissionDialog } from "./BugReportSubmissionDialog";
import type { BugReport, BugReportsAnalytics } from "../types";

type ModuleTab = "dashboard" | "reports" | "my";

interface BugReportsModuleProps {
  initialReportId?: string;
  initialTab?: ModuleTab;
}

export function BugReportsModule({
  initialReportId,
  initialTab = "dashboard",
}: BugReportsModuleProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ModuleTab>(initialTab);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [reports, setReports] = useState<BugReport[]>(
    () => bugReportsService.getCachedReports() || []
  );
  const [analytics, setAnalytics] = useState<BugReportsAnalytics | null>(
    () => bugReportsService.getCachedAnalytics()
  );
  const [isLoading, setIsLoading] = useState(!bugReportsService.getCachedReports());
  const [error, setError] = useState<string | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  const fetchReports = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const [allData, stats] = await Promise.all([
        bugReportsService.getBugReports(undefined, isSilent),
        bugReportsService.getAnalytics(),
      ]);
      setReports(allData);
      setAnalytics(stats);

      // If initialReportId provided, select it
      if (initialReportId) {
        const found = allData.find(
          (r) => r.id === initialReportId || r.ticketNumber === initialReportId
        );
        if (found) setSelectedReport(found);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load bug reports");
    } finally {
      setIsLoading(false);
    }
  }, [initialReportId]);

  useEffect(() => {
    fetchReports(!!bugReportsService.getCachedReports());
  }, [fetchReports]);

  // Handle direct ticket link in URL if provided
  useEffect(() => {
    const ticketParam = searchParams.get("ticket");
    if (ticketParam && reports.length > 0) {
      const found = reports.find(
        (r) => r.ticketNumber === ticketParam || r.id === ticketParam
      );
      if (found) setSelectedReport(found);
    }
  }, [searchParams, reports]);

  const navItems = [
    {
      id: "dashboard" as const,
      labelFa: "داشبورد تحلیلی",
      labelEn: "Analytics Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "reports" as const,
      labelFa: "همه گزارش‌ها",
      labelEn: "All Reports",
      icon: ListOrdered,
    },
    {
      id: "my" as const,
      labelFa: "گزارش‌های من",
      labelEn: "My Reports",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-panel dark:bg-background text-foreground font-sans">
      {/* Module Dedicated Header */}
      <AppHeader
        variant="panel"
        tag={isRtl ? "مرکز خطایابی و تیکت‌ها" : "Issue Center"}
        subTag={
          selectedReport
            ? selectedReport.ticketNumber
            : isRtl
            ? navItems.find((i) => i.id === activeTab)?.labelFa
            : navItems.find((i) => i.id === activeTab)?.labelEn
        }
        showMenuButton={false}
      />

      <div className="flex-1 flex min-h-0">
        {/* Module Sub-Navigation Sidebar */}
        <aside className="w-14 sm:w-16 border-e border-border/40 py-5 px-1.5 sm:px-2 flex flex-col items-center gap-3 shrink-0 bg-background/50 dark:bg-background/20 backdrop-blur-xs select-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !selectedReport && activeTab === item.id;
            const label = isRtl ? item.labelFa : item.labelEn;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setActiveTab(item.id);
                }}
                className={cn(
                  "size-10 sm:size-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer outline-none relative group",
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold ring-2 ring-primary/30"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                title={label}
              >
                <Icon className="size-5 shrink-0" />
                {/* Floating tooltip */}
                <span className="absolute start-full ms-2.5 px-2 py-1 rounded-md bg-popover text-popover-foreground text-[11px] font-semibold whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {label}
                </span>
              </button>
            );
          })}

          <div className="w-6 h-px bg-border/60 my-1" />

          {/* New Bug Report Action */}
          <button
            type="button"
            onClick={() => setSubmissionDialogOpen(true)}
            className="size-10 sm:size-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer outline-none relative group"
            title={isRtl ? "ثبت گزارش باگ" : "Report Bug"}
          >
            <PlusCircle className="size-5 shrink-0" />
            <span className="absolute start-full ms-2.5 px-2 py-1 rounded-md bg-popover text-popover-foreground text-[11px] font-semibold whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              {isRtl ? "ثبت گزارش باگ" : "Report Bug"}
            </span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-0 space-y-6">
          {/* Header Action Row */}
          {!selectedReport && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isRtl ? "مرکز گزارش و مدیریت باگ‌ها" : "Issue Center & Bug Tracking"}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRtl
                    ? "رهگیری اشکالات فنی، درخواست‌های ارتقا و وضعیت رسیدگی به باگ‌های گزارش‌شده"
                    : "Track technical issues, bug resolution progress and system health."}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReports(false)}
                  disabled={isLoading}
                  className="rounded-xl h-10 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={cn("size-3.5", isLoading && "animate-spin text-primary")} />
                  <span>{isRtl ? "بروزرسانی" : "Refresh"}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setSubmissionDialogOpen(true)}
                  className="rounded-xl h-10 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-md shadow-primary/20"
                >
                  <PlusCircle className="size-4" />
                  <span>{isRtl ? "ثبت گزارش جدید" : "Report Bug"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReports(false)}
                className="h-8 rounded-lg text-xs"
              >
                {isRtl ? "تلاش مجدد" : "Retry"}
              </Button>
            </div>
          )}

          {/* Active View */}
          {selectedReport ? (
            <BugReportDetailView
              report={selectedReport}
              onBack={() => setSelectedReport(null)}
              onUpdated={(updated) => {
                setSelectedReport(updated);
                setReports((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
            />
          ) : activeTab === "dashboard" ? (
            <BugReportsDashboard
              analytics={analytics}
              recentReports={reports}
              onSelectReport={(r) => setSelectedReport(r)}
              onOpenNewReport={() => setSubmissionDialogOpen(true)}
              onViewAll={() => setActiveTab("reports")}
            />
          ) : (
            <BugReportsList
              reports={reports}
              currentUserId={user?.id}
              activeFilterTab={activeTab === "my" ? "my" : "all"}
              onFilterTabChange={(tab) => setActiveTab(tab === "my" ? "my" : "reports")}
              onSelectReport={(r) => setSelectedReport(r)}
            />
          )}
        </main>
      </div>

      {/* Submission Dialog */}
      <BugReportSubmissionDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        onSubmitted={() => {
          fetchReports(false);
        }}
      />
    </div>
  );
}

