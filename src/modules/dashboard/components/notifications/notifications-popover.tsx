// src/modules/dashboard/components/notifications/notifications-popover.tsx
"use client";

import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Bell,
  X,
  Calendar,
  Lock,
  Mail,
  Flame,
  CheckCheck,
  ChevronDown,
} from "lucide-react";
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
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type {
  DashboardNotificationItem,
  DashboardTask,
} from "../../services/dashboard.service";
import { ManagerEmailModal } from "../tasks/manager-email-modal";

interface NotificationsPopoverProps {
  notifications?: DashboardNotificationItem[];
  tasks?: DashboardTask[];
  triggerClassName?: string;
  iconClassName?: string;
  unreadCount?: number;
}

type NotificationSegment = "all" | "unread";

export function NotificationsPopover({
  notifications = [],
  tasks = [],
  triggerClassName,
  iconClassName,
  unreadCount: externalUnreadCount,
}: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSegment, setActiveSegment] =
    useState<NotificationSegment>("all");
  const [items, setItems] =
    useState<DashboardNotificationItem[]>(notifications);
  const [selectedTaskForEmail, setSelectedTaskForEmail] =
    useState<DashboardTask | null>(null);

  const t = useTranslations("Dashboard.notifications");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    if (notifications.length > 0) {
      setItems(notifications);
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

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleOpenEmail = (taskId?: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      setSelectedTaskForEmail(found);
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
                    "relative"
                  )}
                  aria-label={t("title")}
                >
                  <Bell className={cn(iconClassName || HEADER_ICON_CLASS)} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 end-2 size-2 rounded-full bg-foreground ring-2 ring-background animate-pulse" />
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {t("title")}
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
          className="relative w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden"
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
          {/* ── Top Bar: Only Close Button ("بالا فقط ضربدر") with concentric fillet ── */}
          <div
            className={cn(
              "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
              isScrolled
                ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50"
                : "bg-popover border-b border-transparent"
            )}
          >
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
            className="w-full flex-1 min-h-0 popup-scroll"
            dir={dir}
            type="auto"
            onViewportScroll={(e) => {
              setIsScrolled(e.currentTarget.scrollTop > 8);
            }}
          >
            <div className="flex flex-col w-full p-3 sm:p-4 pt-[50px] sm:pt-[54px]">
              <div className="segmented-list flex flex-col gap-[2px] w-full">
                {/* ── Main Accordion Trigger (مثل هلپ) ── */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer",
                    isExpanded
                      ? "rounded-t-[32px] rounded-b-[6px]"
                      : "rounded-[32px]"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="flex items-center justify-center size-12 sm:size-14 shrink-0 select-none">
                      <Bell className="size-7 sm:size-8 text-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 w-full">
                        <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate text-start">
                          {locale === "fa" ? "نوتیفیکیشن‌ها" : "Notifications"}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-foreground fa-num">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground text-start leading-tight truncate w-full">
                        {unreadCount > 0
                          ? locale === "fa"
                            ? `${unreadCount} اعلان خوانده‌نشده`
                            : `${unreadCount} unread`
                          : locale === "fa"
                          ? "تمام اعلان‌ها خوانده شده‌اند"
                          : "All caught up"}
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
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex flex-col overflow-hidden gap-[2px]"
                    >
                      {/* Segment Filter (All / Unread) */}
                      {items.length > 0 && (
                        <div className="segmented-item p-1.5 rounded-[6px] flex items-center gap-1.5 w-full">
                          <button
                            type="button"
                            onClick={() => setActiveSegment("all")}
                            className={cn(
                              "relative z-10 flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                              activeSegment === "all"
                                ? "bg-muted text-foreground font-bold shadow-2xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span>{locale === "fa" ? "همه" : "All"}</span>
                            <span className="text-[10px] text-muted-foreground/80 fa-num">
                              ({items.length})
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSegment("unread")}
                            className={cn(
                              "relative z-10 flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                              activeSegment === "unread"
                                ? "bg-muted text-foreground font-bold shadow-2xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span>{locale === "fa" ? "خوانده‌نشده" : "Unread"}</span>
                            {unreadCount > 0 && (
                              <span className="size-1.5 rounded-full bg-foreground" />
                            )}
                            <span className="text-[10px] text-muted-foreground/80 fa-num">
                              ({unreadCount})
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Items List */}
                      {displayedItems.length > 0 ? (
                        displayedItems.map((notif, idx) => {
                          const isLast = idx === displayedItems.length - 1;
                          const isTask = notif.type === "manager_task";
                          const isEvent = notif.type === "event";
                          const isRoutine = notif.type === "routine";

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleToggleRead(notif.id)}
                              className={cn(
                                "segmented-item relative flex items-start gap-3 p-3.5 sm:p-4 outline-none group w-full cursor-pointer select-none",
                                "rounded-t-[6px]",
                                isLast ? "rounded-b-[32px]" : "rounded-b-[6px]"
                              )}
                            >
                              {/* Restrained monochromatic icon */}
                              <div className="relative z-10 size-7.5 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-border/40">
                                {isTask && <Lock className="size-3.5" />}
                                {isEvent && <Calendar className="size-3.5" />}
                                {isRoutine && <Flame className="size-3.5" />}
                                {!isTask && !isEvent && !isRoutine && (
                                  <Bell className="size-3.5" />
                                )}
                              </div>

                              <div className="relative z-10 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {!notif.read && (
                                      <span className="size-1.5 rounded-full bg-foreground shrink-0" />
                                    )}
                                    <h4
                                      className={cn(
                                        "text-xs sm:text-[13px] truncate",
                                        notif.read
                                          ? "font-medium text-foreground/80"
                                          : "font-bold text-foreground"
                                      )}
                                    >
                                      {notif.title}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground shrink-0 fa-num">
                                    {notif.date}
                                  </span>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {notif.description}
                                </p>

                                {/* Action for Manager Task */}
                                {isTask && notif.taskId && (
                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEmail(notif.taskId);
                                      }}
                                      className="h-6.5 px-2.5 rounded-lg text-[11px] font-semibold bg-muted hover:bg-foreground hover:text-background text-foreground border border-border/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Mail className="size-3" />
                                      <span>{t("viewEmailPreview")}</span>
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
                            "segmented-item relative flex flex-col items-center justify-center py-8 px-4 text-center w-full",
                            "rounded-t-[6px] rounded-b-[32px]"
                          )}
                        >
                          <Bell className="relative z-10 size-7 text-muted-foreground/30 mb-2" />
                          <p className="relative z-10 text-xs text-muted-foreground font-medium">
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
                  "segmented-item group relative flex items-center justify-center gap-2.5 py-3 px-5 outline-none rounded-[32px] mt-2.5 w-full cursor-pointer transition-opacity select-none",
                  unreadCount === 0
                    ? "opacity-50 cursor-default pointer-events-none"
                    : "hover:opacity-90"
                )}
              >
                <div className="relative z-10 shrink-0 flex items-center justify-center size-5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <CheckCheck className="size-4" />
                </div>
                <span className="relative z-10 text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                  {t("markAllRead")}
                </span>
                {unreadCount > 0 && (
                  <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-foreground border border-border/60 fa-num">
                    {unreadCount}
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
