// src/modules/tasks/components/task-board.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  ListTodo,
  MessageSquare,
  Paperclip,
  Calendar,
  Plus,
  MoreHorizontal,
  ChevronsUp,
  ArrowUp,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskBoardProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onOpenCreate?: (defaultStatus?: TaskStatus) => void;
}

export function TaskBoard({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onOpenCreate,
}: TaskBoardProps) {
  const t = useTranslations("Tasks");

  const columns: {
    status: TaskStatus;
    title: string;
    dotColor: string;
    bgAccent: string;
    borderTop: string;
  }[] = [
    {
      status: "pending",
      title: "To Do",
      dotColor: "bg-indigo-500",
      bgAccent: "bg-indigo-500/5",
      borderTop: "border-t-indigo-500",
    },
    {
      status: "in_progress",
      title: "In Progress",
      dotColor: "bg-amber-500",
      bgAccent: "bg-amber-500/5",
      borderTop: "border-t-amber-500",
    },
    {
      status: "review",
      title: "Review",
      dotColor: "bg-pink-500",
      bgAccent: "bg-pink-500/5",
      borderTop: "border-t-pink-500",
    },
    {
      status: "completed",
      title: "Done",
      dotColor: "bg-emerald-500",
      bgAccent: "bg-emerald-500/5",
      borderTop: "border-t-emerald-500",
    },
  ];

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return <ChevronsUp className="size-4 text-rose-500" />;
      case "high":
        return <ChevronsUp className="size-4 text-amber-500" />;
      case "medium":
        return <ArrowUp className="size-4 text-sky-500" />;
      case "low":
      default:
        return <ArrowUp className="size-4 text-emerald-500" />;
    }
  };

  const getCompanyColor = (company?: string) => {
    if (company?.includes("یورو اسلات") || company?.includes("Euroslot")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
    if (company?.includes("نانو پالایش") || company?.includes("Nano")) {
      return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30";
    }
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full fa-num items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={cn(
              "flex flex-col rounded-2xl border border-border/50 border-t-4 p-3.5 min-h-[480px]",
              col.bgAccent,
              col.borderTop
            )}
          >
            {/* ── Column Header (matching reference UI) ── */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <div className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", col.dotColor)} />
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  {col.title} ({colTasks.length})
                </span>
              </div>
              <button
                type="button"
                className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Options"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </div>

            {/* ── Add Task Button (Inside To Do column or applicable) ── */}
            {col.status === "pending" && onOpenCreate && (
              <button
                type="button"
                onClick={() => onOpenCreate("pending")}
                className="w-full mb-3 py-2 px-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>{t("board.addTask")}</span>
              </button>
            )}

            {/* ── Column Task Cards ── */}
            <div className="flex flex-col gap-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="h-32 border border-dashed border-border/40 rounded-xl flex items-center justify-center text-xs text-muted-foreground/60 select-none">
                  {t("widget.empty")}
                </div>
              ) : (
                colTasks.map((task) => {
                  const assignees =
                    task.assignees && task.assignees.length > 0
                      ? task.assignees
                      : [
                          {
                            id: "default",
                            name: task.assignedToName || "کاربر",
                            role: task.assignedToRole || "مجری",
                          },
                        ];
                  const visibleAssignees = assignees.slice(0, 3);
                  const overflowCount = assignees.length - visibleAssignees.length;

                  // Progress label text per reference UI
                  const progress = task.progressPercent || 0;
                  let progressLabel = `${progress}% ${t("timeline.completed")}`;
                  let progressBarColor = "bg-primary";

                  if (task.status === "pending" || progress === 0) {
                    progressLabel = t("board.notStarted");
                    progressBarColor = "bg-muted-foreground/30";
                  } else if (task.status === "review") {
                    progressLabel = t("board.underReview");
                    progressBarColor = "bg-pink-500";
                  } else if (task.status === "completed" || progress === 100) {
                    progressLabel = t("board.completed");
                    progressBarColor = "bg-emerald-500";
                  }

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-3.5 rounded-xl border border-border/60 bg-white dark:bg-card/90 shadow-2xs hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-2.5 group"
                    >
                      {/* Top Row: Category Pill + Company Badge */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border/40">
                            {task.category} +
                          </span>

                          {task.company && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-md text-[9px] font-semibold border flex items-center gap-1",
                                getCompanyColor(task.company)
                              )}
                            >
                              <Building2 className="size-2.5" />
                              <span>{task.company}</span>
                            </span>
                          )}
                        </div>

                        {task.isManagerDefined && (
                          <div
                            className="text-amber-500"
                            title={t("tabs.manager")}
                          >
                            <ShieldAlert className="size-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Task Title */}
                      <h4 className="text-xs sm:text-[13px] font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>

                      {/* Progress Section (matching reference UI) */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>{progressLabel}</span>
                          {task.timelineDate && (
                            <span className="text-[9px] opacity-75">
                              {task.timelineDate}
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              progressBarColor
                            )}
                            style={{
                              width:
                                task.status === "pending"
                                  ? "15%"
                                  : `${Math.max(10, progress)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Priority/Status icons on left + Overlapping Avatars stack on right */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                        {/* Status/Priority icons */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "size-5 rounded-full flex items-center justify-center text-white",
                              task.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-sky-500"
                            )}
                          >
                            <CheckCircle2 className="size-3" />
                          </span>

                          <div title={t(`priority.${task.priority}`)}>
                            {getPriorityIcon(task.priority)}
                          </div>

                          {task.attachments?.length > 0 && (
                            <div
                              className="flex items-center text-muted-foreground text-[10px] gap-0.5 ml-1"
                              title={`${task.attachments.length} فایل پیوست`}
                            >
                              <Paperclip className="size-3" />
                              <span>{task.attachments.length}</span>
                            </div>
                          )}

                          {task.comments?.length > 0 && (
                            <div
                              className="flex items-center text-muted-foreground text-[10px] gap-0.5 ml-1"
                              title={`${task.comments.length} نظر`}
                            >
                              <MessageSquare className="size-3" />
                              <span>{task.comments.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Overlapping Collaborators Stack (e.g. 2-3 avatars + +N badge) */}
                        <div
                          className="flex items-center -space-x-1.5 rtl:space-x-reverse"
                          title={assignees.map((a) => `${a.name} (${a.role})`).join("، ")}
                        >
                          {visibleAssignees.map((assignee) => (
                            <Avatar
                              key={assignee.id}
                              className="size-5.5 border-2 border-white dark:border-card shrink-0 shadow-2xs"
                            >
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                {assignee.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {overflowCount > 0 && (
                            <div className="size-5.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center border-2 border-white dark:border-card shadow-2xs">
                              +{overflowCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
