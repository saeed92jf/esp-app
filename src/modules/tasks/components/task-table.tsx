// src/modules/tasks/components/task-table.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Eye,
  Trash2,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: TaskItem[];
  roleMode?: "admin" | "user";
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export function TaskTable({
  tasks,
  roleMode = "admin",
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
}: TaskTableProps) {
  const t = useTranslations("Tasks");

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

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "review":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30";
      case "in_progress":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "pending":
      default:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-xs sm:text-sm text-muted-foreground border border-dashed border-border/50 rounded-2xl bg-muted/10 fa-num">
        {t("widget.empty")}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs fa-num">
      <table className="w-full text-start border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground font-semibold">
            <th className="p-3.5 text-start">{t("table.title")}</th>
            <th className="p-3.5 text-start">{t("table.company")}</th>
            <th className="p-3.5 text-start">{t("table.category")}</th>
            <th className="p-3.5 text-start">{t("table.priority")}</th>
            <th className="p-3.5 text-start">{t("table.status")}</th>
            <th className="p-3.5 text-start">{t("table.progress")}</th>
            <th className="p-3.5 text-start">{t("table.assignee")}</th>
            <th className="p-3.5 text-start">{t("table.dueDate")}</th>
            <th className="p-3.5 text-end">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {tasks.map((task) => {
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
            const overflow = assignees.length - visibleAssignees.length;

            return (
              <tr
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="hover:bg-muted/20 transition-colors cursor-pointer group"
              >
                {/* Title */}
                <td className="p-3.5 font-medium text-foreground max-w-[280px]">
                  <div className="flex items-center gap-2">
                    {task.isManagerDefined && (
                      <span
                        className="text-amber-500 shrink-0"
                        title={t("tabs.manager")}
                      >
                        <ShieldAlert className="size-3.5" />
                      </span>
                    )}
                    <span className="truncate group-hover:text-primary transition-colors font-semibold">
                      {task.title}
                    </span>
                  </div>
                </td>

                {/* Company */}
                <td className="p-3.5 whitespace-nowrap">
                  {task.company ? (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 w-fit",
                        getCompanyColor(task.company)
                      )}
                    >
                      <Building2 className="size-2.5" />
                      <span>{task.company}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>

                {/* Category */}
                <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-muted/40 text-[10px] font-bold uppercase border border-border/40">
                    {task.category}
                  </span>
                </td>

                {/* Priority */}
                <td className="p-3.5 whitespace-nowrap">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                      getPriorityBadgeClass(task.priority)
                    )}
                  >
                    {t(`priority.${task.priority}`)}
                  </span>
                </td>

                {/* Status Dropdown */}
                <td
                  className="p-3.5 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Combobox
                    options={[
                      { value: "pending", label: "To Do" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "review", label: "Review" },
                      { value: "completed", label: "Done" },
                    ]}
                    value={task.status}
                    onChange={(val) => onUpdateStatus(task.id, val as TaskStatus)}
                    className={cn(
                      "h-7 text-[11px] rounded-lg px-2 border font-medium w-[120px]",
                      getStatusBadgeClass(task.status)
                    )}
                  />
                </td>

                {/* Progress */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          task.status === "completed"
                            ? "bg-emerald-500"
                            : task.status === "review"
                            ? "bg-pink-500"
                            : "bg-primary"
                        )}
                        style={{
                          width: `${task.progressPercent || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {task.progressPercent || 0}%
                    </span>
                  </div>
                </td>

                {/* Assignees (stack) */}
                <td className="p-3.5 whitespace-nowrap">
                  <div
                    className="flex items-center -space-x-1.5 rtl:space-x-reverse"
                    title={assignees.map((a) => `${a.name} (${a.role})`).join("، ")}
                  >
                    {visibleAssignees.map((a) => (
                      <Avatar
                        key={a.id}
                        className="size-5.5 border-2 border-white dark:border-card shrink-0 shadow-2xs"
                      >
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                          {a.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {overflow > 0 && (
                      <div className="size-5.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center border-2 border-white dark:border-card shadow-2xs">
                        +{overflow}
                      </div>
                    )}
                  </div>
                </td>

                {/* Due Date */}
                <td className="p-3.5 whitespace-nowrap text-muted-foreground text-xs">
                  {task.dueDate || "-"}
                </td>

                {/* Actions */}
                <td
                  className="p-3.5 text-end whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onSelectTask(task)}
                      className="rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      title={t("drawer.details")}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={roleMode !== "admin" && task.isManagerDefined}
                      onClick={() => {
                        if (confirm(t("drawer.deleteConfirm"))) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30"
                      title={roleMode !== "admin" && task.isManagerDefined ? "تنها مدیر سیستم امکان حذف تسک‌های سازمانی را دارد" : t("drawer.deleteTask")}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
