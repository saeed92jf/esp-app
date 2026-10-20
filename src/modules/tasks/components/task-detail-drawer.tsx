// src/modules/tasks/components/task-detail-drawer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  User,
  Plus,
  Trash2,
  FileText,
  ListTodo,
  MessageSquare,
  Paperclip,
  Activity,
  AlertCircle,
  Building2,
  Sliders,
  UserPlus,
  UserMinus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskAttachment,
  TaskAssignee,
} from "../types/tasks.types";
import { TaskCommentThread } from "./task-comment-thread";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { cn } from "@/lib/utils";

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  open: boolean;
  onClose: () => void;
  roleMode?: "admin" | "user";
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onAddComment: (taskId: string, content: string, attachments?: TaskAttachment[]) => Promise<void>;
  onAddReply: (
    taskId: string,
    commentId: string,
    content: string,
    attachments?: TaskAttachment[]
  ) => Promise<void>;
  onUploadAttachment: (
    taskId: string,
    file: { name: string; size: string; type: string; url?: string; isDrawing?: boolean }
  ) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAssignCollaborator?: (taskId: string, collaborator: TaskAssignee) => Promise<void>;
  onRemoveCollaborator?: (taskId: string, collaboratorId: string) => Promise<void>;
  onUpdateProgress?: (taskId: string, progress: number) => Promise<void>;
}

export function TaskDetailDrawer({
  task,
  open,
  onClose,
  roleMode = "admin",
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onAddComment,
  onAddReply,
  onUploadAttachment,
  onDeleteAttachment,
  onDeleteTask,
  onAssignCollaborator,
  onRemoveCollaborator,
  onUpdateProgress,
}: TaskDetailDrawerProps) {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<
    "details" | "collaborators" | "subtasks" | "comments" | "attachments" | "activity"
  >("details");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabRole, setNewCollabRole] = useState("");
  const [isAddingCollab, setIsAddingCollab] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !task || !mounted) return null;

  const isCompleted = task.status === "completed";
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const assignees = task.assignees || [
    {
      id: "usr-default",
      name: task.assignedToName || "کاربر",
      role: task.assignedToRole || "مجری اصلی",
      isLead: true,
    },
  ];

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName.trim() || !onAssignCollaborator) return;
    await onAssignCollaborator(task.id, {
      id: `usr-${Date.now()}`,
      name: newCollabName.trim(),
      role: newCollabRole.trim() || "همکار پروژه",
    });
    setNewCollabName("");
    setNewCollabRole("");
    setIsAddingCollab(false);
  };

  const handleDelete = async () => {
    if (task.isManagerDefined) {
      alert(t("drawer.cannotDeleteManager"));
      return;
    }
    if (confirm(t("drawer.deleteConfirm"))) {
      await onDeleteTask(task.id);
      onClose();
    }
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: "pending", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Done" },
  ];

  const isRtl = locale === "fa";

  const drawerContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs transition-all duration-200 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        dir={isRtl ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-card shadow-2xl rounded-3xl flex flex-col fa-num border border-border/80 overflow-hidden animate-in zoom-in-95 duration-200 select-text"
      >
        {/* ── Top Header ── */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col gap-3 shrink-0 bg-slate-50/50 dark:bg-muted/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold border",
                  getPriorityBadgeClass(task.priority)
                )}
              >
                {t(`priority.${task.priority}`)}
              </span>

              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted/60 text-muted-foreground border border-border/50">
                {task.category}
              </span>

              {task.company && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  <span>{task.company}</span>
                </span>
              )}

              {task.isManagerDefined && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldAlert className="size-3.5" />
                  <span>{t("tabs.manager")}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {task.title}
          </h2>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-muted-foreground font-semibold me-1">
              {t("drawer.changeStatus")}:
            </span>
            {statusOptions.map((st) => {
              const isCurrent = task.status === st.value;
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => onUpdateStatus(task.id, st.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center gap-1 px-4 border-b border-border/40 bg-muted/10 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "details", label: t("drawer.details"), icon: FileText },
            {
              id: "collaborators",
              label: `${t("collaborators.title")} (${assignees.length})`,
              icon: User,
            },
            {
              id: "subtasks",
              label: `${t("drawer.subtasks")} (${completedSubtasks}/${subtasks.length})`,
              icon: ListTodo,
            },
            {
              id: "comments",
              label: `${t("drawer.comments")} (${task.comments?.length || 0})`,
              icon: MessageSquare,
            },
            {
              id: "attachments",
              label: `${t("drawer.attachments")} (${task.attachments?.length || 0})`,
              icon: Paperclip,
            },
            { id: "activity", label: t("drawer.activity"), icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Body Content (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 min-h-[300px]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-5">
              {task.isManagerDefined && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{t("drawer.managerTaskNotice")}</span>
                </div>
              )}

              {/* Manager Progress Bar & Quick Adjuster */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-primary" />
                    <span>{t("collaborators.progress")}</span>
                  </span>
                  <span className="font-bold text-primary text-sm">
                    {task.progressPercent || 0}%
                  </span>
                </div>

                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${task.progressPercent || 0}%` }}
                  />
                </div>

                {onUpdateProgress && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground">تنظیم سریع:</span>
                    {[0, 25, 50, 60, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => onUpdateProgress(task.id, pct)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
                          task.progressPercent === pct
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">
                  {t("createModal.description")}
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap p-3 rounded-xl bg-muted/20 border border-border/40">
                  {task.description || "توضیحاتی برای این تسک ثبت نشده است."}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {t("drawer.company")}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {task.company || "عمومی"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="size-3.5" />
                    {t("drawer.creator")}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {task.creatorName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {t("drawer.startDate")}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {task.startDate || "ثبت نشده"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {t("drawer.dueDate")}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {task.dueDate || "ثبت نشده"}
                  </span>
                </div>

                {task.timelineDate && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      {t("drawer.timelineDate")}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {task.timelineDate}
                    </span>
                  </div>
                )}

                {task.estimatedHours !== undefined && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {t("drawer.hoursEstimated")}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {task.estimatedHours} ساعت
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Collaborators Tab: Manager Control of Multiple Assignees ── */}
          {activeTab === "collaborators" && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center justify-between">
                <span>{t("collaborators.manageNotice")}</span>
                {roleMode === "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingCollab(!isAddingCollab)}
                    className="rounded-lg gap-1 text-xs cursor-pointer h-7"
                  >
                    <UserPlus className="size-3.5" />
                    <span>{t("collaborators.add")}</span>
                  </Button>
                )}
              </div>

              {/* Add Collaborator Form */}
              {isAddingCollab && (
                <form
                  onSubmit={handleAddCollaborator}
                  className="p-3.5 rounded-xl border border-primary/30 bg-muted/20 flex flex-col gap-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={newCollabName}
                      onChange={(e) => setNewCollabName(e.target.value)}
                      placeholder="نام همکار (مثلا: مهندس ناصری)"
                      className="text-xs rounded-lg bg-background"
                      required
                    />
                    <Input
                      value={newCollabRole}
                      onChange={(e) => setNewCollabRole(e.target.value)}
                      placeholder="سمت (مثلا: طراح P&ID یا ناظر QC)"
                      className="text-xs rounded-lg bg-background"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingCollab(false)}
                      className="h-7 text-xs"
                    >
                      انصراف
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs font-semibold">
                      تایید و افزودن
                    </Button>
                  </div>
                </form>
              )}

              {/* Assignees List */}
              <div className="flex flex-col gap-2.5">
                {assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="p-3 rounded-xl border border-border/60 bg-white dark:bg-card/70 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8.5 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {assignee.name}
                          </span>
                          {assignee.isLead && (
                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-bold">
                              {t("collaborators.lead")}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {assignee.role}
                        </span>
                      </div>
                    </div>

                    {roleMode === "admin" && onRemoveCollaborator && assignees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveCollaborator(task.id, assignee.id)}
                        className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title={t("collaborators.remove")}
                      >
                        <UserMinus className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === "subtasks" && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleAddSub} className="flex items-center gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder={t("subtasks.placeholder")}
                  className="text-xs rounded-xl bg-muted/20"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newSubtaskTitle.trim()}
                  className="rounded-xl gap-1 text-xs shrink-0 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>{t("subtasks.add")}</span>
                </Button>
              </form>

              <div className="flex flex-col gap-2">
                {subtasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/10">
                    {t("subtasks.empty")}
                  </div>
                ) : (
                  subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubtask(task.id, sub.id, !sub.completed)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer select-none",
                        sub.completed
                          ? "bg-emerald-500/5 border-emerald-500/30 text-muted-foreground line-through"
                          : "bg-white dark:bg-card/70 border-border/60 text-foreground hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "size-4.5 rounded-md border flex items-center justify-center transition-colors shrink-0",
                          sub.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-border/80"
                        )}
                      >
                        {sub.completed && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <span className="text-xs font-medium leading-relaxed">
                        {sub.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Comments Tab with Blueprint Attachment Capability */}
          {activeTab === "comments" && (
            <TaskCommentThread
              taskId={task.id}
              comments={task.comments || []}
              onAddComment={onAddComment}
              onAddReply={onAddReply}
            />
          )}

          {/* Attachments Tab */}
          {activeTab === "attachments" && (
            <TaskAttachmentsSection
              taskId={task.id}
              attachments={task.attachments || []}
              onUploadAttachment={onUploadAttachment}
              onDeleteAttachment={onDeleteAttachment}
            />
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="flex flex-col gap-3">
              {(task.activities || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  هیچ فعالیتی ثبت نشده است.
                </div>
              ) : (
                task.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-border/40 bg-muted/15 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">
                        {act.details}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        توسط: {act.authorName}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="p-4 border-t border-border/60 bg-slate-50/50 dark:bg-muted/10 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={roleMode !== "admin" && task.isManagerDefined}
            className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer disabled:opacity-30"
            title={roleMode !== "admin" && task.isManagerDefined ? "تنها مدیر سیستم امکان حذف این تسک سازمانی را دارد" : undefined}
          >
            <Trash2 className="size-3.5" />
            <span>{t("drawer.deleteTask")}</span>
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4 cursor-pointer"
          >
            بستن
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
