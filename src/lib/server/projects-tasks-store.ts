// src/lib/server/projects-tasks-store.ts
import type { ProjectItem, ProjectTaskItem, ProjectPhase } from "@/modules/projects/types/projects.types";
import type { TaskItem } from "@/modules/tasks/types/tasks.types";

export const DEFAULT_PROJECT_PHASES: ProjectPhase[] = [
  { id: "ph-1", name: "Basic Engineering", order: 1, progressPercent: 0, status: "pending" },
  { id: "ph-2", name: "Detailed Engineering", order: 2, progressPercent: 0, status: "pending" },
  { id: "ph-3", name: "Procurement", order: 3, progressPercent: 0, status: "pending" },
  { id: "ph-4", name: "Fabrication", order: 4, progressPercent: 0, status: "pending" },
  { id: "ph-5", name: "QC & Testing", order: 5, progressPercent: 0, status: "pending" },
  { id: "ph-6", name: "Delivery & Commissioning", order: 6, progressPercent: 0, status: "pending" },
];

// In-memory persistent server singleton across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __espServerProjects_v4: ProjectItem[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerTasks_v9: TaskItem[] | undefined;
}

if (!globalThis.__espServerProjects_v4) {
  globalThis.__espServerProjects_v4 = [];
}

if (!globalThis.__espServerTasks_v9) {
  globalThis.__espServerTasks_v9 = [];
}

export function getServerProjects(filters?: {
  organization?: string;
  status?: string;
  search?: string;
}): ProjectItem[] {
  let list = globalThis.__espServerProjects_v4 || [];

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
  const list = globalThis.__espServerProjects_v4 || [];
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

  globalThis.__espServerProjects_v4 = [newProj, ...(globalThis.__espServerProjects_v4 || [])];
  return newProj;
}

export function updateServerProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
  const list = globalThis.__espServerProjects_v4 || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  list[idx] = { ...list[idx], ...updates, id: list[idx].id };
  return list[idx];
}

export function deleteServerProject(id: string): boolean {
  const list = globalThis.__espServerProjects_v4 || [];
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
  let list = globalThis.__espServerTasks_v9 || [];

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
  const list = globalThis.__espServerTasks_v9 || [];
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

  globalThis.__espServerTasks_v9 = [newTask, ...(globalThis.__espServerTasks_v9 || [])];

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

export function updateServerTask(id: string, updates: Partial<TaskItem> & { subtask_toggle?: any; _subtask_toggle?: any }): TaskItem | null {
  const list = globalThis.__espServerTasks_v9 || [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  const toggle = updates.subtask_toggle || updates._subtask_toggle;
  if (toggle && current.subtasks) {
    current.subtasks = current.subtasks.map((st: any) => {
      if (String(st.id) === String(toggle.id)) {
        return {
          ...st,
          is_done: Boolean(toggle.is_done),
          completed_by_id: toggle.completed_by_id,
          completed_by_name: toggle.completed_by_name,
          completed_at: toggle.is_done ? new Date().toISOString() : null,
        };
      }
      return st;
    });
  }

  list[idx] = { ...current, ...updates, id: current.id };
  return list[idx];
}

export function deleteServerTask(id: string): boolean {
  const list = globalThis.__espServerTasks_v9 || [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  list.splice(idx, 1);
  return true;
}

// In-memory letters store fallback
declare global {
  // eslint-disable-next-line no-var
  var __espServerLetters_v1: any[] | undefined;
}

if (!globalThis.__espServerLetters_v1) {
  globalThis.__espServerLetters_v1 = [];
}

export function getServerLetters(filters?: { status?: string; projectId?: string; search?: string }): any[] {
  let list = globalThis.__espServerLetters_v1 || [];
  if (filters?.projectId && filters.projectId !== "all") {
    list = list.filter((l) => l.projectId === filters.projectId || l.espNumber === filters.projectId);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((l) => l.status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (l) =>
        (l.letterNumber || "").toLowerCase().includes(q) ||
        (l.subject || "").toLowerCase().includes(q) ||
        (l.recipient || "").toLowerCase().includes(q) ||
        (l.projectName || "").toLowerCase().includes(q)
    );
  }
  return [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export function createServerLetter(projectId: string, data: any): any {
  const newLetter = {
    ...data,
    id: `let_${Date.now()}`,
    projectId,
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalThis.__espServerLetters_v1 = [newLetter, ...(globalThis.__espServerLetters_v1 || [])];
  return newLetter;
}

export function reviewServerLetter(letterId: string, review: any): any | null {
  const list = globalThis.__espServerLetters_v1 || [];
  const idx = list.findIndex((l) => l.id === letterId);
  if (idx === -1) return null;
  const isApproved = review.decision === "approved";
  list[idx] = {
    ...list[idx],
    status: isApproved ? "approved" : "rejected",
    managerReview: {
      ...review,
      reviewedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
  return list[idx];
}

export function sendServerLetter(letterId: string, info: any): any | null {
  const list = globalThis.__espServerLetters_v1 || [];
  const idx = list.findIndex((l) => l.id === letterId);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    status: "sent",
    sentInfo: {
      ...info,
      sentAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
  return list[idx];
}

export function deleteServerLetter(letterId: string): boolean {
  const list = globalThis.__espServerLetters_v1 || [];
  const idx = list.findIndex((l) => l.id === letterId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}
