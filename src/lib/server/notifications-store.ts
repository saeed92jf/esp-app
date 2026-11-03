// src/lib/server/notifications-store.ts
import type {
  AppNotification,
  CreateNotificationInput,
  GetNotificationsQuery,
} from "@/services/notifications.service";

declare global {
  // eslint-disable-next-line no-var
  var __espServerNotifications: AppNotification[] | undefined;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-sys-1",
    title: "پلتفرم مدیریت سیستم آماده به کار است",
    description: "ارتباط کامل با سرور بک‌اند برقرار شد و سرویس‌های احراز هویت و مدیریت کاربران فعال می‌باشند.",
    type: "system",
    priority: "medium",
    date: "هم‌اکنون",
    createdAt: new Date().toISOString(),
    read: false,
    actionUrl: "/dashboard",
    actionText: "مشاهده داشبورد",
  },
  {
    id: "notif-admin-1",
    title: "حساب‌های فعال مدیران سیستم",
    description: "حساب‌های کاربری مهندس سعید جلیلی فرد و مهندس شفیعی با دسترسی کامل ادمین در سامانه ثبت شده‌اند.",
    type: "system",
    priority: "high",
    date: "امروز",
    createdAt: new Date().toISOString(),
    read: false,
    actionUrl: "/admin",
    actionText: "پنل مدیریت",
  },
];

if (!globalThis.__espServerNotifications) {
  globalThis.__espServerNotifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
}

export function getServerNotifications(query?: GetNotificationsQuery): {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
} {
  let list = [...(globalThis.__espServerNotifications || [])];

  if (query?.unreadOnly) {
    list = list.filter((n) => !n.read);
  }

  if (query?.type) {
    list = list.filter((n) => n.type === query.type);
  }

  const total = list.length;
  const unreadCount = (globalThis.__espServerNotifications || []).filter((n) => !n.read).length;

  const offset = query?.offset || 0;
  const limit = query?.limit || 50;
  const paginated = list.slice(offset, offset + limit);

  return {
    notifications: paginated,
    total,
    unreadCount,
  };
}

export function createServerNotification(input: CreateNotificationInput): AppNotification {
  const list = globalThis.__espServerNotifications || [];
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    title: input.title,
    description: input.description,
    type: input.type || "system",
    priority: input.priority || "medium",
    date: "هم‌اکنون",
    createdAt: new Date().toISOString(),
    read: false,
    actionUrl: input.actionUrl,
    actionText: input.actionText,
    taskId: input.taskId,
    emailPreview: input.emailPreview,
    metadata: input.metadata,
  };

  list.unshift(newNotif);
  globalThis.__espServerNotifications = list;
  return newNotif;
}

export function markServerNotificationAsRead(id: string): boolean {
  const list = globalThis.__espServerNotifications || [];
  const item = list.find((n) => n.id === id);
  if (!item) return false;
  item.read = true;
  globalThis.__espServerNotifications = list;
  return true;
}

export function markAllServerNotificationsAsRead(): number {
  const list = globalThis.__espServerNotifications || [];
  let count = 0;
  list.forEach((n) => {
    if (!n.read) {
      n.read = true;
      count++;
    }
  });
  globalThis.__espServerNotifications = list;
  return count;
}

