// src/modules/bug-reports/components/BugReportsModule.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  ListOrdered,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  User,
  MessageSquare,
  Lightbulb,
  Headset,
  Search,
  ShieldAlert,
  Mail,
  Home,
  Trash2,
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
import { BugReportsList } from "./BugReportsList";
import { BugReportDetailView } from "./BugReportDetailView";
import { BugReportSubmissionDialog } from "./BugReportSubmissionDialog";
import { FeedbackDialog } from "./FeedbackDialog";
import { IdeaDialog } from "./IdeaDialog";
import { SupportRequestDialog } from "./SupportRequestDialog";
import { SupportRequestsList } from "./SupportRequestsList";
import { FeedbackList } from "./FeedbackList";
import { IdeasList } from "./IdeasList";
import { AllRequestsList } from "./AllRequestsList";
import type {
  BugReport,
  BugReportsAnalytics,
  SupportRequest,
  FeedbackSubmission,
  IdeaSubmission,
} from "../types";

type ModuleTab = "all" | "support" | "feedback" | "ideas" | "bugs";

interface BugReportsModuleProps {
  initialReportId?: string;
  initialTab?: ModuleTab;
}

export function BugReportsModule({
  initialReportId,
  initialTab = "all",
}: BugReportsModuleProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ModuleTab>(initialTab);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [reports, setReports] = useState<BugReport[]>(
    () => bugReportsService.getCachedReports() || []
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [ideasList, setIdeasList] = useState<IdeaSubmission[]>([]);
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
      const [allData, stats, supData, fbData, ideaData] = await Promise.all([
        bugReportsService.getBugReports(undefined, isSilent).catch(() => []),
        bugReportsService.getAnalytics().catch(() => null),
        bugReportsService.getSupportRequests().catch(() => []),
        bugReportsService.getFeedback().catch(() => []),
        bugReportsService.getIdeas().catch(() => []),
      ]);
      setReports(allData);
      setAnalytics(stats);
      setSupportRequests(supData);
      setFeedbackList(fbData);
      setIdeasList(ideaData);

      // If initialReportId provided, select it
      if (initialReportId) {
        const found = allData.find(
          (r) => r.id === initialReportId || r.ticketNumber === initialReportId
        );
        if (found) setSelectedReport(found);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  }, [initialReportId]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchReports(!!bugReportsService.getCachedReports());
    } else {
      setIsLoading(false);
    }
  }, [fetchReports, isSuperAdmin]);

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

  const handleDeleteAllActive = async () => {
    let confirmMsg = "";
    if (activeTab === "all") {
      confirmMsg = isRtl
        ? "آیا از حذف تمام درخواست‌ها، باگ‌ها، تیکت‌های پشتیبانی، بازخوردها و ایده‌ها اطمینان دارید؟ تمام داده‌های ایشو سنتر پاک خواهد شد."
        : "Are you sure you want to delete ALL issues, tickets, feedback, and ideas? This will completely clear all issue center data.";
    } else if (activeTab === "support") {
      confirmMsg = isRtl
        ? `آیا از حذف تمام ${supportRequests.length} درخواست پشتیبانی اطمینان دارید؟`
        : `Are you sure you want to delete all ${supportRequests.length} support requests?`;
    } else if (activeTab === "feedback") {
      confirmMsg = isRtl
        ? `آیا از حذف تمام ${feedbackList.length} بازخورد کاربران اطمینان دارید؟`
        : `Are you sure you want to delete all ${feedbackList.length} feedback entries?`;
    } else if (activeTab === "ideas") {
      confirmMsg = isRtl
        ? `آیا از حذف تمام ${ideasList.length} ایده و پیشنهاد اطمینان دارید؟`
        : `Are you sure you want to delete all ${ideasList.length} feature ideas?`;
    } else {
      confirmMsg = isRtl
        ? `آیا از حذف تمام ${reports.length} گزارش باگ اطمینان دارید؟`
        : `Are you sure you want to delete all ${reports.length} bug reports?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      if (activeTab === "all") {
        await bugReportsService.deleteAllIssues();
      } else if (activeTab === "support") {
        await bugReportsService.deleteAllSupportRequests();
      } else if (activeTab === "feedback") {
        await bugReportsService.deleteAllFeedback();
      } else if (activeTab === "ideas") {
        await bugReportsService.deleteAllIdeas();
      } else {
        await bugReportsService.deleteAllBugReports();
      }
      setSelectedReport(null);
      fetchReports(false);
    } catch (err) {
      console.error("Failed to delete all items", err);
    }
  };

  const navItems = [
    {
      id: "all" as const,
      labelFa: "همه درخواست‌ها",
      labelEn: "All Requests",
      icon: ListOrdered,
    },
    {
      id: "support" as const,
      labelFa: "درخواست‌های پشتیبانی",
      labelEn: "Support Requests",
      icon: Headset,
    },
    {
      id: "feedback" as const,
      labelFa: "بازخورد کاربران",
      labelEn: "User Feedback",
      icon: MessageSquare,
    },
    {
      id: "ideas" as const,
      labelFa: "پیشنهادات و ایده‌ها",
      labelEn: "Feature Ideas",
      icon: Lightbulb,
    },
    {
      id: "bugs" as const,
      labelFa: "اشکالات فنی و باگ‌ها",
      labelEn: "Bug Reports",
      icon: AlertCircle,
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
        {isSuperAdmin && (
          <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs md:max-w-sm ms-2 sm:ms-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedReport(null);
                setActiveTab("all");
              }}
              className="w-full h-8.5 rounded-full bg-background/80 hover:bg-muted/70 border border-border/60 hover:border-primary/40 px-3 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground shadow-xs transition-colors duration-150 cursor-pointer font-normal"
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
            </Button>
          </div>
        )}
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
              {/* Primary Views (Superadmin only) */}
              {isSuperAdmin &&
                navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = !selectedReport && activeTab === item.id;
                  const label = isRtl ? item.labelFa : item.labelEn;

                  const buttonElement = (
                    <Button
                      key={item.id}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSelectedReport(null);
                        setActiveTab(item.id);
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={cn(
                        "group relative flex items-center rounded-full outline-hidden cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 p-0 justify-start h-[42px]",
                        sidebarOpen ? "w-full" : "w-[42px]",
                        isActive
                          ? "bg-primary text-white border border-primary shadow-xs ring-1 ring-primary/30 hover:bg-primary/90 hover:text-white"
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
                    </Button>
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

              {/* Non-superadmin: Return to Dashboard button in sidebar */}
              {!isSuperAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/dashboard")}
                      className={cn(
                        "group relative flex items-center rounded-full outline-hidden cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60 p-0 justify-start h-[42px]",
                        sidebarOpen ? "w-full" : "w-[42px]"
                      )}
                      aria-label={isRtl ? "بازگشت به داشبورد" : "Dashboard"}
                    >
                      <div className="size-[42px] shrink-0 flex items-center justify-center">
                        <Home className="size-5 shrink-0 text-foreground/60 group-hover:text-foreground transition-colors duration-150" />
                      </div>
                      <span
                        className={cn(
                          "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none font-medium text-foreground/75 group-hover:text-foreground",
                          sidebarOpen
                            ? "opacity-100 max-w-[170px] pe-3 ps-1"
                            : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                        )}
                      >
                        {isRtl ? "بازگشت به داشبورد" : "Dashboard"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent
                      side={isRtl ? "left" : "right"}
                      className="text-xs font-medium"
                    >
                      {isRtl ? "بازگشت به داشبورد" : "Dashboard"}
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </nav>
          </TooltipProvider>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-transparent w-full relative z-10 p-3 sm:p-6 lg:p-8 pb-28 min-h-0 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {!isSuperAdmin ? (
              <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
                <div className="size-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
                  <ShieldAlert className="size-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {isRtl
                      ? "دسترسی به پنل مدیریت ویژه مدیران ارشد سیستم است"
                      : "Management Panel Restricted to Superadmins"}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "مشاهده و مدیریت کلیه گزارش‌ها و تیکت‌ها منحصراً برای سوپرادمین سامانه فعال است. شما می‌توانید با استفاده از گزینه‌های زیر درخواست پشتیبانی یا گزارش اشکال فنی خود را ارسال فرمایید."
                      : "The full issue center and ticket management are accessible to system administrators only. You can use the quick actions below to submit bug reports or support requests."}
                  </p>
                </div>

                {/* Email Notification Notice */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300 text-xs text-start leading-relaxed shadow-xs">
                  <Mail className="size-5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>
                    {isRtl
                      ? "توجه: کلیه نتایج بررسی، پاسخ‌های تیم فنی و وضعیت رفع اشکال به صورت مستقیم به ایمیل شما ارسال خواهد شد و نیازی به پیگیری در پنل اختصاصی ندارید."
                      : "Note: Investigation findings, IT responses, and resolution updates will be delivered directly to your email address."}
                  </span>
                </div>

                {/* Quick Submission Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => setSubmissionDialogOpen(true)}
                    className="h-11 rounded-xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
                  >
                    <PlusCircle className="size-4" />
                    <span>{isRtl ? "ثبت گزارش اشکال فنی" : "Report Bug"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setSupportDialogOpen(true)}
                    className="h-11 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/70 cursor-pointer"
                  >
                    <Headset className="size-4 text-sky-600" />
                    <span>{isRtl ? "درخواست پشتیبانی" : "Support Request"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setFeedbackDialogOpen(true)}
                    className="h-11 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/70 cursor-pointer"
                  >
                    <MessageSquare className="size-4 text-emerald-600" />
                    <span>{isRtl ? "ارسال بازخورد" : "Send Feedback"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIdeaDialogOpen(true)}
                    className="h-11 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/70 cursor-pointer"
                  >
                    <Lightbulb className="size-4 text-amber-500" />
                    <span>{isRtl ? "پیشنهاد و ایده جدید" : "Feature Idea"}</span>
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="h-10 px-5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-2"
                  >
                    <Home className="size-4" />
                    <span>{isRtl ? "بازگشت به داشبورد" : "Return to Dashboard"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Header Action Row */}
                {!selectedReport && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {activeTab === "all"
                          ? isRtl
                            ? "همه درخواست‌ها و تیکت‌های دریافتی"
                            : "All Incoming Requests"
                          : activeTab === "support"
                          ? isRtl
                            ? "درخواست‌های پشتیبانی کاربران"
                            : "Support Requests"
                          : activeTab === "feedback"
                          ? isRtl
                            ? "بازخوردها و رضایت‌سنجی کاربران"
                            : "User Feedback"
                          : activeTab === "ideas"
                          ? isRtl
                            ? "پیشنهادات و ایده‌های ارتقای سیستم"
                            : "Feature Ideas"
                          : isRtl
                          ? "اشکالات فنی و گزارش‌های باگ"
                          : "Bug Reports"}
                      </h1>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRtl
                          ? "رهگیری کلیه تیکت‌ها، درخواست‌های پشتیبانی، بازخوردها و اشکالات فنی ارسال‌شده توسط کاربران"
                          : "Track all tickets, support inquiries, feedback, and technical bug reports."}
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
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteAllActive}
                        className="rounded-xl h-10 px-3 text-xs font-semibold gap-1.5 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80"
                      >
                        <Trash2 className="size-3.5" />
                        <span>
                          {activeTab === "all"
                            ? isRtl ? "پاکسازی کامل تیکت‌ها" : "Clear All Tickets"
                            : isRtl ? "حذف همه موارد" : "Delete All"}
                        </span>
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
                      onBack={() => {
                        setSelectedReport(null);
                        fetchReports(true);
                      }}
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
                  ) : activeTab === "all" ? (
                    <AllRequestsList
                      reports={reports}
                      supportRequests={supportRequests}
                      feedbackList={feedbackList}
                      ideasList={ideasList}
                      onSelectBug={(bug) => setSelectedReport(bug)}
                      onSelectSupport={() => setActiveTab("support")}
                      onSelectFeedback={() => setActiveTab("feedback")}
                      onSelectIdea={() => setActiveTab("ideas")}
                      onRefresh={() => fetchReports(true)}
                    />
                  ) : activeTab === "support" ? (
                    <SupportRequestsList
                      requests={supportRequests}
                      onRefresh={() => fetchReports(true)}
                    />
                  ) : activeTab === "feedback" ? (
                    <FeedbackList
                      feedbackList={feedbackList}
                      onRefresh={() => fetchReports(true)}
                    />
                  ) : activeTab === "ideas" ? (
                    <IdeasList
                      ideasList={ideasList}
                      onRefresh={() => fetchReports(true)}
                    />
                  ) : (
                    <BugReportsList
                      reports={reports}
                      currentUserId={user?.id}
                      activeFilterTab="all"
                      onFilterTabChange={() => {}}
                      onSelectReport={(r) => setSelectedReport(r)}
                      onRefresh={() => fetchReports(true)}
                    />
                  )}
                </div>
              </>
            )}
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
