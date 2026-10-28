// src/modules/tasks/components/tasks-management-page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Kanban,
  Table2,
  List as ListIcon,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  FileText,
  Building2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  User,
  Users,
  BarChart3,
  CalendarDays,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Briefcase,
  PieChart,
  Check,
  FolderKanban,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useTasks } from "../hooks/use-tasks";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { TaskBoard } from "./task-board";
import { TaskTable } from "./task-table";
import { TaskRoadmapAnalytics } from "./task-timeline-bar";
import { TaskDetailView } from "./task-detail-view";
import { TaskCreateView } from "./task-create-view";
import { AppHeader } from "@/components/layout/app-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TaskTab = "kanban" | "table" | "timeline" | "create" | "detail" | "companies" | "analytics" | "settings";

interface NavItem {
  id: TaskTab;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  descriptionFa: string;
  descriptionEn: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "kanban",
    labelFa: "تسک‌ها و گردش کار",
    labelEn: "Tasks & Workflow",
    icon: Kanban,
    descriptionFa: "نمای یکپارچه کانبان و جدول برای مدیریت وضعیت و فیلتر تسک‌ها",
    descriptionEn: "Unified kanban board and tabular workflow for tasks",
  },
  {
    id: "timeline",
    labelFa: "نقشه راه و آنالیز",
    labelEn: "Roadmap & Analytics",
    icon: Clock,
    descriptionFa: "نقشه راه فازبندی پروژه‌ها، افق زمانی و شاخص‌های آماری KPI",
    descriptionEn: "Engineering roadmap, time horizons, and performance KPIs",
  },
  {
    id: "create",
    labelFa: "تعریف تسک",
    labelEn: "New Task",
    icon: PlusCircle,
    descriptionFa: "فرم اختصاصی ثبت و زمان‌بندی تسک‌های کاری",
    descriptionEn: "Dedicated form to define and schedule new tasks",
  },
  {
    id: "companies",
    labelFa: "تفکیک شرکتی",
    labelEn: "Company Portfolio",
    icon: Building2,
    descriptionFa: "پورتفولیو و آمار تفکیکی شرکت‌های تابعه",
    descriptionEn: "Portfolio view for subsidiaries & joint projects",
  },
  {
    id: "settings",
    labelFa: "نقش و پرسپکتیو",
    labelEn: "Role & Perspective",
    icon: ShieldCheck,
    descriptionFa: "مدیریت سطح دسترسی، دیدگاه کارشناس و تنظیمات",
    descriptionEn: "Manage access oversight and switch member perspective",
  },
];

export interface TasksManagementPageProps {
  initialTab?: TaskTab;
  initialTaskId?: string;
}

export function TasksManagementPage({ initialTab, initialTaskId }: TasksManagementPageProps = {}) {
  const t = useTranslations("Tasks");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();

  const { user } = useAuth();
  const initialRole = user?.role === "admin" ? "admin" : "user";
  const defaultUserName = user?.fullNameFa || user?.fullName || "سعید جلیلی";

  const {
    tasks,
    isAdmin,
    userInvolvedProjects,
    availableProjects,
    isLoading,
    error,
    filters,
    setFilters,
    roleMode,
    setRoleMode,
    currentUserName,
    setCurrentUserName,
    allAssignees,
    filteredTasks,
    stats,
    categories,
    companies,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    addReply,
    uploadAttachment,
    deleteAttachment,
    assignCollaborator,
    removeCollaborator,
    updateProgress,
    refreshTasks,
  } = useTasks({
    initialRole,
    defaultUserName,
  });

  const availableNavItems: NavItem[] = useMemo(() => {
    if (!isAdmin) {
      // Non-admins (regular users) have NO organizational access:
      // Exclude 'companies' (corporate portfolio) and 'settings' (admin perspective switcher)
      return NAV_ITEMS.filter(
        (item) => item.id !== "companies" && item.id !== "settings"
      );
    }
    return NAV_ITEMS;
  }, [isAdmin]);

  const searchParams = useSearchParams();
  const queryTab = searchParams?.get("tab") as TaskTab | null;
  const queryMode = searchParams?.get("mode") as "kanban" | "table" | null;

  const [tasksViewMode, setTasksViewMode] = useState<"kanban" | "table">(() => {
    if (queryTab === "table" || initialTab === "table" || queryMode === "table") {
      return "table";
    }
    return "kanban";
  });

  const [activeTab, setActiveTab] = useState<TaskTab>(() => {
    if (queryTab === "table" || initialTab === "table") {
      return "kanban";
    }
    if (
      queryTab &&
      ["kanban", "timeline", "create", "detail", "companies", "analytics", "settings"].includes(queryTab)
    ) {
      return queryTab;
    }
    return initialTab || "kanban";
  });

  useEffect(() => {
    if (queryTab === "table") {
      setActiveTab("kanban");
      setTasksViewMode("table");
    } else if (
      queryTab &&
      ["kanban", "timeline", "create", "detail", "companies", "analytics", "settings"].includes(queryTab)
    ) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  useEffect(() => {
    if (!isAdmin && (activeTab === "companies" || activeTab === "settings")) {
      setActiveTab("kanban");
    }
  }, [isAdmin, activeTab]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("pending");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Selected company state for company portfolio tab
  const [selectedCompanyPortfolio, setSelectedCompanyPortfolio] = useState<string>("all");

  const queryTaskId = searchParams?.get("taskId");

  useEffect(() => {
    const targetId = initialTaskId || queryTaskId;
    if (targetId && tasks.length > 0) {
      const found = tasks.find((t) => t.id === targetId);
      if (found) {
        setSelectedTask(found);
        setActiveTab("detail");
      }
    }
  }, [initialTaskId, queryTaskId, tasks]);

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task);
    setActiveTab("detail");
  };

  const handleOpenCreateWithStatus = (status: TaskStatus = "pending") => {
    setCreateDefaultStatus(status);
    setActiveTab("create");
  };

  const companyList = [
    { id: "all", label: t("companies.all") },
    { id: "یورو اسلات پارس", label: t("companies.euroslot") },
    { id: "نانو پالایش سرام", label: t("companies.nano") },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.company !== "all" ||
    filters.isManagerOnly;

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 1: UNIFIED TASKS WORKFLOW (KANBAN & TABLE MODES)         */
  /* ──────────────────────────────────────────────────────────── */
  const renderTasksWorkflowView = () => (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
      {/* ── 1. Page Title & Overview (Fixed, Never Shifts) ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {isRtl ? "گردش کار و مدیریت تسک‌ها" : "Tasks & Workflow Management"}
          </h1>
          <Badge variant="outline" className="fa-num border-primary/30 text-primary font-semibold text-xs">
            {filteredTasks.length} {t("timeline.tasksCount")}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isRtl
            ? "مشاهده، فیلتر و هدایت وظایف سازمانی در دو نمای چابک کانبان و جدول داده اکسلی"
            : "Track and organize organizational workflows seamlessly across Agile Kanban and data tables."}
        </p>
      </div>

      {/* ── 2. Dedicated Fixed Toolbar Directly Below Title (Fixed Layout, Zero Jump) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/70 dark:bg-card/70 border border-border/60 shadow-2xs backdrop-blur-md">
        {/* Left Side: Live Search & Scope Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-1">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isRtl ? "جستجوی زنده در تسک‌ها..." : "Search tasks..."}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="h-10 ps-8 pe-3 text-xs rounded-xl bg-card border-border/70 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Scope Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, scope: "all", isManagerOnly: false }))}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                filters.scope === "all" && !filters.isManagerOnly
                  ? "bg-primary text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabs.all")}
            </button>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, scope: "personal", isManagerOnly: false }))}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                filters.scope === "personal"
                  ? "bg-primary text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabs.mine")}
            </button>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, scope: "all", isManagerOnly: true }))}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                filters.isManagerOnly
                  ? "bg-primary text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabs.manager")}
            </button>
          </div>
        </div>

        {/* Right Side: Switcher, Refresh & New Task */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end lg:self-auto flex-wrap">
          {/* Two-Icon Mode Toggle with Animated Sliding Pill */}
          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/50 relative">
            <button
              type="button"
              onClick={() => setTasksViewMode("kanban")}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-10",
                tasksViewMode === "kanban" ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
              title={t("views.switchToKanban")}
              aria-label={t("views.switchToKanban")}
            >
              {tasksViewMode === "kanban" && (
                <motion.div
                  layoutId="tasksViewModePill"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Kanban className="size-4" />
              <span className="hidden sm:inline">{t("views.switchToKanban")}</span>
            </button>

            <button
              type="button"
              onClick={() => setTasksViewMode("table")}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-10",
                tasksViewMode === "table" ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
              title={t("views.switchToTable")}
              aria-label={t("views.switchToTable")}
            >
              {tasksViewMode === "table" && (
                <motion.div
                  layoutId="tasksViewModePill"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Table2 className="size-4" />
              <span className="hidden sm:inline">{t("views.switchToTable")}</span>
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={refreshTasks}
            className="size-10 rounded-xl shadow-2xs hover:bg-muted/70 bg-card border-border/60"
            title={isRtl ? "بروزرسانی داده‌ها" : "Refresh"}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>

          {/* New Task Button */}
          <Button
            onClick={() => handleOpenCreateWithStatus("pending")}
            className="rounded-xl h-10 px-4 text-xs font-semibold gap-2 shadow-2xs"
          >
            <Plus className="size-4" />
            <span>{t("newTask")}</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Stable Shared Display Container for Kanban / Table with Motion Transition ── */}
      <div className="rounded-3xl border border-border/60 bg-white/50 dark:bg-card/40 backdrop-blur-sm p-4 sm:p-6 shadow-xs min-h-[580px] w-full relative">
        <AnimatePresence mode="wait" initial={false}>
          {tasksViewMode === "kanban" ? (
            <motion.div
              key="kanban-view"
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.995 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <TaskBoard
                tasks={filteredTasks}
                searchQuery={filters.search}
                onSelectTask={handleOpenDetail}
                onUpdateStatus={changeTaskStatus}
                onOpenCreate={handleOpenCreateWithStatus}
              />
            </motion.div>
          ) : (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.995 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <TaskTable
                tasks={filteredTasks}
                searchQuery={filters.search}
                roleMode={roleMode}
                onSelectTask={handleOpenDetail}
                onUpdateStatus={changeTaskStatus}
                onDeleteTask={deleteTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 3: UNIFIED ROADMAP & ANALYTICS VIEW                      */
  /* ──────────────────────────────────────────────────────────── */
  const renderTimelineView = () => (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
      {/* Universal Visual Roadmap & Analytics Component with Pure Segmented-Lists */}
      <TaskRoadmapAnalytics
        tasks={tasks}
        selectedTaskId={selectedTask?.id}
        onSelectTask={handleOpenDetail}
        searchQuery={filters.search}
        allAssignees={allAssignees}
        userInvolvedProjects={userInvolvedProjects}
        isAdmin={isAdmin}
        roleMode={roleMode}
      />
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 4: DEDICATED TASK CREATION VIEW                          */
  /* ──────────────────────────────────────────────────────────── */
  const renderCreateView = () => (
    <TaskCreateView
      onCreateTask={createTask}
      onCancel={() => setActiveTab("kanban")}
      onSuccess={(_newTask) => {
        setFilters((prev) => ({
          ...prev,
          search: "",
          status: "all",
          company: "all",
          category: "all",
          assignee: "all",
          scope: "all",
          isManagerOnly: false,
        }));
        setActiveTab("kanban");
      }}
      categories={categories}
      companies={companies}
      defaultStatus={createDefaultStatus}
      currentUserName={currentUserName}
      isAdmin={isAdmin}
      userInvolvedProjects={userInvolvedProjects}
      availableProjects={availableProjects}
    />
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 5: COMPANY PORTFOLIO VIEW                                */
  /* ──────────────────────────────────────────────────────────── */
  const renderCompaniesView = () => {
    if (!isAdmin) {
      return renderTasksWorkflowView();
    }

    const companiesData = [
      {
        id: "یورو اسلات پارس",
        nameFa: "یورو اسلات پارس",
        nameEn: "Euroslot Pars",
        badge: "غربال و نازل‌های فیلتراسیون",
        descFa: "تولید تخصصی صفحات و لوله‌های غربال اسلات‌دار، وِج وایر و تجهیزات فرایندی نفت و پتروشیمی",
        descEn: "Continuous slot screen panels, wedge wire, and process filtration nozzles",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        accent: "bg-blue-600",
      },
      {
        id: "نانو پالایش سرام",
        nameFa: "نانو پالایش سرام",
        nameEn: "Nano Palayesh Ceram",
        badge: "غشاهای نانوسرامیک",
        descFa: "فیلتراسیون پیشرفته دمای بالا، غشاهای جداسازی متخلخل سرامیکی و کاتالیست‌های خاص",
        descEn: "High-temperature ceramic membrane filters and advanced porous substrates",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        accent: "bg-emerald-600",
      },
    ];

    const displayTasks =
      selectedCompanyPortfolio === "all"
        ? tasks
        : tasks.filter((t) => t.company === selectedCompanyPortfolio);

    return (
      <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <Building2 className="size-7 text-primary shrink-0" />
              <span>{isRtl ? "تفکیک شرکتی و پورتفولیو پروژه‌ها" : "Corporate Task Portfolio"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isRtl
                ? "پایش وضعیت پروژه‌ها، بار کاری و درصد پیشرفت تفکیک‌شده برای هر شرکت هلدینگ"
                : "Project oversight, active workloads, and completion rates segregated by subsidiary"}
            </p>
          </div>

          <Button
            onClick={() => handleOpenCreateWithStatus("pending")}
            className="rounded-full h-9 px-4 text-xs font-semibold gap-1.5 shadow-2xs shrink-0"
          >
            <Plus className="size-4" />
            <span>{t("newTask")}</span>
          </Button>
        </div>

        {/* 2 Company Portfolio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {companiesData.map((comp) => {
            const compTasks = tasks.filter((t) => t.company === comp.id);
            const compCompleted = compTasks.filter((t) => t.status === "completed").length;
            const compRate = compTasks.length > 0 ? Math.round((compCompleted / compTasks.length) * 100) : 0;
            const isSelected = selectedCompanyPortfolio === comp.id;

            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompanyPortfolio(isSelected ? "all" : comp.id)}
                className={cn(
                  "p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-xs",
                  isSelected
                    ? "bg-white dark:bg-card border-primary ring-2 ring-primary/30 shadow-md"
                    : "bg-white/70 dark:bg-card/60 border-border/60 hover:border-border hover:bg-white dark:hover:bg-card"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", comp.color)}>
                      {comp.badge}
                    </span>
                    <Badge variant="outline" className="fa-num text-xs">
                      {compTasks.length} {isRtl ? "تسک" : "tasks"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-foreground mb-1">
                    {isRtl ? comp.nameFa : comp.nameEn}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {isRtl ? comp.descFa : comp.descEn}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{isRtl ? "درصد تکمیل:" : "Progress:"}</span>
                    <span className="font-bold text-foreground fa-num">{compRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", comp.accent)}
                      style={{ width: `${compRate}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span>
                      {compTasks.filter((t) => t.status === "in_progress").length} {isRtl ? "در حال انجام" : "active"}
                    </span>
                    <span className="font-semibold text-primary">
                      {isSelected ? (isRtl ? "فیلتر اعمال شد ✓" : "Active Filter ✓") : (isRtl ? "مشاهده تسک‌ها ←" : "Filter tasks →")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtered Company Tasks Grid */}
        <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-foreground">
                {selectedCompanyPortfolio === "all"
                  ? (isRtl ? "کلیه تسک‌های شرکتی" : "All Corporate Tasks")
                  : `${isRtl ? "تسک‌های اختصاصی" : "Tasks for"} ${selectedCompanyPortfolio}`}
              </h3>
              <span className="text-xs text-muted-foreground">
                {displayTasks.length} {isRtl ? "مورد ثبت شده" : "items listed"}
              </span>
            </div>

            {selectedCompanyPortfolio !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCompanyPortfolio("all")}
                className="text-xs rounded-full"
              >
                <X className="size-3 mr-1 rtl:ml-1 rtl:mr-0" />
                <span>{isRtl ? "نمایش همه شرکت‌ها" : "Show all companies"}</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleOpenDetail(task)}
                className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/60">
                      {task.category}
                    </Badge>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                        task.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : task.status === "in_progress"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-indigo-500/10 text-indigo-600"
                      )}
                    >
                      {t(`status.${task.status}`)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="size-3" />
                    <span>{task.assignedToName}</span>
                  </div>
                  <span className="font-mono">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 5: ANALYTICS & KPIS VIEW                                 */
  /* ──────────────────────────────────────────────────────────── */
  const renderAnalyticsView = () => {
    return (
      <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <BarChart3 className="size-7 text-primary shrink-0" />
              <span>{isRtl ? "داشبورد تحلیلی و شاخص‌های عملکرد (KPI)" : "Task Analytics & Performance KPIs"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isRtl
                ? "پایش جامع نرخ تکمیل وظایف، توزیع اولویت‌ها و توازن بار کاری بین اعضای تیم"
                : "Real-time task completion rate, priority distribution, and team workload balance"}
            </p>
          </div>

          <Badge variant="secondary" className="px-3.5 py-1 rounded-full text-xs font-semibold self-start md:self-auto">
            {isRtl ? "داده‌های زنده سامانه ESP Core" : "Live ESP Core Telemetry"}
          </Badge>
        </div>

        {/* 6 Top Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">{t("stats.total")}</span>
              <span className="text-2xl font-bold text-foreground fa-num">{stats.total}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <CheckSquare className="size-5" />
            </div>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">{t("stats.pending")}</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 fa-num">{stats.pending}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-500/10 text-slate-500">
              <Clock className="size-5" />
            </div>
          </div>

          {/* In Progress */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mb-0.5">{t("stats.inProgress")}</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 fa-num">{stats.inProgress}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Clock className="size-5" />
            </div>
          </div>

          {/* In Review */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-pink-600 dark:text-pink-400 block mb-0.5">{t("stats.review")}</span>
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400 fa-num">{stats.review}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500">
              <FileText className="size-5" />
            </div>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-0.5">{t("stats.completed")}</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 fa-num">{stats.completed}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="p-4 rounded-3xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-primary block mb-0.5">{t("stats.rate")}</span>
              <span className="text-2xl font-bold text-primary fa-num">{stats.completionRate}%</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </div>

        {/* Priority & Workload Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Breakdown Card */}
          <div className="p-6 rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md shadow-xs">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              <span>{isRtl ? "توزیع بر اساس سطح اهمیت و فوریت" : "Priority Distribution"}</span>
            </h3>

            <div className="space-y-4">
              {[
                { key: "urgent", label: t("priority.urgent"), color: "bg-rose-500", count: tasks.filter((t) => t.priority === "urgent").length },
                { key: "high", label: t("priority.high"), color: "bg-amber-500", count: tasks.filter((t) => t.priority === "high").length },
                { key: "medium", label: t("priority.medium"), color: "bg-sky-500", count: tasks.filter((t) => t.priority === "medium").length },
                { key: "low", label: t("priority.low"), color: "bg-slate-400", count: tasks.filter((t) => t.priority === "low").length },
              ].map((item) => {
                const percent = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="text-muted-foreground fa-num">
                        {item.count} {isRtl ? "تسک" : "tasks"} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workload / Involved Projects Breakdown */}
          <div className="p-6 rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md shadow-xs">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <FolderKanban className="size-4 text-primary" />
              <span>
                {isAdmin && roleMode === "admin"
                  ? (isRtl ? "ماتریس بار کاری کارشناسان" : "Team Workload Matrix")
                  : (isRtl ? "پروژه‌ها و وضعیت مشارکت من" : "My Projects & Task Allocation")}
              </span>
            </h3>

            {isAdmin && roleMode === "admin" ? (
              <div className="space-y-3">
                {allAssignees.map((member) => {
                  const memberTasks = tasks.filter(
                    (t) => t.assignedToName === member.name || t.assignees?.some((a) => a.name === member.name)
                  );
                  const completedCount = memberTasks.filter((t) => t.status === "completed").length;
                  const memberRate = memberTasks.length > 0 ? Math.round((completedCount / memberTasks.length) * 100) : 0;

                  return (
                    <div key={member.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-foreground block">{member.name}</span>
                          <span className="text-[10px] text-muted-foreground">{member.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground fa-num">
                          {memberTasks.length} {isRtl ? "تسک" : "tasks"}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/60 fa-num">
                          {memberRate}% {isRtl ? "تکمیل" : "done"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {userInvolvedProjects.length > 0 ? (
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      {isRtl ? "پروژه‌هایی که در آن دخیل هستید:" : "Projects you are involved in:"}
                    </span>
                    {userInvolvedProjects.map((p) => {
                      const pTasks = tasks.filter((t) => t.relatedProjectId === p.id);
                      const pCompleted = pTasks.filter((t) => t.status === "completed").length;
                      const pRate = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : p.progressPercent || 0;
                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground truncate max-w-[240px]">{p.title}</span>
                            <Badge variant="outline" className="fa-num text-[10px]">{pTasks.length} {isRtl ? "تسک" : "tasks"}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{p.organization} • {p.code}</span>
                            <span className="font-semibold text-primary fa-num">{pRate}% {isRtl ? "پیشرفت" : "progress"}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pRate}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-xs text-muted-foreground text-center">
                    {isRtl ? "در حال حاضر پروژه‌ای برای این حساب کاربری ثبت نشده است." : "No active projects found for this account."}
                  </div>
                )}

                <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-border/50 text-center">
                    <span className="text-[11px] text-muted-foreground block">{isRtl ? "وظایف من" : "My Tasks"}</span>
                    <span className="font-bold text-foreground fa-num text-base">{stats.userTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border/50 text-center">
                    <span className="text-[11px] text-muted-foreground block">{isRtl ? "ابلاغی مدیر" : "Manager Defined"}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 fa-num text-base">{stats.managerCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 6: SETTINGS & ROLE PERSPECTIVE VIEW                      */
  /* ──────────────────────────────────────────────────────────── */
  const renderSettingsView = () => {
    if (!isAdmin) {
      return renderTasksWorkflowView();
    }

    return (
      <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="size-7 text-primary shrink-0" />
            <span>{isRtl ? "مدیریت نقش و پرسپکتیو کاری" : "Role Management & Workspace Perspective"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isRtl
              ? "جابجایی بین نمای نظارتی ادمین کل سازمان و میز کار شخصی کارشناسان، تفکیک وظایف و تنظیمات"
              : "Switch between organization-wide admin oversight and personalized specialist workspace"}
          </p>
        </div>

        {/* Role Toggle Card */}
        <div className="bg-white dark:bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-foreground">
            {t("roles.roleMode")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin Mode Card */}
            <div
              onClick={() => setRoleMode("admin")}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between",
                roleMode === "admin"
                  ? "border-primary bg-primary/5 text-foreground shadow-xs"
                  : "border-border/60 hover:border-border text-muted-foreground"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  {roleMode === "admin" && (
                    <Badge variant="default" className="text-[10px]">
                      {isRtl ? "فعال" : "Active"}
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">{t("roles.adminMode")}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("roles.adminBadge")}
                </p>
              </div>
            </div>

            {/* User Mode Card */}
            <div
              onClick={() => setRoleMode("user")}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between",
                roleMode === "user"
                  ? "border-emerald-600 bg-emerald-500/5 text-foreground shadow-xs"
                  : "border-border/60 hover:border-border text-muted-foreground"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <UserCheck className="size-5" />
                  </div>
                  {roleMode === "user" && (
                    <Badge className="text-[10px] bg-emerald-600 text-white">
                      {isRtl ? "فعال" : "Active"}
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">{t("roles.userMode")}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("roles.userBadge")}
                </p>
              </div>
            </div>
          </div>

          {/* Specialist Persona Switcher */}
          {roleMode === "user" && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3 animate-in fade-in">
              <label className="text-xs font-bold text-foreground block">
                {t("roles.switchPerspective")}
              </label>
              <select
                value={currentUserName}
                onChange={(e) => setCurrentUserName(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-border/70 px-3 text-xs font-semibold text-foreground cursor-pointer"
              >
                {allAssignees.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} — {a.role}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {t("roles.userNotice")}
              </p>
            </div>
          )}
        </div>

        {/* System Operations Card */}
        <div className="bg-white dark:bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-foreground">
            {isRtl ? "عملیات و نگهداری تسک‌ها" : "Task Operations & Cache"}
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                {isRtl ? "بروزرسانی مستقیم داده‌های مخزن" : "Synchronize Repository Data"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isRtl ? "بازیابی مجدد آخرین تغییرات و فایل‌های پیوست" : "Refetches latest comments, subtasks, and files"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTasks}
              className="rounded-full text-xs font-semibold"
            >
              <RefreshCw className={cn("size-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0", isLoading && "animate-spin")} />
              <span>{isRtl ? "بروزرسانی داده‌ها" : "Refresh Data"}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 8: DEDICATED FULL-PAGE TASK DETAIL VIEW                  */
  /* ──────────────────────────────────────────────────────────── */
  const renderDetailView = () => {
    const targetId = initialTaskId || queryTaskId;
    const currentTask = selectedTask
      ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
      : (targetId ? tasks.find((t) => t.id === targetId) || null : null);

    if (!currentTask) {
      if (isLoading) {
        return (
          <div className="max-w-7xl mx-auto py-24 px-4 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">
              {isRtl ? "در حال بارگذاری اطلاعات تسک..." : "Loading task details..."}
            </p>
          </div>
        );
      }

      return (
        <div className="max-w-7xl mx-auto py-16 px-4 text-center space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "تسک مورد نظر یافت نشد" : "Task not found"}
          </h3>
          <Button
            onClick={() => {
              setSelectedTask(null);
              setActiveTab("kanban");
              if (initialTaskId) {
                router.push("/dashboard/tasks");
              }
            }}
            className="rounded-full"
          >
            {isRtl ? "بازگشت به تخته کانبان" : "Back to Kanban"}
          </Button>
        </div>
      );
    }

    return (
      <TaskDetailView
        task={currentTask}
        roleMode={roleMode}
        onBack={() => {
          setSelectedTask(null);
          setActiveTab("kanban");
          if (initialTaskId) {
            router.push("/dashboard/tasks");
          }
        }}
        onUpdateStatus={changeTaskStatus}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onDeleteSubtask={deleteSubtask}
        onAddComment={addComment}
        onAddReply={addReply}
        onUploadAttachment={uploadAttachment}
        onDeleteAttachment={deleteAttachment}
        onDeleteTask={async (id) => {
          await deleteTask(id);
          setSelectedTask(null);
          setActiveTab("kanban");
          if (initialTaskId) {
            router.push("/dashboard/tasks");
          }
        }}
        onAssignCollaborator={assignCollaborator}
        onRemoveCollaborator={removeCollaborator}
        onUpdateProgress={updateProgress}
        onUpdateTask={updateTask}
        availableProjects={availableProjects}
      />
    );
  };



  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (AppHeader with tag="tasks") ── */}
      <AppHeader
        tag="tasks"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── 2. Sidebar Navigation (Directly following Profile Page Layout) ── */}
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
              {availableNavItems.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    {/* Fixed 42px circle icon - 100% fixed position, aligned with header button */}
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
                    </div>

                    {/* Smooth horizontal expansion label */}
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
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
                      <TooltipContent side={locale === "fa" ? "left" : "right"} className="text-xs font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}
            </nav>
          </TooltipProvider>
        </aside>

        {/* ── 3. Main Content Area ── */}
        <main className="flex-1 bg-transparent w-full relative z-10">
          <div className="pb-10">
            {(activeTab === "kanban" || activeTab === "table") && renderTasksWorkflowView()}
            {(activeTab === "timeline" || activeTab === "analytics") && renderTimelineView()}
            {activeTab === "create" && renderCreateView()}
            {activeTab === "detail" && renderDetailView()}
            {activeTab === "companies" && renderCompaniesView()}
            {activeTab === "settings" && renderSettingsView()}
          </div>
        </main>
      </div>
    </div>
  );
}
