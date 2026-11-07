// src/modules/tasks/components/TaskProgressView.tsx
"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NewTask, NewTaskProgress, newTasksService, TaskAttachmentItem } from "../services/new-tasks.service";
import { TaskAttachmentList, readAttachmentFile } from "./TaskAttachmentList";
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

const STATUS_CHANGE_OPTIONS = [
  { value: "todo", labelFa: "برای انجام", labelEn: "To Do" },
  { value: "in_progress", labelFa: "در حال انجام", labelEn: "In Progress" },
  { value: "review", labelFa: "بازبینی", labelEn: "Review" },
  { value: "done", labelFa: "انجام‌شده", labelEn: "Done" },
  { value: "cancelled", labelFa: "لغو شده", labelEn: "Cancelled" },
];

export function TaskProgressView({
  task,
  currentUser,
  isAdmin,
  onTaskUpdated,
  onTaskDeleted,
}: TaskProgressViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [progressContent, setProgressContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isApprovingTask, setIsApprovingTask] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<TaskAttachmentItem[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const progressFileInputRef = useRef<HTMLInputElement>(null);

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
    setIsSending(true);
    try {
      const updatedTask = await newTasksService.addProgress(task.id, {
        author_id: currentUser.id,
        author_name: currentUser.fullNameFa || currentUser.fullName || currentUser.name || "کاربر",
        author_role: currentUser.role || "کارشناس",
        content: progressContent.trim() || (isRtl ? "ارسال فایل‌های پیوست" : "Attached files"),
        attachments: pendingAttachments,
        is_admin_note: isAdmin,
      });
      setProgressContent("");
      setPendingAttachments([]);
      onTaskUpdated(updatedTask);
      toast.success(isRtl ? "گزارش ثبت شد." : "Progress update added.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ثبت گزارش" : "Failed to add progress"));
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

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    try {
      const updatedTask = await newTasksService.updateTask(task.id, { status: newStatus as any });
      onTaskUpdated(updatedTask);
      toast.success(isRtl ? "وضعیت تسک تغییر کرد." : "Task status updated.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در تغییر وضعیت" : "Failed to change status"));
    } finally {
      setIsChangingStatus(false);
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

        {/* Admin: Status change */}
        {isAdmin && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-semibold text-muted-foreground mb-2">{isRtl ? "تغییر وضعیت:" : "Change Status:"}</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_CHANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={task.status === opt.value || isChangingStatus}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                    task.status === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-muted border-border hover:bg-muted/80 text-foreground disabled:opacity-50"
                  )}
                >
                  {isRtl ? opt.labelFa : opt.labelEn}
                </button>
              ))}
            </div>
          </div>
        )}
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

      {/* Progress Thread */}
      <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            {isRtl ? "گفتگو و گزارش پیشرفت" : "Progress & Discussion"}
          </h3>
        </div>

        {/* Progress items */}
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {(!task.progress || task.progress.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {isRtl ? "هنوز گزارشی ثبت نشده." : "No updates yet."}
            </div>
          ) : (
            task.progress.map((p) => (
              <ProgressItem key={p.id} progress={p} isRtl={isRtl} currentUserId={currentUser.id} isAdmin={isAdmin} />
            ))
          )}
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
                placeholder={
                  isAdmin
                    ? (isRtl ? "نظر مدیریتی یا راهنمایی بنویسید..." : "Write managerial feedback or guidance...")
                    : (isRtl ? "گزارش پیشرفت، مشکلات یا سوالات خود را بنویسید..." : "Report progress, issues, or ask questions...")
                }
                className="rounded-xl resize-none min-h-[80px] text-sm"
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
          "size-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
          isAdminNote
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {progress.author_name.charAt(0)}
      </div>
      <div className={cn("flex-1 max-w-[85%]", isMe ? "items-end" : "items-start", "flex flex-col")}>
        <div className="flex items-center gap-2 mb-1">
          {!isMe && (
            <span className="text-xs font-semibold text-foreground">{progress.author_name}</span>
          )}
          {isAdminNote && (
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
              <ShieldCheck className="size-3" />
              {isRtl ? "مدیر" : "Admin"}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed space-y-1.5",
            isAdminNote
              ? "bg-primary/10 text-primary-foreground dark:text-primary border border-primary/20"
              : isMe
              ? "bg-primary text-white"
              : "bg-muted text-foreground"
          )}
        >
          <div>{progress.content}</div>
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
