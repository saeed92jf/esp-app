"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Send,
  Paperclip,
  File,
  FileText,
  Mail,
  User,
  Calendar,
  MessageSquare,
  UploadCloud,
  Check,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  DashboardTask,
  TaskComment,
  TaskAttachment,
} from "../../services/dashboard.service";
import { ManagerEmailModal } from "./manager-email-modal";

interface TaskDetailModalProps {
  task: DashboardTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (updatedTask: DashboardTask) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdateTask,
}: TaskDetailModalProps) {
  const t = useTranslations("Dashboard.tasks.modal");
  const locale = useLocale();

  const [activeTab, setActiveTab] = React.useState<"details" | "comments" | "files">("details");
  const [commentText, setCommentText] = React.useState("");
  const [explanation, setExplanation] = React.useState(task?.completionExplanation || "");
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (task) {
      setExplanation(task.completionExplanation || "");
    }
  }, [task]);

  if (!open || !task || !mounted) return null;

  const isCompleted = task.status === "completed";

  const handleToggleCompleted = () => {
    const nextStatus = isCompleted ? "in_progress" : "completed";
    const updated: DashboardTask = {
      ...task,
      status: nextStatus,
      completedAt:
        nextStatus === "completed"
          ? locale === "fa"
            ? new Intl.DateTimeFormat("fa-IR").format(new Date())
            : new Date().toLocaleDateString()
          : undefined,
      completionExplanation: explanation.trim() || task.completionExplanation,
    };
    onUpdateTask(updated);
  };

  const handleSaveExplanation = () => {
    const updated: DashboardTask = {
      ...task,
      completionExplanation: explanation.trim(),
    };
    onUpdateTask(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      authorName: "سعید جلیلی",
      authorRole: "کارشناس ارشد مهندسی",
      content: commentText.trim(),
      createdAt:
        locale === "fa"
          ? new Intl.DateTimeFormat("fa-IR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())
          : new Date().toLocaleTimeString(),
    };

    const updated: DashboardTask = {
      ...task,
      comments: [...task.comments, newComment],
    };
    onUpdateTask(updated);
    setCommentText("");
  };

  const handleSimulateFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAtt: TaskAttachment = {
        id: `att-${Date.now()}`,
        name: `Technical_Document_ESP_${Date.now().toString().slice(-4)}.pdf`,
        size: "2.4 MB",
        type: "application/pdf",
        uploadedAt:
          locale === "fa"
            ? new Intl.DateTimeFormat("fa-IR").format(new Date())
            : new Date().toLocaleDateString(),
      };
      const updated: DashboardTask = {
        ...task,
        attachments: [...task.attachments, newAtt],
      };
      onUpdateTask(updated);
      setIsUploading(false);
    }, 1200);
  };

  const handleDeleteAttachment = (attId: string) => {
    const updated: DashboardTask = {
      ...task,
      attachments: task.attachments.filter((a) => a.id !== attId),
    };
    onUpdateTask(updated);
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* ── Modal Header ── */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "p-2 rounded-xl shrink-0",
                  task.isManagerDefined
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-primary/10 text-primary"
                )}
              >
                {task.isManagerDefined ? (
                  <Lock className="size-4.5" />
                ) : (
                  <CheckCircle2 className="size-4.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                    {task.title}
                  </h3>
                  {task.isManagerDefined && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium shrink-0 flex items-center gap-1">
                      <Lock className="size-2.5" />
                      <span>{t("managerDefined")}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                  <span>{t("creator")}: {task.creatorName}</span>
                  {task.dueDate && <span>• {t("dueDate")}: {task.dueDate}</span>}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ── Sub Navigation Tabs ── */}
          <div className="flex items-center gap-2 px-4 border-b border-border/40 bg-muted/10 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={cn(
                "py-2.5 border-b-2 font-medium transition-colors outline-none",
                activeTab === "details"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabDetails")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={cn(
                "py-2.5 border-b-2 font-medium transition-colors outline-none flex items-center gap-1.5",
                activeTab === "comments"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{t("tabComments")}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono fa-num">
                {task.comments.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={cn(
                "py-2.5 border-b-2 font-medium transition-colors outline-none flex items-center gap-1.5",
                activeTab === "files"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{t("tabFiles")}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono fa-num">
                {task.attachments.length}
              </span>
            </button>
          </div>

          {/* ── Tab Contents ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {/* ── TAB 1: DETAILS ── */}
            {activeTab === "details" && (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Manager Task Protection Alert Banner */}
                {task.isManagerDefined && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                    <ShieldAlert className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="font-semibold block mb-0.5">
                        {t("managerNoticeTitle")}
                      </strong>
                      {t("managerNoticeDesc")}
                    </div>
                  </div>
                )}

                {/* Description */}
                {task.description && (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">
                      {t("description")}
                    </h4>
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Completion & Explanation Section */}
                <div className="p-3.5 rounded-xl border border-border/60 bg-white dark:bg-card/70 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleToggleCompleted}
                        variant={isCompleted ? "default" : "outline"}
                        className={cn(
                          "h-8 text-xs gap-1.5 font-medium shadow-xs",
                          isCompleted && "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{isCompleted ? t("statusCompleted") : t("markCompleted")}</span>
                      </Button>
                      {isCompleted && task.completedAt && (
                        <span className="text-[11px] text-muted-foreground fa-num">
                          {t("completedOn")}: {task.completedAt}
                        </span>
                      )}
                    </div>

                    {task.isManagerDefined && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowEmailModal(true)}
                        className="h-8 text-xs gap-1.5 text-primary hover:bg-primary/10"
                      >
                        <Mail className="size-3.5" />
                        <span>{t("viewEmail")}</span>
                      </Button>
                    )}
                  </div>

                  {/* Completion Explanation Form */}
                  <div className="space-y-1.5 pt-2 border-t border-border/30">
                    <label className="text-xs font-semibold text-foreground/80 block">
                      {t("explanationLabel")}
                    </label>
                    <Textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder={t("explanationPlaceholder")}
                      className="text-xs min-h-[70px] bg-muted/30 border-border/50 resize-none"
                    />
                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleSaveExplanation}
                        className="h-7 text-xs px-3 shadow-xs"
                      >
                        {t("saveReport")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: COMMENTS ── */}
            {activeTab === "comments" && (
              <div className="space-y-3 flex flex-col h-full">
                {/* Comments List */}
                <div className="space-y-2.5 flex-1 min-h-[160px]">
                  {task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-semibold text-foreground/90">
                            {comment.authorName}{" "}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({comment.authorRole})
                            </span>
                          </span>
                          <span className="text-[10px] opacity-70 fa-num">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <MessageSquare className="size-7 mb-1.5 opacity-25" />
                      <p className="text-xs">{t("noComments")}</p>
                    </div>
                  )}
                </div>

                {/* Add Comment Input */}
                <form
                  onSubmit={handleAddComment}
                  className="flex items-center gap-2 pt-2 border-t border-border/40 shrink-0"
                >
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t("commentPlaceholder")}
                    className="h-9 text-xs bg-muted/30 border-border/50 flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-3 gap-1.5 text-xs shadow-xs"
                    disabled={!commentText.trim()}
                  >
                    <Send className="size-3.5 rtl:rotate-180" />
                    <span>{t("sendComment")}</span>
                  </Button>
                </form>
              </div>
            )}

            {/* ── TAB 3: FILES & ATTACHMENTS ── */}
            {activeTab === "files" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("attachmentsCount", { count: task.attachments.length })}
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSimulateFileUpload}
                    disabled={isUploading}
                    className="h-8 text-xs gap-1.5 px-3 shadow-xs"
                  >
                    <UploadCloud className="size-3.5" />
                    <span>{isUploading ? t("uploading") : t("uploadDoc")}</span>
                  </Button>
                </div>

                {task.attachments.length > 0 ? (
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {task.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 flex items-center justify-between gap-2.5 group/file shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-foreground/90 truncate block" dir="ltr">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {file.size} • {file.uploadedAt}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(file.id)}
                          title={t("delete")}
                          className="p-1 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/file:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Paperclip className="size-7 mb-1.5 opacity-25" />
                    <p className="text-xs">{t("noFiles")}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {t("taskCategory")}: {task.category}
            </span>

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

      {/* Corporate Email Preview Modal */}
      <ManagerEmailModal
        task={task}
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
      />
    </>,
    document.body
  );
}
