// src/modules/tasks/components/TasksPage.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Kanban,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  X,
  ListChecks,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { newTasksService, NewTask } from "../services/new-tasks.service";
import { TaskCreateWizard } from "./TaskCreateWizard";
import { AdminRoadmapView } from "./AdminRoadmapView";
import { TaskProgressView } from "./TaskProgressView";
import { UserTasksView } from "./UserTasksView";

type TaskTab = "kanban" | "create";

interface NavItem {
  id: TaskTab;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

function isAdminRole(role?: string): boolean {
  return role === "superadmin" || role === "admin";
}

export function TasksPage({ initialTaskId }: { initialTaskId?: string } = {}) {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const isAdmin = isAdminRole(user?.role);
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<NewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TaskTab>(() => {
    const tab = searchParams?.get("tab");
    const isNew = searchParams?.get("new");
    return isNew === "true" || tab === "create" ? "create" : "kanban";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<NewTask | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const targetTaskId = initialTaskId || searchParams?.get("id");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Admin sees all tasks; regular users see only their assigned tasks
      const params = isAdmin ? undefined : { assigneeId: user?.id };
      const data = await newTasksService.getTasks(params);
      setTasks(data);

      if (targetTaskId) {
        const found = data.find((t) => t.id === targetTaskId);
        if (found) {
          setSelectedTask(found);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user?.id, targetTaskId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    setIsRefreshing(false);
  };

  const handleTaskCreated = (newTask: NewTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setActiveTab("kanban");
  };

  const handleTaskUpdated = (updatedTask: NewTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Nav items: Kanaban (Roadmap) + Create Task for Admin; My Tasks for regular user
  const navItems: NavItem[] = useMemo(() => {
    if (isAdmin) {
      return [
        { id: "kanban", labelFa: "تخته کانبان و نقشه راه", labelEn: "Kanban Roadmap", icon: Kanban },
        { id: "create", labelFa: "ایجاد تسک جدید", labelEn: "New Task", icon: PlusCircle },
      ];
    }
    return [
      { id: "kanban", labelFa: "تسک‌های من", labelEn: "My Tasks", icon: ListChecks },
    ];
  }, [isAdmin]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header ── */}
      <AppHeader
        tag={isRtl ? "مدیریت تسک‌ها" : "Task Management"}
        subTag={
          selectedTask
            ? selectedTask.title
            : isAdmin
            ? activeTab === "create"
              ? isRtl ? "ایجاد تسک جدید" : "Create New Task"
              : isRtl ? "تخته کانبان و نقشه راه" : "Kanban Roadmap"
            : isRtl ? "تسک‌های محوله من" : "My Assigned Tasks"
        }
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

        {/* ── 2. Unified Collapsible Sidebar Navigation ── */}
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !selectedTask;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setActiveTab(item.id);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
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
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
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
        <main className="flex-1 bg-transparent w-full relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto">
          {/* Header Action / Summary Toolbar */}
          {!selectedTask && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
                    <span>{isRtl ? "تخته کانبان و گردش کار تسک‌ها" : "Task Kanban & Workflow"}</span>
                    {isAdmin && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary font-semibold">
                        {isRtl ? "پنل مدیریت" : "Admin Panel"}
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {isAdmin
                      ? (isRtl ? "پایش، جابجایی و تایید مراحل اجرای تسک‌ها در تخته کانبان" : "Monitor, navigate, and approve tasks directly on the Kanban board")
                      : (isRtl ? "مشاهده تسک‌های محوله، ارسال گزارش پیشرفت و دریافت بازخورد مدیر" : "View assigned tasks, report progress, and receive manager feedback")}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="rounded-xl gap-2 h-10 shadow-2xs"
                  >
                    <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                    <span>{isRtl ? "بروزرسانی" : "Refresh"}</span>
                  </Button>

                  {isAdmin && activeTab !== "create" && (
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="rounded-xl gap-2 h-10 font-bold shadow-xs"
                    >
                      <PlusCircle className="size-4" />
                      <span>{isRtl ? "تسک جدید" : "New Task"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Top Stats Metric Strip */}
              {isAdmin && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: isRtl ? "کل تسک‌ها" : "Total", value: stats.total, color: "text-foreground" },
                    { label: isRtl ? "برای انجام" : "Todo", value: stats.todo, color: "text-slate-500" },
                    { label: isRtl ? "در حال انجام" : "In Progress", value: stats.inProgress, color: "text-amber-500" },
                    { label: isRtl ? "بازبینی" : "Review", value: stats.review, color: "text-pink-500" },
                    { label: isRtl ? "انجام‌شده" : "Done", value: stats.done, color: "text-emerald-500" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-card rounded-2xl border border-border/60 p-3.5 flex items-center justify-between shadow-2xs"
                    >
                      <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                      <span className={cn("text-xl font-bold fa-num", s.color)}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">{isRtl ? "در حال بارگذاری اطلاعات..." : "Loading tasks data..."}</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="size-10 text-destructive mx-auto" />
              <h3 className="font-bold text-lg text-foreground">{isRtl ? "خطا در بارگذاری تسک‌ها" : "Failed to load tasks"}</h3>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button onClick={fetchTasks} className="rounded-xl">
                {isRtl ? "تلاش مجدد" : "Retry"}
              </Button>
            </div>
          ) : selectedTask ? (
            /* Selected Task Progress Thread View */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-card px-3.5 py-2 rounded-xl border border-border/50 w-fit"
              >
                <X className="size-4" />
                <span>{isRtl ? "بازگشت به تخته کانبان" : "Back to Kanban"}</span>
              </button>

              <TaskProgressView
                task={selectedTask}
                currentUser={user!}
                isAdmin={isAdmin}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={() => handleTaskDeleted(selectedTask.id)}
              />
            </div>
          ) : isAdmin ? (
            /* Admin Views: Kanban Roadmap or Create Wizard */
            <AnimatePresence mode="wait">
              {activeTab === "kanban" && (
                <motion.div
                  key="admin-kanban"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <AdminRoadmapView
                    tasks={tasks}
                    onSelectTask={setSelectedTask}
                  />
                </motion.div>
              )}

              {activeTab === "create" && (
                <motion.div
                  key="admin-create"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <TaskCreateWizard
                    currentUser={user!}
                    onTaskCreated={handleTaskCreated}
                    onCancel={() => setActiveTab("kanban")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* Regular User View: Only Assigned Tasks */
            <UserTasksView
              tasks={tasks}
              currentUser={user!}
              onRefresh={fetchTasks}
              onTasksChange={setTasks}
            />
          )}
        </main>
      </div>
    </div>
  );
}
