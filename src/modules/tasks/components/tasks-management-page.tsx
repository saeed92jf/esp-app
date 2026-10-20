// src/modules/tasks/components/tasks-management-page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Kanban,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useTasks } from "../hooks/use-tasks";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { TaskBoard } from "./task-board";
import { TaskTable } from "./task-table";
import { TaskTimelineBar } from "./task-timeline-bar";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { TaskCreateDialog } from "./task-create-dialog";
import { AppHeader } from "@/components/layout/app-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TaskTab = "kanban" | "table" | "timeline" | "companies" | "analytics" | "settings";

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
    labelFa: "تخته کانبان",
    labelEn: "Kanban Board",
    icon: Kanban,
    descriptionFa: "تخته چابک بصری برای مدیریت وضعیت جریان کار",
    descriptionEn: "Visual agile workflow across task stages",
  },
  {
    id: "table",
    labelFa: "جدول و فهرست",
    labelEn: "Table & List",
    icon: ListIcon,
    descriptionFa: "فهرست جدولی با فیلترهای پیشرفته و دسته‌بندی",
    descriptionEn: "Tabular data view with column filters and sorting",
  },
  {
    id: "timeline",
    labelFa: "خط زمانی و فازبندی",
    labelEn: "Timeline & Roadmap",
    icon: Clock,
    descriptionFa: "نقشه راه، فازبندی پروژه‌ها و مهلت‌های تحویل",
    descriptionEn: "Engineering roadmap and milestone deadlines",
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
    id: "analytics",
    labelFa: "آمار و تحلیل",
    labelEn: "Analytics & KPIs",
    icon: BarChart3,
    descriptionFa: "شاخص‌های عملکرد، ماتریس بار کاری و نرخ تکمیل",
    descriptionEn: "Performance KPIs, workload matrix, and completion rates",
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

export function TasksManagementPage() {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const { user } = useAuth();
  const initialRole = user?.role === "admin" ? "admin" : "user";
  const defaultUserName = user?.fullNameFa || user?.fullName || "سعید جلیلی";

  const {
    tasks,
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

  const [activeTab, setActiveTab] = useState<TaskTab>("kanban");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("pending");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected company state for company portfolio tab
  const [selectedCompanyPortfolio, setSelectedCompanyPortfolio] = useState<string>("all");

  const searchParams = useSearchParams();
  const queryTaskId = searchParams?.get("taskId");

  useEffect(() => {
    if (queryTaskId && tasks.length > 0) {
      const found = tasks.find((t) => t.id === queryTaskId);
      if (found) {
        setSelectedTask(found);
        setIsDetailOpen(true);
      }
    }
  }, [queryTaskId, tasks]);

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleOpenCreateWithStatus = (status: TaskStatus = "pending") => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  const companyList = [
    { id: "all", label: t("companies.all") },
    { id: "یورو اسلات پارس", label: t("companies.euroslot") },
    { id: "نانو پالایش سرام", label: t("companies.nano") },
    { id: "پترو اسپادانا", label: t("companies.petro") },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.company !== "all" ||
    filters.isManagerOnly;

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 1: KANBAN BOARD VIEW                                     */
  /* ──────────────────────────────────────────────────────────── */
  const renderKanbanView = () => (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      {/* View Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isRtl ? "تخته کانبان گردش کار" : "Agile Kanban Workflow"}
            </h1>
            <Badge variant="outline" className="fa-num border-primary/30 text-primary font-semibold text-xs">
              {filteredTasks.length} {t("timeline.tasksCount")}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isRtl
              ? "مدیریت تسک‌ها با کشیدن و رها کردن در ستون‌های کارها، در دست اقدام، بازبینی و انجام‌شده"
              : "Drag and drop tasks between To Do, In Progress, Review, and Done stages"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Quick Search */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isRtl ? "جستجوی زنده..." : "Filter tasks..."}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="h-9 ps-8 pe-3 text-xs rounded-full bg-card/70 border-border/70"
            />
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={refreshTasks}
            className="rounded-full shadow-2xs hover:bg-muted"
            title={isRtl ? "بروزرسانی داده‌ها" : "Refresh"}
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>

          <Button
            onClick={() => handleOpenCreateWithStatus("pending")}
            className="rounded-full h-9 px-4 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Plus className="size-4" />
            <span>{t("newTask")}</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="rounded-3xl border border-border/60 bg-white/50 dark:bg-card/40 backdrop-blur-sm p-4 sm:p-6 shadow-xs">
        <TaskBoard
          tasks={filteredTasks}
          onSelectTask={handleOpenDetail}
          onUpdateStatus={changeTaskStatus}
          onOpenCreate={handleOpenCreateWithStatus}
        />
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 2: TABLE & LIST VIEW                                     */
  /* ──────────────────────────────────────────────────────────── */
  const renderTableView = () => (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isRtl ? "فهرست و جدول تسک‌ها" : "Task Table & Data List"}
            </h1>
            <Badge variant="outline" className="fa-num border-primary/30 text-primary font-semibold text-xs">
              {filteredTasks.length} {t("timeline.tasksCount")}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isRtl
              ? "مشاهده کلیه جزئیات تسک‌ها با امکان مرتب‌سازی، فیلتر ترکیبی و اعمال عملیات گروهی"
              : "Comprehensive tabular view with sorting, multi-attribute filtering, and quick actions"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => handleOpenCreateWithStatus("pending")}
            className="rounded-full h-9 px-4 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Plus className="size-4" />
            <span>{t("newTask")}</span>
          </Button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md p-4 sm:p-5 shadow-xs mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search")}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="h-10 ps-9 pe-8 text-xs rounded-2xl bg-card border-border/60"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <Combobox
            value={filters.status}
            onChange={(val) => setFilters((prev) => ({ ...prev, status: val as any }))}
            options={[
              { value: "all", label: t("filters.allStatus") },
              { value: "pending", label: t("status.pending") },
              { value: "in_progress", label: t("status.in_progress") },
              { value: "review", label: t("status.review") },
              { value: "completed", label: t("status.completed") },
            ]}
            placeholder={t("filters.allStatus")}
            className="h-10 rounded-2xl text-xs bg-card border-border/60"
          />

          {/* Priority Dropdown */}
          <Combobox
            value={filters.priority}
            onChange={(val) => setFilters((prev) => ({ ...prev, priority: val as any }))}
            options={[
              { value: "all", label: t("filters.allPriority") },
              { value: "urgent", label: t("priority.urgent") },
              { value: "high", label: t("priority.high") },
              { value: "medium", label: t("priority.medium") },
              { value: "low", label: t("priority.low") },
            ]}
            placeholder={t("filters.allPriority")}
            className="h-10 rounded-2xl text-xs bg-card border-border/60"
          />

          {/* Company Dropdown */}
          <Combobox
            value={filters.company}
            onChange={(val) => setFilters((prev) => ({ ...prev, company: val }))}
            options={companyList.map((c) => ({ value: c.id, label: c.label }))}
            placeholder={t("filters.allCompanies")}
            className="h-10 rounded-2xl text-xs bg-card border-border/60"
          />
        </div>

        {/* Filter Utilities */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={filters.isManagerOnly}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    isManagerOnly: e.target.checked,
                  }))
                }
                className="rounded border-border/70 text-primary focus:ring-primary size-4"
              />
              <span>{t("filters.managerOnly")}</span>
            </label>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  priority: "all",
                  category: "all",
                  company: "all",
                  assignee: "all",
                  isManagerOnly: false,
                })
              }
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-3 rounded-full"
            >
              <X className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
              <span>{t("filters.clear")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Component */}
      <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md overflow-hidden shadow-xs">
        <TaskTable
          tasks={filteredTasks}
          roleMode={roleMode}
          onSelectTask={handleOpenDetail}
          onUpdateStatus={changeTaskStatus}
          onDeleteTask={deleteTask}
        />
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 3: TIMELINE & ROADMAP VIEW                               */
  /* ──────────────────────────────────────────────────────────── */
  const renderTimelineView = () => (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Clock className="size-7 text-primary shrink-0" />
            <span>{isRtl ? "خط زمانی و فازبندی پروژه‌ها" : "Project Timeline & Roadmap"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isRtl
              ? "برنامه‌ریزی زمانی، تحویل مهندسی، موعد بازبینی نقشه‌ها و مایلستون‌های کلیدی ASME / API"
              : "Engineering milestones, delivery deadlines, and ASME/API review schedules"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-primary/30 text-primary">
            {isRtl ? "نرخ تحقق برنامه زمانی:" : "Timeline Adherence:"} {stats.completionRate}%
          </Badge>
        </div>
      </div>

      {/* Interactive Timeline Bar Component */}
      <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md p-4 sm:p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <span>{t("timeline.title")}</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {isRtl ? "برای مشاهده مشخصات، روی نوار هر تسک کلیک کنید" : "Click on any milestone bar to view details"}
          </span>
        </div>
        <TaskTimelineBar
          tasks={filteredTasks}
          selectedTaskId={selectedTask?.id}
          onSelectTask={handleOpenDetail}
        />
      </div>

      {/* Engineering Milestone Chronology */}
      <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md p-6 shadow-xs">
        <h3 className="font-bold text-base text-foreground mb-4">
          {isRtl ? "جدول توالی مایلستون‌های فعال" : "Active Engineering Milestones"}
        </h3>

        <div className="space-y-3">
          {filteredTasks.slice(0, 8).map((task) => (
            <div
              key={task.id}
              onClick={() => handleOpenDetail(task)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-2.5 rounded-full",
                    task.status === "completed"
                      ? "bg-emerald-500"
                      : task.status === "in_progress"
                      ? "bg-amber-500 animate-pulse"
                      : task.status === "review"
                      ? "bg-pink-500"
                      : "bg-indigo-500"
                  )}
                />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span>{task.company}</span>
                    <span>•</span>
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>{task.assignedToName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-end">
                  <span className="text-xs font-mono font-semibold text-foreground block">
                    {task.dueDate}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {task.progressPercent}% {isRtl ? "پیشرفت" : "progress"}
                  </span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground rtl:rotate-180 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 4: COMPANY PORTFOLIO VIEW                                */
  /* ──────────────────────────────────────────────────────────── */
  const renderCompaniesView = () => {
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
      {
        id: "پترو اسپادانا",
        nameFa: "پترو اسپادانا",
        nameEn: "Petro Espadana",
        badge: "پایپینگ و کنترل فشار",
        descFa: "تجهیزات خطوط انتقال، شیرآلات صنعتی فشار قوی، چک‌ولوها و اسپول‌های مهندسی",
        descEn: "High-pressure valves, piping spools, and skid instrumentation packages",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        accent: "bg-amber-600",
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

        {/* 3 Company Portfolio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Team Workload Matrix */}
          <div className="p-6 rounded-3xl border border-border/60 bg-white/80 dark:bg-card/70 backdrop-blur-md shadow-xs">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>{isRtl ? "ماتریس بار کاری کارشناسان" : "Team Workload Matrix"}</span>
            </h3>

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
          </div>
        </div>
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 6: SETTINGS & ROLE PERSPECTIVE VIEW                      */
  /* ──────────────────────────────────────────────────────────── */
  const renderSettingsView = () => {
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
  /* FOOTER COMPONENT                                             */
  /* ──────────────────────────────────────────────────────────── */
  const renderFooter = () => (
    <footer className="w-full border-t border-border/50 bg-white/70 dark:bg-card/70 backdrop-blur-md px-4 sm:px-8 py-3 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2 shrink-0 z-20">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-foreground">
          {isRtl ? "سامانه تسک‌های مرکزی یورواسلات" : "Euroslot Central Task System"}
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline text-[11px]">
          {isRtl ? `دیدگاه فعال: ${currentUserName} (${roleMode === "admin" ? "ادمین" : "کارشناس"})` : `Perspective: ${currentUserName}`}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {isRtl ? "بازگشت به داشبورد" : "Dashboard"}
        </Link>
        <span>•</span>
        <Link href="/" className="hover:text-foreground transition-colors">
          {isRtl ? "صفحه نخست" : "Home"}
        </Link>
        <span>•</span>
        <span className="font-mono text-muted-foreground/80">ESP Core v2.4</span>
      </div>
    </footer>
  );

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-panel dark:bg-background font-sans w-full overflow-hidden relative">
      {/* ── 1. Top Unified Header (AppHeader with tag="tasks") ── */}
      <AppHeader
        tag="tasks"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
        position="absolute"
      />

      <div className="flex flex-1 overflow-hidden w-full relative pt-[72px]">
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
            "flex flex-col shrink-0 h-full bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none",
            "absolute md:relative start-0 top-0",
            sidebarOpen
              ? "w-64 ps-3 sm:ps-6 pe-4 py-6 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "-translate-x-full rtl:translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto md:w-[90px] md:ps-6 md:pe-6 md:py-6"
          )}
        >
          <TooltipProvider>
            <nav className="flex flex-col gap-2.5 w-full items-start">
              {NAV_ITEMS.map((item) => {
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
                    {/* Fixed 42px circle icon */}
                    <div className="aspect-square h-full shrink-0 flex items-center justify-center">
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
                          ? "opacity-100 max-w-[170px] pe-4 ps-1.5"
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

        {/* ── 3. Main Scrollable Content Area with Footer ── */}
        <main className="flex-1 overflow-y-auto bg-transparent h-full w-full relative z-10 flex flex-col justify-between">
          <div className="flex-1 pb-10">
            {activeTab === "kanban" && renderKanbanView()}
            {activeTab === "table" && renderTableView()}
            {activeTab === "timeline" && renderTimelineView()}
            {activeTab === "companies" && renderCompaniesView()}
            {activeTab === "analytics" && renderAnalyticsView()}
            {activeTab === "settings" && renderSettingsView()}
          </div>

          {/* Bottom Footer */}
          {renderFooter()}
        </main>
      </div>

      {/* ── 4. Modals & Drawers ── */}
      <TaskDetailDrawer
        task={selectedTask}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        roleMode={roleMode}
        onUpdateStatus={changeTaskStatus}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onAddComment={addComment}
        onAddReply={addReply}
        onUploadAttachment={uploadAttachment}
        onDeleteAttachment={deleteAttachment}
        onDeleteTask={deleteTask}
        onAssignCollaborator={assignCollaborator}
        onRemoveCollaborator={removeCollaborator}
        onUpdateProgress={updateProgress}
      />

      <TaskCreateDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={createTask}
        categories={categories}
        companies={companies}
        defaultStatus={createDefaultStatus}
      />
    </div>
  );
}
