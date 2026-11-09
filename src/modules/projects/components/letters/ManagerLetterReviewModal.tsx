// src/modules/projects/components/letters/ManagerLetterReviewModal.tsx
"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "next-intl";
import {
  CheckCircle2,
  XCircle,
  FileText,
  UploadCloud,
  X,
  Loader2,
  Download,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type {
  ProjectLetter,
  LetterAttachment,
} from "../../types/project-letters.types";
import { projectLettersService } from "../../services/project-letters.service";
import {
  readAttachmentFile,
  downloadAttachment,
} from "@/modules/tasks/components/TaskAttachmentList";

interface ManagerLetterReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: ProjectLetter | null;
  onLetterReviewed: (updatedLetter: ProjectLetter) => void;
}

export function ManagerLetterReviewModal({
  open,
  onOpenChange,
  letter,
  onLetterReviewed,
}: ManagerLetterReviewModalProps) {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [comment, setComment] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<LetterAttachment | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!letter) return null;

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsReadingFile(true);
    try {
      const att = await readAttachmentFile(file);
      setAttachmentFile({
        fileName: att.name,
        fileSize: att.size,
        fileType: att.type,
        url: att.url || "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || "مدیر پروژه",
      });
      toast.success(
        isRtl
          ? `فایل مدیر "${file.name}" پیوست شد.`
          : `Manager file "${file.name}" attached.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to process file");
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (decision === "rejected" && !comment.trim()) {
      toast.error(
        isRtl
          ? "در صورت رد نامه، درج دلیل رد و کامنت اصلاحی برای بخش اداری الزامی است."
          : "Comment explaining rejection is required."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await projectLettersService.reviewLetter(letter.id, {
        decision,
        comment: comment.trim(),
        reviewerId: user?.id,
        reviewerName: user?.name || "مدیر پروژه",
        reviewerRole: user?.role || "manager",
        attachmentFile: attachmentFile || undefined,
      });

      toast.success(
        decision === "approved"
          ? isRtl
            ? "نامه با موفقیت تایید شد و آماده ارسال است."
            : "Letter approved for dispatch."
          : isRtl
          ? "نامه رد شد و نکات اصلاحی برای بخش اداری ثبت گردید."
          : "Letter rejected with comments."
      );

      onLetterReviewed(updated);
      onOpenChange(false);
      setComment("");
      setAttachmentFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border/60">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <span>{isRtl ? "کارتابل بررسی و تایید نامه توسط مدیر" : "Manager Letter Review & Approval"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {isRtl
              ? "بررسی فایل پیش‌نویس اداری، اعلام تایید یا رد نامه با درج کامنت، و امکان آپلود نسخه امضاشده توسط مدیر."
              : "Review letter draft, approve or reject with feedback, and attach signed or annotated files."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Letter Summary Card */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  {letter.letterNumber}
                </span>
                <span className="text-xs text-muted-foreground fa-num">
                  {isRtl ? `تاریخ: ${letter.date}` : `Date: ${letter.date}`}
                </span>
              </div>
              <span className="text-xs font-bold text-foreground">
                {letter.projectName} ({letter.espNumber})
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground">
                {letter.subject}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isRtl ? "گیرنده: " : "Recipient: "}
                <span className="font-semibold text-foreground">{letter.recipient}</span>
              </p>
              {letter.description && (
                <p className="text-xs text-muted-foreground mt-1 bg-background/50 p-2 rounded-xl">
                  {letter.description}
                </p>
              )}
            </div>

            {/* Drafter file download bar */}
            {letter.draftFile && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs truncate">
                  <FileText className="size-4 text-primary shrink-0" />
                  <span className="font-semibold truncate">{letter.draftFile.fileName}</span>
                  <span className="text-muted-foreground text-[11px] shrink-0">
                    ({letter.draftFile.fileSize})
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadAttachment({
                      name: letter.draftFile!.fileName,
                      url: letter.draftFile!.url,
                    })
                  }
                  className="rounded-xl h-8 px-3 text-xs gap-1.5 shrink-0 hover:border-primary/50"
                >
                  <Download className="size-3.5" />
                  <span>{isRtl ? "دانلود و مشاهده پیش‌نویس" : "Download Draft"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* 2. Manager Decision Selector (Approve vs Reject) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              {isRtl ? "تصمیم مدیر در مورد این نامه *" : "Manager Decision *"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Approve Option */}
              <button
                type="button"
                onClick={() => setDecision("approved")}
                className={cn(
                  "p-4 rounded-2xl border text-start flex items-center gap-3.5 transition-all cursor-pointer select-none",
                  decision === "approved"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs"
                    : "bg-muted/20 border-border/60 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0",
                    decision === "approved"
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold">
                    {isRtl ? "تایید جهت ارسال به کارفرما" : "Approve for Dispatch"}
                  </h5>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isRtl
                      ? "نامه تایید می‌شود و بخش اداری مجاز به ارسال رسمی آن است."
                      : "Letter is approved and cleared for official sending."}
                  </p>
                </div>
              </button>

              {/* Reject Option */}
              <button
                type="button"
                onClick={() => setDecision("rejected")}
                className={cn(
                  "p-4 rounded-2xl border text-start flex items-center gap-3.5 transition-all cursor-pointer select-none",
                  decision === "rejected"
                    ? "bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-xs"
                    : "bg-muted/20 border-border/60 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0",
                    decision === "rejected"
                      ? "bg-rose-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <XCircle className="size-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold">
                    {isRtl ? "رد و بازگشت جهت اصلاح" : "Reject / Request Revision"}
                  </h5>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isRtl
                      ? "نامه نیاز به بازنگری دارد و با کامنت برای بخش اداری برگشت می‌خورد."
                      : "Letter requires revision and returns to office with comments."}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Manager Comment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-primary" />
                <span>
                  {decision === "rejected"
                    ? isRtl ? "کامنت و دلایل رد مدیر (الزامی) *" : "Manager Rejection Reason (Required) *"
                    : isRtl ? "توضیحات و دستورات مدیر (اختیاری)" : "Manager Notes / Instructions (Optional)"}
                </span>
              </span>
              {decision === "rejected" && (
                <span className="text-[11px] text-rose-500 font-semibold">
                  {isRtl ? "درج کامنت برای رد الزامی است" : "Required on rejection"}
                </span>
              )}
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                decision === "rejected"
                  ? isRtl
                    ? "لطفاً موارد نیازمند اصلاح، اشتباهات متنی یا پیوست‌های کسری را جهت اقدام بخش اداری شرح دهید..."
                    : "Explain required changes or missing attachments..."
                  : isRtl
                  ? "توضیحات یا دستورات پیگیری به بخش اداری (مثال: ارسال رونوشت به بازرسی و...) ..."
                  : "Optional notes for office staff..."
              }
              className={cn(
                "rounded-xl text-xs sm:text-sm min-h-[90px] resize-none",
                decision === "rejected" && !comment.trim() && "border-rose-400 focus-visible:ring-rose-400"
              )}
              required={decision === "rejected"}
            />
          </div>

          {/* 4. Manager File Upload (Optional: Signed PDF, annotations) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>
                {isRtl
                  ? "آپلود فایل توسط مدیر (اختیاری: نسخه امضاشده، پیوست یا اصلاحیه)"
                  : "Upload File by Manager (Optional: Signed letter, stamped PDF)"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isRtl ? "حداکثر ۱۵ مگابایت" : "Max 15 MB"}
              </span>
            </Label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />

            {attachmentFile ? (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {attachmentFile.fileName}
                    </p>
                    <p className="text-[11px] text-primary">
                      {attachmentFile.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs rounded-xl h-8 px-2.5 hover:bg-primary/20"
                  >
                    {isRtl ? "تغییر فایل" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachmentFile(null)}
                    className="size-8 rounded-xl text-rose-500 hover:bg-rose-500/10"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFileChange(e.dataTransfer.files);
                }}
                className={cn(
                  "p-5 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-primary/[0.02] flex items-center justify-center gap-3 cursor-pointer transition-all text-center",
                  isReadingFile && "pointer-events-none opacity-60"
                )}
              >
                {isReadingFile ? (
                  <Loader2 className="size-5 text-primary animate-spin" />
                ) : (
                  <UploadCloud className="size-5 text-muted-foreground" />
                )}
                <div className="text-xs">
                  <span className="font-bold text-foreground">
                    {isRtl ? "آپلود نسخه امضاشده یا فایل پیوست مدیر" : "Click to attach signed letter"}
                  </span>
                  <span className="text-muted-foreground ms-1 hidden sm:inline">
                    {isRtl ? "(کلیک یا Drag & Drop)" : "(Click or drag)"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-semibold cursor-pointer"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isReadingFile}
              className={cn(
                "rounded-full px-7 text-xs font-bold gap-2 cursor-pointer shadow-sm text-white",
                decision === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : decision === "approved" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              <span>
                {decision === "approved"
                  ? isRtl ? "ثبت تاییدیه مدیر و مجوز ارسال" : "Approve & Authorize Sending"
                  : isRtl ? "ثبت رد نامه و ابلاغ کامنت" : "Reject with Comments"}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
