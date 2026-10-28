import tasksMock from "@/data/mock/tasks.json";
// src/modules/tasks/services/fake-tasks.service.ts
import { TasksService } from "./tasks.service";
import {
  TaskItem,
  TaskComment,
  TaskCommentReply,
  TaskAttachment,
  TaskAssignee,
} from "../types/tasks.types";

const STORAGE_KEY = "esp_tasks_data_v8";

export const INITIAL_MOCK_TASKS: TaskItem[] = tasksMock as unknown as TaskItem[];

export class FakeTasksService implements TasksService {
  private tasks: TaskItem[] = [];

  constructor() {
    this.initTasks();
  }

  private initTasks() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.tasks = JSON.parse(stored);
          return;
        }
      } catch {}
    }
    this.tasks = [...INITIAL_MOCK_TASKS];
    this.persist();
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
        window.dispatchEvent(
          new CustomEvent("esp_tasks_change", { detail: this.tasks })
        );
      } catch {}
    }
  }

  async getTasks(): Promise<TaskItem[]> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.tasks = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.tasks]), 80);
    });
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.tasks = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.tasks.find((t) => t.id === id);
        resolve(found ? { ...found } : null);
      }, 70);
    });
  }

  async createTask(
    taskData: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
  ): Promise<TaskItem> {
    return new Promise((resolve) => {
      const newTask: TaskItem = {
        ...taskData,
        id: `task-${Date.now()}`,
        comments: [],
        attachments: [],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "created",
            authorName: taskData.creatorName || "کاربر",
            timestamp: new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date()),
            details: taskData.isManagerDefined
              ? "تسک سازمانی توسط مدیر تعریف شد."
              : "تسک جدید ثبت شد.",
          },
        ],
      };

      this.tasks.unshift(newTask);
      this.persist();
      setTimeout(() => resolve(newTask), 150);
    });
  }

  async updateTask(task: TaskItem): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index === -1) {
        return reject(new Error("Task not found"));
      }

      this.tasks[index] = { ...task };
      this.persist();
      setTimeout(() => resolve(this.tasks[index]), 150);
    });
  }

  async deleteTask(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index === -1) {
        return reject(new Error("Task not found"));
      }

      if (this.tasks[index].isManagerDefined) {
        return reject(new Error("تسک‌های ابلاغی مدیر قابل حذف نیستند."));
      }

      this.tasks.splice(index, 1);
      this.persist();
      setTimeout(() => resolve(), 150);
    });
  }

  async addComment(
    taskId: string,
    commentData: Omit<TaskComment, "id" | "createdAt" | "replies">
  ): Promise<TaskComment> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const newComment: TaskComment = {
        ...commentData,
        id: `comm-${Date.now()}`,
        createdAt: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        likes: 0,
        replies: [],
      };

      task.comments = task.comments || [];
      task.comments.push(newComment);

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "comment_added",
        authorName: commentData.authorName,
        timestamp: newComment.createdAt,
        details: commentData.attachments?.length
          ? `نظر جدید به همراه الحاقیه نقشه/فایل ثبت شد.`
          : `نظر جدید ثبت شد: "${commentData.content.slice(0, 35)}..."`,
      });

      this.persist();
      setTimeout(() => resolve(newComment), 150);
    });
  }

  async addReply(
    taskId: string,
    commentId: string,
    replyData: Omit<TaskCommentReply, "id" | "createdAt">
  ): Promise<TaskCommentReply> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const comment = task.comments.find((c) => c.id === commentId);
      if (!comment) return reject(new Error("Comment not found"));

      const newReply: TaskCommentReply = {
        ...replyData,
        id: `rep-${Date.now()}`,
        createdAt: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        likes: 0,
      };

      comment.replies = comment.replies || [];
      comment.replies.push(newReply);

      this.persist();
      setTimeout(() => resolve(newReply), 150);
    });
  }

  async uploadAttachment(
    taskId: string,
    file: {
      name: string;
      size: string;
      type: string;
      url?: string;
      uploaderName?: string;
      isDrawing?: boolean;
    }
  ): Promise<TaskAttachment> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        isDrawing: file.isDrawing,
        uploaderName: file.uploaderName || "سعید جلیلی",
        uploadedAt: new Intl.DateTimeFormat("fa-IR").format(new Date()),
      };

      task.attachments = task.attachments || [];
      task.attachments.unshift(newAttachment);

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "attachment_added",
        authorName: newAttachment.uploaderName || "کاربر",
        timestamp: newAttachment.uploadedAt,
        details: `پیوست ${newAttachment.name} بارگذاری شد.`,
      });

      this.persist();
      setTimeout(() => resolve(newAttachment), 150);
    });
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.attachments = (task.attachments || []).filter((a) => a.id !== attachmentId);
      this.persist();
      setTimeout(() => resolve(), 150);
    });
  }

  async toggleSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const sub = task.subtasks.find((s) => s.id === subtaskId);
      if (sub) {
        sub.completed = completed;
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async assignCollaborator(taskId: string, collaborator: TaskAssignee): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.assignees = task.assignees || [];
      if (!task.assignees.some((a) => a.id === collaborator.id || a.name === collaborator.name)) {
        task.assignees.push(collaborator);
        task.activities = task.activities || [];
        task.activities.unshift({
          id: `act-${Date.now()}`,
          type: "collaborator_added",
          authorName: "مدیر سیستم",
          timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
          details: `همکار جدید (${collaborator.name} - ${collaborator.role}) به تسک اضافه شد.`,
        });
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async removeCollaborator(taskId: string, collaboratorId: string): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const removed = task.assignees?.find((a) => a.id === collaboratorId);
      task.assignees = (task.assignees || []).filter((a) => a.id !== collaboratorId);

      if (removed) {
        task.activities = task.activities || [];
        task.activities.unshift({
          id: `act-${Date.now()}`,
          type: "collaborator_removed",
          authorName: "مدیر سیستم",
          timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
          details: `همکار (${removed.name}) از تسک برداشته شد.`,
        });
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async updateProgress(taskId: string, progressPercent: number): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.progressPercent = Math.max(0, Math.min(100, progressPercent));
      if (task.progressPercent === 100 && task.status !== "completed") {
        task.status = "completed";
      }

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "progress_updated",
        authorName: "مدیر",
        timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
        details: `درصد پیشرفت تسک به ${task.progressPercent}٪ به‌روزرسانی شد.`,
      });

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }
}

export const fakeTasksService = new FakeTasksService();
