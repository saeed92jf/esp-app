// src/modules/tasks/services/new-tasks.service.ts
// New real tasks service that works with the new backend schema

export interface TaskAttachmentItem {
  id?: string;
  name: string;
  size?: string;
  type?: string;
  url?: string;
  uploaded_by?: string;
  uploaded_at?: string;
}

export interface NewTaskSubtask {
  id: string;
  title: string;
  is_done: boolean;
  assigned_to_id?: string;
  assigned_to_name?: string;
  completed_by_id?: string;
  completed_by_name?: string;
  completed_at?: string;
}

export interface NewTaskProgress {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  attachments: TaskAttachmentItem[];
  created_at: string;
  is_admin_note: boolean;
  is_system_event?: boolean;
  reply_to?: {
    id: string;
    author_name: string;
    content: string;
  } | null;
}

export interface NewTaskAssignee {
  userId: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface NewTask {
  id: string;
  title: string;
  description: string;
  subtasks: NewTaskSubtask[];
  assignees: NewTaskAssignee[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  deadline: string | null;
  priority: "low" | "medium" | "high" | "critical";
  company: string;
  tags: string[];
  status: "todo" | "in_progress" | "review" | "done" | "cancelled";
  attachments: TaskAttachmentItem[];
  project_id?: string | null;
  project_name?: string | null;
  project_esp_number?: string | null;
  is_independent?: boolean;
  progress: NewTaskProgress[];
  is_approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
}

export interface NewTaskCreate {
  title: string;
  description?: string;
  subtasks?: Omit<NewTaskSubtask, "id">[];
  assignees?: NewTaskAssignee[];
  created_by: string;
  created_by_name: string;
  deadline?: string | null;
  priority?: "low" | "medium" | "high" | "critical";
  company?: string;
  tags?: string[];
  attachments?: TaskAttachmentItem[];
  project_id?: string | null;
  project_name?: string | null;
  project_esp_number?: string | null;
  is_independent?: boolean;
}

export interface NewTaskUpdate {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "done" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  deadline?: string | null;
  company?: string;
  tags?: string[];
  subtasks?: NewTaskSubtask[];
  assignees?: NewTaskAssignee[];
  attachments?: TaskAttachmentItem[];
  project_id?: string | null;
  project_name?: string | null;
  project_esp_number?: string | null;
  is_independent?: boolean;
}

export interface ProgressCreate {
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  attachments?: TaskAttachmentItem[];
  is_admin_note?: boolean;
  reply_to?: {
    id: string;
    author_name: string;
    content: string;
  } | null;
}

class NewTasksService {
  private baseUrl = "/api/tasks";

  async getTasks(params?: { assigneeId?: string; status?: string }): Promise<NewTask[]> {
    const url = new URL(this.baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:4000");
    if (params?.assigneeId) url.searchParams.set("assignee_id", params.assigneeId);
    if (params?.status) url.searchParams.set("status", params.status);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const data = await res.json();
    // Handle both array response and object with items
    return Array.isArray(data) ? data : (data.items || data.tasks || []);
  }

  async getTaskById(id: string): Promise<NewTask | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch task ${id}`);
    return res.json();
  }

  async createTask(task: NewTaskCreate): Promise<NewTask> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to create task");
    }
    return res.json();
  }

  async updateTask(id: string, updates: NewTaskUpdate): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update task ${id}`);
    return res.json();
  }

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete task ${id}`);
  }

  async addProgress(taskId: string, progress: ProgressCreate): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${taskId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to add progress");
    }
    return res.json();
  }

  async startTask(taskId: string, userId: string, userName: string, note?: string): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${taskId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, user_name: userName, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to start task");
    }
    return res.json();
  }

  async approveTask(taskId: string, approvedBy: string, approvedByName: string): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${taskId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved_by: approvedBy, approved_by_name: approvedByName }),
    });
    if (!res.ok) throw new Error("Failed to approve task");
    return res.json();
  }

  async toggleSubtask(
    taskId: string,
    subtaskId: string,
    isDone: boolean,
    completedBy?: { id: string; name: string },
    updatedSubtasks?: NewTaskSubtask[]
  ): Promise<NewTask> {
    const payload = {
      id: subtaskId,
      is_done: isDone,
      completed_by_id: completedBy?.id,
      completed_by_name: completedBy?.name,
    };
    const body: Record<string, any> = {
      subtask_toggle: payload,
      _subtask_toggle: payload,
    };
    if (updatedSubtasks) {
      body.subtasks = updatedSubtasks;
    }
    const res = await fetch(`${this.baseUrl}/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to toggle subtask");
    return res.json();
  }

  async uploadAttachment(file: File): Promise<TaskAttachmentItem> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to upload file");
    }
    return res.json();
  }

  async submitForReview(taskId: string, userId: string, userName: string, note?: string): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${taskId}/submit-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, user_name: userName, note: note || "" }),
    });
    if (!res.ok) throw new Error("Failed to submit task for review");
    return res.json();
  }

  async requestChanges(taskId: string, adminId: string, adminName: string, feedback: string): Promise<NewTask> {
    const res = await fetch(`${this.baseUrl}/${taskId}/request-changes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId, admin_name: adminName, feedback }),
    });
    if (!res.ok) throw new Error("Failed to request changes");
    return res.json();
  }
}

export const newTasksService = new NewTasksService();
