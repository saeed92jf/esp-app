// src/modules/tasks/components/UserTasksView.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  AlertCircle,
  FolderKanban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewTask } from "../services/new-tasks.service";
import { TaskProgressView } from "./TaskProgressView";
import type { User } from "@/types/auth";

interface UserTasksViewProps {
  tasks: NewTask[];
  currentUser: User;
  onRefresh: () => void;
  onTasksChange: (tasks: NewTask[]) => void;
}

const STATUS_CONFIG = {
  todo: { labelFa: "برای انجام", labelEn: "To Do", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", dot: "bg-slate-400" },
  in_progress: { labelFa: "در حال انجام", labelEn: "In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-400" },
  review: { labelFa: "بازبینی", labelEn: "Review", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300", dot: "bg-pink-400" },
  done: { labelFa: "انجام‌شده", labelEn: "Done", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-400" },
  cancelled: { labelFa: "لغو شده", labelEn: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dot: "bg-red-400" },
};

const PRIORITY_CONFIG = {
  low: { labelFa: "عادی", labelEn: "Low", color: "text-slate-500" },
  medium: { labelFa: "متوسط", labelEn: "Medium", color: "text-blue-500" },
  high: { labelFa: "مهم", labelEn: "High", color: "text-orange-500" },
  critical: { labelFa: "فوری", labelEn: "Critical", color: "text-red-500" },
};

export function UserTasksView({ tasks, currentUser, onRefresh, onTasksChange }: UserTasksViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [selectedTask, setSelectedTask] = useState<NewTask | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleTaskUpdated = (updatedTask: NewTask) => {
    onTasksChange(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const activeTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const doneTasks = tasks.filter((t) => t.status === "done" || t.status === "cancelled");

  if (selectedTask) {
    return (
      <div className="flex flex-col min-h-screen bg-panel dark:bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/40 px-4 sm:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedTask(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
            <span>{isRtl ? "بازگشت به تسک‌های من" : "Back to my tasks"}</span>
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground line-clamp-1">{selectedTask.title}</span>
        </div>
        <div className="flex-1 p-4 sm:p-8">
          <TaskProgressView
            task={selectedTask}
            currentUser={currentUser}
            isAdmin={false}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-panel dark:bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border/40 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRtl ? "تسک‌های من" : "My Tasks"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isRtl
                ? `${tasks.length} تسک در کل · ${activeTasks.length} فعال`
                : `${tasks.length} total tasks · ${activeTasks.length} active`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl gap-2">
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            {isRtl ? "بروزرسانی" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckSquare className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                {isRtl ? "تسکی برای شما تعریف نشده" : "No tasks assigned"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isRtl
                  ? "وقتی مدیر تسکی برای شما تعریف کند اینجا نمایش داده می‌شود."
                  : "When a manager assigns tasks to you, they will appear here."}
              </p>
            </div>
          ) : (
            <>
              {/* Active Tasks */}
              {activeTasks.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {isRtl ? "تسک‌های فعال" : "Active Tasks"}
                  </h2>
                  <div className="space-y-2">
                    {activeTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isRtl={isRtl}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Done Tasks */}
              {doneTasks.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {isRtl ? "تسک‌های تکمیل‌شده" : "Completed Tasks"}
                  </h2>
                  <div className="space-y-2">
                    {doneTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isRtl={isRtl}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, isRtl, onClick }: { task: NewTask; isRtl: boolean; onClick: () => void }) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const progressCount = task.progress?.length ?? 0;
  const doneSubtasks = task.subtasks?.filter((s) => s.is_done).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full", status.color)}>
              <span className={cn("size-1.5 rounded-full", status.dot)} />
              {isRtl ? status.labelFa : status.labelEn}
            </span>
            <span className={cn("text-xs font-semibold", priority.color)}>
              {isRtl ? priority.labelFa : priority.labelEn}
            </span>
            {task.company && (
              <span className="text-xs text-muted-foreground">{task.company}</span>
            )}
            {task.project_name ? (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FolderKanban className="size-3" />
                <span>{task.project_esp_number ? `${task.project_esp_number} | ` : ""}{task.project_name}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                {isRtl ? "تسک مستقل" : "Independent"}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-4 text-xs text-muted-foreground">
        {totalSubtasks > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            <span className="fa-num">{doneSubtasks}/{totalSubtasks}</span>
          </span>
        )}
        {progressCount > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" />
            <span className="fa-num">{progressCount}</span>
            <span>{isRtl ? "گزارش" : "updates"}</span>
          </span>
        )}
        {task.deadline && (
          <span className="flex items-center gap-1 ms-auto">
            <Clock className="size-3.5" />
            <span>{task.deadline}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
