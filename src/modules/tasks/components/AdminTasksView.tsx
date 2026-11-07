// src/modules/tasks/components/AdminTasksView.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  ListChecks,
  PlusCircle,
  Kanban,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NewTask } from "../services/new-tasks.service";
import { TaskCreateWizard } from "./TaskCreateWizard";
import { AdminAllTasksList } from "./AdminAllTasksList";
import { AdminRoadmapView } from "./AdminRoadmapView";
import { TaskProgressView } from "./TaskProgressView";
import type { User } from "@/types/auth";

type AdminTab = "tasks" | "create" | "roadmap";

interface AdminTasksViewProps {
  tasks: NewTask[];
  currentUser: User;
  onRefresh: () => void;
  onTasksChange: (tasks: NewTask[]) => void;
}

export function AdminTasksView({ tasks, currentUser, onRefresh, onTasksChange }: AdminTasksViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [activeTab, setActiveTab] = useState<AdminTab>("tasks");
  const [selectedTask, setSelectedTask] = useState<NewTask | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleTaskCreated = (newTask: NewTask) => {
    onTasksChange([newTask, ...tasks]);
    setActiveTab("tasks");
  };

  const handleTaskUpdated = (updatedTask: NewTask) => {
    onTasksChange(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDeleted = (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const tabs: { id: AdminTab; labelFa: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "tasks", labelFa: "همه تسک‌ها", labelEn: "All Tasks", icon: ListChecks },
    { id: "create", labelFa: "ایجاد تسک", labelEn: "New Task", icon: PlusCircle },
    { id: "roadmap", labelFa: "نقشه راه", labelEn: "Roadmap", icon: Kanban },
  ];

  if (selectedTask) {
    return (
      <div className="flex flex-col min-h-screen bg-panel dark:bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/40 px-4 sm:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedTask(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
            <span>{isRtl ? "بازگشت به لیست" : "Back to list"}</span>
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground line-clamp-1">{selectedTask.title}</span>
        </div>
        <div className="flex-1 p-4 sm:p-8">
          <TaskProgressView
            task={selectedTask}
            currentUser={currentUser}
            isAdmin={true}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={() => handleTaskDeleted(selectedTask.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-panel dark:bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border/40 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isRtl ? "مدیریت تسک‌ها" : "Task Management"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRtl
                  ? "تعریف، پیگیری و تایید تسک‌های سازمانی"
                  : "Define, track and approve organizational tasks"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="rounded-xl gap-2 self-start sm:self-auto"
            >
              <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
              {isRtl ? "بروزرسانی" : "Refresh"}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {[
              { label: isRtl ? "کل" : "Total", value: stats.total, color: "text-foreground" },
              { label: isRtl ? "برای انجام" : "Todo", value: stats.todo, color: "text-slate-500" },
              { label: isRtl ? "در حال انجام" : "In Progress", value: stats.inProgress, color: "text-amber-500" },
              { label: isRtl ? "بازبینی" : "Review", value: stats.review, color: "text-pink-500" },
              { label: isRtl ? "انجام‌شده" : "Done", value: stats.done, color: "text-emerald-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card rounded-2xl border border-border/50 p-3 flex items-center justify-between shadow-xs"
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className={cn("text-xl font-bold fa-num", s.color)}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Tab Nav */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/40 border border-border/40 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AdminAllTasksList
                  tasks={tasks}
                  onSelectTask={setSelectedTask}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  currentUser={currentUser}
                />
              </motion.div>
            )}
            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TaskCreateWizard
                  currentUser={currentUser}
                  onTaskCreated={handleTaskCreated}
                  onCancel={() => setActiveTab("tasks")}
                />
              </motion.div>
            )}
            {activeTab === "roadmap" && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AdminRoadmapView
                  tasks={tasks}
                  onSelectTask={setSelectedTask}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
