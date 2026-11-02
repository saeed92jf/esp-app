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
    id: "notif-1",
    title: "درخواست عضویت جدید در پنل ادمین",
    description: "متقاضی کیوان کریمی (نوین پژوهان سرام) منتظر بررسی و تأیید مدارک پرسنلی است.",
    type: "approval_req",
    priority: "high",
    date: "۱۰:۳۰ امروز",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/admin",
    actionText: "بررسی در پنل مدیریت",
    emailPreview: {
      subject: "[Euroslot Pars] درخواست عضویت پرسنلی جدید",
      from: "system@euroslotpars.com",
      to: "saeed@euroslotpars.com",
      sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      body: "یک درخواست ثبت‌نام جدید با ایمیل سازمانی k.karimi@npceram.com ثبت شده و در انتظار تایید است.",
    },
  },
  {
    id: "notif-2",
    title: "تخصیص تسک بحرانی طراحی مبدل حرارتی",
    description: "مهندس سعید جلیلی فرد تسک شماره ESP-TK-402 را به شما محول کرده است.",
    type: "manager_task",
    priority: "urgent",
    date: "۰۹:۱۵ امروز",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    taskId: "task-402",
    actionUrl: "/dashboard/tasks",
    actionText: "مشاهده تسک",
  },
  {
    id: "notif-3",
    title: "جلسه فنی بررسی نقشه‌های P&ID مخزن تحت فشار",
    description: "جلسه با واحد مهندسی مکانیک امروز ساعت ۱۴:۰۰ در اتاق کنفرانس مرکزی برگزار خواهد شد.",
    type: "event",
    priority: "medium",
    date: "دیروز",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "notif-4",
    title: "به‌روزرسانی امنیتی پلتفرم ERP",
    description: "نسخه جدید ماژول محاسبات مهندسی و مدیریت سطوح دسترسی مستقر شد.",
    type: "system",
    priority: "low",
    date: "۲ روز پیش",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
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

