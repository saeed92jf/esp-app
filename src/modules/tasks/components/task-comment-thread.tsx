// src/modules/tasks/components/task-comment-thread.tsx
"use client";

import React, { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MessageSquare,
  CornerDownLeft,
  Send,
  Heart,
  User,
  X,
  Paperclip,
  FileText,
  FileCode,
  Download,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  Mail,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskComment, TaskCommentReply, TaskAttachment } from "../types/tasks.types";
import { cn } from "@/lib/utils";
import { formatPersonName } from "@/lib/person-names";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { TaskItem } from "../types/tasks.types";

interface TaskCommentThreadProps {
  taskId: string;
  task?: TaskItem;
  comments: TaskComment[];
  onAddComment: (taskId: string, content: string, attachments?: TaskAttachment[]) => Promise<void>;
  onAddReply: (
    taskId: string,
    commentId: string,
    content: string,
    attachments?: TaskAttachment[],
    replyToAuthorName?: string
  ) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onDeleteReply?: (commentId: string, replyId: string) => Promise<void>;
  onEmailComment?: (comment: TaskComment, recipientEmails: string[], includeAttachments: boolean) => Promise<void>;
}

export function TaskCommentThread({
  taskId,
  task,
  comments,
  onAddComment,
  onAddReply,
  onDeleteComment,
  onDeleteReply,
  onEmailComment,
}: TaskCommentThreadProps) {
  const t = useTranslations("Tasks.comments");
  const { user } = useAuth();

  const [emailModalComment, setEmailModalComment] = useState<TaskComment | null>(null);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState("");
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const isSaeed = Boolean(
    user?.id === "u-saeed" ||
    user?.id === "usr_9801" ||
    (user?.email && (user.email.toLowerCase().includes("jalili") || user.email.toLowerCase() === "s.jalili@euroslotpars.com") && !user.email.toLowerCase().includes("saeedkhani"))
  );
  const isSuperAdmin = user?.role === "superadmin" || isSaeed;
  const isDeptAdmin = user?.role === "dept_admin" || user?.role === "manager";

  const canDeleteComment = (authorName: string, authorId?: string) => {
    if (isSuperAdmin || user?.role === "admin") return true;
    const currentName = (user?.name || user?.fullName || user?.fullNameFa || "").toLowerCase().trim();
    const currentId = (user?.id || "").toLowerCase().trim();
    const authN = (authorName || "").toLowerCase().trim();
    const authI = (authorId || "").toLowerCase().trim();
    return (currentName && authN && (currentName === authN || currentName.includes(authN) || authN.includes(currentName))) ||
           (currentId && authI && currentId === authI);
  };

  const handleOpenEmailModal = (comment: TaskComment) => {
    setEmailModalComment(comment);
    const emails = new Set<string>();
    (task?.assignees || []).forEach((a: any) => {
      if (a.email && a.email.includes("@")) emails.add(a.email.toLowerCase().trim());
    });
    if ((task as any)?.creatorEmail) emails.add((task as any).creatorEmail.toLowerCase().trim());
    setRecipientEmails(Array.from(emails));
    setIncludeAttachments(Boolean(comment.attachments && comment.attachments.length > 0));
  };

  const handleAddRecipient = () => {
    const trimmed = newRecipientInput.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !recipientEmails.includes(trimmed)) {
      setRecipientEmails((prev) => [...prev, trimmed]);
      setNewRecipientInput("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipientEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleConfirmSendEmail = async () => {
    if (!emailModalComment || recipientEmails.length === 0) return;
    setIsSendingEmail(true);
    try {
      if (onEmailComment) {
        await onEmailComment(emailModalComment, recipientEmails, includeAttachments);
      } else {
        await fetch(`/api/real/tasks/${taskId}/email-comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_id: emailModalComment.id,
            comment_content: emailModalComment.content,
            author_name: emailModalComment.authorName,
            author_role: emailModalComment.authorRole,
            recipient_emails: recipientEmails,
            include_attachments: includeAttachments,
            attachments: emailModalComment.attachments || [],
          }),
        });
      }
      setEmailModalComment(null);
    } catch (err) {
      console.error("Failed to email comment:", err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Check if current user is an assignee of this task
  const isAssignee = React.useMemo(() => {
    if (!user) return false;
    const taskAssignees = task?.assignees || [];
    const directAssignedName = (task?.assignedToName || "").toLowerCase();
    const uId = (user.id || "").toLowerCase();
    const uEmail = (user.email || "").toLowerCase();
    const uName = (user.name || user.fullName || user.fullNameFa || "").toLowerCase();

    if (directAssignedName && (directAssignedName.includes(uName) || (uName && uName.includes(directAssignedName)))) {
      return true;
    }

    return taskAssignees.some((a) => {
      const aId = (a.id || "").toLowerCase();
      const aName = (a.name || "").toLowerCase();
      if (uId && aId === uId) return true;
      if (aName && (aName === uName || aName.includes(uName) || uName.includes(aName))) return true;
      if (uEmail && aName && uEmail.split("@")[0] && aName.includes(uEmail.split("@")[0])) return true;
      return false;
    });
  }, [user, task]);

  // Law: In task discussions, ONLY assignees and department admin (+ super admin) can post comments & replies
  const canPostComment = isSuperAdmin || isDeptAdmin || isAssignee;
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [newCommentText, setNewCommentText] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<TaskAttachment[]>([]);

  interface ReplyingTarget {
    commentId: string;
    authorName: string;
    replyId?: string;
  }

  const [replyingTarget, setReplyingTarget] = useState<ReplyingTarget | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStagedAttachments, setReplyStagedAttachments] = useState<TaskAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: TaskAttachment[] = Array.from(files).map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isDrawing = ["dwg", "dxf", "pdf"].includes(ext);
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: sizeStr,
        type: ext || "file",
        isDrawing,
        uploadedAt: new Intl.DateTimeFormat(isRtl ? "fa-IR" : "en-US").format(new Date()),
        uploaderName: formatPersonName(user?.name || user?.fullName || user?.fullNameFa || "کاربر", locale),
      };
    });

    if (isReply) {
      setReplyStagedAttachments((prev) => [...prev, ...newItems]);
    } else {
      setStagedAttachments((prev) => [...prev, ...newItems]);
    }

    if (e.target) e.target.value = "";
  };

  const removeStagedAttachment = (id: string, isReply = false) => {
    if (isReply) {
      setReplyStagedAttachments((prev) => prev.filter((a) => a.id !== id));
    } else {
      setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newCommentText.trim() && stagedAttachments.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(
        taskId,
        newCommentText.trim(),
        stagedAttachments.length > 0 ? stagedAttachments : undefined
      );
      setNewCommentText("");
      setStagedAttachments([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartReplyToComment = (comment: TaskComment) => {
    if (replyingTarget?.commentId === comment.id && !replyingTarget?.replyId) {
      setReplyingTarget(null);
      setReplyStagedAttachments([]);
      setReplyText("");
    } else {
      setReplyingTarget({
        commentId: comment.id,
        authorName: comment.authorName,
      });
      setReplyText("");
      setReplyStagedAttachments([]);
    }
  };

  const handleStartReplyToReply = (commentId: string, reply: TaskCommentReply) => {
    if (replyingTarget?.commentId === commentId && replyingTarget?.replyId === reply.id) {
      setReplyingTarget(null);
      setReplyStagedAttachments([]);
      setReplyText("");
    } else {
      setReplyingTarget({
        commentId,
        authorName: reply.authorName,
        replyId: reply.id,
      });
      setReplyText("");
      setReplyStagedAttachments([]);
    }
  };

  const handlePostReply = async (commentId: string, replyToAuthorName?: string) => {
    if ((!replyText.trim() && replyStagedAttachments.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddReply(
        taskId,
        commentId,
        replyText.trim(),
        replyStagedAttachments.length > 0 ? replyStagedAttachments : undefined,
        replyToAuthorName
      );
      setReplyText("");
      setReplyStagedAttachments([]);
      setReplyingTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReplyComposer = (commentId: string, authorName: string) => (
    <div className="mt-2.5 p-3 rounded-xl border border-primary/25 bg-muted/25 flex flex-col gap-2.5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-0.5">
        <div className="flex items-center gap-1.5 font-medium text-primary">
          <CornerDownLeft className="size-3 rtl:rotate-180" />
          <span>{t("replyTo", { author: formatPersonName(authorName, locale) })}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setReplyingTarget(null);
            setReplyStagedAttachments([]);
            setReplyText("");
          }}
          className="size-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          title={t("cancelReply")}
        >
          <X className="size-3" />
        </button>
      </div>

      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder={t("replyPlaceholder")}
        autoFocus
        className="min-h-[65px] resize-none text-xs rounded-lg bg-background border-border/60 focus:ring-1"
      />

      {/* Reply Staged Attachments */}
      {replyStagedAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {replyStagedAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-background border border-border/60 text-[10px] shadow-2xs"
            >
              {renderAttachmentIcon(att.type, att.isDrawing)}
              <span className="truncate max-w-[130px] font-medium">{att.name}</span>
              <button
                type="button"
                onClick={() => removeStagedAttachment(att.id, true)}
                className="text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <X className="size-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <div className="flex items-center gap-1">
          <input
            ref={replyFileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e, true)}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => replyFileInputRef.current?.click()}
            className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Paperclip className="size-3" />
            <span>{t("attachFile")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setReplyingTarget(null);
              setReplyStagedAttachments([]);
              setReplyText("");
            }}
            className="h-7 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
          >
            {t("cancelReply")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              (!replyText.trim() && replyStagedAttachments.length === 0) ||
              isSubmitting
            }
            onClick={() => handlePostReply(commentId, authorName)}
            className="h-7 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
          >
            <Send className="size-3 rtl:rotate-180" />
            <span>{t("send")}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAttachmentIcon = (type: string, isDrawing?: boolean) => {
    if (isDrawing || type === "dwg" || type === "dxf") {
      return <FileCode className="size-4 text-amber-500 shrink-0" />;
    }
    if (type === "pdf") {
      return <FileText className="size-4 text-rose-500 shrink-0" />;
    }
    if (type === "image" || ["png", "jpg", "jpeg"].includes(type)) {
      return <ImageIcon className="size-4 text-sky-500 shrink-0" />;
    }
    return <FileText className="size-4 text-primary shrink-0" />;
  };

  return (
    <div className="flex flex-col gap-4 fa-num">
      {/* ── Main Comment Input Composer with File/Blueprint Attachment ── */}
      {canPostComment ? (
        <form
          onSubmit={handlePostComment}
          className="flex flex-col gap-2.5 p-3 rounded-2xl border border-border/60 bg-muted/15"
        >
        <Textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={t("placeholder")}
          className="min-h-[85px] resize-none text-xs sm:text-sm rounded-xl bg-background border-border/60 focus:ring-1"
        />

        {/* Staged Attachments Chips Preview */}
        {stagedAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {stagedAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-card border border-border/80 text-[11px] shadow-2xs"
              >
                {renderAttachmentIcon(att.type, att.isDrawing)}
                <span className="font-medium text-foreground max-w-[170px] truncate">
                  {att.name}
                </span>
                <span className="text-[10px] text-muted-foreground">({att.size})</span>
                {att.isDrawing && (
                  <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-semibold">
                    {t("drawingBadge")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeStagedAttachment(att.id, false)}
                  className="size-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ms-1"
                  aria-label={t("removeAttachment")}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Composer Actions: Attach Blueprint Button + Submit Button */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e, false)}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer h-8"
              title={t("attachFile")}
            >
              <Paperclip className="size-3.5" />
              <span>{t("attachFile")}</span>
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={(!newCommentText.trim() && stagedAttachments.length === 0) || isSubmitting}
            className="rounded-lg gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs h-8"
          >
            <Send className="size-3.5 rtl:rotate-180" />
            <span>{t("send")}</span>
          </Button>
        </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            {isRtl
              ? "در گفتگوی این تسک منحصراً افراد تخصیص‌یافته به تسک (Assignees) و مدیر دپارتمان مجاز به ثبت نظر و ارسال پیام هستند."
              : "In this task discussion, only assigned team members (Assignees) and department managers are authorized to comment."}
          </p>
        </div>
      )}

      {/* ── Comments Feed List ── */}
      <div className="flex flex-col gap-3 pt-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/10">
            {t("noComments")}
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex flex-col gap-2.5 shadow-xs"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7.5 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {formatPersonName(comment.authorName, locale).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      {formatPersonName(comment.authorName, locale)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {comment.createdAt}
                </span>
              </div>

              {/* Comment Text Content */}
              {comment.content && (
                <p className="text-[13px] text-slate-800 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed px-1 font-normal select-text">
                  {comment.content}
                </p>
              )}

              {/* ── Attached Blueprints/Files inside Comment ── */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 px-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("attachedFiles")}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {comment.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs",
                          att.isDrawing || att.type === "dwg"
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/50"
                            : "bg-slate-50 dark:bg-card border-border/60"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderAttachmentIcon(att.type, att.isDrawing)}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-foreground truncate">
                              {att.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                              <span>{att.size}</span>
                              {att.isDrawing && (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                  • {t("drawingBadge")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <a
                          href={att.url || "#"}
                          download={att.name}
                          onClick={(e) => {
                            if (!att.url) {
                              e.preventDefault();
                              alert(isRtl ? `دانلود فایل نقشه: ${att.name}` : `Download drawing: ${att.name}`);
                            }
                          }}
                          className="size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                          title={isRtl ? "دانلود نقشه / سند" : "Download Drawing / Document"}
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Actions: Reply, Email & Delete */}
              <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px]">
                <div className="flex items-center gap-3">
                  {canPostComment && (
                    <button
                      type="button"
                      onClick={() => handleStartReplyToComment(comment)}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium cursor-pointer"
                    >
                      <CornerDownLeft className="size-3 rtl:rotate-180" />
                      <span>{t("reply")}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEmailModal(comment)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium cursor-pointer transition-colors"
                    title={isRtl ? "ارسال این نظر به ایمیل مخاطبان" : "Email this comment"}
                  >
                    <Mail className="size-3 text-sky-500" />
                    <span>{isRtl ? "ارسال به ایمیل" : "Email"}</span>
                  </button>
                </div>

                {canDeleteComment(comment.authorName, (comment as any).authorId) && (
                  <button
                    type="button"
                    onClick={() => onDeleteComment && onDeleteComment(comment.id)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer p-1 transition-colors"
                    title={isRtl ? "حذف نظر" : "Delete comment"}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Reply Input Box (when replying directly to comment) */}
              {replyingTarget?.commentId === comment.id && !replyingTarget?.replyId && (
                renderReplyComposer(comment.id, replyingTarget.authorName)
              )}

              {/* Replies Thread */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ms-4 sm:ms-6 ps-3 border-s-2 border-border/50 flex flex-col gap-2.5 mt-1 pt-1">
                  {comment.replies.map((reply) => (
                    <React.Fragment key={reply.id}>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex flex-col gap-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="size-6 border border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                                {formatPersonName(reply.authorName, locale).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-semibold text-foreground">
                                {formatPersonName(reply.authorName, locale)}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {reply.createdAt}
                          </span>
                        </div>

                        {/* Indication of who this reply is addressing */}
                        {reply.replyToAuthorName && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-1">
                            <CornerDownLeft className="size-2.5 text-primary/70 rtl:rotate-180" />
                            <span>{isRtl ? "در پاسخ به" : "Replying to"}</span>
                            <span className="text-primary font-semibold">
                              @{formatPersonName(reply.replyToAuthorName, locale)}
                            </span>
                          </div>
                        )}

                        {reply.content && (
                          <p className="text-[13px] text-slate-800 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed px-1 font-normal select-text">
                            {reply.content}
                          </p>
                        )}

                        {/* Reply Attachments */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {reply.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-card border border-border/60 text-[10px]"
                              >
                                {renderAttachmentIcon(att.type, att.isDrawing)}
                                <span className="font-medium truncate max-w-[140px]">
                                  {att.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  ({att.size})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Action & Delete on this Reply */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[10px]">
                          {canPostComment ? (
                            <button
                              type="button"
                              onClick={() => handleStartReplyToReply(comment.id, reply)}
                              className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium cursor-pointer"
                            >
                              <CornerDownLeft className="size-2.5 rtl:rotate-180" />
                              <span>{t("reply")}</span>
                            </button>
                          ) : <div />}

                          {canDeleteComment(reply.authorName, (reply as any).authorId) && (
                            <button
                              type="button"
                              onClick={() => onDeleteReply && onDeleteReply(comment.id, reply.id)}
                              className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5 transition-colors"
                              title={isRtl ? "حذف پاسخ" : "Delete reply"}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reply Input Box (when replying specifically to this reply) */}
                      {replyingTarget?.commentId === comment.id && replyingTarget?.replyId === reply.id && (
                        renderReplyComposer(comment.id, replyingTarget.authorName)
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Dialog for Emailing Comment ── */}
      <Dialog open={Boolean(emailModalComment)} onOpenChange={(open) => !open && setEmailModalComment(null)}>
        <DialogContent className="sm:max-w-md fa-num">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Mail className="size-5 text-sky-500" />
              <span>{isRtl ? "ارسال نظر تسک به ایمیل سازمانی" : "Email Task Comment"}</span>
            </DialogTitle>
          </DialogHeader>

          {emailModalComment && (
            <div className="space-y-4 py-2">
              {/* Comment Content Preview */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
                <p className="text-muted-foreground font-semibold mb-1">
                  {formatPersonName(emailModalComment.authorName, locale)} ({emailModalComment.createdAt}):
                </p>
                <p className="text-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                  {emailModalComment.content}
                </p>
                {emailModalComment.attachments && emailModalComment.attachments.length > 0 && (
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-2 font-medium">
                    📎 {emailModalComment.attachments.length} {isRtl ? "فایل پیوست" : "attachments"}
                  </p>
                )}
              </div>

              {/* Recipients Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  {isRtl ? "گیرندگان ایمیل (ایمیل‌های سازمانی):" : "Recipients:"}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newRecipientInput}
                    onChange={(e) => setNewRecipientInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRecipient())}
                    placeholder="user@euroslotpars.com"
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddRecipient}
                    className="h-8 px-3 text-xs cursor-pointer"
                  >
                    {isRtl ? "افزودن" : "Add"}
                  </Button>
                </div>

                {/* Recipient Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {recipientEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-mono"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  {recipientEmails.length === 0 && (
                    <span className="text-xs text-rose-500">
                      {isRtl ? "حداقل یک گیرنده باید مشخص شود." : "At least one recipient is required."}
                    </span>
                  )}
                </div>
              </div>

              {/* Include attachments toggle */}
              {emailModalComment.attachments && emailModalComment.attachments.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Checkbox
                    id="include-att"
                    checked={includeAttachments}
                    onCheckedChange={(checked) => setIncludeAttachments(Boolean(checked))}
                  />
                  <label htmlFor="include-att" className="text-xs text-foreground cursor-pointer select-none">
                    {isRtl ? "ارسال فایل‌های پیوست به همراه ایمیل" : "Include attached files in email"}
                  </label>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEmailModalComment(null)}
              disabled={isSendingEmail}
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSendEmail}
              disabled={isSendingEmail || recipientEmails.length === 0}
              className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              {isSendingEmail ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5 rtl:rotate-180" />
              )}
              <span>{isRtl ? "ارسال ایمیل" : "Send Email"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
