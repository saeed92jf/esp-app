// src/modules/bug-reports/components/BugReportsModule.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  User,
  MessageSquare,
  Lightbulb,
  Headset,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import { BugReportsDashboard } from "./BugReportsDashboard";
import { BugReportsList } from "./BugReportsList";
import { BugReportDetailView } from "./BugReportDetailView";
import { BugReportSubmissionDialog } from "./BugReportSubmissionDialog";
import { FeedbackDialog } from "./FeedbackDialog";
import { IdeaDialog } from "./IdeaDialog";
import { SupportRequestDialog } from "./SupportRequestDialog";
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

  // Layout & sidebar state identical to Profile Manager
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dialogs
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

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

  const quickActionItems = [
    {
      id: "feedback",
      labelFa: "ارسال بازخورد",
      labelEn: "Send Feedback",
      icon: MessageSquare,
      onClick: () => setFeedbackDialogOpen(true),
    },
    {
      id: "idea",
      labelFa: "ثبت ایده و پیشنهاد",
      labelEn: "Feature Idea",
      icon: Lightbulb,
      onClick: () => setIdeaDialogOpen(true),
    },
    {
      id: "support",
      labelFa: "درخواست پشتیبانی",
      labelEn: "Support Request",
      icon: Headset,
      onClick: () => setSupportDialogOpen(true),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-panel dark:bg-background font-sans w-full relative">
      {/* Top Header - Designed identically to Profile Manager */}
      <AppHeader
        tag={isRtl ? "مرکز پشتیبانی و باگ‌ها" : "Issue Center"}
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      >
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs md:max-w-sm ms-2 sm:ms-4">
          <button
            type="button"
            onClick={() => {
              setSelectedReport(null);
              setActiveTab("reports");
            }}
            className="w-full h-8.5 rounded-full bg-background/80 hover:bg-muted/70 border border-border/60 hover:border-primary/40 px-3 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground shadow-xs transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">
                {isRtl ? "جستجوی گزارش‌ها و تیکت‌ها..." : "Search issues & bug reports..."}
              </span>
            </div>
            <kbd
              className="inline-flex items-center gap-0.5 text-[10px] font-sans font-semibold bg-muted/70 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground shrink-0"
              dir="ltr"
            >
              Ctrl+k
            </kbd>
          </button>
        </div>
      </AppHeader>

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation - Styled identically to Profile Manager */}
        <aside
          className={cn(
            "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6",
            "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
            sidebarOpen
              ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
          )}
        >
          <TooltipProvider>
            <nav
              className={cn(
                "flex flex-col gap-2.5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
                sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
              )}
            >
              {/* Primary Views */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !selectedReport && activeTab === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedReport(null);
                      setActiveTab(item.id);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-hidden cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    {/* Fixed 42px circle icon aligned with header button */}
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive
                            ? "text-white"
                            : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
                    </div>

                    {/* Smooth horizontal expansion label */}
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive
                          ? "font-semibold text-white"
                          : "font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                      <TooltipContent
                        side={isRtl ? "left" : "right"}
                        className="text-xs font-medium"
                      >
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}

              {/* Divider */}
              <div
                className={cn(
                  "h-px bg-border/40 my-1 transition-all duration-300",
                  sidebarOpen ? "w-[calc(100%-16px)]" : "w-[32px] mx-auto"
                )}
              />

              {/* Quick Actions (Feedback, Idea, Support) */}
              {quickActionItems.map((action) => {
                const Icon = action.icon;
                const label = isRtl ? action.labelFa : action.labelEn;

                const actionButton = (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      action.onClick();
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-hidden cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]"
                    )}
                    aria-label={label}
                  >
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon className="size-5 shrink-0 text-foreground/60 group-hover:text-foreground transition-colors duration-150" />
                    </div>
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>{actionButton}</TooltipTrigger>
                      <TooltipContent
                        side={isRtl ? "left" : "right"}
                        className="text-xs font-medium"
                      >
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return actionButton;
              })}

              {/* Divider */}
              <div
                className={cn(
                  "h-px bg-border/40 my-1 transition-all duration-300",
                  sidebarOpen ? "w-[calc(100%-16px)]" : "w-[32px] mx-auto"
                )}
              />

              {/* Primary Action: New Bug Report */}
              {(() => {
                const label = isRtl ? "ثبت گزارش باگ" : "Report Bug";
                const plusButton = (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionDialogOpen(true);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-hidden cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 hover:border-primary shadow-xs",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]"
                    )}
                    aria-label={label}
                  >
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <PlusCircle className="size-5 shrink-0 transition-colors duration-150" />
                    </div>
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none font-semibold",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key="report-bug">
                      <TooltipTrigger asChild>{plusButton}</TooltipTrigger>
                      <TooltipContent
                        side={isRtl ? "left" : "right"}
                        className="text-xs font-medium"
                      >
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return plusButton;
              })()}
            </nav>
          </TooltipProvider>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-transparent w-full relative z-10 p-3 sm:p-6 lg:p-8 pb-28 min-h-0 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Header Action Row */}
            {!selectedReport && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {isRtl
                      ? "مرکز گزارش و مدیریت باگ‌ها"
                      : "Issue Center & Bug Tracking"}
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
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        isLoading && "animate-spin text-primary"
                      )}
                    />
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

            {/* Active View with Pure Opacity Fade */}
            <div className="w-full animate-in fade-in duration-150">
              {selectedReport ? (
                <BugReportDetailView
                  report={selectedReport}
                  onBack={() => setSelectedReport(null)}
                  onUpdated={(updated) => {
                    setSelectedReport(updated);
                    setReports((prev) =>
                      prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                    bugReportsService.getAnalytics().then(setAnalytics).catch(() => {});
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("esp:bug-reports-updated"));
                    }
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
                  onFilterTabChange={(tab) =>
                    setActiveTab(tab === "my" ? "my" : "reports")
                  }
                  onSelectReport={(r) => setSelectedReport(r)}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <BugReportSubmissionDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        onSubmitted={() => {
          fetchReports(false);
        }}
      />

      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
      />

      <IdeaDialog
        open={ideaDialogOpen}
        onOpenChange={setIdeaDialogOpen}
      />

      <SupportRequestDialog
        open={supportDialogOpen}
        onOpenChange={setSupportDialogOpen}
      />
    </div>
  );
}
