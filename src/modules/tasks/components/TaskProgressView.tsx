// src/modules/tasks/components/TaskProgressView.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Users,
  Send,
  Loader2,
  CheckSquare,
  AlertCircle,
  FileText,
  Tag,
  Building2,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FolderKanban,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NewTask, NewTaskProgress, newTasksService, TaskAttachmentItem } from "../services/new-tasks.service";
import { TaskAttachmentList, readAttachmentFile } from "./TaskAttachmentList";
import {
  playNotificationChime,
  triggerDesktopNotification,
} from "@/modules/notifications/components/desktop-notification-manager";
import { toast } from "sonner";
import type { User } from "@/types/auth";

interface TaskProgressViewProps {
  task: NewTask;
  currentUser: User;
  isAdmin: boolean;
  onTaskUpdated: (task: NewTask) => void;
  onTaskDeleted?: () => void;
}

const STATUS_CONFIG: Record<string, { labelFa: string; labelEn: string; color: string }> = {
  todo: { labelFa: "برای انجام", labelEn: "To Do", color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
  in_progress: { labelFa: "در حال انجام", labelEn: "In Progress", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  review: { labelFa: "بازبینی", labelEn: "Review", color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30" },
  done: { labelFa: "انجام‌شده", labelEn: "Done", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  cancelled: { labelFa: "لغو شده", labelEn: "Cancelled", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
};

const PRIORITY_CONFIG: Record<string, { labelFa: string; labelEn: string; color: string }> = {
  low: { labelFa: "عادی", labelEn: "Low", color: "text-slate-500" },
  medium: { labelFa: "متوسط", labelEn: "Medium", color: "text-blue-500" },
  high: { labelFa: "مهم", labelEn: "High", color: "text-orange-500" },
  critical: { labelFa: "فوری", labelEn: "Critical", color: "text-red-500" },
};

const LIFECYCLE_STEPS = [
  { key: "todo", labelFa: "۱. برای انجام", labelEn: "1. To Do", descFa: "تعریف تسک و ارجاع" },
  { key: "in_progress", labelFa: "۲. در حال انجام", labelEn: "2. In Progress", descFa: "ثبت گزارشات و فعالیت" },
  { key: "review", labelFa: "۳. بازبینی و بررسی", labelEn: "3. Under Review", descFa: "بررسی کیفیت و تایید مدیر" },
  { key: "done", labelFa: "۴. تکمیل و مختومه", labelEn: "4. Completed", descFa: "تایید نهایی مدیر سیستم" },
] as const;

export function TaskProgressView({
  task,
  currentUser,
  isAdmin,
  onTaskUpdated,
  onTaskDeleted,
}: TaskProgressViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [currentTask, setCurrentTask] = useState<NewTask>(task);
  const [progressContent, setProgressContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isApprovingTask, setIsApprovingTask] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showChangesBox, setShowChangesBox] = useState(false);
  const [changesFeedback, setChangesFeedback] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<TaskAttachmentItem[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const progressFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  // Sync when prop task changes
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // High-frequency auto-refresh polling (every 3s) with background unthrottled sync
  useEffect(() => {
    let isMounted = true;

    const syncTaskData = async () => {
      try {
        const fresh = await newTasksService.getTaskById(task.id);
        if (fresh && isMounted) {
          const oldLen = currentTask.progress?.length || 0;
          const newLen = fresh.progress?.length || 0;
          if (newLen !== oldLen || fresh.status !== currentTask.status) {
            // Check if new messages arrived from other participants
            if (newLen > oldLen) {
              const incoming = (fresh.progress || []).slice(oldLen);
              const fromOtherUser = incoming.some(
                (m) => m.author_id && m.author_id !== currentUser.id
              );
              if (fromOtherUser) {
                // Play deduplicated single chime
                playNotificationChime();

                // If window or tab is hidden/minimized, trigger native Windows desktop toast
                if (typeof document !== "undefined" && document.hidden) {
                  const lastMsg = incoming[incoming.length - 1];
                  triggerDesktopNotification({
                    title: isRtl
                      ? `پیام جدید در تسک: ${fresh.title}`
                      : `New message in: ${fresh.title}`,
                    body: `${lastMsg.author_name}: ${lastMsg.content}`,
                    actionUrl: `/tasks`,
                    tag: `task-${fresh.id}-${lastMsg.id}`,
                  });
                }
              }
            }

            setCurrentTask(fresh);
            onTaskUpdated(fresh);
            setTimeout(() => scrollToBottom(true), 50);
          }
        }
      } catch {
        // ignore background poll errors
      }
    };

    const interval = setInterval(syncTaskData, 3000);

    const handleFocusOrVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        syncTaskData();
      }
    };
    document.addEventListener("visibilitychange", handleFocusOrVisible);
    window.addEventListener("focus", handleFocusOrVisible);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
      window.removeEventListener("focus", handleFocusOrVisible);
    };
  }, [task.id, currentTask.progress?.length, currentTask.status, currentUser.id, isRtl, onTaskUpdated, scrollToBottom]);

  const handleProgressFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsReadingFiles(true);
    const newItems: TaskAttachmentItem[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const item = await readAttachmentFile(file);
          newItems.push(item);
        } catch (err: any) {
          toast.error(err.message || `خطا در خواندن ${file.name}`);
        }
      }
      if (newItems.length > 0) {
        setPendingAttachments((prev) => [...prev, ...newItems]);
      }
    } finally {
      setIsReadingFiles(false);
      if (progressFileInputRef.current) progressFileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleSendProgress = async () => {
    if (!progressContent.trim() && pendingAttachments.length === 0) return;
    if (isSending) return;

    const textToSend = progressContent.trim() || (isRtl ? "ارسال فایل‌های پیوست" : "Attached files");
    const attachmentsToSend = [...pendingAttachments];

    // Optimistic entry for instant 0ms chat feel
    const optimisticMsg: NewTaskProgress = {
      id: `opt_${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کاربر",
      author_role: currentUser.role || "کارشناس",
      content: textToSend,
      attachments: attachmentsToSend,
      created_at: new Date().toISOString(),
      is_admin_note: isAdmin,
    };

    setProgressContent("");
    setPendingAttachments([]);
    setCurrentTask((prev) => ({
      ...prev,
      status: prev.status === "todo" ? "in_progress" : prev.status,
      progress: [...(prev.progress || []), optimisticMsg],
    }));
    setTimeout(() => scrollToBottom(true), 25);

    setIsSending(true);
    try {
      const updatedTask = await newTasksService.addProgress(task.id, {
        author_id: currentUser.id,
        author_name: currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کاربر",
        author_role: currentUser.role || "کارشناس",
        content: textToSend,
        attachments: attachmentsToSend,
        is_admin_note: isAdmin,
      });
      setCurrentTask(updatedTask);
      onTaskUpdated(updatedTask);
      setTimeout(() => scrollToBottom(true), 40);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ارسال پیام" : "Failed to send message"));
      setProgressContent(textToSend);
      setPendingAttachments(attachmentsToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm(isRtl ? "آیا از تایید و بستن این تسک اطمینان دارید؟" : "Approve and close this task?")) return;
    setIsApprovingTask(true);
    try {
      const updatedTask = await newTasksService.approveTask(
        task.id,
        currentUser.id,
        currentUser.fullNameFa || currentUser.fullName || "مدیر"
      );
      onTaskUpdated(updatedTask);
      toast.success(isRtl ? "تسک تایید و بسته شد." : "Task approved and closed.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در تایید تسک" : "Failed to approve task"));
    } finally {
      setIsApprovingTask(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!confirm(isRtl ? "آیا از تکمیل فعالیت‌ها و ارسال تسک جهت بازبینی و تایید نهایی مدیر اطمینان دارید؟" : "Submit task for manager review?")) return;
    setIsSubmittingReview(true);
    try {
      const updatedTask = await newTasksService.submitForReview(
        task.id,
        currentUser.id,
        currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کارشناس"
      );
      onTaskUpdated(updatedTask);
      toast.success(isRtl ? "تسک به مرحله بازبینی و تایید مدیر منتقل گردید." : "Task submitted for manager review.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ارسال جهت بررسی" : "Failed to submit for review"));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changesFeedback.trim()) {
      toast.error(isRtl ? "لطفاً توضیحات و موارد نیازمند اصلاح را وارد کنید." : "Please enter revision feedback.");
      return;
    }
    setIsRequestingChanges(true);
    try {
      const updatedTask = await newTasksService.requestChanges(
        task.id,
        currentUser.id,
        currentUser.fullNameFa || currentUser.fullName || "مدیر",
        changesFeedback.trim()
      );
      onTaskUpdated(updatedTask);
      setShowChangesBox(false);
      setChangesFeedback("");
      toast.success(isRtl ? "درخواست اصلاحات ثبت و وضعیت تسک به «در حال انجام» بازگردانده شد." : "Changes requested.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ثبت درخواست اصلاحات" : "Failed to request changes"));
    } finally {
      setIsRequestingChanges(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isDone: boolean) => {
    try {
      const updatedTask = await newTasksService.toggleSubtask(task.id, subtaskId, isDone);
      onTaskUpdated(updatedTask);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update subtask");
    }
  };

  const handleDelete = async () => {
    if (!confirm(isRtl ? `آیا از حذف تسک "${task.title}" اطمینان دارید؟` : `Delete task "${task.title}"?`)) return;
    try {
      await newTasksService.deleteTask(task.id);
      toast.success(isRtl ? "تسک حذف شد." : "Task deleted.");
      onTaskDeleted?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete task");
    }
  };

  const doneSubtasks = task.subtasks?.filter((s) => s.is_done).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Task Header */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full", status.color)}>
                {isRtl ? status.labelFa : status.labelEn}
              </span>
              <span className={cn("text-xs font-bold", priority.color)}>
                {isRtl ? priority.labelFa : priority.labelEn}
              </span>
              {task.is_approved && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  {isRtl ? "تایید شده" : "Approved"}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground leading-snug">{task.title}</h1>
          </div>
          {isAdmin && onTaskDeleted && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-xl"
              onClick={handleDelete}
              title={isRtl ? "حذف تسک" : "Delete task"}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
          {/* Project linkage */}
          <div className="flex items-start gap-2">
            <FolderKanban className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "پروژه مرتبط" : "Linked Project"}</p>
              <p className="text-sm font-semibold text-foreground">
                {task.project_name ? (
                  <span className="text-primary font-bold">
                    {task.project_esp_number ? `${task.project_esp_number} - ` : ""}
                    {task.project_name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{isRtl ? "تسک مستقل (عمومی)" : "Independent Task"}</span>
                )}
              </p>
            </div>
          </div>
          {task.assignees?.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "مجریان" : "Assignees"}</p>
                <p className="text-sm font-semibold">{task.assignees.map((a) => a.name).join("، ")}</p>
              </div>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-start gap-2">
              <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "مهلت تحویل" : "Deadline"}</p>
                <p className="text-sm font-semibold">{task.deadline}</p>
              </div>
            </div>
          )}
          {task.company && (
            <div className="flex items-start gap-2">
              <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "شرکت" : "Company"}</p>
                <p className="text-sm font-semibold">{task.company}</p>
              </div>
            </div>
          )}
          {task.tags?.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "تگ‌ها" : "Tags"}</p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((t) => (
                    <span key={t} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Initial Task Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="pt-3 border-t border-border/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground">
                <Paperclip className="size-3.5 text-primary" />
                <span>{isRtl ? "مستندات و فایل‌های پیوست تسک" : "Task Attachments"}</span>
              </span>
              <span className="fa-num">
                {task.attachments.length} {isRtl ? "فایل" : "files"}
              </span>
            </div>
            <TaskAttachmentList
              attachments={task.attachments}
              isRtl={isRtl}
            />
          </div>
        )}

        {/* Automated Task Lifecycle Tracker */}
        <div className="pt-3 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>{isRtl ? "چرخه عمر و وضعیت خودکار تسک:" : "Automated Task Lifecycle:"}</span>
            </span>
            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", status.color)}>
              {isRtl ? status.labelFa : status.labelEn}
            </span>
          </div>

          {/* 4-Step Lifecycle Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LIFECYCLE_STEPS.map((step) => {
              const isActive = task.status === step.key;
              const isPast =
                (step.key === "todo" && task.status !== "todo") ||
                (step.key === "in_progress" && (task.status === "review" || task.status === "done")) ||
                (step.key === "review" && task.status === "done");

              return (
                <div
                  key={step.key}
                  className={cn(
                    "p-3 rounded-2xl border transition-all text-start flex flex-col justify-between min-h-[72px]",
                    isActive
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-2 ring-primary/20"
                      : isPast
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "bg-muted/20 border-border/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold leading-tight truncate">
                      {isRtl ? step.labelFa : step.labelEn}
                    </span>
                    {isPast && <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />}
                    {isActive && <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />}
                  </div>
                  <span className="text-[10px] opacity-75 truncate">{step.descFa}</span>
                </div>
              );
            })}
          </div>

          {/* Workflow Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-primary shrink-0" />
              <span>
                {isRtl
                  ? "وضعیت تسک با ثبت گزارش، پیشرفت زیرفعالیت‌ها و تایید مدیریت به‌صورت خودکار به‌روزرسانی می‌شود."
                  : "Task status transitions automatically through reports, subtasks, and managerial approval."}
              </span>
            </p>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              {/* If in_progress or todo: Allow Submitting for Review */}
              {(task.status === "in_progress" || task.status === "todo") && (
                <Button
                  onClick={handleSubmitForReview}
                  disabled={isSubmittingReview}
                  size="sm"
                  className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 bg-pink-600 hover:bg-pink-700 text-white shadow-xs"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>{isRtl ? "ارسال جهت بررسی و تایید مدیر" : "Submit for Review"}</span>
                </Button>
              )}

              {/* If review: Admin actions */}
              {task.status === "review" && isAdmin && (
                <>
                  <Button
                    onClick={() => setShowChangesBox(!showChangesBox)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-3.5 text-xs font-bold gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    <AlertCircle className="size-3.5" />
                    <span>{isRtl ? "درخواست اصلاحات" : "Request Changes"}</span>
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isApprovingTask}
                    size="sm"
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    {isApprovingTask ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-3.5" />
                    )}
                    <span>{isRtl ? "تایید نهایی و مختومه کردن" : "Approve & Complete"}</span>
                  </Button>
                </>
              )}

              {/* If review: Non-admin status message */}
              {task.status === "review" && !isAdmin && (
                <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/30 px-3 py-1">
                  {isRtl ? "تسک در حال بازبینی و بررسی مدیریت می‌باشد" : "Under Manager Review"}
                </Badge>
              )}

              {/* If done: Verified completed badge */}
              {task.status === "done" && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1 gap-1">
                  <CheckCircle2 className="size-3.5" />
                  <span>{isRtl ? "تسک تایید و مختومه شده است" : "Task Completed & Approved"}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Admin Changes Feedback Box */}
          {showChangesBox && isAdmin && (
            <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-2 mt-2">
              <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                {isRtl ? "توضیحات و موارد نیازمند اصلاح و بازنگری:" : "Revision Feedback:"}
              </label>
              <Textarea
                value={changesFeedback}
                onChange={(e) => setChangesFeedback(e.target.value)}
                placeholder={isRtl ? "موارد نقایص فنی، مستندات مورد نیاز یا تغییرات درخواستی را بنویسید..." : "Specify required changes..."}
                rows={2}
                className="text-xs rounded-xl bg-background resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChangesBox(false)}
                  className="rounded-xl h-8 px-3 text-xs"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleRequestChanges}
                  disabled={isRequestingChanges || !changesFeedback.trim()}
                  className="rounded-xl h-8 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                >
                  {isRequestingChanges ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  <span>{isRtl ? "ثبت بازخورد و بازگشت به کار" : "Submit Feedback"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks */}
      {totalSubtasks > 0 && (
        <div className="bg-card rounded-3xl border border-border/50 p-5 shadow-sm">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              <h3 className="font-semibold text-sm">
                {isRtl ? "ریزتسک‌ها" : "Subtasks"}
              </h3>
              <span className="text-xs text-muted-foreground fa-num">({doneSubtasks}/{totalSubtasks})</span>
            </div>
            {showSubtasks ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-muted mb-3">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0}%` }}
            />
          </div>

          {showSubtasks && (
            <div className="space-y-2">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleSubtask(sub.id, !sub.is_done)}
                    className={cn(
                      "size-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                      sub.is_done
                        ? "bg-primary border-primary text-white"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {sub.is_done && <CheckCircle2 className="size-3" />}
                  </button>
                  <span className={cn("text-sm", sub.is_done && "line-through text-muted-foreground")}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Progress Chat Thread */}
      <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="font-bold text-sm">
              {isRtl ? "گفتگوی زنده و گزارش پیشرفت تسک" : "Live Task Chat & Progress"}
            </h3>
            <span className="text-xs font-mono text-muted-foreground fa-num">
              ({currentTask.progress?.length || 0})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== "undefined") {
                  if ((window as any).__espTriggerTestNotification) {
                    await (window as any).__espTriggerTestNotification();
                  } else {
                    playNotificationChime();
                    await triggerDesktopNotification({
                      title: isRtl ? "تست اعلان ویندوز - گفتگوی تسک" : "Test Notification - Task Chat",
                      body: isRtl
                        ? "سامانه اعلان‌های زنده ویندوز با موفقیت متصل و فعال است."
                        : "Desktop notification is active.",
                      actionUrl: "/tasks",
                    });
                  }
                  toast.success(
                    isRtl ? "اعلان تستی به ویندوز ارسال گردید." : "Test desktop toast sent."
                  );
                }
              }}
              title={isRtl ? "بررسی و ارسال اعلان تستی به ویندوز" : "Test Windows Notification"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-background hover:bg-muted text-[11px] font-medium text-foreground transition-colors cursor-pointer shadow-2xs"
            >
              <Bell className="size-3 text-primary" />
              <span>{isRtl ? "تست اعلان ویندوز" : "Test Notification"}</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>{isRtl ? "به‌روزرسانی آنی" : "Live Sync"}</span>
            </div>
          </div>
        </div>

        {/* Progress items / Chat stream */}
        <div ref={messagesContainerRef} className="p-4 sm:p-5 space-y-4 max-h-[460px] overflow-y-auto scroll-smooth bg-slate-50/70 dark:bg-zinc-950/40 border-y border-border/40">
          {(!currentTask.progress || currentTask.progress.length === 0) ? (
            <div className="text-center py-10 text-muted-foreground text-sm space-y-1">
              <p className="font-semibold">{isRtl ? "هنوز پیامی در این تسک رد و بدل نشده است." : "No messages yet."}</p>
              <p className="text-xs">{isRtl ? "می‌توانید اولین پیام یا گزارش کار را از کادر زیر ارسال نمایید." : "Send the first message below to start."}</p>
            </div>
          ) : (
            currentTask.progress.map((p) => (
              <ProgressItem key={p.id} progress={p} isRtl={isRtl} currentUserId={currentUser.id} isAdmin={isAdmin} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 pb-5 border-t border-border/40 pt-4">
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {(currentUser.fullNameFa || currentUser.fullName || "U").charAt(0)}
            </div>
            <div className="flex-1 space-y-2">
              {/* Pending Attachments in conversation input */}
              {pendingAttachments.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                    <span>{isRtl ? "فایل‌های پیوست به این پیام:" : "Files attached to this update:"}</span>
                    <span className="fa-num">({pendingAttachments.length})</span>
                  </div>
                  <TaskAttachmentList
                    attachments={pendingAttachments}
                    onRemove={removePendingAttachment}
                    isRtl={isRtl}
                  />
                </div>
              )}

              <Textarea
                value={progressContent}
                onChange={(e) => setProgressContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendProgress();
                  }
                }}
                placeholder={
                  isAdmin
                    ? (isRtl ? "پیام مدیریتی یا راهنمایی بنویسید (Enter برای ارسال سریع، Shift+Enter خط جدید)..." : "Write guidance (Enter to send, Shift+Enter for new line)...")
                    : (isRtl ? "پیام، گزارش پیشرفت یا سوال خود را بنویسید (Enter برای ارسال سریع، Shift+Enter خط جدید)..." : "Write message (Enter to send, Shift+Enter for new line)...")
                }
                className="rounded-xl resize-none min-h-[75px] text-sm"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    ref={progressFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleProgressFilesSelect(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => progressFileInputRef.current?.click()}
                    disabled={isReadingFiles || isSending}
                    className="rounded-xl gap-1.5 text-xs h-9"
                  >
                    {isReadingFiles ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Paperclip className="size-3.5 text-primary" />
                    )}
                    <span>{isRtl ? "پیوست فایل" : "Attach File"}</span>
                  </Button>

                  {isAdmin && (
                    <span className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1">
                      <ShieldCheck className="size-3 text-primary" />
                      {isRtl ? "یادداشت مدیریتی" : "Admin Note"}
                    </span>
                  )}
                </div>

                <div className="ms-auto">
                  <Button
                    onClick={handleSendProgress}
                    disabled={(!progressContent.trim() && pendingAttachments.length === 0) || isSending}
                    size="sm"
                    className="rounded-xl gap-2 font-bold px-4"
                  >
                    {isSending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {isRtl ? "ارسال گزارش" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Approve Button */}
      {isAdmin && !task.is_approved && task.status !== "cancelled" && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
                {isRtl ? "تایید نهایی تسک" : "Final Task Approval"}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                {isRtl
                  ? "با تایید این تسک، وضعیت آن به «انجام‌شده» تغییر می‌کند و بسته می‌شود."
                  : "Approving this task will mark it as done and close it."}
              </p>
            </div>
            <Button
              onClick={handleApprove}
              disabled={isApprovingTask}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-2"
            >
              {isApprovingTask ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {isRtl ? "تایید و بستن تسک" : "Approve & Close"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressItem({
  progress,
  isRtl,
  currentUserId,
  isAdmin,
}: {
  progress: NewTaskProgress;
  isRtl: boolean;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const isMe = progress.author_id === currentUserId;
  const isAdminNote = progress.is_admin_note;

  const date = (() => {
    try {
      return new Date(progress.created_at).toLocaleDateString(isRtl ? "fa-IR" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return progress.created_at;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isMe ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "size-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs",
          isAdminNote
            ? "bg-gradient-to-tr from-amber-600 to-amber-500 text-white ring-2 ring-amber-500/20"
            : isMe
            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-2 ring-blue-500/20"
            : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700"
        )}
      >
        {progress.author_name.charAt(0)}
      </div>
      <div className={cn("flex-1 max-w-[85%]", isMe ? "items-end" : "items-start", "flex flex-col")}>
        <div className={cn("flex items-center gap-2 mb-1 px-1", isMe ? "justify-end" : "justify-start")}>
          <span className="text-xs font-bold text-foreground">
            {isMe ? (isRtl ? "شما" : "You") : progress.author_name}
          </span>
          {isAdminNote && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              <ShieldCheck className="size-3 text-amber-600 dark:text-amber-400" />
              {isRtl ? "پیام مدیر" : "Admin Note"}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/80 font-mono fa-num flex items-center gap-1">
            <Clock className="size-2.5 opacity-60" />
            {date}
          </span>
        </div>
        <div
          className={cn(
            "px-4.5 py-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed space-y-2 select-text shadow-sm transition-all",
            isAdminNote
              ? "bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-500/50 text-amber-950 dark:text-amber-50"
              : isMe
              ? "bg-blue-600 dark:bg-blue-600 text-white border border-blue-500/50"
              : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200/90 dark:border-zinc-800",
            isMe
              ? (isRtl ? "rounded-tl-xs" : "rounded-tr-xs")
              : (isRtl ? "rounded-tr-xs" : "rounded-tl-xs")
          )}
        >
          <div
            className={cn(
              "whitespace-pre-wrap break-words leading-relaxed select-text",
              isAdminNote
                ? "text-amber-950 dark:text-amber-100 font-medium"
                : isMe
                ? "text-white font-normal drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
                : "text-slate-800 dark:text-zinc-100 font-normal"
            )}
          >
            {progress.content}
          </div>
          {progress.attachments && progress.attachments.length > 0 && (
            <TaskAttachmentList
              attachments={progress.attachments}
              compact={true}
              inPrimaryBubble={isMe && !isAdminNote}
              isRtl={isRtl}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
