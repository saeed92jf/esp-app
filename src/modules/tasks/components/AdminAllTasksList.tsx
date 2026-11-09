// src/modules/tasks/components/AdminAllTasksList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Users,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NewTask, newTasksService } from "../services/new-tasks.service";
import { toast } from "sonner";
import type { User } from "@/types/auth";
import { formatPersonName } from "@/lib/person-names";

interface AdminAllTasksListProps {
  tasks: NewTask[];
  currentUser: User;
  onSelectTask: (task: NewTask) => void;
  onTaskUpdated: (task: NewTask) => void;
  onTaskDeleted: (taskId: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", labelFa: "همه وضعیت‌ها", labelEn: "All Statuses" },
  { value: "todo", labelFa: "برای انجام", labelEn: "To Do" },
  { value: "in_progress", labelFa: "در حال انجام", labelEn: "In Progress" },
  { value: "review", labelFa: "بازبینی", labelEn: "Review" },
  { value: "done", labelFa: "انجام‌شده", labelEn: "Done" },
  { value: "cancelled", labelFa: "لغو شده", labelEn: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  review: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_LABELS_FA: Record<string, string> = {
  todo: "برای انجام",
  in_progress: "در حال انجام",
  review: "بازبینی",
  done: "انجام‌شده",
  cancelled: "لغو شده",
};

const STATUS_LABELS_EN: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  cancelled: "Cancelled",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

const PRIORITY_LABELS_FA: Record<string, string> = {
  low: "عادی",
  medium: "متوسط",
  high: "مهم",
  critical: "فوری",
};

export function AdminAllTasksList({
  tasks,
  currentUser,
  onSelectTask,
  onTaskUpdated,
  onTaskDeleted,
}: AdminAllTasksListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const q = search.toLowerCase().trim();
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (q) {
        const hay = [t.title, t.description, t.company, ...(t.tags || []),
          ...(t.assignees?.map((a) => a.name) || [])].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, search, statusFilter]);

  const handleDelete = async (task: NewTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isRtl ? `آیا از حذف تسک "${task.title}" اطمینان دارید؟` : `Delete task "${task.title}"?`)) return;
    setDeletingId(task.id);
    try {
      await newTasksService.deleteTask(task.id);
      toast.success(isRtl ? "تسک حذف شد." : "Task deleted.");
      onTaskDeleted(task.id);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در حذف تسک" : "Failed to delete task"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "جستجو در تسک‌ها..." : "Search tasks..."}
            className="ps-9 rounded-xl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{isRtl ? o.labelFa : o.labelEn}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {isRtl ? `${filtered.length} تسک` : `${filtered.length} tasks`}
      </p>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="size-12 mx-auto mb-3 opacity-30" />
          <p>{isRtl ? "تسکی یافت نشد." : "No tasks found."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="group bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                        STATUS_COLORS[task.status] || "bg-muted text-foreground"
                      )}
                    >
                      {isRtl
                        ? STATUS_LABELS_FA[task.status] || task.status
                        : STATUS_LABELS_EN[task.status] || task.status}
                    </span>
                    <span className={cn("text-xs font-semibold", PRIORITY_COLORS[task.priority])}>
                      {isRtl
                        ? PRIORITY_LABELS_FA[task.priority] || task.priority
                        : task.priority}
                    </span>
                    {task.company && (
                      <span className="text-xs text-muted-foreground">{task.company}</span>
                    )}
                    {task.is_approved && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                        {isRtl ? "✓ تایید شده" : "✓ Approved"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.assignees?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span>{task.assignees.map((a) => formatPersonName(a.name, locale)).join(isRtl ? "، " : ", ")}</span>
                      </span>
                    )}
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{task.deadline}</span>
                      </span>
                    )}
                    {task.progress?.length > 0 && (
                      <span className="fa-num">{task.progress.length} {isRtl ? "گزارش" : "updates"}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleDelete(task, e)}
                    disabled={deletingId === task.id}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-xl hover:bg-primary/10 hover:text-primary"
                    onClick={() => onSelectTask(task)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
