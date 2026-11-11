"use client";
// src/modules/dashboard/components/notifications/notifications-popover.tsx
import { api } from "@/services";

import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  Calendar,
  Lock,
  Mail,
  Flame,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { IoNotifications } from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";
import {
  type DashboardNotificationItem,
  type DashboardTask,
  SAMPLE_TASKS,
} from "../../services/dashboard.service";
import { ManagerEmailModal } from "../tasks/manager-email-modal";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { playNotificationChime, triggerDesktopNotification } from "@/modules/notifications/components/desktop-notification-manager";

interface NotificationsPopoverProps {
  notifications?: DashboardNotificationItem[];
  tasks?: DashboardTask[];
  triggerClassName?: string;
  iconClassName?: string;
  unreadCount?: number;
}

type NotificationSegment = "all" | "unread";

function getLocalizedNotification(notif: any, locale: string) {
  let title =
    locale === "en"
      ? notif.titleEn || notif.title
      : notif.titleFa || notif.title;
  let description =
    locale === "en"
      ? notif.descriptionEn || notif.description
      : notif.descriptionFa || notif.description;
  let date = notif.date || "";

  const isPersian = (str?: string) => /[\u0600-\u06FF]/.test(str || "");

  if (locale === "en") {
    if (date === "هم‌اکنون") date = "Just now";
    if (date === "امروز") date = "Today";
    if (date === "دیروز") date = "Yesterday";

    if (isPersian(title)) {
      if (title.includes("حساب کاربری شما فعال شد")) {
        title = "Your Account Has Been Activated";
        description =
          "Your account has been approved and activated by System Admin. Credentials and access permissions are configured.";
      } else if (title.startsWith("تأیید و فعال‌سازی حساب:")) {
        const name = title.replace("تأیید و فعال‌سازی حساب:", "").trim();
        title = `Account Approved & Activated: ${name}`;
      } else if (title.startsWith("درخواست ویرایش اطلاعات:")) {
        const name = title.replace("درخواست ویرایش اطلاعات:", "").trim();
        title = `Profile Edit Request: ${name}`;
      } else if (title.startsWith("حذف درخواست:")) {
        const name = title.replace("حذف درخواست:", "").trim();
        title = `Request Removed: ${name}`;
      } else if (title.startsWith("رد درخواست:")) {
        const name = title.replace("رد درخواست:", "").trim();
        title = `Request Rejected: ${name}`;
      } else if (title.includes("تغییر رمز عبور کاربر")) {
        title = "User Password Changed";
      } else if (title.includes("ایجاد حساب کاربری")) {
        title = "New User Account Created";
      }
    }

    if (isPersian(description)) {
      if (description.includes("در سامانه ثبت شد و منتظر بررسی است")) {
        const emailMatch = description.match(/[\w.-]+@[\w.-]+\.\w+/);
        const email = emailMatch ? emailMatch[0] : "user";
        description = `Profile update request for ${email} has been registered and is awaiting review.`;
      } else if (description.includes("تأیید و فعال گردید")) {
        description =
          "Your account has been approved and activated by System Admin. Credentials and access permissions are configured.";
      } else if (description.includes("در سیستم تأیید و فعال شد")) {
        description =
          "User account has been reviewed, approved and successfully activated in the system.";
      } else if (
        description.includes("توسط") &&
        description.includes("بازنشانی و تغییر یافت")
      ) {
        description =
          "User password has been successfully reset and updated by System Admin.";
      }
    }
  } else {
    if (date === "Just now") date = "هم‌اکنون";
    if (date === "Today") date = "امروز";
    if (date === "Yesterday") date = "دیروز";

    if (!isPersian(title)) {
      if (title.includes("Your Account Has Been Activated")) {
        title = "حساب کاربری شما فعال شد";
        description =
          "حساب کاربری شما توسط مدیر سیستم تأیید و فعال گردید. رمز عبور و دسترسی‌ها تنظیم شد.";
      } else if (title.startsWith("Account Approved & Activated:")) {
        const name = title.replace("Account Approved & Activated:", "").trim();
        title = `تأیید و فعال‌سازی حساب: ${name}`;
      } else if (title.startsWith("Profile Edit Request:")) {
        const name = title.replace("Profile Edit Request:", "").trim();
        title = `درخواست ویرایش اطلاعات: ${name}`;
      } else if (title.startsWith("Request Removed:")) {
        const name = title.replace("Request Removed:", "").trim();
        title = `حذف درخواست: ${name}`;
      } else if (title.startsWith("Request Rejected:")) {
        const name = title.replace("Request Rejected:", "").trim();
        title = `رد درخواست: ${name}`;
      } else if (
        title.includes("User Password Changed") ||
        title.includes("Password Changed")
      ) {
        title = "تغییر رمز عبور کاربر";
      }
    }
  }

  return { title, description, date };
}

function getNotificationTargetUrl(notif: any): string {
  if (notif.actionUrl) return notif.actionUrl;
  if (notif.link) return notif.link;
  if (notif.url) return notif.url;

  if (notif.taskId) return `/tasks/${notif.taskId}`;

  const type = notif.type;
  const title = (notif.titleFa || notif.titleEn || notif.title || "").toLowerCase();
  const desc = (notif.descriptionFa || notif.descriptionEn || notif.description || "").toLowerCase();

  if (type === "manager_task") return "/tasks";
  if (type === "event") return "/calendar";
  if (type === "routine") return "/dashboard";

  // Request notifications (edit request, account request, etc.)
  if (
    type === "approval_req" ||
    title.includes("درخواست") ||
    desc.includes("درخواست") ||
    title.includes("request") ||
    desc.includes("request")
  ) {
    if (
      title.includes("ویرایش") ||
      desc.includes("ویرایش") ||
      title.includes("edit") ||
      desc.includes("edit")
    ) {
      return "/profile?tab=requests";
    }
    return "/admin?tab=requests";
  }

  // User activation or account
  if (
    title.includes("فعال‌سازی") ||
    title.includes("حساب کاربری") ||
    title.includes("رمز عبور") ||
    title.includes("activated") ||
    title.includes("password")
  ) {
    return "/profile";
  }

  // Projects
  if (title.includes("پروژه") || desc.includes("پروژه") || title.includes("project") || desc.includes("project")) {
    return "/projects";
  }

  // Tasks
  if (title.includes("تسک") || desc.includes("تسک") || title.includes("task") || desc.includes("task")) {
    return "/tasks";
  }

  return "/dashboard";
}

export function NotificationsPopover({
  notifications,
  tasks = [],
  triggerClassName,
  iconClassName,
  unreadCount: externalUnreadCount,
}: NotificationsPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSegment, setActiveSegment] =
    useState<NotificationSegment>("all");
  const [items, setItems] = useState<DashboardNotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esp_dashboard_notifications");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return (parsed || []).filter(
            (n: any) =>
              ![
                "notif-1",
                "notif-2",
                "notif-3",
                "notif-sys-1",
                "notif-admin-1",
                "notif-admin-req",
              ].includes(n.id)
          );
        } catch { }
      }
    }
    if (notifications && notifications.length > 0) {
      return notifications.filter(
        (n) =>
          ![
            "notif-1",
            "notif-2",
            "notif-3",
            "notif-sys-1",
            "notif-admin-1",
            "notif-admin-req",
          ].includes(n.id)
      );
    }
    return [];
  });
  const [selectedTaskForEmail, setSelectedTaskForEmail] =
    useState<DashboardTask | null>(null);
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>("default");
  const [isDesktopEnabled, setIsDesktopEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const pref = localStorage.getItem("esp_desktop_notifications_enabled");
    if (pref === "false") return false;
    if (pref === "true") return true;
    return "Notification" in window && Notification.permission === "granted";
  });
  const [isTogglingDesktop, setIsTogglingDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = Notification.permission;
      setDesktopPermission(perm);
      const pref = localStorage.getItem("esp_desktop_notifications_enabled");
      if (pref === "false") {
        setIsDesktopEnabled(false);
      } else if (pref === "true" || perm === "granted") {
        setIsDesktopEnabled(true);
      }
    }
  }, [open]);

  const handleToggleDesktopSwitch = async (checked: boolean) => {
    setIsTogglingDesktop(true);
    try {
      if (checked) {
        // 1. Automatically configure browser flags & preferences via backend
        if (typeof window !== "undefined") {
          try {
            await fetch("/api/real/browser-policy/apply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "enable",
                origin: window.location.origin,
              }),
            });
          } catch (e) {
            console.warn("[BrowserPolicy] Auto-apply error:", e);
          }
        }

        // 2. Request native browser notification permission
        let granted = false;
        if (typeof window !== "undefined" && "Notification" in window) {
          try {
            if (Notification.permission === "default") {
              const res = await Notification.requestPermission();
              setDesktopPermission(res);
              granted = res === "granted";
            } else if (Notification.permission === "granted") {
              granted = true;
            }
          } catch (e) {
            console.warn("[DesktopNotification] Permission request error:", e);
          }
        }

        // 3. Mark enabled in localStorage
        localStorage.setItem("esp_desktop_notifications_enabled", "true");
        localStorage.setItem("esp_insecure_origin_dismissed", "true");
        setIsDesktopEnabled(true);

        // 4. Play audio chime and trigger test notification
        playNotificationChime();
        if (granted) {
          await triggerDesktopNotification({
            title: locale === "fa" ? "اعلان‌های ویندوز یورواسلات پارس" : "ESP Windows Notifications",
            body: locale === "fa"
              ? "اعلان‌های دسکتاپ با موفقیت فعال شدند!"
              : "Desktop notifications have been successfully enabled!",
            actionUrl: "/tasks",
          });
          toast.success(
            locale === "fa"
              ? "اعلان‌های دسکتاپ ویندوز با موفقیت فعال شد"
              : "Windows desktop notifications enabled successfully"
          );
        } else {
          toast.success(
            locale === "fa"
              ? "تنظیمات به صورت خودکار اعمال شد. در صورت نیاز، مرورگر را یک‌بار ببندید و باز کنید تا فعال‌سازی نهایی شود."
              : "Settings applied automatically. Please restart browser once if needed to complete activation."
          );
        }
      } else {
        localStorage.setItem("esp_desktop_notifications_enabled", "false");
        setIsDesktopEnabled(false);

        if (typeof window !== "undefined") {
          try {
            await fetch("/api/real/browser-policy/apply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "disable",
                origin: window.location.origin,
              }),
            });
          } catch {}
        }

        toast.info(
          locale === "fa"
            ? "اعلان‌های ویندوز غیرفعال شد"
            : "Windows desktop notifications disabled"
        );
      }
    } finally {
      setIsTogglingDesktop(false);
    }
  };

  const t = useTranslations("Dashboard.notifications");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    const handleNewNotif = (e: any) => {
      if (e.detail) {
        setItems((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener("esp_notification_added", handleNewNotif);
    return () =>
      window.removeEventListener("esp_notification_added", handleNewNotif);
  }, []);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const filtered = notifications.filter(
        (n) =>
          ![
            "notif-1",
            "notif-2",
            "notif-3",
            "notif-sys-1",
            "notif-admin-1",
            "notif-admin-req",
          ].includes(n.id)
      );
      setItems(filtered);
    } else {
      api.notifications
        .getNotifications()
        .then((res) => {
          if (res?.notifications && Array.isArray(res.notifications)) {
            const real = res.notifications
              .filter(
                (n) =>
                  ![
                    "notif-1",
                    "notif-2",
                    "notif-3",
                    "notif-sys-1",
                    "notif-admin-1",
                    "notif-admin-req",
                  ].includes(n.id)
              )
              .map((n) => ({
                id: n.id,
                title: n.title,
                description: n.description,
                type: n.type as any,
                date: n.date || "هم‌اکنون",
                read: n.read,
              }));
            setItems(real);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(
                  "esp_dashboard_notifications",
                  JSON.stringify(real)
                );
              } catch { }
            }
          }
        })
        .catch(() => { });
    }
  }, [notifications]);

  const unreadItems = useMemo(
    () => items.filter((n) => !n.read),
    [items]
  );
  const unreadCount =
    externalUnreadCount !== undefined ? externalUnreadCount : unreadItems.length;

  const displayedItems = useMemo(() => {
    if (activeSegment === "unread") {
      return unreadItems;
    }
    return items;
  }, [activeSegment, items, unreadItems]);

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllAsRead();
    } catch { }
  };

  const handleToggleRead = async (id: string) => {
    const item = items.find((n) => n.id === id);
    const willBeRead = item ? !item.read : true;
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    if (willBeRead) {
      try {
        await api.notifications.markAsRead(id);
      } catch { }
    }
  };

  const markAsRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.notifications.markAsRead(id);
    } catch { }
  };

  const handleNotificationClick = async (notif: DashboardNotificationItem) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    setOpen(false);
    const targetUrl = getNotificationTargetUrl(notif);
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const handleOpenEmail = (
    taskId?: string,
    notif?: DashboardNotificationItem
  ) => {
    const allTasks = tasks && tasks.length > 0 ? tasks : SAMPLE_TASKS;
    let found = taskId ? allTasks.find((t) => t.id === taskId) : null;
    if (!found && notif) {
      found = {
        id: notif.taskId || notif.id,
        title: notif.title,
        description: notif.description,
        creatorName: notif.emailPreview?.from || "مهندس شریفی (مدیر فنی)",
        assignedToName: "سعید جلیلی",
        dueDate: notif.date || "1405/02/10",
        priority: "urgent",
        status: "in_progress",
        category: "کنترل کیفیت",
        createdBy: "manager",
        comments: [],
        attachments: [],
        isManagerDefined: true,
        emailSent: true,
      };
    }
    if (found) {
      setSelectedTaskForEmail(found);
      setOpen(false);
    }
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(val) => {
          if (val && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setAnchorEdge(rect.left < window.innerWidth / 2 ? "left" : "right");
          }
          setOpen(val);
          if (!val) {
            setIsScrolled(false);
          }
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  ref={triggerRef}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    triggerClassName || HEADER_ICON_BUTTON_CLASS,
                    "relative",
                    open && "!text-blue-600 dark:!text-blue-400"
                  )}
                  aria-label={t("tooltip")}
                >
                  <IoNotifications
                    className={cn(
                      "size-5 shrink-0 stroke-none",
                      iconClassName,
                      open && "!text-blue-600 dark:!text-blue-400"
                    )}
                    style={{ shapeRendering: "geometricPrecision" }}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 dark:bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center shadow-xs ring-2 ring-background pointer-events-none fa-num">
                      {unreadCount > 99 ? "+99" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {t("tooltip")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverAnchor
          className={cn(
            "fixed top-[calc(var(--header-height)+8px)] w-0 h-0 pointer-events-none",
            anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
          )}
        />

        <PopoverContent
          className="relative w-[calc(100vw-24px)] max-w-[calc(100vw-24px)] sm:w-[380px] sm:max-w-[380px] h-[500px] sm:h-[540px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden box-border"
          align={
            anchorEdge === "left"
              ? dir === "rtl"
                ? "end"
                : "start"
              : dir === "rtl"
                ? "start"
                : "end"
          }
          side="bottom"
          sideOffset={0}
          collisionPadding={12}
          dir={dir}
        >
          {/* ── Top Bar: Mini Summary on scroll & concentric Close Button ── */}
          <div
            className={cn(
              "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
              isScrolled
                ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50"
                : "bg-popover border-b border-transparent"
            )}
          >
            {/* Mini Notifications Summary (Centered in header on scroll) */}
            <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none overflow-hidden">
              <div className="flex items-center gap-2 max-w-full min-w-0">
                <div
                  className={cn(
                    "transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                    isScrolled
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-90 translate-y-2 pointer-events-none"
                  )}
                >
                  <IoNotifications className="size-5 sm:size-5.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold text-foreground truncate min-w-0 text-center transition-opacity duration-300 ease-out",
                    isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  {t("titleShort")}
                </span>
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 dark:bg-red-500 text-white shadow-xs fa-num transition-opacity duration-300 ease-out leading-none shrink-0",
                      isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    {unreadCount > 99 ? "+99" : unreadCount}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#98c1d9]/30 transition-colors z-20 cursor-pointer"
              aria-label={t("close")}
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* ── Scrollable Body Matching HelpPopover Segmented List Structure ── */}
          <ScrollArea
            className="w-full max-w-full flex-1 min-h-0 overflow-x-hidden popup-scroll [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-radix-scroll-area-viewport]>div]:!w-full [&_[data-radix-scroll-area-viewport]>div]:!min-w-0 [&_[data-radix-scroll-area-viewport]>div]:!max-w-full"
            dir={dir}
            type="auto"
            onViewportScroll={(e) => {
              setIsScrolled(e.currentTarget.scrollTop > 8);
            }}
          >
            <div className="flex flex-col w-full max-w-full min-w-0 box-border px-3.5 sm:px-4 pt-[56px] sm:pt-[62px] pb-4">
              <div className="segmented-list flex flex-col gap-[2px] w-full max-w-full min-w-0">
                {/* ── Main Accordion Trigger (آیکون بولد آبی شارپ بزرگ و بج قرمز) ── */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "segmented-item group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 w-full max-w-full min-w-0 box-border outline-none cursor-pointer overflow-hidden",
                    getSegmentedAccordionHeaderClass(isExpanded, {
                      isTopRounded: true,
                      fullCapsuleWhenClosed: true,
                    })
                  )}
                >
                  <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-center size-11 sm:size-12 shrink-0 select-none">
                      <IoNotifications className="size-9.5 sm:size-11 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate text-start">
                          {t("titleShort")}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 dark:bg-red-500 text-white shadow-xs fa-num flex items-center justify-center leading-none shrink-0">
                            {unreadCount > 99 ? "+99" : unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground text-start leading-tight truncate w-full">
                        {unreadCount > 0
                          ? t("unreadBadge", { count: unreadCount })
                          : t("allCaughtUp")}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "relative z-10 size-4.5 shrink-0 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* ── Accordion Items (سفید، مونوکروم و سگمنت لیست داخل) ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={segmentedAccordionMotion.initial}
                      animate={segmentedAccordionMotion.animate}
                      exit={segmentedAccordionMotion.exit}
                      className="flex flex-col w-full max-w-full min-w-0 overflow-hidden gap-[2px]"
                    >
                      {/* Segment Filter (All / Unread) */}
                      {items.length > 0 && (
                        <div className="segmented-item p-1.5 rounded-[6px] flex items-center gap-1.5 w-full max-w-full min-w-0 box-border overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setActiveSegment("all")}
                            className={cn(
                              "relative z-10 flex-1 min-w-0 py-1.5 px-2.5 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate",
                              activeSegment === "all"
                                ? "bg-muted text-foreground font-bold shadow-2xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="truncate">{t("all")}</span>
                            <span className="size-1.5 rounded-full bg-primary shrink-0" />
                            <span className="text-[10px] text-muted-foreground/80 fa-num shrink-0">
                              ({items.length})
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSegment("unread")}
                            className={cn(
                              "relative z-10 flex-1 min-w-0 py-1.5 px-2.5 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate",
                              activeSegment === "unread"
                                ? "bg-muted text-foreground font-bold shadow-2xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="truncate">{t("unread")}</span>
                            {unreadCount > 0 && (
                              <span className="size-1.5 rounded-full bg-red-600 dark:bg-red-500 shrink-0" />
                            )}
                            <span className="text-[10px] text-muted-foreground/80 fa-num shrink-0">
                              ({unreadCount})
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Windows Desktop Notification Toggle Switch */}
                      <div className="segmented-item p-2.5 rounded-[6px] flex items-center justify-between gap-2.5 w-full max-w-full min-w-0 box-border bg-muted/40 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={cn(
                              "size-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                              isDesktopEnabled
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <IoNotifications className="size-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[12px] font-semibold text-foreground truncate">
                                {locale === "fa" ? "اعلان‌های ویندوز" : "Windows Notifications"}
                              </span>
                              <span
                                className={cn(
                                  "size-1.5 rounded-full shrink-0",
                                  isDesktopEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                                )}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {isDesktopEnabled
                                ? (locale === "fa" ? "فعال • ارسال آنی به دسکتاپ" : "Enabled • Real-time desktop alerts")
                                : (locale === "fa" ? "برای فعال‌سازی سوییچ را روشن کنید" : "Switch on to enable")}
                            </span>
                          </div>
                        </div>

                        <Switch
                          checked={isDesktopEnabled}
                          disabled={isTogglingDesktop}
                          onCheckedChange={handleToggleDesktopSwitch}
                          aria-label={locale === "fa" ? "فعال‌سازی اعلان‌های ویندوز" : "Enable Windows Notifications"}
                        />
                      </div>

                      {/* Items List */}
                      {displayedItems.length > 0 ? (
                        displayedItems.map((notif, idx) => {
                          const isLast = idx === displayedItems.length - 1;
                          const isTask = notif.type === "manager_task";
                          const isEvent = notif.type === "event";
                          const isRoutine = notif.type === "routine";
                          const {
                            title: displayTitle,
                            description: displayDesc,
                            date: displayDate,
                          } = getLocalizedNotification(notif, locale);

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={cn(
                                "segmented-item relative flex items-start gap-2.5 sm:gap-3 p-3.5 sm:p-4 outline-none group w-full max-w-full min-w-0 box-border cursor-pointer select-none overflow-hidden hover:bg-accent/40 transition-colors",
                                "rounded-t-[6px]",
                                isLast ? "rounded-b-[28px]" : "rounded-b-[6px]"
                              )}
                            >
                              {/* Clean icon without background */}
                              <div className="relative z-10 shrink-0 flex items-center justify-center size-5.5 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                                {isTask && (
                                  <Lock className="size-4.5 sm:size-5 stroke-[2]" />
                                )}
                                {isEvent && (
                                  <Calendar className="size-4.5 sm:size-5 stroke-[2]" />
                                )}
                                {isRoutine && (
                                  <Flame className="size-4.5 sm:size-5 stroke-[2]" />
                                )}
                                {!isTask && !isEvent && !isRoutine && (
                                  <IoNotifications className="size-4.5 sm:size-5" />
                                )}
                              </div>

                              <div className="relative z-10 flex-1 min-w-0 max-w-full overflow-hidden">
                                <div className="flex items-center justify-between gap-2 mb-1 w-full min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRead(notif.id);
                                      }}
                                      title={
                                        notif.read
                                          ? dir === "rtl"
                                            ? "علامت به عنوان خوانده‌نشده"
                                            : "Mark as unread"
                                          : dir === "rtl"
                                          ? "علامت به عنوان خوانده‌شده"
                                          : "Mark as read"
                                      }
                                      className="p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0 cursor-pointer"
                                    >
                                      {!notif.read ? (
                                        <span className="size-1.5 rounded-full bg-red-600 dark:bg-red-500 shrink-0 block" />
                                      ) : (
                                        <CheckCheck className="size-3.5 text-primary shrink-0 stroke-[2.2]" />
                                      )}
                                    </button>
                                    <h4
                                      className={cn(
                                        "text-xs sm:text-[13px] truncate min-w-0 flex-1 text-start group-hover:text-primary transition-colors",
                                        notif.read
                                          ? "font-medium text-foreground/80"
                                          : "font-bold text-foreground"
                                      )}
                                    >
                                      {displayTitle}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] text-muted-foreground shrink-0 fa-num whitespace-nowrap">
                                      {displayDate}
                                    </span>
                                    <ChevronLeft
                                      className={cn(
                                        "size-3.5 text-muted-foreground/40 group-hover:text-primary transition-all shrink-0 opacity-0 group-hover:opacity-100",
                                        dir !== "rtl" && "rotate-180"
                                      )}
                                    />
                                  </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 break-words w-full text-start">
                                  {displayDesc}
                                </p>

                                {/* Action for Manager Task */}
                                {isTask && (
                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEmail(notif.taskId, notif);
                                      }}
                                      className="h-6.5 px-2.5 max-w-full rounded-lg text-[11px] font-semibold bg-muted hover:bg-foreground hover:text-background text-foreground border border-border/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer truncate"
                                    >
                                      <Mail className="size-3 shrink-0" />
                                      <span className="truncate">
                                        {t("viewEmailPreview")}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className={cn(
                            "segmented-item relative flex flex-col items-center justify-center py-8 px-4 text-center w-full max-w-full min-w-0 box-border overflow-hidden",
                            "rounded-t-[6px] rounded-b-[28px]"
                          )}
                        >
                          <IoNotifications className="relative z-10 size-7 text-muted-foreground/30 mb-2" />
                          <p className="relative z-10 text-xs text-muted-foreground font-medium break-words max-w-full">
                            {t("empty")}
                          </p>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Separate Pill Button ("یه لوبیایی make all read بعد اکاردیون") ── */}
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className={cn(
                  "segmented-item group relative flex items-center justify-center gap-2 py-3 px-4 outline-none rounded-[28px] mt-2.5 w-full max-w-full min-w-0 box-border cursor-pointer transition-opacity select-none overflow-hidden",
                  unreadCount === 0
                    ? "opacity-50 cursor-default pointer-events-none"
                    : "hover:opacity-90"
                )}
              >
                <div className="relative z-10 shrink-0 flex items-center justify-center size-5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <CheckCheck className="size-4" />
                </div>
                <span className="relative z-10 text-xs sm:text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors truncate">
                  {t("markAllRead")}
                </span>
                {unreadCount > 0 && (
                  <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 dark:bg-red-500 text-white shadow-xs fa-num leading-none shrink-0">
                    {unreadCount > 99 ? "+99" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <ManagerEmailModal
        task={selectedTaskForEmail}
        open={Boolean(selectedTaskForEmail)}
        onOpenChange={(open) => !open && setSelectedTaskForEmail(null)}
      />
    </>
  );
}