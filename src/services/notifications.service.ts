// src/services/notifications.service.ts
import type { HttpClient } from "./core/http";
import { SAMPLE_NOTIFICATIONS } from "@/modules/dashboard/services/dashboard.service";

export type NotificationType =
  | "system"
  | "manager_task"
  | "approval_req"
  | "event"
  | "routine"
  | "message";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface EmailPreview {
  subject: string;
  from: string;
  to: string;
  body: string;
  sentAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  priority?: NotificationPriority;
  date: string;
  createdAt?: string;
  read: boolean;
  taskId?: string;
  actionUrl?: string;
  actionText?: string;
  emailPreview?: EmailPreview;
  metadata?: Record<string, unknown>;
}

export interface NotificationsListResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
}

export interface GetNotificationsQuery {
  unreadOnly?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export interface CreateNotificationInput {
  title: string;
  description: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  recipientId?: string;
  actionUrl?: string;
  actionText?: string;
  taskId?: string;
  emailPreview?: EmailPreview;
  metadata?: Record<string, unknown>;
}

export interface INotificationsService {
  getNotifications(query?: GetNotificationsQuery): Promise<NotificationsListResponse>;
  getUnreadCount(): Promise<number>;
  markAsRead(notificationId: string): Promise<{ success: boolean; id: string }>;
  markAllAsRead(): Promise<{ success: boolean; count: number }>;
  deleteNotification(notificationId: string): Promise<{ success: boolean; id: string }>;
  createNotification(input: CreateNotificationInput): Promise<AppNotification>;
}

// ─── Real Implementation ───────────────────────────────────────────────────────

export class RealNotificationsService implements INotificationsService {
  constructor(private http: HttpClient) {}

  async getNotifications(query?: GetNotificationsQuery): Promise<NotificationsListResponse> {
    return this.http.get<NotificationsListResponse>("/notifications", {
      params: {
        unreadOnly: query?.unreadOnly,
        type: query?.type,
        limit: query?.limit,
        offset: query?.offset,
      },
    });
  }

  async getUnreadCount(): Promise<number> {
    const res = await this.http.get<{ count: number }>("/notifications/unread-count");
    return res.count;
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean; id: string }> {
    return this.http.patch<{ success: boolean; id: string }>(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return this.http.patch<{ success: boolean; count: number }>("/notifications/read-all");
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(`/notifications/${notificationId}`);
  }

  async createNotification(input: CreateNotificationInput): Promise<AppNotification> {
    return this.http.post<AppNotification>("/notifications", input);
  }
}

// ─── Fake / Mock Implementation ───────────────────────────────────────────────

export class FakeNotificationsService implements INotificationsService {
  private readonly storageKey = "esp_dashboard_notifications";

  private getItems(): AppNotification[] {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return (parsed || []).filter((n: any) => !["notif-1", "notif-2", "notif-3", "notif-sys-1", "notif-admin-1", "notif-admin-req"].includes(n.id));
      } catch {}
    }
    return [];
  }

  private saveItems(items: AppNotification[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {}
    window.dispatchEvent(new CustomEvent("esp_notifications_updated", { detail: items }));
  }

  async getNotifications(query?: GetNotificationsQuery): Promise<NotificationsListResponse> {
    let list = this.getItems();
    if (query?.unreadOnly) {
      list = list.filter((n) => !n.read);
    }
    if (query?.type) {
      list = list.filter((n) => n.type === query.type);
    }
    const unreadCount = this.getItems().filter((n) => !n.read).length;
    const offset = query?.offset || 0;
    const limit = query?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return {
      notifications: paginated,
      total: list.length,
      unreadCount,
    };
  }

  async getUnreadCount(): Promise<number> {
    const list = this.getItems();
    return list.filter((n) => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean; id: string }> {
    const list = this.getItems();
    const updated = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    this.saveItems(updated);
    return { success: true, id: notificationId };
  }

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    const list = this.getItems();
    const unreadBefore = list.filter((n) => !n.read).length;
    const updated = list.map((n) => ({ ...n, read: true }));
    this.saveItems(updated);
    return { success: true, count: unreadBefore };
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean; id: string }> {
    const list = this.getItems();
    const updated = list.filter((n) => n.id !== notificationId);
    this.saveItems(updated);
    return { success: true, id: notificationId };
  }

  async createNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const list = this.getItems();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: input.title,
      description: input.description,
      type: input.type || "system",
      priority: input.priority || "medium",
      date: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
      read: false,
      taskId: input.taskId,
      actionUrl: input.actionUrl,
      actionText: input.actionText,
      emailPreview: input.emailPreview,
      metadata: input.metadata,
    };

    const updated = [newNotif, ...list];
    this.saveItems(updated);
    window.dispatchEvent(new CustomEvent("esp_notification_added", { detail: newNotif }));
    return newNotif;
  }
}

