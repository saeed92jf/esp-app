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
import { cn } from "@/lib/utils";

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

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("pending");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-background text-foreground fa-num pb-16">
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-white/80 dark:bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="size-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-2xs"
              title="بازگشت به داشبورد"
            >
              {isRtl ? (
                <ArrowRight className="size-4" />
              ) : (
                <ArrowLeft className="size-4" />
              )}
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <CheckSquare className="size-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-bold text-foreground">
                  {t("title")}
                </h1>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  {t("subtitle")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role View Toggle (Admin vs User) */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/50">
              <button
                type="button"
                onClick={() => setRoleMode("admin")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  roleMode === "admin"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("roles.adminMode")}
              >
                <ShieldCheck className="size-3.5" />
                <span className="hidden sm:inline">{t("roles.adminMode")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleMode("user")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  roleMode === "user"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("roles.userMode")}
              >
                <UserCheck className="size-3.5" />
                <span className="hidden sm:inline">{t("roles.userMode")}</span>
              </button>
            </div>

            {/* Persona Selector when in User Mode */}
            {roleMode === "user" && allAssignees.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-xl px-2 py-1 text-xs">
                <span className="text-[11px] text-muted-foreground">{t("roles.switchPerspective")}</span>
                <select
                  value={currentUserName}
                  onChange={(e) => setCurrentUserName(e.target.value)}
                  className="h-6 rounded-md bg-background border border-border/60 px-1.5 text-xs font-semibold cursor-pointer text-foreground"
                >
                  {allAssignees.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/50">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                  viewMode === "kanban"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("views.kanban")}
              >
                <Kanban className="size-4" />
                <span className="hidden md:inline">{t("views.kanban")}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                  viewMode === "list"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("views.list")}
              >
                <ListIcon className="size-4" />
                <span className="hidden md:inline">{t("views.list")}</span>
              </button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={refreshTasks}
              className="rounded-xl text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
              title="بروزرسانی"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>

            {/* New Task Button */}
            <Button
              type="button"
              onClick={() => handleOpenCreateWithStatus("pending")}
              className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs h-9 px-3.5"
            >
              <Plus className="size-4" />
              <span>{t("newTask")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col gap-5">
        {/* ── Role Banner (Admin Oversight vs User Personal Workspace) ── */}
        {roleMode === "admin" ? (
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">
                  {t("roles.adminMode")} - {t("roles.adminBadge")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  نظارت بر کلیه تسک‌های سازمانی، پایش بار کاری اعضای تیم و ابلاغ وظایف جدید با اختیارات مدیریتی
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary fa-num font-semibold shrink-0 self-end sm:self-auto text-xs">
              {stats.allTotal || stats.total} تسک کل سازمان • {allAssignees.length} عضو تیم
            </Badge>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <UserCheck className="size-4" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">
                  {t("roles.userBadge")} ({currentUserName})
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {t("roles.userNotice")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Badge variant="secondary" className="bg-emerald-600 text-white fa-num font-semibold text-xs">
                {stats.total} تسک محوله به شما
              </Badge>
            </div>
          </div>
        )}

        {/* ── Company Segregation Bar (یورو اسلات پارس، نانو پالایش سرام، پترو اسپادانا) ── */}
        <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/80 dark:bg-card/70 border border-border/60 shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground px-2 flex items-center gap-1.5 shrink-0">
              <Building2 className="size-3.5 text-primary" />
              <span>{t("company")}:</span>
            </span>

            {companyList.map((comp) => {
              const isSelected =
                (filters.company || "all") === comp.id ||
                (comp.id === "all" && (!filters.company || filters.company === "all"));
              const compCount =
                comp.id === "all"
                  ? tasks.length
                  : tasks.filter((t) => t.company === comp.id).length;

              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      company: comp.id,
                    }))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <span>{comp.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {compCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground pe-2">
            <span>{t("stats.rate")}:</span>
            <span className="font-bold text-primary">{stats.completionRate}%</span>
          </div>
        </div>

        {/* ── Interactive Timeline / Roadmap Bar (Matching reference UI) ── */}
        <TaskTimelineBar
          tasks={filteredTasks}
          selectedTaskId={selectedTask?.id}
          onSelectTask={handleOpenDetail}
        />

        {/* ── Top Metric KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">
                {t("stats.total")}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.total}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="size-4 sm:size-5" />
            </div>
          </div>

          {/* Pending */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">
                {t("stats.pending")}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                {stats.pending}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-500/10 text-slate-500">
              <Clock className="size-4 sm:size-5" />
            </div>
          </div>

          {/* In Progress */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mb-0.5">
                {t("stats.inProgress")}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.inProgress}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="size-4 sm:size-5" />
            </div>
          </div>

          {/* In Review */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-pink-600 dark:text-pink-400 block mb-0.5">
                {t("stats.review")}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
                {stats.review}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-pink-500/10 text-pink-500">
              <FileText className="size-4 sm:size-5" />
            </div>
          </div>

          {/* Completed */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-0.5">
                {t("stats.completed")}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completed}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4 sm:size-5" />
            </div>
          </div>

          {/* Manager Assigned */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mb-0.5 font-medium flex items-center gap-1">
                <ShieldAlert className="size-3" />
                <span>{t("stats.manager")}</span>
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.managerCount}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="size-4 sm:size-5" />
            </div>
          </div>
        </div>

        {/* ── Filters & Search Toolbar (Matching reference UI) ── */}
        <div className="p-3 sm:p-4 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/70 backdrop-blur-xs shadow-2xs flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder={t("search")}
                className="ps-9 h-10 text-xs sm:text-sm rounded-xl bg-muted/20 border-border/60"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <Combobox
                options={[
                  { value: "all", label: t("filters.allStatus") },
                  { value: "pending", label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "review", label: "Review" },
                  { value: "completed", label: "Done" },
                ]}
                value={filters.status}
                onChange={(val: string) =>
                  setFilters((prev) => ({ ...prev, status: val }))
                }
                className="h-9 text-xs rounded-xl w-[125px]"
              />

              {/* Priority Filter */}
              <Combobox
                options={[
                  { value: "all", label: t("filters.allPriority") },
                  { value: "urgent", label: t("priority.urgent") },
                  { value: "high", label: t("priority.high") },
                  { value: "medium", label: t("priority.medium") },
                  { value: "low", label: t("priority.low") },
                ]}
                value={filters.priority}
                onChange={(val: string) =>
                  setFilters((prev) => ({ ...prev, priority: val }))
                }
                className="h-9 text-xs rounded-xl w-[120px]"
              />

              {/* Category Filter */}
              {categories.length > 0 && (
                <Combobox
                  options={[
                    { value: "all", label: t("filters.allCategories") },
                    ...categories.map((cat) => ({ value: cat, label: cat })),
                  ]}
                  value={filters.category}
                  onChange={(val: string) =>
                    setFilters((prev) => ({ ...prev, category: val }))
                  }
                  className="h-9 text-xs rounded-xl w-[130px]"
                />
              )}

              {/* Assignee Filter (Only in Admin Mode) */}
              {roleMode === "admin" && allAssignees.length > 0 && (
                <Combobox
                  options={[
                    { value: "all", label: t("roles.allAssignees") },
                    ...allAssignees.map((a) => ({
                      value: a.name,
                      label: `${a.name} (${a.role})`,
                    })),
                  ]}
                  value={filters.assignee || "all"}
                  onChange={(val: string) =>
                    setFilters((prev) => ({ ...prev, assignee: val }))
                  }
                  className="h-9 text-xs rounded-xl w-[170px]"
                />
              )}

              {/* Manager Tasks Only Toggle */}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    isManagerOnly: !prev.isManagerOnly,
                  }))
                }
                className={cn(
                  "h-9 px-3 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer select-none",
                  filters.isManagerOnly
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                    : "bg-muted/20 border-border/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldAlert className="size-3.5" />
                <span>{t("filters.managerOnly")}</span>
              </button>

              {/* Clear Filters */}
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
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                >
                  <X className="size-3.5" />
                  <span>{t("filters.clear")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content Area: Kanban Board OR Table List ── */}
        <div className="w-full">
          {viewMode === "kanban" ? (
            <TaskBoard
              tasks={filteredTasks}
              onSelectTask={handleOpenDetail}
              onUpdateStatus={changeTaskStatus}
              onOpenCreate={handleOpenCreateWithStatus}
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              roleMode={roleMode}
              onSelectTask={handleOpenDetail}
              onUpdateStatus={changeTaskStatus}
              onDeleteTask={deleteTask}
            />
          )}
        </div>
      </main>

      {/* ── Modals & Drawers ── */}
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
