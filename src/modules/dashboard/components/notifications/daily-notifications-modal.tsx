"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  Calendar,
  Lock,
  Mail,
  CheckCircle2,
  Clock,
  Flame,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type DashboardNotificationItem,
  type DashboardTask,
  SAMPLE_TASKS,
} from "../../services/dashboard.service";
import { ManagerEmailModal } from "../tasks/manager-email-modal";

interface DailyNotificationsModalProps {
  notifications?: DashboardNotificationItem[];
  tasks?: DashboardTask[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTask?: (task: DashboardTask) => void;
}

export function DailyNotificationsModal({
  notifications = [],
  tasks = [],
  open,
  onOpenChange,
  onSelectTask,
}: DailyNotificationsModalProps) {
  const t = useTranslations("Dashboard.notifications");
  const locale = useLocale();

  const [items, setItems] = React.useState<DashboardNotificationItem[]>(notifications);
  const [selectedTaskForEmail, setSelectedTaskForEmail] = React.useState<DashboardTask | null>(null);

  React.useEffect(() => {
    if (notifications.length > 0) setItems(notifications);
  }, [notifications]);

  if (!open) return null;

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
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
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* ── Modal Header ── */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Bell className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-foreground leading-none">
                    {t("title")}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-bold fa-num">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllRead}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  {t("markAllRead")}
                </Button>
              )}

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Notifications List ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5">
            {items.length > 0 ? (
              items.map((notif) => {
                const isTask = notif.type === "manager_task";
                const isEvent = notif.type === "event";
                const isRoutine = notif.type === "routine";

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-3 rounded-xl border transition-colors flex items-start gap-3 shadow-2xs",
                      notif.read
                        ? "bg-white/40 dark:bg-card/40 border-border/40 opacity-75"
                        : "bg-white dark:bg-card border-border/70 shadow-xs"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0 mt-0.5",
                        isTask && "bg-amber-500/15 text-amber-500",
                        isEvent && "bg-blue-500/15 text-blue-500",
                        isRoutine && "bg-emerald-500/15 text-emerald-500"
                      )}
                    >
                      {isTask && <Lock className="size-4" />}
                      {isEvent && <Calendar className="size-4" />}
                      {isRoutine && <Flame className="size-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground/90 truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 fa-num">
                          {notif.date}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/75 leading-relaxed mb-2">
                        {notif.description}
                      </p>

                      {/* Action Row for Manager Task */}
                      {isTask && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEmail(notif.taskId, notif)}
                            className="h-7 text-[11px] gap-1 px-2.5 font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          >
                            <Mail className="size-3" />
                            <span>{t("viewEmailPreview")}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Bell className="size-8 mb-2 opacity-25" />
                <p className="text-xs font-medium">{t("empty")}</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 flex justify-end">
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-4 font-medium shadow-xs"
            >
              {t("close")}
            </Button>
          </div>
        </motion.div>
      </div>

      <ManagerEmailModal
        task={selectedTaskForEmail}
        open={Boolean(selectedTaskForEmail)}
        onOpenChange={(open) => !open && setSelectedTaskForEmail(null)}
      />
    </>
  );
}
