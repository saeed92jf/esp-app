// src/modules/tasks/components/TaskProgressView.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Users,
  Send,
  Loader2,
  CheckSquare,
  AlertCircle,
  FileText,
  FileCode,
  Tag,
  Building2,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon,
  FolderKanban,
  Bell,
  Play,
  Calendar,
  Edit2,
  X,
  CheckCheck,
  CornerUpLeft,
  Download,
  Eye,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";
import { NewTask, NewTaskProgress, newTasksService, TaskAttachmentItem } from "../services/new-tasks.service";
import {
  TaskAttachmentList,
  readAttachmentFile,
  downloadAttachment,
  isImageAttachment,
  formatBytes,
} from "./TaskAttachmentList";
import { TelegramEmojiPicker } from "./TelegramEmojiPicker";

export interface StagedAttachment extends TaskAttachmentItem {
  stagingId: string;
  isUploading?: boolean;
  previewUrl?: string;
  file?: File;
}
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
  onBack?: () => void;
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
  { key: "todo", labelFa: "۱. برای انجام", labelEn: "1. To Do", descFa: "تعریف تسک در انتظار شروع" },
  { key: "in_progress", labelFa: "۲. در حال انجام", labelEn: "2. In Progress", descFa: "شروع کار یا ثبت اولین پیام/گزارش" },
  { key: "review", labelFa: "۳. بازبینی و بررسی", labelEn: "3. Under Review", descFa: "بررسی کیفیت و تایید مدیر" },
  { key: "done", labelFa: "۴. تکمیل و مختومه", labelEn: "4. Completed", descFa: "تایید نهایی مدیر سیستم" },
] as const;

// Telegram name colors
const TELEGRAM_NAME_COLORS = [
  "#2481cc", // Telegram Blue
  "#2f9e44", // Telegram Green
  "#e8590c", // Telegram Orange
  "#845ef7", // Telegram Violet
  "#d6336c", // Telegram Pink
  "#0ca678", // Telegram Teal
  "#d9480f", // Telegram Warm Brown
];

export function getSenderColor(name?: string): string {
  if (!name) return "#2481cc";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % TELEGRAM_NAME_COLORS.length;
  return TELEGRAM_NAME_COLORS[idx];
}

export function getMessageDateKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

export function formatDateSeparator(dateStr: string, isRtl: boolean): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isToday) return isRtl ? "امروز" : "Today";
    if (isYesterday) return isRtl ? "دیروز" : "Yesterday";

    // Show day of the week if within the last 6 days (like Telegram: Monday, Thursday)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      return d.toLocaleDateString(isRtl ? "fa-IR" : "en-US", { weekday: "long" });
    }

    if (isRtl) {
      return d.toLocaleDateString("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatMessageTime(dateStr: string, isRtl: boolean): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function TaskProgressView({
  task,
  currentUser,
  isAdmin,
  onTaskUpdated,
  onTaskDeleted,
  onBack,
}: TaskProgressViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [currentTask, setCurrentTask] = useState<NewTask>(task);
  const [progressContent, setProgressContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [isApprovingTask, setIsApprovingTask] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showChangesBox, setShowChangesBox] = useState(false);
  const [changesFeedback, setChangesFeedback] = useState("");
  const [openSegments, setOpenSegments] = useState<Record<string, boolean>>({
    details: false,
    attachments: false,
    subtasks: false,
    chat: true,
  });

  const toggleSegment = (key: string) => {
    setOpenSegments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/tasks";
      }
    }
  };

  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<StagedAttachment[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; author_name: string; content: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<TaskAttachmentItem | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const attachMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    if (!showAttachMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (showAttachMenu && attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachMenu]);

  const handleAttachMouseEnter = () => {
    if (attachMenuTimeoutRef.current) {
      clearTimeout(attachMenuTimeoutRef.current);
      attachMenuTimeoutRef.current = null;
    }
    setShowAttachMenu(true);
  };

  const handleAttachMouseLeave = () => {
    attachMenuTimeoutRef.current = setTimeout(() => {
      setShowAttachMenu(false);
    }, 220);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? progressContent.length;
      const end = textarea.selectionEnd ?? progressContent.length;
      const nextVal = progressContent.substring(0, start) + emoji + progressContent.substring(end);
      setProgressContent(nextVal);
      setTimeout(() => {
        textarea.focus();
        const newPos = start + emoji.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setProgressContent((prev) => prev + emoji);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleStageAttachments(e.dataTransfer.files);
    }
  };

  const getDeadlineStatus = useCallback((deadline?: string | null) => {
    if (!deadline) return null;
    try {
      const parts = deadline.split("/").map(Number);
      if (parts.length === 3 && parts[0] > 1300 && parts[0] < 1500) {
        const curJ = getJalaliDate(new Date());
        const targetDays = parts[0] * 365 + parts[1] * 30 + parts[2];
        const curDays = curJ.year * 365 + curJ.month * 30 + curJ.day;
        const diff = targetDays - curDays;
        if (diff < 0) return { label: isRtl ? "مهلت گذشته است" : "Overdue", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
        if (diff === 0) return { label: isRtl ? "سررسید امروز" : "Due Today", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
        if (diff <= 2) return { label: isRtl ? `${diff} روز مانده (فوری)` : `${diff} days left`, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
        return { label: isRtl ? `${diff} روز مانده` : `${diff} days left`, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
      }
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        const now = new Date();
        const diffMs = d.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: isRtl ? "مهلت گذشته است" : "Overdue", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
        if (diffDays === 0) return { label: isRtl ? "سررسید امروز" : "Due Today", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
        return { label: isRtl ? `${diffDays} روز مانده` : `${diffDays} days left`, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
      }
    } catch {}
    return null;
  }, [isRtl]);

  const handleStartTask = async () => {
    setIsStartingTask(true);
    try {
      const updated = await newTasksService.startTask(
        task.id,
        currentUser.id,
        currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کارشناس"
      );
      setCurrentTask(updated);
      onTaskUpdated(updated);
      toast.success(
        isRtl
          ? "تسک با موفقیت وارد مرحله «در حال انجام» شد."
          : "Task moved to In Progress."
      );
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در شروع تسک" : "Failed to start task"));
    } finally {
      setIsStartingTask(false);
    }
  };

  const handleSaveDeadline = async (selectedDate?: Date) => {
    setIsSavingDeadline(true);
    try {
      let deadlineStr = "";
      if (selectedDate) {
        if (isRtl) {
          const j = getJalaliDate(selectedDate);
          deadlineStr = `${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`;
        } else {
          deadlineStr = selectedDate.toISOString().split("T")[0];
        }
      }
      const updated = await newTasksService.updateTask(task.id, {
        deadline: deadlineStr || undefined,
      });
      setCurrentTask(updated);
      onTaskUpdated(updated);
      setIsEditingDeadline(false);
      toast.success(
        isRtl
          ? deadlineStr ? `مهلت تسک به ${deadlineStr} تنظیم شد.` : "مهلت زمانی تسک حذف گردید."
          : "Deadline updated."
      );
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در به‌روزرسانی مهلت" : "Failed to update deadline"));
    } finally {
      setIsSavingDeadline(false);
    }
  };

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
              const myUid = currentUser?.id ? String(currentUser.id).trim().toLowerCase() : "";
              const fromOtherUser = incoming.some(
                (m) => m.author_id && String(m.author_id).trim().toLowerCase() !== myUid
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

  const handleStageAttachments = async (files: FileList | File[] | null) => {
    if (!files) return;
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Create immediate staged items with local blob URLs (0ms instant preview)
    const newItems: StagedAttachment[] = fileList.map((file) => {
      const isImg =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|svg|bmp|avif|heic)$/i.test(file.name);
      const stagingId = `staging_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let previewUrl: string | undefined = undefined;
      try {
        if (isImg && typeof window !== "undefined" && window.URL) {
          previewUrl = window.URL.createObjectURL(file);
        }
      } catch {}

      return {
        stagingId,
        id: stagingId,
        name: file.name,
        size: formatBytes(file.size),
        type: file.name.split(".").pop()?.toLowerCase() || (isImg ? "image" : "file"),
        url: previewUrl,
        previewUrl,
        file,
        isUploading: true,
      };
    });

    setPendingAttachments((prev) => [...prev, ...newItems]);

    // Concurrently upload to /api/tasks/upload in background
    for (const item of newItems) {
      if (!item.file) continue;
      try {
        const uploaded = await newTasksService.uploadAttachment(item.file);
        setPendingAttachments((prev) =>
          prev.map((p) =>
            p.stagingId === item.stagingId
              ? {
                  ...p,
                  ...uploaded,
                  previewUrl: p.previewUrl || uploaded.url,
                  isUploading: false,
                }
              : p
          )
        );
      } catch (err: any) {
        // Fallback: convert to base64 DataURL so user never loses file
        try {
          const fallback = await readAttachmentFile(item.file);
          setPendingAttachments((prev) =>
            prev.map((p) =>
              p.stagingId === item.stagingId
                ? {
                    ...p,
                    ...fallback,
                    previewUrl: fallback.url,
                    isUploading: false,
                  }
                : p
            )
          );
        } catch (inner: any) {
          toast.error(
            err?.message || (isRtl ? `خطا در آپلود ${item.name}` : `Failed to upload ${item.name}`)
          );
          setPendingAttachments((prev) => prev.filter((p) => p.stagingId !== item.stagingId));
        }
      }
    }
  };

  const removePendingAttachment = (stagingId: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.stagingId === stagingId);
      if (
        target?.previewUrl &&
        target.previewUrl.startsWith("blob:") &&
        typeof window !== "undefined"
      ) {
        try {
          window.URL.revokeObjectURL(target.previewUrl);
        } catch {}
      }
      return prev.filter((item) => item.stagingId !== stagingId);
    });
  };

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleSendProgress = async () => {
    if (!progressContent.trim() && pendingAttachments.length === 0) return;
    if (isSending) return;

    if (pendingAttachments.some((a) => a.isUploading)) {
      toast.info(
        isRtl
          ? "لطفاً تا اتمام بارگذاری فایل‌ها صبور باشید..."
          : "Please wait for attachments to upload..."
      );
      return;
    }

    const textToSend = progressContent.trim();
    const attachmentsToSend: TaskAttachmentItem[] = pendingAttachments.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url || att.previewUrl,
      uploaded_at: att.uploaded_at || new Date().toISOString(),
    }));

    const currentReply = replyingTo
      ? { id: replyingTo.id, author_name: replyingTo.author_name, content: replyingTo.content }
      : null;

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
      reply_to: currentReply,
    };

    setReplyingTo(null);
    setShowAttachMenu(false);
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
        reply_to: currentReply,
      });
      setCurrentTask(updatedTask);
      onTaskUpdated(updatedTask);
      setTimeout(() => scrollToBottom(true), 40);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ارسال پیام" : "Failed to send message"));
      setProgressContent(textToSend);
      setPendingAttachments(
        attachmentsToSend.map((a) => ({ ...a, stagingId: a.id || `staging_${Date.now()}` }))
      );
      if (currentReply) setReplyingTo(currentReply);
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

  const canToggleSubtask = true;

  const handleToggleSubtask = async (subtaskId: string, isDone: boolean) => {
    const prevTask = currentTask;
    const authorName = currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کاربر";

    // 0ms instantaneous optimistic update
    const updatedSubtasks = (currentTask.subtasks || []).map((s) => {
      if (s.id === subtaskId) {
        return {
          ...s,
          is_done: isDone,
          completed_by_id: isDone ? currentUser.id : undefined,
          completed_by_name: isDone ? authorName : undefined,
          completed_at: isDone ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    const optimisticTask: NewTask = {
      ...currentTask,
      subtasks: updatedSubtasks,
    };
    setCurrentTask(optimisticTask);
    onTaskUpdated(optimisticTask);

    try {
      const updatedTask = await newTasksService.toggleSubtask(
        currentTask.id,
        subtaskId,
        isDone,
        {
          id: currentUser.id,
          name: authorName,
        },
        updatedSubtasks
      );
      setCurrentTask(updatedTask);
      onTaskUpdated(updatedTask);
    } catch (err: any) {
      // Revert optimistic update on failure
      setCurrentTask(prevTask);
      onTaskUpdated(prevTask);
      toast.error(err?.message || (isRtl ? "خطا در تغییر وضعیت ریزتسک" : "Failed to update subtask"));
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

  const doneSubtasks = currentTask.subtasks?.filter((s) => s.is_done).length ?? 0;
  const totalSubtasks = currentTask.subtasks?.length ?? 0;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Top Header: Title with Back Button (Profile Manager Style) */}
      <div className="flex items-center gap-3 sm:gap-4 mb-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full hover:bg-muted/60 size-10 shrink-0 cursor-pointer"
          title={isRtl ? "بازگشت" : "Back"}
        >
          <ArrowLeft className="size-6 text-foreground rtl:rotate-180" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full", status.color)}>
              {isRtl ? status.labelFa : status.labelEn}
            </span>
            <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted/60", priority.color)}>
              {isRtl ? priority.labelFa : priority.labelEn}
            </span>
            {currentTask.is_approved && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="size-3" />
                {isRtl ? "تایید شده" : "Approved"}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate leading-tight">
            {currentTask.title}
          </h1>
        </div>
      </div>

      {/* Independent Segmented Accordion Sections (سگمنت لیست‌های تفکیک‌شده با فاصله) */}
      <div className="space-y-4">
        {/* ======================================================== */}
        {/* SEGMENT 1: مشخصات و اطلاعات تسک (Task Details & Approve) */}
        {/* ======================================================== */}
        <div className="segmented-list flex flex-col gap-[2px] w-full">
          {/* Accordion Header as authentic segmented-item */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSegment("details")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSegment("details");
              }
            }}
            className={cn(
              "segmented-item group relative flex items-center justify-between gap-3 p-4 sm:p-5 w-full outline-none cursor-pointer border border-border/60 shadow-xs text-start select-none",
              getSegmentedAccordionHeaderClass(openSegments.details, { isTopRounded: true, fullCapsuleWhenClosed: true })
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <FolderKanban className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate leading-snug">
                  {isRtl ? "مشخصات و جزئیات تکمیلی تسک" : "Task Details & Information"}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {currentTask.project_name ? `${currentTask.project_name} · ` : ""}{currentTask.assignees?.map((a) => a.name).join("، ") || (isRtl ? "بدون مجری" : "No assignees")}
                </p>
              </div>
            </div>

            {/* Action on Item 1: APPROVE BUTTON & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && !currentTask.is_approved && currentTask.status !== "cancelled" && (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove();
                  }}
                  disabled={isApprovingTask}
                  size="sm"
                  className="rounded-xl h-8 px-3.5 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer shrink-0"
                  title={isRtl ? "تایید نهایی و مختومه کردن تسک" : "Approve & Complete Task"}
                >
                  {isApprovingTask ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  <span>{isRtl ? "تایید نهایی تسک" : "Approve Task"}</span>
                </Button>
              )}

              {isAdmin && onTaskDeleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive/10 hover:text-destructive rounded-xl shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  title={isRtl ? "حذف تسک" : "Delete task"}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}

              <div className="size-8 rounded-full bg-muted/40 hover:bg-muted/70 flex items-center justify-center text-muted-foreground transition-colors shrink-0">
                <ChevronDown className={cn("size-4 transition-transform duration-200", openSegments.details && "rotate-180")} />
              </div>
            </div>
          </div>

          {/* Accordion Body for Item 1 */}
          <AnimatePresence initial={false}>
            {openSegments.details && (
              <motion.div
                key="details-body"
                initial={segmentedAccordionMotion.initial}
                animate={segmentedAccordionMotion.animate}
                exit={segmentedAccordionMotion.exit}
                className="flex flex-col overflow-hidden gap-[2px]"
              >
                <div className="segmented-item no-hover-bg rounded-t-[6px] rounded-b-[32px] p-5 w-full border border-border/60 shadow-xs space-y-4">
            {currentTask.description && (
              <p className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {currentTask.description}
              </p>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/40">
              {/* Project linkage */}
              <div className="flex items-start gap-2">
                <FolderKanban className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "پروژه مرتبط" : "Linked Project"}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {currentTask.project_name ? (
                      <span className="text-primary font-bold">
                        {currentTask.project_esp_number ? `${currentTask.project_esp_number} - ` : ""}
                        {currentTask.project_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{isRtl ? "تسک مستقل (عمومی)" : "Independent Task"}</span>
                    )}
                  </p>
                </div>
              </div>

              {currentTask.assignees?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "مجریان" : "Assignees"}</p>
                    <p className="text-sm font-semibold">{currentTask.assignees.map((a) => a.name).join("، ")}</p>
                  </div>
                </div>
              )}

              {/* Deadline Block */}
              <div className="flex items-start gap-2 min-w-[200px]">
                <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs text-muted-foreground">{isRtl ? "مهلت تحویل (Deadline)" : "Deadline"}</p>
                    {isAdmin && !isEditingDeadline && (
                      <button
                        type="button"
                        onClick={() => setIsEditingDeadline(true)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                      >
                        <Edit2 className="size-2.5" />
                        <span>{currentTask.deadline ? (isRtl ? "ویرایش" : "Edit") : (isRtl ? "+ تنظیم مهلت" : "+ Set")}</span>
                      </button>
                    )}
                  </div>

                  {isEditingDeadline ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-[160px]">
                        <DatePicker
                          value={deadlineDate}
                          onChange={(d) => {
                            setDeadlineDate(d);
                            handleSaveDeadline(d);
                          }}
                          placeholder={isRtl ? "انتخاب تاریخ..." : "Select date..."}
                          className="h-8 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingDeadline(false)}
                        className="h-8 px-2 text-xs"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-sm font-semibold fa-num">
                        {currentTask.deadline || (isRtl ? "تعیین نشده" : "Not set")}
                      </span>
                      {currentTask.deadline && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border fa-num",
                            getDeadlineStatus(currentTask.deadline)?.color || "text-slate-600 bg-muted border-border/40"
                          )}
                        >
                          {getDeadlineStatus(currentTask.deadline)?.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {currentTask.company && (
                <div className="flex items-start gap-2">
                  <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "شرکت" : "Company"}</p>
                    <p className="text-sm font-semibold">{currentTask.company}</p>
                  </div>
                </div>
              )}

              {currentTask.tags?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{isRtl ? "تگ‌ها" : "Tags"}</p>
                    <div className="flex flex-wrap gap-1">
                      {currentTask.tags.map((t) => (
                        <span key={t} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  const isActive = currentTask.status === step.key;
                  const isPast =
                    (step.key === "todo" && currentTask.status !== "todo") ||
                    (step.key === "in_progress" && (currentTask.status === "review" || currentTask.status === "done")) ||
                    (step.key === "review" && currentTask.status === "done");

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
                    {currentTask.status === "todo"
                      ? (isRtl
                          ? "تسک در انتظار شروع: با کلیک بر روی «شروع انجام تسک» یا ارسال پیام در بخش گفتگو، تسک به «در حال انجام» منتقل می‌شود."
                          : "Task ready: Click 'Start Working on Task' or send a message to transition to In Progress.")
                      : isRtl
                      ? "وضعیت تسک با ثبت گزارش، پیشرفت زیرفعالیت‌ها و تایید مدیریت به‌صورت خودکار به‌روزرسانی می‌شود."
                      : "Task status transitions automatically through reports, subtasks, and managerial approval."}
                  </span>
                </p>

                <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                  {currentTask.status === "todo" && (
                    <Button
                      onClick={handleStartTask}
                      disabled={isStartingTask}
                      size="sm"
                      className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                    >
                      {isStartingTask ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Play className="size-3.5 fill-current" />
                      )}
                      <span>{isRtl ? "شروع انجام تسک" : "Start Working on Task"}</span>
                    </Button>
                  )}

                  {currentTask.status === "in_progress" && (
                    <Button
                      onClick={handleSubmitForReview}
                      disabled={isSubmittingReview}
                      size="sm"
                      className="rounded-xl h-9 px-4 text-xs font-bold gap-1.5 bg-pink-600 hover:bg-pink-700 text-white shadow-xs cursor-pointer"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>{isRtl ? "ارسال جهت بررسی و تایید مدیر" : "Submit for Review"}</span>
                    </Button>
                  )}

                  {currentTask.status === "review" && isAdmin && (
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

                  {currentTask.status === "review" && !isAdmin && (
                    <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/30 px-3 py-1">
                      {isRtl ? "تسک در حال بازبینی و بررسی مدیریت می‌باشد" : "Under Manager Review"}
                    </Badge>
                  )}

                  {currentTask.status === "done" && (
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
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  {/* ======================================================== */}
  {/* SEGMENT 2: مستندات و فایل‌های تسک (Initial Attachments) */}
  {/* ======================================================== */}
  {currentTask.attachments && currentTask.attachments.length > 0 && (
    <div className="segmented-list flex flex-col gap-[2px] w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleSegment("attachments")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSegment("attachments");
          }
        }}
        className={cn(
          "segmented-item group relative flex items-center justify-between gap-3 p-4 sm:p-5 w-full outline-none cursor-pointer border border-border/60 shadow-xs text-start select-none",
          getSegmentedAccordionHeaderClass(openSegments.attachments, { isTopRounded: true, fullCapsuleWhenClosed: true })
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Paperclip className="size-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground">
            {isRtl ? "مستندات و فایل‌های پیوست تسک" : "Task Attachments"}
          </h3>
          <Badge variant="secondary" className="text-xs fa-num font-medium">
            {currentTask.attachments.length} {isRtl ? "فایل" : "files"}
          </Badge>
        </div>
        <div className="size-8 rounded-full bg-muted/40 hover:bg-muted/70 flex items-center justify-center text-muted-foreground transition-colors shrink-0">
          <ChevronDown className={cn("size-4 transition-transform duration-200", openSegments.attachments && "rotate-180")} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {openSegments.attachments && (
          <motion.div
            key="attachments-body"
            initial={segmentedAccordionMotion.initial}
            animate={segmentedAccordionMotion.animate}
            exit={segmentedAccordionMotion.exit}
            className="flex flex-col overflow-hidden gap-[2px]"
          >
            <div className="segmented-item no-hover-bg rounded-t-[6px] rounded-b-[32px] p-5 w-full border border-border/60 shadow-xs">
              <TaskAttachmentList attachments={currentTask.attachments} isRtl={isRtl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )}

        {/* ======================================================== */}
        {/* SEGMENT 3: ریزتسک‌ها و چک‌لیست فعالیت‌ها (Subtasks) */}
        {/* ======================================================== */}
        {totalSubtasks > 0 && (
          <div className="segmented-list flex flex-col gap-[2px] w-full">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSegment("subtasks")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSegment("subtasks");
                }
              }}
              className={cn(
                "segmented-item group relative flex items-center justify-between gap-3 p-4 sm:p-5 w-full outline-none cursor-pointer border border-border/60 shadow-xs text-start select-none",
                getSegmentedAccordionHeaderClass(openSegments.subtasks, { isTopRounded: true, fullCapsuleWhenClosed: true })
              )}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <CheckSquare className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">
                  {isRtl ? "ریزتسک‌ها و چک‌لیست فعالیت‌ها" : "Subtasks Checklist"}
                </h3>
                <Badge variant="secondary" className="text-xs fa-num font-medium">
                  {doneSubtasks} از {totalSubtasks}
                </Badge>
                {/* Mini progress bar in header */}
                <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block ms-2">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="size-8 rounded-full bg-muted/40 hover:bg-muted/70 flex items-center justify-center text-muted-foreground transition-colors shrink-0">
                <ChevronDown className={cn("size-4 transition-transform duration-200", openSegments.subtasks && "rotate-180")} />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {openSegments.subtasks && (
                <motion.div
                  key="subtasks-body"
                  initial={segmentedAccordionMotion.initial}
                  animate={segmentedAccordionMotion.animate}
                  exit={segmentedAccordionMotion.exit}
                  className="flex flex-col overflow-hidden gap-[2px]"
                >
                  <div className="segmented-item no-hover-bg rounded-t-[6px] rounded-b-[32px] p-5 w-full border border-border/60 shadow-xs space-y-3">
                    {/* Permission & Attribution Banner */}
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{isRtl ? "افراد مجاز برای تیک‌زدن ریزتسک‌ها:" : "Authorized to check off subtasks:"}</span>
                      </span>
                      <span className="font-semibold text-[11px]">
                        {currentTask.assignees?.length > 0
                          ? currentTask.assignees.map((a) => a.name).join("، ") + (isRtl ? " و مدیر سیستم" : " & Admin")
                          : (isRtl ? "مجریان و مدیر سیستم" : "Assignees & Admin")}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2">
                      {currentTask.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSubtask(sub.id, !sub.is_done)}
                              className={cn(
                                "size-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
                                sub.is_done
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-border hover:border-primary"
                              )}
                              title={isRtl ? "تغییر وضعیت ریزتسک" : "Toggle subtask"}
                            >
                              {sub.is_done && <CheckCircle2 className="size-3" />}
                            </button>
                            <span className={cn("text-sm", sub.is_done && "line-through text-muted-foreground")}>
                              {sub.title}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {sub.is_done ? (
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-500/20">
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                <span>
                                  {sub.completed_by_name
                                    ? (isRtl ? `تکمیل‌شده توسط ${sub.completed_by_name}` : `Done by ${sub.completed_by_name}`)
                                    : (isRtl ? "تکمیل‌شده" : "Completed")}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users className="size-2.5" />
                                <span>
                                  {currentTask.assignees?.length > 0
                                    ? (isRtl ? `مسئول: ${currentTask.assignees.map((a) => a.name).join("، ")}` : `Assignee: ${currentTask.assignees.map((a) => a.name).join(", ")}`)
                                    : (isRtl ? "در انتظار اقدام مجری" : "Pending")}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================================================== */}
        {/* SEGMENT 4: گفتگوی زنده و گزارش پیشرفت (Telegram Live Chat) */}
        {/* ======================================================== */}
        <div className="segmented-list flex flex-col gap-[2px] w-full">
          {/* Accordion Header for Item 4 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSegment("chat")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSegment("chat");
              }
            }}
            className={cn(
              "segmented-item group relative flex items-center justify-between gap-3 px-5 py-4 w-full outline-none cursor-pointer border border-border/60 shadow-xs text-start select-none",
              getSegmentedAccordionHeaderClass(openSegments.chat, { isTopRounded: true, fullCapsuleWhenClosed: true })
            )}
          >
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
                onClick={async (e) => {
                  e.stopPropagation();
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

              <div className="size-8 rounded-full bg-muted/40 hover:bg-muted/70 flex items-center justify-center text-muted-foreground transition-colors ms-1 shrink-0">
                <ChevronDown className={cn("size-4 transition-transform duration-200", openSegments.chat && "rotate-180")} />
              </div>
            </div>
          </div>

          {/* Telegram Styled Live Progress Chat Thread (OPEN BY DEFAULT) */}
          <AnimatePresence initial={false}>
            {openSegments.chat && (
              <motion.div
                key="chat-body"
                initial={segmentedAccordionMotion.initial}
                animate={segmentedAccordionMotion.animate}
                exit={segmentedAccordionMotion.exit}
                className="flex flex-col gap-[2px]"
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="segmented-item no-hover-bg rounded-t-[6px] rounded-b-[32px] w-full border border-border/60 shadow-xs flex flex-col relative overflow-hidden bg-gradient-to-br from-[#dcf6e1] via-[#bee9c4] to-[#9ad2a4] dark:from-[#0d1c27] dark:via-[#132735] dark:to-[#08131c]"
                >
                  {/* Drag & Drop Overlay */}
                  {isDraggingOver && (
                    <div className="absolute inset-0 z-50 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center text-white font-bold gap-2 select-none animate-in fade-in-50 duration-150">
                      <Paperclip className="size-10 animate-bounce text-white" />
                      <span className="text-sm bg-black/60 px-4 py-2 rounded-2xl border border-white/20">
                        {isRtl ? "فایل‌ها یا تصاویر را رها کنید تا در گفتگو ارسال شوند" : "Drop files or images here to send to chat"}
                      </span>
                    </div>
                  )}

                  {/* Dense Seamless Engineering Doodle Wallpaper (Stationary Background across whole chat) */}
                  <div
                    className="absolute inset-0 pointer-events-none bg-[url('/images/telegram-doodle.svg')] dark:bg-[url('/images/telegram-doodle-dark.svg')] bg-repeat [background-size:520px_520px]"
                  />

                  <div
                    ref={messagesContainerRef}
                    dir="ltr"
                    className="relative z-0 p-3.5 sm:p-5 space-y-2.5 max-h-[500px] min-h-[380px] overflow-y-auto scroll-smooth select-text pb-24 -mb-16"
                    >
                      {(!currentTask.progress || currentTask.progress.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16 text-white drop-shadow-sm select-none" dir={isRtl ? "rtl" : "ltr"}>
                          <div className="p-3 rounded-full bg-black/20 backdrop-blur-xs mb-2">
                            <FileText className="size-6 text-white" />
                          </div>
                          <p className="font-semibold text-sm">{isRtl ? "هنوز پیامی در این تسک رد و بدل نشده است." : "No messages yet."}</p>
                          <p className="text-xs text-white/80">{isRtl ? "می‌توانید اولین پیام، عکس یا گزارش کار را از کادر زیر ارسال نمایید." : "Send the first message or photo below to start."}</p>
                        </div>
                      ) : (
                        currentTask.progress.map((p, idx) => {
                          const prevMsg = idx > 0 ? currentTask.progress[idx - 1] : null;
                          const isNewDate = !prevMsg || getMessageDateKey(prevMsg.created_at) !== getMessageDateKey(p.created_at);
                          const dateLabel = isNewDate ? formatDateSeparator(p.created_at, isRtl) : null;
                          const isSysEvent = isSystemEventMessage(p);

                          return (
                            <React.Fragment key={p.id}>
                              {dateLabel && (
                                <div className="flex justify-center my-3 select-none" dir="ltr">
                                  <span className="px-3.5 py-0.5 rounded-full text-[11px] font-medium bg-black/35 dark:bg-black/55 text-white backdrop-blur-xs shadow-xs fa-num">
                                    {dateLabel}
                                  </span>
                                </div>
                              )}
                              {isSysEvent ? (
                                <SystemEventPill progress={p} isRtl={isRtl} />
                              ) : (
                                <ProgressItem
                                  progress={p}
                                  isRtl={isRtl}
                                  currentUserId={currentUser.id}
                                  isAdmin={isAdmin}
                                  onReply={(msg) => {
                                    setReplyingTo({
                                      id: msg.id,
                                      author_name: msg.author_name,
                                      content: msg.content.substring(0, 90),
                                    });
                                  }}
                                  onPreviewImage={(att) => setPreviewImage(att)}
                                />
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area with translucent blur & top fade so messages passing underneath look dimmed but visible */}
                    <div className="relative z-10 p-2.5 sm:p-3.5 space-y-2 backdrop-blur-md bg-white/40 dark:bg-black/45 border-t border-black/5 dark:border-white/5">
                      {/* Top Fade Gradient Boundary */}
                      <div className="absolute -top-7 inset-x-0 h-7 pointer-events-none bg-gradient-to-t from-white/40 to-transparent dark:from-black/45" />
                      {/* Active Reply Banner */}
                      {replyingTo && (
                        <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-white/70 dark:bg-black/60 backdrop-blur-md border-s-4 border-[#2481cc] rounded-e-xl text-xs animate-in fade-in-50 duration-150">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[#2481cc]">
                              <CornerUpLeft className="size-3" />
                              <span>{isRtl ? `پاسخ به ${replyingTo.author_name}` : `Reply to ${replyingTo.author_name}`}</span>
                            </div>
                            <p className="truncate text-foreground/80 text-[11px] mt-0.5 max-w-md">
                              {replyingTo.content}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            title={isRtl ? "لغو پاسخ" : "Cancel reply"}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Telegram-style Pending Attachments Staging Bar */}
                      {pendingAttachments.length > 0 && (
                        <div className="p-2.5 bg-white/70 dark:bg-black/60 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl space-y-2 animate-in fade-in-50 duration-150">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                            <span className="flex items-center gap-1.5">
                              <Paperclip className="size-3.5 text-primary" />
                              <span>{isRtl ? "پیوست‌های این پیام (آماده ارسال با متن):" : "Staged attachments (will send with text):"}</span>
                            </span>
                            <span className="fa-num text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                              {pendingAttachments.length} {isRtl ? "مورد" : "items"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 select-none scrollbar-thin">
                            {pendingAttachments.map((att) => {
                              const isImg = isImageAttachment(att);
                              const ext = (att.name?.split(".").pop() || att.type || "file").toLowerCase();

                              if (isImg && (att.previewUrl || att.url)) {
                                return (
                                  <div
                                    key={att.stagingId}
                                    className="relative size-18 sm:size-20 rounded-xl overflow-hidden shrink-0 border-2 border-primary/30 dark:border-primary/20 bg-black/10 group shadow-xs"
                                  >
                                    <img
                                      src={att.previewUrl || att.url}
                                      alt={att.name}
                                      onClick={() => setPreviewImage(att)}
                                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                    />

                                    {att.isUploading ? (
                                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 text-white">
                                        <Loader2 className="size-4 animate-spin" />
                                        <span className="text-[9px] font-medium">{isRtl ? "در حال آپلود..." : "Uploading..."}</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => removePendingAttachment(att.stagingId)}
                                        className="absolute top-1 end-1 size-5 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xs z-10"
                                        title={isRtl ? "حذف این تصویر" : "Remove image"}
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                    )}

                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1 pointer-events-none">
                                      <p className="text-[9px] text-white truncate font-medium">{att.name}</p>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={att.stagingId}
                                  className="relative flex items-center gap-2.5 p-2 pe-8 rounded-xl bg-background/90 dark:bg-card/90 border border-border/70 shrink-0 max-w-[210px] shadow-xs group"
                                  dir={isRtl ? "rtl" : "ltr"}
                                >
                                  <div className="size-9 rounded-lg bg-[#2481cc] text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-2xs">
                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white/40 rounded-bl-[2px]" />
                                    <span className="font-bold text-[9px] lowercase tracking-tight leading-none mt-0.5">
                                      {ext.slice(0, 4)}
                                    </span>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-xs text-foreground truncate leading-tight">
                                      {att.name}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground font-mono fa-num">
                                      {att.size}
                                    </span>
                                  </div>

                                  {att.isUploading ? (
                                    <div className="absolute top-2.5 end-2">
                                      <Loader2 className="size-3.5 animate-spin text-primary" />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => removePendingAttachment(att.stagingId)}
                                      className="absolute top-2 end-2 size-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                                      title={isRtl ? "حذف این فایل" : "Remove file"}
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Hidden Native File Inputs */}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          e.target.value = "";
                          if (files.length > 0) {
                            handleStageAttachments(files);
                          }
                        }}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          e.target.value = "";
                          if (files.length > 0) {
                            handleStageAttachments(files);
                          }
                        }}
                      />
                      <input
                        ref={cadInputRef}
                        type="file"
                        accept=".dwg,.dxf,.step,.stp,.iges,.igs,.stl,.pdf,.zip,.rar"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          e.target.value = "";
                          if (files.length > 0) {
                            handleStageAttachments(files);
                          }
                        }}
                      />

                      {/* Text input row with Telegram Attachment Popover + Textarea + Emoji Popover + Send */}
                      {/* Pill-shaped Composer Bar without shadow or focus */}
                      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 shadow-none transition-colors">
                        {/* Telegram Attachment Button with Popover Menu (Pill, Hover Trigger, Airy Top Spacing) */}
                        <div
                          className="relative shrink-0"
                          ref={attachMenuRef}
                          onMouseEnter={handleAttachMouseEnter}
                          onMouseLeave={handleAttachMouseLeave}
                        >
                          <button
                            type="button"
                            onClick={() => setShowAttachMenu((prev) => !prev)}
                            disabled={isSending}
                            className={cn(
                              "size-9 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 cursor-pointer transition-colors relative",
                              showAttachMenu && "text-foreground",
                              isSending && "opacity-50 pointer-events-none cursor-not-allowed"
                            )}
                            title={isRtl ? "پیوست فایل، عکس یا نقشه" : "Attach file, photo or drawing"}
                          >
                            <Paperclip className="size-5" />
                          </button>

                          {/* Floating Attachment Menu (Simple, No Shadow, Transparent & Blur, Text Color Icons, Floating Above) */}
                          <AnimatePresence>
                            {showAttachMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.12 }}
                                className={cn(
                                  "absolute bottom-full mb-3.5 sm:mb-4 z-50 w-56 sm:w-60 p-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg space-y-1 select-none",
                                  isRtl ? "right-0" : "left-0"
                                )}
                                style={{ transformOrigin: isRtl ? "bottom right" : "bottom left" }}
                                dir={isRtl ? "rtl" : "ltr"}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAttachMenu(false);
                                    photoInputRef.current?.click();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-colors text-start cursor-pointer group"
                                >
                                  <ImageIcon className="size-4.5 text-foreground shrink-0 transition-transform group-hover:scale-110" />
                                  <span className="font-medium text-xs text-foreground flex-1">
                                    {isRtl ? "عکس یا تصویر" : "Photo or Image"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAttachMenu(false);
                                    fileInputRef.current?.click();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-colors text-start cursor-pointer group"
                                >
                                  <FileText className="size-4.5 text-foreground shrink-0 transition-transform group-hover:scale-110" />
                                  <span className="font-medium text-xs text-foreground flex-1">
                                    {isRtl ? "سند یا فایل" : "Document or File"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAttachMenu(false);
                                    cadInputRef.current?.click();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-colors text-start cursor-pointer group"
                                >
                                  <FileCode className="size-4.5 text-foreground shrink-0 transition-transform group-hover:scale-110" />
                                  <span className="font-medium text-xs text-foreground flex-1">
                                    {isRtl ? "نقشه مهندسی و ۳ بعدی" : "Engineering CAD & 3D"}
                                  </span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Textarea inside the white pill */}
                        <div className="flex-1 relative">
                          <Textarea
                            ref={textareaRef}
                            value={progressContent}
                            onChange={(e) => setProgressContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendProgress();
                              }
                            }}
                            onPaste={(e) => {
                              const items = e.clipboardData?.items;
                              if (!items) return;
                              const imageFiles: File[] = [];
                              for (let i = 0; i < items.length; i++) {
                                if (items[i].type.startsWith("image/")) {
                                  const file = items[i].getAsFile();
                                  if (file) {
                                    const namedFile = new File([file], `screenshot_${Date.now()}.png`, { type: file.type });
                                    imageFiles.push(namedFile);
                                  }
                                }
                              }
                              if (imageFiles.length > 0) {
                                e.preventDefault();
                                handleStageAttachments(imageFiles);
                              }
                            }}
                            placeholder={isRtl ? "پیام" : "Message"}
                            className="flex-1 rounded-full resize-none min-h-[38px] max-h-[120px] py-2 px-2 text-sm leading-relaxed bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground/60 transition-colors"
                            rows={1}
                          />
                        </div>

                        {/* Telegram Fast Emoji Popover */}
                        <TelegramEmojiPicker
                          onSelectEmoji={handleInsertEmoji}
                          isRtl={isRtl}
                        />

                        {/* Send Button: Circular Frame, Empty & No-Hover by default, Zoom-Bounces Rocket Icon on Type */}
                        {(() => {
                          const hasContent = Boolean(progressContent.trim() || pendingAttachments.length > 0);
                          return (
                            <button
                              type="button"
                              onClick={hasContent ? handleSendProgress : undefined}
                              disabled={!hasContent || isSending}
                              className={cn(
                                "size-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 select-none",
                                hasContent
                                  ? "bg-[#2481cc] border border-[#2481cc] text-white shadow-xs cursor-pointer active:scale-95 hover:bg-[#1e70b3]"
                                  : "bg-transparent border border-black/15 dark:border-white/15 text-transparent cursor-default pointer-events-none hover:bg-transparent"
                              )}
                              title={isRtl ? "ارسال پیام" : "Send message"}
                            >
                              <AnimatePresence mode="wait">
                                {hasContent && (
                                  <motion.div
                                    key="send-rocket"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.25, 0.95, 1], opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    className="flex items-center justify-center"
                                  >
                                    {isSending ? (
                                      <Loader2 className="size-4 animate-spin text-white" />
                                    ) : (
                                      <Send className="size-4 text-white" />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-4 overflow-hidden rounded-3xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-sm font-semibold truncate flex items-center justify-between gap-4">
              <span>{previewImage?.name}</span>
              {previewImage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 rounded-xl text-xs"
                  onClick={() => downloadAttachment(previewImage)}
                >
                  <Download className="size-3.5" />
                  <span>{isRtl ? "دانلود" : "Download"}</span>
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewImage?.url && (
            <div className="max-h-[75vh] flex items-center justify-center bg-muted/30 rounded-2xl overflow-hidden p-2">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Determine whether a task progress content is purely emojis (1-4 emojis)
export function getEmojiMessageInfo(content?: string): { isPureEmoji: boolean; count: number } {
  if (!content) return { isPureEmoji: false, count: 0 };
  const trimmed = content.trim();
  if (!trimmed) return { isPureEmoji: false, count: 0 };

  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(trimmed))
      .map((s) => s.segment)
      .filter((s) => s.trim().length > 0);

    const emojiRegex =
      /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\u200d|\ufe0f|\ufe0e)+$/u;
    const allEmojis = segments.length > 0 && segments.every((seg) => emojiRegex.test(seg));

    if (allEmojis && segments.length <= 4) {
      return { isPureEmoji: true, count: segments.length };
    }
  } catch {
    const emojiRegex =
      /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\u200d|\ufe0f|\ufe0e|\s)+$/u;
    if (emojiRegex.test(trimmed)) {
      const codePoints = Array.from(trimmed).filter((c) => c.trim().length > 0);
      if (codePoints.length <= 6) {
        return { isPureEmoji: true, count: codePoints.length };
      }
    }
  }

  return { isPureEmoji: false, count: 0 };
}

// Determine whether a task progress entry is a system status event
export function isSystemEventMessage(progress: NewTaskProgress): boolean {
  if (progress.attachments && progress.attachments.length > 0) return false;
  if (progress.is_system_event) return true;
  const c = (progress.content || "").trim();
  if (!c) return false;
  return (
    c.includes("آغاز به کار تسک") ||
    c.includes("ارسال جهت بازبینی") ||
    c.includes("تایید و مختومه") ||
    c.includes("درخواست اصلاحات و بازنگری") ||
    c.includes("وضعیت «در حال انجام» قرار گرفت") ||
    c.includes("به مدیر سیستم ارجاع شد") ||
    c.startsWith("🚀 آغاز به کار تسک") ||
    c.startsWith("📋 ارسال جهت بازبینی")
  );
}

// Telegram Service Message Pill (Centered capsule matching date badge)
function SystemEventPill({
  progress,
  isRtl,
}: {
  progress: NewTaskProgress;
  isRtl: boolean;
}) {
  const timeStr = formatMessageTime(progress.created_at, isRtl);

  return (
    <div className="flex justify-center my-2.5 px-3 select-none" dir={isRtl ? "rtl" : "ltr"}>
      <span className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full text-[11.5px] leading-relaxed font-medium bg-black/35 dark:bg-black/55 text-white backdrop-blur-xs shadow-xs text-center max-w-[92%] sm:max-w-[80%]">
        <span>{progress.content}</span>
        {timeStr && (
          <span className="opacity-75 text-[10px] font-mono fa-num shrink-0 ms-1" dir="ltr">
            {timeStr}
          </span>
        )}
      </span>
    </div>
  );
}

// Telegram Document & Media Attachment Card (matches authentic Telegram UI)
function TelegramDocumentCard({
  att,
  onPreviewImage,
  isRtl,
  isSingleImageOnly,
  timeStr,
  isMe,
}: {
  att: TaskAttachmentItem;
  onPreviewImage: (att: TaskAttachmentItem) => void;
  isRtl: boolean;
  isSingleImageOnly?: boolean;
  timeStr?: string;
  isMe?: boolean;
}) {
  const isImg = isImageAttachment(att);

  if (isImg && att.url) {
    return (
      <div className="relative my-0.5 rounded-2xl overflow-hidden max-w-sm sm:max-w-md border border-black/10 dark:border-white/10 group/img select-none shadow-xs">
        <img
          src={att.url}
          alt={att.name}
          onClick={() => onPreviewImage(att)}
          className="max-h-80 w-auto object-cover rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform block"
        />
        {/* Floating Download Button on Hover */}
        <div className="absolute top-2 end-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              downloadAttachment(att);
            }}
            className="h-7 px-2 rounded-lg text-xs gap-1 bg-black/60 hover:bg-black/80 text-white border-0 shadow-sm cursor-pointer"
          >
            <Download className="size-3" />
            <span>{isRtl ? "دانلود" : "Download"}</span>
          </Button>
        </div>

        {/* Telegram-style floating time pill on pure image message */}
        {isSingleImageOnly && timeStr && (
          <div
            className="absolute bottom-2 end-2 bg-black/55 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 fa-num shadow-xs pointer-events-none select-none"
            dir="ltr"
          >
            <span>{timeStr}</span>
            {isMe && <CheckCheck className="size-3.5 text-emerald-400" />}
          </div>
        )}
      </div>
    );
  }

  const ext = (att.name?.split(".").pop() || att.type || "file").toLowerCase();

  return (
    <div
      onClick={() => downloadAttachment(att)}
      className="flex items-center gap-3 py-2 px-1 my-0.5 cursor-pointer group/doc select-none max-w-sm transition-all hover:opacity-95"
      dir={isRtl ? "rtl" : "ltr"}
      title={isRtl ? `دانلود فایل ${att.name}` : `Download ${att.name}`}
    >
      {/* Telegram Blue Document Badge with folded top-right corner */}
      <div className="size-11 rounded-xl bg-[#2481cc] text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-2xs group-hover/doc:scale-105 transition-transform">
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-white/35 rounded-bl-[4px]" />
        <span className="font-bold text-[10px] lowercase tracking-tight leading-none mt-1">
          {ext.slice(0, 4)}
        </span>
        <Download className="size-3.5 opacity-0 group-hover/doc:opacity-100 transition-opacity absolute inset-0 m-auto text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[13px] sm:text-sm text-slate-900 dark:text-slate-100 group-hover/doc:text-[#2481cc] transition-colors truncate leading-snug">
          {att.name}
        </p>
        {att.size && (
          <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono fa-num leading-tight mt-0.5 block">
            {att.size}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressItem({
  progress,
  isRtl,
  currentUserId,
  isAdmin,
  onReply,
  onPreviewImage,
}: {
  progress: NewTaskProgress;
  isRtl: boolean;
  currentUserId: string;
  isAdmin: boolean;
  onReply: (progress: NewTaskProgress) => void;
  onPreviewImage: (att: TaskAttachmentItem) => void;
}) {
  const isMe = progress.author_id === currentUserId;
  const isAdminNote = progress.is_admin_note;
  const timeStr = formatMessageTime(progress.created_at, isRtl);
  const senderColor = getSenderColor(progress.author_name);

  const isGenericAttachmentLabel =
    progress.content?.trim() === "تصویر پیوست" ||
    progress.content?.trim() === "فایل پیوست" ||
    progress.content?.trim() === "Attached photo" ||
    progress.content?.trim() === "Attached file";

  const hasCaption =
    Boolean(progress.content?.trim()) &&
    !(progress.attachments && progress.attachments.length > 0 && isGenericAttachmentLabel);

  const isSingleImageOnly = Boolean(
    progress.attachments &&
      progress.attachments.length === 1 &&
      isImageAttachment(progress.attachments[0]) &&
      !hasCaption
  );

  const emojiInfo = getEmojiMessageInfo(progress.content);
  const isPureEmojiMessage =
    emojiInfo.isPureEmoji &&
    (!progress.attachments || progress.attachments.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex my-2 group items-end gap-2",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      {/* Incoming Message Avatar (bottom-left) */}
      {!isMe && (
        <div
          style={{ backgroundColor: senderColor }}
          className="size-9 rounded-full overflow-hidden shrink-0 shadow-xs border border-white/60 dark:border-black/30 flex items-center justify-center font-bold text-xs text-white select-none"
          title={progress.author_name}
        >
          {progress.author_name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Quick reply button for outgoing messages */}
      {isMe && (
        <button
          type="button"
          onClick={() => onReply(progress)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-white/80 self-center cursor-pointer shrink-0"
          title={isRtl ? "پاسخ" : "Reply"}
        >
          <CornerUpLeft className="size-3.5" />
        </button>
      )}

      {/* Message Bubble / Jumboji */}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] select-text transition-all",
          isPureEmojiMessage
            ? "bg-transparent border-0 shadow-none px-1 py-0"
            : cn(
                "px-3.5 py-2",
                isMe
                  ? "rounded-[16px] rounded-br-[3px] bg-[#effdde] text-slate-900 border border-[#d6f0c2]/70 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#2b5278] dark:text-slate-100 dark:border-[#386794]/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                  : "rounded-[16px] rounded-bl-[3px] bg-white text-slate-900 border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#182533] dark:text-slate-100 dark:border-slate-800/80 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
              ),
          isAdminNote && !isPureEmojiMessage && "ring-1 ring-amber-500/30"
        )}
      >
        {/* Header for incoming messages: Name + Badge right beside each other like screenshot */}
        {!isMe && (
          <div className="flex items-center gap-2 mb-1" dir={isRtl ? "rtl" : "ltr"}>
            <span
              style={{ color: senderColor }}
              className="font-bold text-xs truncate leading-tight select-none"
            >
              {progress.author_name}
            </span>
            {(isAdminNote || progress.author_role === "admin" || progress.author_role === "مدیر" || progress.author_role === "Owner") && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ede8f8] text-[#7053d2] dark:bg-purple-900/40 dark:text-purple-300 leading-tight select-none">
                {isRtl ? "مدیر" : "Owner"}
              </span>
            )}
          </div>
        )}

        {/* Reply Quote Block (like Telegram screenshot) */}
        {progress.reply_to && (
          <div
            className={cn(
              "border-s-[3px] border-[#2481cc] rounded-e-lg px-2.5 py-1 text-xs mb-1.5 leading-snug select-none",
              isPureEmojiMessage
                ? "bg-black/35 text-white backdrop-blur-xs"
                : "bg-[#2481cc]/8 dark:bg-white/10"
            )}
          >
            <span
              className={cn(
                "font-bold block text-[11px]",
                isPureEmojiMessage ? "text-[#67b5ff]" : "text-[#2481cc] dark:text-[#67b5ff]"
              )}
            >
              {progress.reply_to.author_name}
            </span>
            <span
              className={cn(
                "truncate block text-[11px]",
                isPureEmojiMessage ? "text-slate-200" : "text-slate-600 dark:text-slate-300"
              )}
            >
              {progress.reply_to.content}
            </span>
          </div>
        )}

        {/* Attachments / Files (Telegram Document Cards & Images) - PLACED AT THE TOP */}
        {progress.attachments && progress.attachments.length > 0 && (
          <div className="space-y-1.5 mb-1 pt-0.5">
            {progress.attachments.map((att, idx) => (
              <TelegramDocumentCard
                key={att.id || idx}
                att={att}
                onPreviewImage={onPreviewImage}
                isRtl={isRtl}
                isSingleImageOnly={isSingleImageOnly}
                timeStr={timeStr}
                isMe={isMe}
              />
            ))}
          </div>
        )}

        {/* Caption / Content below media OR Jumboji */}
        {isPureEmojiMessage ? (
          <div className="flex items-end gap-2 my-1 select-text" dir="ltr">
            <span
              className={cn(
                "inline-block font-sans select-text leading-none tracking-tight",
                emojiInfo.count === 1
                  ? "text-6xl sm:text-7xl py-1"
                  : emojiInfo.count <= 3
                  ? "text-4xl sm:text-5xl py-0.5"
                  : "text-3xl sm:text-4xl py-0.5"
              )}
            >
              {progress.content?.trim()}
            </span>

            {/* Telegram Floating Time & Status Pill for Jumboji */}
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/45 dark:bg-black/60 text-white backdrop-blur-xs shadow-xs select-none mb-1 shrink-0"
              dir="ltr"
            >
              <span className="fa-num">{timeStr}</span>
              {isMe && <CheckCheck className="size-3 text-emerald-400" />}
            </div>
          </div>
        ) : (
          hasCaption && (
            <div
              className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words dir-auto mt-1"
              dir={isRtl ? "rtl" : "auto"}
            >
              {progress.content}
            </div>
          )
        )}

        {/* Message Footer: Time + Read Status (tucked seamlessly at bottom right) */}
        {!isSingleImageOnly && !isPureEmojiMessage && (
          <div
            className={cn(
              "flex items-center justify-end gap-1 mt-1 text-[10px] font-mono select-none float-end ms-2 -mb-0.5",
              isMe ? "text-[#55804e] dark:text-[#9bc2e6]" : "text-slate-400 dark:text-slate-400"
            )}
            dir="ltr"
          >
            <span className="fa-num">{timeStr}</span>
            {isMe && <CheckCheck className="size-3.5 text-[#4fae60] dark:text-[#6ec97f]" />}
          </div>
        )}
      </div>

      {/* Quick reply button for incoming messages */}
      {!isMe && (
        <button
          type="button"
          onClick={() => onReply(progress)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-white/80 self-center cursor-pointer shrink-0"
          title={isRtl ? "پاسخ" : "Reply"}
        >
          <CornerUpLeft className="size-3.5" />
        </button>
      )}
    </motion.div>
  );
}
