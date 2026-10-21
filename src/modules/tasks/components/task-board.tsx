// src/modules/tasks/components/task-board.tsx
"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { cn } from "@/lib/utils";
import { HighlightMatch } from "../utils/task-search";

interface TaskBoardProps {
  tasks: TaskItem[];
  searchQuery?: string;
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onOpenCreate?: (defaultStatus?: TaskStatus) => void;
}

export function TaskBoard({
  tasks,
  searchQuery = "",
  onSelectTask,
  onUpdateStatus,
}: TaskBoardProps) {
  const t = useTranslations("Tasks");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const isDraggingRef = useRef(false);

  const columns: {
    status: TaskStatus;
    title: string;
    dotColor: string;
    bgAccent: string;
    borderTop: string;
  }[] = [
    {
      status: "pending",
      title: t("status.pending"),
      dotColor: "bg-indigo-500",
      bgAccent: "bg-indigo-500/5",
      borderTop: "border-t-indigo-500",
    },
    {
      status: "in_progress",
      title: t("status.in_progress"),
      dotColor: "bg-amber-500",
      bgAccent: "bg-amber-500/5",
      borderTop: "border-t-amber-500",
    },
    {
      status: "review",
      title: t("status.review"),
      dotColor: "bg-pink-500",
      bgAccent: "bg-pink-500/5",
      borderTop: "border-t-pink-500",
    },
    {
      status: "completed",
      title: t("status.completed"),
      dotColor: "bg-emerald-500",
      bgAccent: "bg-emerald-500/5",
      borderTop: "border-t-emerald-500",
    },
  ];

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return {
          label: t("priority.urgent"),
          dotColor: "bg-rose-500",
          badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        };
      case "high":
        return {
          label: t("priority.high"),
          dotColor: "bg-amber-500",
          badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "medium":
        return {
          label: t("priority.medium"),
          dotColor: "bg-sky-500",
          badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      case "low":
      default:
        return {
          label: t("priority.low"),
          dotColor: "bg-slate-400 dark:bg-slate-500",
          badgeClass: "bg-muted text-muted-foreground border-border/40",
        };
    }
  };

  const getCompanyColor = (company?: string) => {
    if (company?.includes("یورو اسلات") || company?.includes("Euroslot")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
    }
    if (company?.includes("نانو پالایش") || company?.includes("Nano")) {
      return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20";
    }
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full fa-num items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        const isColumnDragOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverColumn !== col.status) {
                setDragOverColumn(col.status);
              }
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              if (dragOverColumn === col.status) {
                setDragOverColumn(null);
              }
            }}
            onDrop={async (e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
              setDragOverColumn(null);
              setDraggedTaskId(null);
              if (taskId) {
                const targetTask = tasks.find((t) => t.id === taskId);
                if (targetTask && targetTask.status !== col.status) {
                  await onUpdateStatus(taskId, col.status);
                }
              }
            }}
            className={cn(
              "flex flex-col rounded-2xl border border-border/50 border-t-4 p-3.5 min-h-[500px] transition-all duration-200",
              col.bgAccent,
              col.borderTop,
              isColumnDragOver && "ring-2 ring-primary/40 bg-primary/[0.06] border-primary/60"
            )}
          >
            {/* ── Column Header ── */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <div className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full shrink-0", col.dotColor)} />
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  {col.title}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted/80 text-muted-foreground border border-border/30">
                {colTasks.length}
              </span>
            </div>

            {/* ── Drag Over Drop Indicator ── */}
            {isColumnDragOver && draggedTaskId && (
              <div className="mb-3 h-14 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary transition-all animate-pulse select-none">
                {t("board.dropHere")}
              </div>
            )}

            {/* ── Column Task Cards ── */}
            <div className="flex flex-col gap-2.5 flex-1">
              {colTasks.length === 0 && !isColumnDragOver ? (
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

                  // Progress label text
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

                  const priorityInfo = getPriorityInfo(task.priority);
                  const isBeingDragged = task.id === draggedTaskId;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", task.id);
                        e.dataTransfer.effectAllowed = "move";
                        isDraggingRef.current = true;
                        setDraggedTaskId(task.id);
                      }}
                      onDragEnd={() => {
                        setTimeout(() => {
                          isDraggingRef.current = false;
                        }, 120);
                        setDraggedTaskId(null);
                        setDragOverColumn(null);
                      }}
                      onClick={() => {
                        if (!isDraggingRef.current) {
                          onSelectTask(task);
                        }
                      }}
                      className={cn(
                        "p-3.5 rounded-xl border bg-white dark:bg-card/90 shadow-2xs transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2.5 group select-none",
                        isBeingDragged
                          ? "opacity-35 border-dashed border-primary ring-2 ring-primary/20 scale-[0.98]"
                          : "border-border/60 hover:border-primary/50 hover:shadow-xs"
                      )}
                    >
                      {/* Top Row: Category Pill + Company Badge + Priority Pill */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/70 text-muted-foreground border border-border/40">
                            {task.category}
                          </span>

                          {task.company && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-md text-[9px] font-semibold border",
                                getCompanyColor(task.company)
                              )}
                            >
                              {task.company}
                            </span>
                          )}
                        </div>

                        {/* Modern Minimalist Priority Indicator */}
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1.5",
                            priorityInfo.badgeClass
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full shrink-0", priorityInfo.dotColor)} />
                          <span>{priorityInfo.label}</span>
                        </div>
                      </div>

                      {/* Task Title */}
                      <h4 className="text-xs sm:text-[13px] font-bold text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                        <HighlightMatch text={task.title} query={searchQuery} />
                      </h4>

                      {/* Progress Section */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>{progressLabel}</span>
                          {task.timelineDate && (
                            <span className="text-[10px] opacity-80 font-medium">
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
                                  ? "12%"
                                  : `${Math.max(10, progress)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Metadata & Assignees */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                        <div>
                          {task.isManagerDefined ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {t("tabs.manager")}
                            </span>
                          ) : task.dueDate ? (
                            <span className="text-muted-foreground text-[10px] font-medium">
                              {task.dueDate}
                            </span>
                          ) : (
                            <span />
                          )}
                        </div>

                        {/* Overlapping Collaborators Stack */}
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
