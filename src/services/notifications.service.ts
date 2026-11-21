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

