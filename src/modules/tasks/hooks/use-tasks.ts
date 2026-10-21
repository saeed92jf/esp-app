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
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { projectsService } from "@/modules/projects/services";
import type { ProjectItem } from "@/modules/projects/types/projects.types";
import { matchesSmartSearch } from "../utils/task-search";

const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  company: "all",
  assignee: "all",
  scope: "all",
  isManagerOnly: false,
};

function matchesUserIdentity(
  target: string | undefined | null,
  user: any | null,
  currentUserName?: string
): boolean {
  if (!target) return false;
  const t = target.trim().toLowerCase();

  if (currentUserName && currentUserName.trim()) {
    const cur = currentUserName.trim().toLowerCase();
    if (t.includes(cur) || cur.includes(t)) return true;
  }

  if (user?.id) {
    const uid = String(user.id).toLowerCase();
    if (t.includes(uid) || uid.includes(t)) return true;
  }

  if (user?.email) {
    const uemail = user.email.toLowerCase();
    const uemailPrefix = uemail.split("@")[0];
    if (t.includes(uemail) || t.includes(uemailPrefix)) return true;
  }

  if (user?.fullName) {
    const fn = user.fullName.toLowerCase();
    if (t.includes(fn) || fn.includes(t)) return true;
  }

  if (user?.fullNameFa) {
    const fnFa = user.fullNameFa.toLowerCase();
    if (t.includes(fnFa) || fnFa.includes(t)) return true;
  }

  // Common aliases for guest and saeed
  if (t.includes("مهمان") || t.includes("guest") || t.includes("gust")) {
    const isGuest =
      user?.email?.toLowerCase().includes("guest") ||
      user?.email?.toLowerCase().includes("gust") ||
      user?.fullName?.toLowerCase().includes("guest") ||
      user?.fullNameFa?.toLowerCase().includes("مهمان") ||
      currentUserName?.toLowerCase().includes("guest") ||
      currentUserName?.toLowerCase().includes("gust") ||
      currentUserName?.includes("مهمان");
    if (isGuest) return true;
  }

  if (t.includes("سعید") || t.includes("saeed") || t.includes("jalili")) {
    return true;
  }

  if (t === "کاربر" || t === "user" || t === "شخصی" || t === "personal") {
    return true;
  }

  return false;
}

export function useTasks(options?: {
  initialRole?: "admin" | "user";
  defaultUserName?: string;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const userDisplayName =
    user?.fullNameFa || user?.fullName || options?.defaultUserName || "کاربر";

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Role & Persona state:
  // Non-admins (users) MUST NEVER have organizational admin access
  const [roleMode, setRoleMode] = useState<"admin" | "user">(() => {
    if (!isAdmin) return "user";
    return options?.initialRole || "admin";
  });

  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    if (!isAdmin) return userDisplayName;
    return options?.defaultUserName || userDisplayName;
  });

  // Sync with localStorage across views (strictly gated for admins)
  useEffect(() => {
    if (!isAdmin) {
      setRoleMode("user");
      setCurrentUserName(userDisplayName);
      return;
    }

    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("esp_role_perspective") as
        | "admin"
        | "user"
        | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setRoleMode(savedRole);
      }
      if (savedPersona) {
        setCurrentUserName(savedPersona);
      }
    }

    const handleSync = () => {
      if (!isAdmin) {
        setRoleMode("user");
        setCurrentUserName(userDisplayName);
        return;
      }
      const savedRole = localStorage.getItem("esp_role_perspective") as
        | "admin"
        | "user"
        | null;
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
  }, [isAdmin, userDisplayName]);

  const changeRoleMode = useCallback(
    (role: "admin" | "user") => {
      if (!isAdmin) {
        setRoleMode("user");
        return;
      }
      setRoleMode(role);
      if (typeof window !== "undefined") {
        localStorage.setItem("esp_role_perspective", role);
        window.dispatchEvent(new Event("esp_role_change"));
      }
    },
    [isAdmin]
  );

  const changeCurrentUserName = useCallback(
    (name: string) => {
      if (!isAdmin) {
        setCurrentUserName(userDisplayName);
        return;
      }
      setCurrentUserName(name);
      if (typeof window !== "undefined") {
        localStorage.setItem("esp_persona_name", name);
        window.dispatchEvent(new Event("esp_role_change"));
      }
    },
    [isAdmin, userDisplayName]
  );

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

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (err) {
      console.warn("Failed to load projects in useTasks:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Identify projects in which the user is actively involved
  const userInvolvedProjects = useMemo(() => {
    return projects.filter((proj) => {
      // 1. User is in the project team
      const inTeam = proj.team?.some(
        (m) =>
          matchesUserIdentity(m.name, user, currentUserName) ||
          matchesUserIdentity(m.email, user, currentUserName) ||
          matchesUserIdentity(m.id, user, currentUserName)
      );
      if (inTeam) return true;

      // 2. User has assigned tasks in this project
      const inTasks = proj.tasks?.some((t) =>
        matchesUserIdentity(t.assignedToName, user, currentUserName)
      );
      if (inTasks) return true;

      // 3. User is assigned to tasks related to this project
      const inTaskItems = tasks.some(
        (t) =>
          t.relatedProjectId === proj.id &&
          (matchesUserIdentity(t.assignedToName, user, currentUserName) ||
            t.assignees?.some(
              (a) =>
                matchesUserIdentity(a.name, user, currentUserName) ||
                matchesUserIdentity(a.id, user, currentUserName)
            ))
      );
      if (inTaskItems) return true;

      return false;
    });
  }, [projects, tasks, user, currentUserName]);

  const userInvolvedProjectIds = useMemo(() => {
    return userInvolvedProjects.map((p) => p.id);
  }, [userInvolvedProjects]);

  // ── Core Access Evaluation ──
  // User cannot have organizational access; only sees:
  // 1. Their own tasks
  // 2. Manager defined tasks assigned to them
  // 3. Tasks in projects they are involved in
  const isTaskAccessibleToUser = useCallback(
    (task: TaskItem): boolean => {
      // Full admin oversight (only allowed if authenticated user is admin)
      if (isAdmin && roleMode === "admin") {
        return true;
      }

      // Rule 1: تسک‌های خودش و تسک‌های شخصی (Their own tasks & personal tasks)
      if (task.isPersonal || task.scope === "personal") {
        return true;
      }

      const isCreator = matchesUserIdentity(task.creatorName, user, currentUserName);
      const isSelfCreated = task.createdBy === "user" && isCreator;
      if (isCreator || isSelfCreated) {
        return true;
      }

      // Rule 2: تسک‌هایی که مدیر براش تعریف کرده (Tasks defined by manager for this user)
      const isManagerTask = task.isManagerDefined || task.createdBy === "manager";
      const isAssignedToUser =
        matchesUserIdentity(task.assignedToName, user, currentUserName) ||
        task.assignees?.some(
          (a) =>
            matchesUserIdentity(a.name, user, currentUserName) ||
            matchesUserIdentity(a.id, user, currentUserName)
        );

      if (isManagerTask && isAssignedToUser) {
        return true;
      }

      // Direct task assignment
      if (isAssignedToUser) {
        return true;
      }

      // Rule 3: پروژه‌هایی که درش دخیل هست (Projects they are involved in)
      if (
        task.relatedProjectId &&
        userInvolvedProjectIds.includes(task.relatedProjectId)
      ) {
        return true;
      }

      return false;
    },
    [isAdmin, roleMode, user, currentUserName, userInvolvedProjectIds]
  );

  const accessibleTasks = useMemo(() => {
    return tasks.filter(isTaskAccessibleToUser);
  }, [tasks, isTaskAccessibleToUser]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    accessibleTasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [accessibleTasks]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    accessibleTasks.forEach((t) => {
      if (t.company) set.add(t.company);
    });
    return Array.from(set);
  }, [accessibleTasks]);

  const allAssignees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; role: string }>();
    accessibleTasks.forEach((t) => {
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
  }, [accessibleTasks]);

  const userTasks = useMemo(() => {
    return accessibleTasks;
  }, [accessibleTasks]);

  const personalTasks = useMemo(() => {
    return accessibleTasks.filter((t) => t.isPersonal || t.scope === "personal");
  }, [accessibleTasks]);

  const stats = useMemo(() => {
    const targetSet =
      roleMode === "user" || !isAdmin
        ? accessibleTasks
        : tasks.filter((t) => !t.isPersonal && t.scope !== "personal");
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
      allTotal: targetSet.length,
      userTotal: accessibleTasks.length,
      personalTotal: personalTasks.length,
    };
  }, [tasks, accessibleTasks, personalTasks, roleMode, isAdmin]);

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return accessibleTasks.filter((task) => {
      // ── Scope Isolation: Personal vs Team tasks ──
      if (filters.scope === "personal") {
        if (!task.isPersonal && task.scope !== "personal") return false;
      } else if (filters.scope === "team") {
        // By default on team-only view, keep personal tasks strictly isolated
        if (task.isPersonal || task.scope === "personal") return false;
      }
      // When scope is "all" or undefined, allow both personal and team tasks that the user has access to!

      // Admin mode: can optionally filter by a specific assignee
      if (roleMode === "admin" && isAdmin) {
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

      if (filters.search && filters.search.trim()) {
        const candidateFields = [
          task.title,
          task.titleEn,
          task.description,
          task.descriptionEn,
          task.category,
          task.company,
          task.creatorName,
          task.assignedToName,
          task.relatedProjectTitle,
          ...(task.assignees?.map((a) => a.name) || []),
          ...(task.assignees?.map((a) => a.role) || []),
          ...(task.tags || []),
          ...(task.attachments?.map((att) => att.name) || []),
        ];

        if (!matchesSmartSearch(candidateFields, filters.search)) {
          return false;
        }
      }

      return true;
    });
  }, [accessibleTasks, filters, roleMode, isAdmin]);

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

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updated: TaskItem = {
        ...task,
        subtasks: (task.subtasks || []).filter((s) => s.id !== subtaskId),
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
    tasks: accessibleTasks,
    allTasksRaw: tasks,
    isAdmin,
    userInvolvedProjectIds,
    userInvolvedProjects,
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
    deleteSubtask,
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
