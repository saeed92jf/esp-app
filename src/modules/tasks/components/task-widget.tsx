// src/modules/tasks/components/task-widget.tsx
"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useTasks } from "../hooks/use-tasks";
import { TaskItem, TaskPriority } from "../types/tasks.types";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { cn } from "@/lib/utils";

export function TaskWidget() {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const {
    tasks,
    isLoading,
    stats,
    createTask,
    toggleTaskComplete,
    changeTaskStatus,
    toggleSubtask,
    addSubtask,
    addComment,
    addReply,
    uploadAttachment,
    deleteAttachment,
    deleteTask,
    assignCollaborator,
    removeCollaborator,
    updateProgress,
  } = useTasks();

  const [quickTitle, setQuickTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "inProgress" | "manager">("all");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await createTask({
      title: quickTitle.trim(),
      category: "عمومی",
      company: "یورو اسلات پارس",
      priority: "medium",
      status: "pending",
      createdBy: "user",
      creatorName: "سعید جلیلی",
      assignedToName: "سعید جلیلی",
      assignedToRole: "کارشناس ارشد مهندسی",
      assignees: [
        { id: "lead", name: "سعید جلیلی", role: "کارشناس ارشد مهندسی", isLead: true },
      ],
      progressPercent: 0,
      isManagerDefined: false,
      startDate: new Intl.DateTimeFormat("fa-IR").format(new Date()),
      subtasks: [],
    });

    setQuickTitle("");
  };

  const displayedTasks = tasks.filter((task) => {
    if (filterTab === "inProgress")
      return task.status === "in_progress" || task.status === "pending";
    if (filterTab === "manager") return task.isManagerDefined;
    return true;
  });

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
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
              {stats.pending + stats.inProgress} {t("widget.remaining")}
            </span>
          </div>
        </div>

        {/* Link to Full Task Management Page */}
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors border border-primary/20 shrink-0"
        >
          <span>{t("manageAll")}</span>
          <ArrowUpRight className="size-3.5 rtl:rotate-270" />
        </Link>
      </div>

      {/* ── Compact Filter Pills ── */}
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5 overflow-x-auto no-scrollbar">
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
        <button
          type="button"
          onClick={() => setFilterTab("inProgress")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "inProgress"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("tabs.inProgress")} ({stats.pending + stats.inProgress})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("manager")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0 flex items-center gap-1",
            filterTab === "manager"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-amber-600 dark:text-amber-400 hover:text-foreground border-border/40"
          )}
        >
          <ShieldAlert className="size-3" />
          <span>{t("tabs.manager")} ({stats.managerCount})</span>
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
        />
        <Button
          type="submit"
          size="sm"
          disabled={!quickTitle.trim()}
          className="h-8.5 px-3 rounded-xl gap-1 text-xs font-medium cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{t("subtasks.add")}</span>
        </Button>
      </form>

      {/* ── Scrollable Tasks List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pe-1 min-h-[140px]">
        {displayedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground/60 select-none py-6">
            {t("widget.empty")}
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setIsDrawerOpen(true);
                }}
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-colors cursor-pointer shadow-2xs group select-none",
                  isCompleted
                    ? "bg-muted/20 border-border/30 opacity-70"
                    : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-primary/40 hover:bg-white dark:hover:bg-card"
                )}
              >
                {/* Left: Checkbox + Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task);
                    }}
                    className={cn(
                      "size-4 rounded-md flex items-center justify-center shrink-0 border transition-colors cursor-pointer",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border/80 bg-background hover:border-primary"
                    )}
                  >
                    {isCompleted && <Check className="size-2.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0">
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
                    <span className="text-[10px] text-muted-foreground truncate">
                      {task.category}
                      {task.dueDate && ` • ${task.dueDate}`}
                    </span>
                  </div>
                </div>

                {/* Right: Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.isManagerDefined && (
                    <div
                      className="text-amber-500"
                      title={t("widget.managerBadge")}
                    >
                      <ShieldAlert className="size-3.5" />
                    </div>
                  )}

                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-semibold border",
                      getPriorityBadgeClass(task.priority)
                    )}
                  >
                    {t(`priority.${task.priority}`)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Task Detail Modal ── */}
      <TaskDetailDrawer
        task={selectedTask}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
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
    </div>
  );
}
