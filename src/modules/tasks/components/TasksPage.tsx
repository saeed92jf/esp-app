// src/modules/tasks/components/TasksPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { newTasksService, NewTask } from "../services/new-tasks.service";
import { AdminTasksView } from "./AdminTasksView";
import { UserTasksView } from "./UserTasksView";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function isAdminRole(role?: string): boolean {
  return role === "superadmin" || role === "admin";
}

export function TasksPage() {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const isAdmin = isAdminRole(user?.role);

  const [tasks, setTasks] = useState<NewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Admin gets all tasks; user gets only their assigned tasks
      const params = isAdmin
        ? undefined
        : { assigneeId: user?.id };
      const data = await newTasksService.getTasks(params);
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <span className="text-sm">{isRtl ? "در حال بارگذاری تسک‌ها..." : "Loading tasks..."}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-destructive max-w-sm text-center">
          <AlertCircle className="size-10" />
          <p className="font-semibold">{isRtl ? "خطا در بارگذاری تسک‌ها" : "Error loading tasks"}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {isRtl ? "تلاش مجدد" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminTasksView
        tasks={tasks}
        currentUser={user!}
        onRefresh={fetchTasks}
        onTasksChange={setTasks}
      />
    );
  }

  return (
    <UserTasksView
      tasks={tasks}
      currentUser={user!}
      onRefresh={fetchTasks}
      onTasksChange={setTasks}
    />
  );
}
