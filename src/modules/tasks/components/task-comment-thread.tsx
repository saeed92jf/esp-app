// src/modules/tasks/components/task-comment-thread.tsx
"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskComment, TaskCommentReply, TaskAttachment } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskCommentThreadProps {
  taskId: string;
  comments: TaskComment[];
  onAddComment: (taskId: string, content: string, attachments?: TaskAttachment[]) => Promise<void>;
  onAddReply: (
    taskId: string,
    commentId: string,
    content: string,
    attachments?: TaskAttachment[]
  ) => Promise<void>;
}

export function TaskCommentThread({
  taskId,
  comments,
  onAddComment,
  onAddReply,
}: TaskCommentThreadProps) {
  const t = useTranslations("Tasks.comments");
  const [newCommentText, setNewCommentText] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<TaskAttachment[]>([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
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
        uploadedAt: new Intl.DateTimeFormat("fa-IR").format(new Date()),
        uploaderName: "سعید جلیلی",
      };
    });

    if (isReply) {
      setReplyStagedAttachments((prev) => [...prev, ...newItems]);
    } else {
      setStagedAttachments((prev) => [...prev, ...newItems]);
    }

    if (e.target) e.target.value = "";
  };

  const handleAddSampleDrawing = (isReply = false) => {
    const sampleDrawing: TaskAttachment = {
      id: `att-draw-${Date.now()}`,
      name: `PID-Unit400-Detail-Rev0${Math.floor(Math.random() * 5) + 1}.dwg`,
      size: "3.8 MB",
      type: "dwg",
      isDrawing: true,
      uploadedAt: new Intl.DateTimeFormat("fa-IR").format(new Date()),
      uploaderName: "سعید جلیلی",
    };

    if (isReply) {
      setReplyStagedAttachments((prev) => [...prev, sampleDrawing]);
    } else {
      setStagedAttachments((prev) => [...prev, sampleDrawing]);
    }
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

  const handlePostReply = async (commentId: string) => {
    if ((!replyText.trim() && replyStagedAttachments.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddReply(
        taskId,
        commentId,
        replyText.trim(),
        replyStagedAttachments.length > 0 ? replyStagedAttachments : undefined
      );
      setReplyText("");
      setReplyStagedAttachments([]);
      setReplyingToCommentId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

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

            {/* Quick Button to attach sample Blueprint */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleAddSampleDrawing(false)}
              className="rounded-lg gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer h-8 hidden sm:flex"
              title={t("selectDrawing")}
            >
              <FileCode className="size-3.5" />
              <span>+ {t("selectDrawing")}</span>
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
              className="p-3.5 rounded-xl border border-border/60 bg-white/80 dark:bg-card/60 flex flex-col gap-2.5 shadow-2xs"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7.5 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {comment.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {comment.authorRole}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {comment.createdAt}
                </span>
              </div>

              {/* Comment Text Content */}
              {comment.content && (
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed px-1">
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
                              alert(`دانلود فایل نقشه: ${att.name}`);
                            }
                          }}
                          className="size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                          title="دانلود نقشه / سند"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Actions: Reply Trigger */}
              <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setReplyingToCommentId(
                      replyingToCommentId === comment.id ? null : comment.id
                    )
                  }
                  className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium cursor-pointer"
                >
                  <CornerDownLeft className="size-3 rtl:rotate-180" />
                  <span>{t("reply")}</span>
                </button>
              </div>

              {/* Reply Input Box (when active) */}
              {replyingToCommentId === comment.id && (
                <div className="mt-2 p-2.5 rounded-xl border border-primary/20 bg-muted/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t("replyTo", { author: comment.authorName })}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToCommentId(null);
                        setReplyStagedAttachments([]);
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t("replyPlaceholder")}
                    className="min-h-[60px] resize-none text-xs rounded-lg bg-background"
                  />

                  {/* Reply Staged Attachments */}
                  {replyStagedAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {replyStagedAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border/60 text-[10px]"
                        >
                          {renderAttachmentIcon(att.type, att.isDrawing)}
                          <span className="truncate max-w-[130px]">{att.name}</span>
                          <button
                            type="button"
                            onClick={() => removeStagedAttachment(att.id, true)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
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
                        className="h-7 text-[10px] gap-1 text-muted-foreground"
                      >
                        <Paperclip className="size-3" />
                        <span>{t("attachFile")}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSampleDrawing(true)}
                        className="h-7 text-[10px] gap-1 text-amber-600 dark:text-amber-400"
                      >
                        <FileCode className="size-3" />
                        <span>+ نقشه</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToCommentId(null);
                          setReplyStagedAttachments([]);
                        }}
                        className="h-7 text-xs"
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
                        onClick={() => handlePostReply(comment.id)}
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        <Send className="size-3 rtl:rotate-180" />
                        <span>{t("send")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies Thread */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ms-4 sm:ms-6 ps-3 border-s-2 border-border/50 flex flex-col gap-2.5 mt-1 pt-1">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-2.5 rounded-lg border border-border/40 bg-muted/15 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="size-6 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                              {reply.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-foreground">
                              {reply.authorName}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {reply.authorRole}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {reply.createdAt}
                        </span>
                      </div>

                      {reply.content && (
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed px-1">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
