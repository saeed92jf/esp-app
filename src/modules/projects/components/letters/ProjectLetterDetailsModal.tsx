// src/modules/projects/components/letters/ProjectLetterDetailsModal.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import {
  FileText,
  Download,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectLetter } from "../../types/project-letters.types";
import { downloadAttachment } from "@/modules/tasks/components/TaskAttachmentList";
import { formatPersonName, formatRoleName } from "@/lib/person-names";

interface ProjectLetterDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: ProjectLetter | null;
  canReview?: boolean;
  onOpenReviewModal?: () => void;
  canSend?: boolean;
  onMarkSent?: () => void;
}

const STATUS_MAP = {
  pending_approval: {
    labelFa: "در انتظار بررسی و تایید مدیر",
    labelEn: "Awaiting Manager Approval",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: Clock,
  },
  approved: {
    labelFa: "تایید شده جهت ارسال",
    labelEn: "Approved for Dispatch",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    labelFa: "رد شده / نیاز به اصلاح",
    labelEn: "Rejected / Needs Revision",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    icon: XCircle,
  },
  sent: {
    labelFa: "ارسال رسمی شده",
    labelEn: "Dispatched & Sent",
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    icon: Send,
  },
};

export function ProjectLetterDetailsModal({
  open,
  onOpenChange,
  letter,
  canReview,
  onOpenReviewModal,
  canSend,
  onMarkSent,
}: ProjectLetterDetailsModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (!letter) return null;

  const statusInfo = STATUS_MAP[letter.status] || STATUS_MAP.pending_approval;
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border/60">
        <DialogHeader className="space-y-2 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {letter.letterNumber}
            </span>
            <Badge variant="outline" className={cn("text-xs font-bold gap-1 px-3 py-1", statusInfo.color)}>
              <StatusIcon className="size-3.5" />
              <span>{isRtl ? statusInfo.labelFa : statusInfo.labelEn}</span>
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-foreground pt-1">
            {letter.subject}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2 text-xs sm:text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground block">{isRtl ? "پروژه:" : "Project:"}</span>
              <span className="font-bold text-foreground">{letter.projectName}</span>
              <span className="text-muted-foreground block text-[11px] font-mono">{letter.espNumber}</span>
            </div>

            <div>
              <span className="text-muted-foreground block">{isRtl ? "گیرنده / کارفرما:" : "Recipient:"}</span>
              <span className="font-bold text-foreground">{letter.recipient}</span>
            </div>

            <div>
              <span className="text-muted-foreground block">{isRtl ? "تاریخ ثبت:" : "Date:"}</span>
              <span className="font-bold text-foreground fa-num">{letter.date}</span>
            </div>

            <div>
              <span className="text-muted-foreground block">{isRtl ? "دپارتمان فرستنده:" : "Sender Dept:"}</span>
              <span className="font-bold text-foreground">{letter.senderDepartment || "بخش اداری"}</span>
            </div>

            <div>
              <span className="text-muted-foreground block">{isRtl ? "اولویت:" : "Priority:"}</span>
              <span className="font-bold text-foreground">
                {letter.priority === "urgent" ? (isRtl ? "فوری" : "Urgent") : letter.priority === "confidential" ? (isRtl ? "آنی/محرمانه" : "Confidential") : (isRtl ? "عادی" : "Normal")}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">{isRtl ? "ثبت‌کننده اداری:" : "Drafted By:"}</span>
              <span className="font-bold text-foreground">{letter.draftBy?.userName || "بخش اداری"}</span>
            </div>
          </div>

          {/* Description */}
          {letter.description && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">{isRtl ? "توضیحات و خلاصه متن نامه:" : "Summary & Description:"}</span>
              <p className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 text-foreground leading-relaxed">
                {letter.description}
              </p>
            </div>
          )}

          {/* Draft File by Office Staff */}
          {letter.draftFile && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                <span>{isRtl ? "فایل پیش‌نویس بارگذاری‌شده توسط بخش اداری:" : "Draft File from Office Staff:"}</span>
              </span>
              <div className="p-3.5 rounded-2xl bg-background border border-border/60 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{letter.draftFile.fileName}</p>
                    <p className="text-[11px] text-muted-foreground">{letter.draftFile.fileSize}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAttachment({ name: letter.draftFile!.fileName, url: letter.draftFile!.url })}
                  className="rounded-xl h-9 px-3.5 gap-1.5 text-xs font-bold"
                >
                  <Download className="size-3.5" />
                  <span>{isRtl ? "دانلود فایل" : "Download"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Manager Review Box */}
          {letter.managerReview ? (
            <div
              className={cn(
                "p-4 rounded-2xl border space-y-3",
                letter.managerReview.decision === "approved"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              )}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={cn(
                      "size-4.5",
                      letter.managerReview.decision === "approved" ? "text-emerald-600" : "text-rose-600"
                    )}
                  />
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "بررسی و تصمیم مدیر پروژه:" : "Manager Review Decision:"}{" "}
                    {letter.managerReview.decision === "approved"
                      ? isRtl ? "تایید شده جهت ارسال" : "Approved for Dispatch"
                      : isRtl ? "رد شده / نیاز به اصلاح" : "Rejected"}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {isRtl ? `توسط ${letter.managerReview.reviewerName}` : `By ${letter.managerReview.reviewerName}`}
                </span>
              </div>

              {letter.managerReview.comment && (
                <div className="p-3 rounded-xl bg-background/80 border border-border/40 text-xs text-foreground space-y-1">
                  <span className="font-bold text-muted-foreground block">{isRtl ? "کامنت و یادداشت مدیر:" : "Manager Comment:"}</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{letter.managerReview.comment}</p>
                </div>
              )}

              {/* Manager Attached File */}
              {letter.managerReview.attachmentFile && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs truncate">
                    <Paperclip className="size-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground truncate">{letter.managerReview.attachmentFile.fileName}</span>
                    <span className="text-muted-foreground text-[11px] shrink-0">
                      ({letter.managerReview.attachmentFile.fileSize})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadAttachment({
                        name: letter.managerReview!.attachmentFile!.fileName,
                        url: letter.managerReview!.attachmentFile!.url,
                      })
                    }
                    className="rounded-xl h-8 px-3 text-xs gap-1.5 shrink-0 bg-background"
                  >
                    <Download className="size-3.5" />
                    <span>{isRtl ? "دانلود فایل ارسالی مدیر" : "Download File"}</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Clock className="size-4 shrink-0 text-amber-600 animate-pulse" />
              <span>{isRtl ? "این نامه در صف بررسی مدیر پروژه قرار دارد و هنوز تصمیمی برای آن ثبت نشده است." : "This letter is in the manager review queue."}</span>
            </div>
          )}

          {/* Sent Information */}
          {letter.status === "sent" && letter.sentInfo && (
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 text-xs text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-2">
                <Send className="size-4 shrink-0 text-sky-600" />
                <span>
                  {isRtl ? "این نامه رسماً ارسال شده است." : "Letter officially sent."}
                  {letter.sentInfo.trackingNumber && ` (کد رهگیری / شماره دبیرخانه: ${letter.sentInfo.trackingNumber})`}
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-semibold cursor-pointer"
            >
              {isRtl ? "بستن" : "Close"}
            </Button>

            <div className="flex items-center gap-2">
              {canReview && letter.status === "pending_approval" && onOpenReviewModal && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenReviewModal();
                  }}
                  className="rounded-full px-5 text-xs font-bold bg-primary text-white shadow-xs gap-1.5"
                >
                  <ShieldCheck className="size-4" />
                  <span>{isRtl ? "بررسی و تایید/رد توسط مدیر" : "Review as Manager"}</span>
                </Button>
              )}

              {canSend && letter.status === "approved" && onMarkSent && (
                <Button
                  onClick={onMarkSent}
                  className="rounded-full px-5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>{isRtl ? "ثبت ارسال به کارفرما" : "Mark as Sent"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

