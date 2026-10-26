// src/lib/server/projects-tasks-store.ts
import { INITIAL_PROJECTS, DEFAULT_PROJECT_PHASES } from "@/modules/projects/services/fake-projects.service";
import { INITIAL_MOCK_TASKS } from "@/modules/tasks/services/fake-tasks.service";
import type { ProjectItem, ProjectTaskItem } from "@/modules/projects/types/projects.types";
import type { TaskItem } from "@/modules/tasks/types/tasks.types";

// In-memory persistent server singleton across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __espServerProjects: ProjectItem[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerTasks: TaskItem[] | undefined;
}

if (!globalThis.__espServerProjects) {
  globalThis.__espServerProjects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
}

if (!globalThis.__espServerTasks) {
  globalThis.__espServerTasks = JSON.parse(JSON.stringify(INITIAL_MOCK_TASKS));
}

export function getServerProjects(filters?: {
  organization?: string;
  status?: string;
  search?: string;
}): ProjectItem[] {
  let list = globalThis.__espServerProjects || [];

  if (filters?.organization && filters.organization !== "all") {
    list = list.filter((p) => p.organization === filters.organization);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.quotationNumber.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getServerProjectById(id: string): ProjectItem | null {
  const list = globalThis.__espServerProjects || [];
  return list.find((p) => p.id === id || p.code === id) || null;
}

export function createServerProject(data: Omit<ProjectItem, "id">): ProjectItem {
  const newProj: ProjectItem = {
    ...data,
    id: `prj-${Date.now()}`,
    phases: data.phases && data.phases.length > 0 ? data.phases : DEFAULT_PROJECT_PHASES,
    vdisDocuments: data.vdisDocuments || [],
    transmittals: data.transmittals || [],
    risks: data.risks || [],
    tasks: data.tasks || [],
    strategicGoals: data.strategicGoals || [],
    roadmapNodes: data.roadmapNodes || [],
  };

  globalThis.__espServerProjects = [newProj, ...(globalThis.__espServerProjects || [])];
  return newProj;
}

export function updateServerProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
  const list = globalThis.__espServerProjects || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  list[idx] = { ...list[idx], ...updates, id: list[idx].id };
  return list[idx];
}

export function deleteServerProject(id: string): boolean {
  const list = globalThis.__espServerProjects || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  list.splice(idx, 1);
  return true;
}

export function addServerProjectTask(projectId: string, task: Omit<ProjectTaskItem, "id">): ProjectTaskItem | null {
  const proj = getServerProjectById(projectId);
  if (!proj) return null;

  const newTask: ProjectTaskItem = {
    ...task,
    id: `pt-${Date.now()}`,
  };

  proj.tasks = proj.tasks || [];
  proj.tasks.unshift(newTask);
  return newTask;
}

export function getServerTasks(filters?: {
  projectId?: string;
  company?: string;
  status?: string;
  scope?: string;
  search?: string;
}): TaskItem[] {
  let list = globalThis.__espServerTasks || [];

  if (filters?.projectId && filters.projectId !== "all") {
    list = list.filter((t) => t.relatedProjectId === filters.projectId);
  }
  if (filters?.company && filters.company !== "all") {
    list = list.filter((t) => t.company === filters.company);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters?.scope && filters.scope !== "all") {
    list = list.filter((t) => t.scope === filters.scope);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.relatedProjectTitle && t.relatedProjectTitle.toLowerCase().includes(q)) ||
        t.assignedToName.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getServerTaskById(id: string): TaskItem | null {
  const list = globalThis.__espServerTasks || [];
  return list.find((t) => t.id === id) || null;
}

export function createServerTask(
  data: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
): TaskItem {
  const newTask: TaskItem = {
    ...data,
    id: `task-${Date.now()}`,
    comments: [],
    attachments: [],
    activities: [
      {
        id: `act-${Date.now()}`,
        type: "created",
        authorName: data.creatorName || "کاربر",
        timestamp: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        details: data.isManagerDefined
          ? "تسک سازمانی توسط مدیر تعریف شد."
          : "تسک جدید ثبت شد.",
      },
    ],
  };

  globalThis.__espServerTasks = [newTask, ...(globalThis.__espServerTasks || [])];

  // If connected to a project, sync with project task list
  if (data.relatedProjectId && data.relatedProjectId !== "proj-custom") {
    addServerProjectTask(data.relatedProjectId, {
      title: newTask.title,
      phaseId: "ph-1",
      status: newTask.status === "completed" ? "done" : newTask.status === "in_progress" ? "in_progress" : "todo",
      priority: newTask.priority,
      assignedToName: newTask.assignedToName,
      assignedToRole: newTask.assignedToRole,
      dueDate: newTask.dueDate,
      progressPercent: newTask.progressPercent || 0,
      commentsCount: 0,
      attachmentsCount: 0,
    });
  }

  return newTask;
}

export function updateServerTask(id: string, updates: Partial<TaskItem>): TaskItem | null {
  const list = globalThis.__espServerTasks || [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  list[idx] = { ...list[idx], ...updates, id: list[idx].id };
  return list[idx];
}

export function deleteServerTask(id: string): boolean {
  const list = globalThis.__espServerTasks || [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  list.splice(idx, 1);
  return true;
}
