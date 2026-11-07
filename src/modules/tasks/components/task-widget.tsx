// src/modules/tasks/components/task-widget.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Check,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  FolderKanban,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { newTasksService, NewTask } from "../services/new-tasks.service";
import { cn } from "@/lib/utils";

type TaskFilterTab = "all" | "my" | "in_progress" | "review" | "done";

export function TaskWidget() {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [tasks, setTasks] = useState<NewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quickTitle, setQuickTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<TaskFilterTab>(isAdmin ? "all" : "my");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await newTasksService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error("Failed to load tasks in TaskWidget:", err);
      setError(err?.message || "خطا در دریافت تسک‌ها");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    const handleSync = () => {
      fetchTasks();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("esp_tasks_change", handleSync);
      window.addEventListener("storage", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("esp_tasks_change", handleSync);
        window.removeEventListener("storage", handleSync);
      }
    };
  }, [fetchTasks]);

  // Check if a task belongs to or was created by the active user
  const isUserTask = useCallback(
    (task: NewTask) => {
      if (!user) return false;
      const uid = String(user.id || "").toLowerCase();
      const uNameFa = (user.fullNameFa || "").toLowerCase();
      const uName = (user.fullName || "").toLowerCase();
      const uEmail = (user.email || "").toLowerCase();

      // Check assignees
      const isAssigned = (task.assignees || []).some((a) => {
        const aId = String(a.userId || "").toLowerCase();
        const aName = String(a.name || "").toLowerCase();
        const aEmail = String(a.email || "").toLowerCase();
        return (
          (aId && aId === uid) ||
          (uNameFa && aName.includes(uNameFa)) ||
          (uName && aName.includes(uName)) ||
          (uEmail && aEmail.includes(uEmail))
        );
      });

      // Check creator
      const isCreator =
        String(task.created_by || "").toLowerCase() === uid ||
        (uNameFa && String(task.created_by_name || "").toLowerCase().includes(uNameFa)) ||
        (uName && String(task.created_by_name || "").toLowerCase().includes(uName));

      return isAssigned || isCreator;
    },
    [user]
  );

  // Compute live statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const review = tasks.filter((t) => t.status === "review").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const myCount = tasks.filter(isUserTask).length;

    return {
      total,
      remaining: todo + inProgress,
      todo,
      inProgress,
      review,
      done,
      myCount,
    };
  }, [tasks, isUserTask]);

  // Filtered tasks
  const displayedTasks = useMemo(() => {
    let list = tasks;

    // For non-admin, restrict to their tasks unless explicitly viewing all
    if (!isAdmin && filterTab === "all") {
      list = list.filter(isUserTask);
    } else if (filterTab === "my") {
      list = list.filter(isUserTask);
    } else if (filterTab === "in_progress") {
      list = list.filter((t) => t.status === "in_progress");
      if (!isAdmin) list = list.filter(isUserTask);
    } else if (filterTab === "review") {
      list = list.filter((t) => t.status === "review");
      if (!isAdmin) list = list.filter(isUserTask);
    } else if (filterTab === "done") {
      list = list.filter((t) => t.status === "done");
      if (!isAdmin) list = list.filter(isUserTask);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.project_esp_number && t.project_esp_number.toLowerCase().includes(q)) ||
          (t.project_name && t.project_name.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
          (t.assignees && t.assignees.some((a) => a.name.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [tasks, filterTab, searchQuery, isUserTask, isAdmin]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const currentUserName = user?.fullNameFa || user?.fullName || "سعید جلیلی";
      const currentUserId = user?.id || "usr_9801";

      const created = await newTasksService.createTask({
        title: quickTitle.trim(),
        description: "",
        subtasks: [],
        assignees: [
          {
            userId: currentUserId,
            name: currentUserName,
            email: user?.email,
            role: user?.role,
          },
        ],
        created_by: currentUserId,
        created_by_name: currentUserName,
        priority: "medium",
        company: "یورو اسلات پارس",
        tags: ["سریع"],
        is_independent: true,
      });

      setTasks((prev) => [created, ...prev]);
      setQuickTitle("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("esp_tasks_change"));
      }
    } catch (err) {
      console.error("Failed to quick create task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return {
          label: "انجام شده",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
      case "review":
        return {
          label: "در انتظار بازبینی",
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        };
      case "in_progress":
        return {
          label: "در حال انجام",
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        };
      case "todo":
      default:
        return {
          label: "برای انجام",
          className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
        };
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 fa-num bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container">
      {/* ── Widget Header ── */}
      <div className="flex items-center justify-between gap-2 px-1 mb-3 pe-18 sm:pe-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0 text-primary">
            <CheckSquare className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 shrink-0">
              {t("widget.title")}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {stats.remaining} {t("widget.remaining")} • {stats.review} در انتظار تایید
            </span>
          </div>
        </div>

        {/* Link to Full Task Management Page */}
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors border border-primary/20 shrink-0"
        >
          <span>{t("manageAll")}</span>
          <ArrowUpRight className="size-3.5 rtl:rotate-270" />
        </Link>
      </div>

      {/* ── Compact Filter Pills ── */}
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5 overflow-x-auto no-scrollbar">
        {isAdmin && (
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={cn(
              "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
              filterTab === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
            )}
          >
            {t("tabs.all")} ({stats.total})
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilterTab("my")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "my"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          تسک‌های من ({stats.myCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("in_progress")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "in_progress"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("tabs.inProgress")} ({stats.inProgress})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("review")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "review"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-purple-600 dark:text-purple-400 hover:text-foreground border-border/40"
          )}
        >
          بازبینی ({stats.review})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("done")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "done"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          انجام‌شده ({stats.done})
        </button>
      </div>

      {/* ── Quick Add Input ── */}
      <form onSubmit={handleQuickAdd} className="mb-3 flex items-center gap-1.5">
        <Input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder={t("widget.quickAdd")}
          className="h-8.5 text-xs rounded-xl bg-muted/20 border-border/60"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!quickTitle.trim() || isSubmitting}
          className="h-8.5 px-3 rounded-xl gap-1 text-xs font-medium cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{isSubmitting ? "ثبت..." : t("subtasks.add")}</span>
        </Button>
      </form>

      {/* ── Scrollable Tasks List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 min-h-[140px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground/60 py-8 gap-2">
            <RefreshCw className="size-4 animate-spin text-primary" />
            <span>در حال بارگذاری تسک‌ها...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-rose-500 py-8 gap-2">
            <AlertCircle className="size-6 text-rose-500" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTasks}
              className="text-xs h-7 rounded-lg mt-1"
            >
              تلاش مجدد
            </Button>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground/60 select-none py-6">
            {t("widget.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-2">
            {displayedTasks.map((task) => {
              const isCompleted = task.status === "done";
              const statusMeta = getStatusBadge(task.status);
              const completedSubtasks = (task.subtasks || []).filter((s) => s.is_done).length;
              const totalSubtasks = (task.subtasks || []).length;
              const firstAssignee = task.assignees?.[0]?.name;

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    router.push(`/tasks?id=${encodeURIComponent(task.id)}`);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all duration-150 cursor-pointer shadow-2xs group select-none",
                    isCompleted
                      ? "bg-muted/20 border-border/30 opacity-75"
                      : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-primary/40 hover:bg-white dark:hover:bg-card hover:shadow-xs"
                  )}
                >
                  {/* Top: Title and Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          "size-4 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : task.status === "review"
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-600"
                            : task.status === "in_progress"
                            ? "border-blue-500/50 bg-blue-500/10 text-blue-600"
                            : "border-border/80 bg-background"
                        )}
                      >
                        {isCompleted && <Check className="size-2.5 stroke-[3]" />}
                      </div>

                      <span
                        className={cn(
                          "text-xs font-medium truncate",
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground group-hover:text-primary transition-colors"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-semibold border",
                          getPriorityBadgeClass(task.priority)
                        )}
                      >
                        {task.priority === "critical"
                          ? "بحرانی"
                          : task.priority === "high"
                          ? "بالا"
                          : task.priority === "medium"
                          ? "متوسط"
                          : "عادی"}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Project & Subtasks */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground gap-2 pt-0.5">
                    <div className="flex items-center gap-2 truncate">
                      {task.project_esp_number ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded border border-primary/20 shrink-0 font-medium">
                          <FolderKanban className="size-2.5" />
                          <span>{task.project_esp_number}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70">مستقل</span>
                      )}

                      {firstAssignee && (
                        <span className="inline-flex items-center gap-0.5 truncate text-muted-foreground/90">
                          <UserIcon className="size-2.5 shrink-0" />
                          <span className="truncate">{firstAssignee}</span>
                        </span>
                      )}
                    </div>

                    {totalSubtasks > 0 && (
                      <span className="text-[10px] text-muted-foreground/80 shrink-0 font-mono">
                        {completedSubtasks}/{totalSubtasks} زیروظیفه
                      </span>
                    )}
                  </div>

                  {/* Bottom: Status & Due Date */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-medium border",
                        statusMeta.className
                      )}
                    >
                      {statusMeta.label}
                    </span>

                    {task.deadline ? (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {task.deadline}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-primary group-hover:underline text-[10px]">
                        <span>مشاهده</span>
                        <ArrowUpRight className="size-2.5 rtl:rotate-270" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
