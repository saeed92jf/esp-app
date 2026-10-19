// src/modules/tasks/services/tasks.service.ts
import {
  TaskItem,
  TaskComment,
  TaskCommentReply,
  TaskAttachment,
  TaskAssignee,
} from "../types/tasks.types";

export interface TasksService {
  getTasks(): Promise<TaskItem[]>;
  getTaskById(id: string): Promise<TaskItem | null>;
  createTask(task: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">): Promise<TaskItem>;
  updateTask(task: TaskItem): Promise<TaskItem>;
  deleteTask(id: string): Promise<void>;
  addComment(taskId: string, comment: Omit<TaskComment, "id" | "createdAt" | "replies">): Promise<TaskComment>;
  addReply(taskId: string, commentId: string, reply: Omit<TaskCommentReply, "id" | "createdAt">): Promise<TaskCommentReply>;
  uploadAttachment(taskId: string, file: { name: string; size: string; type: string; url?: string; isDrawing?: boolean }): Promise<TaskAttachment>;
  deleteAttachment(taskId: string, attachmentId: string): Promise<void>;
  toggleSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<TaskItem>;
  assignCollaborator(taskId: string, collaborator: TaskAssignee): Promise<TaskItem>;
  removeCollaborator(taskId: string, collaboratorId: string): Promise<TaskItem>;
  updateProgress(taskId: string, progressPercent: number): Promise<TaskItem>;
}

export class RealTasksService implements TasksService {
  private baseUrl = "/api/tasks";

  async getTasks(): Promise<TaskItem[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch task ${id}`);
    }
    return res.json();
  }

  async createTask(task: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">): Promise<TaskItem> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  }

  async updateTask(task: TaskItem): Promise<TaskItem> {
    const res = await fetch(`${this.baseUrl}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error(`Failed to update task ${task.id}`);
    return res.json();
  }

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete task ${id}`);
  }

  async addComment(taskId: string, comment: Omit<TaskComment, "id" | "createdAt" | "replies">): Promise<TaskComment> {
    const res = await fetch(`${this.baseUrl}/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
  }

  async addReply(taskId: string, commentId: string, reply: Omit<TaskCommentReply, "id" | "createdAt">): Promise<TaskCommentReply> {
    const res = await fetch(`${this.baseUrl}/${taskId}/comments/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reply),
    });
    if (!res.ok) throw new Error("Failed to add reply");
    return res.json();
  }

  async uploadAttachment(taskId: string, file: { name: string; size: string; type: string; url?: string }): Promise<TaskAttachment> {
    const res = await fetch(`${this.baseUrl}/${taskId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(file),
    });
    if (!res.ok) throw new Error("Failed to upload attachment");
    return res.json();
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${taskId}/attachments/${attachmentId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete attachment");
  }

  async toggleSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<TaskItem> {
    const res = await fetch(`${this.baseUrl}/${taskId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error("Failed to toggle subtask");
    return res.json();
  }

  async assignCollaborator(taskId: string, collaborator: TaskAssignee): Promise<TaskItem> {
    const res = await fetch(`${this.baseUrl}/${taskId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collaborator),
    });
    if (!res.ok) throw new Error("Failed to assign collaborator");
    return res.json();
  }

  async removeCollaborator(taskId: string, collaboratorId: string): Promise<TaskItem> {
    const res = await fetch(`${this.baseUrl}/${taskId}/collaborators/${collaboratorId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove collaborator");
    return res.json();
  }

  async updateProgress(taskId: string, progressPercent: number): Promise<TaskItem> {
    const res = await fetch(`${this.baseUrl}/${taskId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progressPercent }),
    });
    if (!res.ok) throw new Error("Failed to update progress");
    return res.json();
  }
}

