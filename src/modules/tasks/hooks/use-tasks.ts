// src/modules/tasks/hooks/use-tasks.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TaskItem,
  TaskFilterState,
  TaskStatus,
  TaskPriority,
  SubTask,
  TaskAttachment,
  TaskAssignee,
} from "../types/tasks.types";
import { tasksService } from "../services";

const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  company: "all",
  assignee: "all",
  isManagerOnly: false,
};

export function useTasks(options?: {
  initialRole?: "admin" | "user";
  defaultUserName?: string;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Role & Persona state (Admin oversight vs User personal workspace)
  const [roleMode, setRoleMode] = useState<"admin" | "user">(
    options?.initialRole || "admin"
  );
  const [currentUserName, setCurrentUserName] = useState<string>(
    options?.defaultUserName || "سعید جلیلی"
  );

  // Sync with localStorage across views
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("esp_role_perspective") as "admin" | "user" | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setRoleMode(savedRole);
      }
      if (savedPersona) {
        setCurrentUserName(savedPersona);
      }
    }

    const handleSync = () => {
      const savedRole = localStorage.getItem("esp_role_perspective") as "admin" | "user" | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setRoleMode(savedRole);
      }
      if (savedPersona) {
        setCurrentUserName(savedPersona);
      }
    };
    window.addEventListener("esp_role_change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("esp_role_change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const changeRoleMode = useCallback((role: "admin" | "user") => {
    setRoleMode(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("esp_role_perspective", role);
      window.dispatchEvent(new Event("esp_role_change"));
    }
  }, []);

  const changeCurrentUserName = useCallback((name: string) => {
    setCurrentUserName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("esp_persona_name", name);
      window.dispatchEvent(new Event("esp_role_change"));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksService.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.company) set.add(t.company);
    });
    return Array.from(set);
  }, [tasks]);

  const allAssignees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; role: string }>();
    tasks.forEach((t) => {
      if (t.assignedToName) {
        map.set(t.assignedToName, {
          id: t.assignees?.[0]?.id || t.assignedToName,
          name: t.assignedToName,
          role: t.assignedToRole || "کارشناس مهندسی",
        });
      }
      t.assignees?.forEach((a) => {
        if (a.name) {
          map.set(a.name, {
            id: a.id,
            name: a.name,
            role: a.role,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [tasks]);

  const userTasks = useMemo(() => {
    const u = currentUserName.trim().toLowerCase();
    return tasks.filter((task) => {
      const isAssigned =
        task.assignedToName?.toLowerCase().includes(u) ||
        task.assignees?.some((a) => a.name.toLowerCase().includes(u));
      const isCreator = task.creatorName?.toLowerCase().includes(u);
      return isAssigned || isCreator;
    });
  }, [tasks, currentUserName]);

  const personalTasks = useMemo(() => {
    return tasks.filter((t) => t.isPersonal || t.scope === "personal");
  }, [tasks]);

  const stats = useMemo(() => {
    const targetSet = roleMode === "user" ? userTasks : tasks.filter((t) => !t.isPersonal && t.scope !== "personal");
    const total = targetSet.length;
    const pending = targetSet.filter((t) => t.status === "pending").length;
    const inProgress = targetSet.filter((t) => t.status === "in_progress").length;
    const review = targetSet.filter((t) => t.status === "review").length;
    const completed = targetSet.filter((t) => t.status === "completed").length;
    const managerCount = targetSet.filter((t) => t.isManagerDefined).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      review,
      completed,
      managerCount,
      completionRate,
      allTotal: tasks.length,
      userTotal: userTasks.length,
      personalTotal: personalTasks.length,
    };
  }, [tasks, userTasks, personalTasks, roleMode]);

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((task) => {
      // ── Scope Isolation: Personal vs Team tasks ──
      if (filters.scope === "personal") {
        if (!task.isPersonal && task.scope !== "personal") return false;
      } else {
        // By default on team boards, keep personal tasks strictly isolated
        if (task.isPersonal || task.scope === "personal") return false;
      }

      // ── Role Separation ──
      if (roleMode === "user") {
        const u = currentUserName.trim().toLowerCase();
        const isAssigned =
          task.assignedToName?.toLowerCase().includes(u) ||
          task.assignees?.some((a) => a.name.toLowerCase().includes(u));
        const isCreator = task.creatorName?.toLowerCase().includes(u);
        if (!isAssigned && !isCreator) {
          return false;
        }
      } else {
        // Admin mode: can optionally filter by a specific assignee
        if (filters.assignee && filters.assignee !== "all") {
          const target = filters.assignee.trim().toLowerCase();
          const matchesAssignee =
            task.assignedToName?.toLowerCase().includes(target) ||
            task.assignees?.some((a) => a.name.toLowerCase().includes(target));
          if (!matchesAssignee) return false;
        }
      }

      if (filters.isManagerOnly && !task.isManagerDefined) return false;
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      if (filters.category !== "all" && task.category !== filters.category) return false;
      if (filters.company && filters.company !== "all" && task.company !== filters.company) return false;

      if (q) {
        const titleMatch =
          task.title.toLowerCase().includes(q) ||
          (task.titleEn ? task.titleEn.toLowerCase().includes(q) : false);
        const descMatch =
          (task.description ? task.description.toLowerCase().includes(q) : false) ||
          (task.descriptionEn ? task.descriptionEn.toLowerCase().includes(q) : false);
        const catMatch = task.category.toLowerCase().includes(q);
        const compMatch = task.company?.toLowerCase().includes(q) || false;
        const creatorMatch = task.creatorName.toLowerCase().includes(q);
        const assigneeMatch =
          task.assignedToName?.toLowerCase().includes(q) ||
          task.assignees?.some(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.role.toLowerCase().includes(q)
          );
        const tagMatch = task.tags?.some((tg) => tg.toLowerCase().includes(q)) || false;
        const projectMatch = task.relatedProjectTitle?.toLowerCase().includes(q) || false;
        const attachmentMatch = task.attachments?.some((att) => att.name.toLowerCase().includes(q)) || false;

        if (
          !titleMatch &&
          !descMatch &&
          !catMatch &&
          !compMatch &&
          !creatorMatch &&
          !assigneeMatch &&
          !tagMatch &&
          !projectMatch &&
          !attachmentMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, roleMode, currentUserName]);

  const createTask = useCallback(
    async (taskData: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">) => {
      const created = await tasksService.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateTask = useCallback(async (updated: TaskItem) => {
    const result = await tasksService.updateTask(updated);
    setTasks((prev) => prev.map((t) => (t.id === result.id ? result : t)));
    return result;
  }, []);

  const deleteTask = useCallback(
    async (id: string) => {
      await tasksService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
    },
    [selectedTaskId]
  );

  const changeTaskStatus = useCallback(
    async (id: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updated: TaskItem = {
        ...task,
        status: newStatus,
        progressPercent:
          newStatus === "completed"
            ? 100
            : newStatus === "pending"
            ? 0
            : task.progressPercent || 50,
        completedAt:
          newStatus === "completed"
            ? new Intl.DateTimeFormat("fa-IR").format(new Date())
            : undefined,
      };

      updated.activities = [
        {
          id: `act-${Date.now()}`,
          type: "status_change",
          authorName: "سعید جلیلی",
          timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
          details: `وضعیت به ${newStatus} تغییر کرد.`,
        },
        ...(updated.activities || []),
      ];

      await updateTask(updated);
    },
    [tasks, updateTask]
  );

  const toggleTaskComplete = useCallback(
    async (task: TaskItem) => {
      const nextStatus: TaskStatus = task.status === "completed" ? "in_progress" : "completed";
      await changeTaskStatus(task.id, nextStatus);
    },
    [changeTaskStatus]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string, completed: boolean) => {
      const updated = await tasksService.toggleSubtask(taskId, subtaskId, completed);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    []
  );

  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !title.trim()) return;

      const newSub: SubTask = {
        id: `sub-${Date.now()}`,
        title: title.trim(),
        completed: false,
      };

      const updated: TaskItem = {
        ...task,
        subtasks: [...(task.subtasks || []), newSub],
      };

      await updateTask(updated);
    },
    [tasks, updateTask]
  );

  const addComment = useCallback(
    async (
      taskId: string,
      content: string,
      attachments?: TaskAttachment[],
      authorName = "سعید جلیلی",
      authorRole = "سرپرست مهندسی فرآیند"
    ) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) return;
      await tasksService.addComment(taskId, {
        authorName,
        authorRole,
        content: content.trim(),
        likes: 0,
        attachments,
      });
      await fetchTasks();
    },
    [fetchTasks]
  );

  const addReply = useCallback(
    async (
      taskId: string,
      commentId: string,
      content: string,
      attachments?: TaskAttachment[],
      authorName = "سعید جلیلی",
      authorRole = "سرپرست مهندسی فرآیند"
    ) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) return;
      await tasksService.addReply(taskId, commentId, {
        commentId,
        authorName,
        authorRole,
        content: content.trim(),
        likes: 0,
        attachments,
      });
      await fetchTasks();
    },
    [fetchTasks]
  );

  const uploadAttachment = useCallback(
    async (
      taskId: string,
      file: {
        name: string;
        size: string;
        type: string;
        url?: string;
        uploaderName?: string;
        isDrawing?: boolean;
      }
    ) => {
      await tasksService.uploadAttachment(taskId, file);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const deleteAttachment = useCallback(
    async (taskId: string, attachmentId: string) => {
      await tasksService.deleteAttachment(taskId, attachmentId);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const assignCollaborator = useCallback(
    async (taskId: string, collaborator: TaskAssignee) => {
      const updated = await tasksService.assignCollaborator(taskId, collaborator);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    []
  );

  const removeCollaborator = useCallback(
    async (taskId: string, collaboratorId: string) => {
      const updated = await tasksService.removeCollaborator(taskId, collaboratorId);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    []
  );

  const updateProgress = useCallback(
    async (taskId: string, progressPercent: number) => {
      const updated = await tasksService.updateProgress(taskId, progressPercent);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    []
  );

  return {
    tasks,
    isLoading,
    error,
    filters,
    setFilters,
    roleMode,
    setRoleMode: changeRoleMode,
    currentUserName,
    setCurrentUserName: changeCurrentUserName,
    allAssignees,
    filteredTasks,
    personalTasks,
    stats,
    categories,
    companies,
    selectedTask,
    setSelectedTaskId,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    addComment,
    addReply,
    uploadAttachment,
    deleteAttachment,
    assignCollaborator,
    removeCollaborator,
    updateProgress,
    refreshTasks: fetchTasks,
  };
}
