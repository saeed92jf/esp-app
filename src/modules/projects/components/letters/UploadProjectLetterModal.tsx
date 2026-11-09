// src/modules/projects/components/letters/UploadProjectLetterModal.tsx
"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "next-intl";
import {
  FileText,
  UploadCloud,
  X,
  Loader2,
  Calendar,
  Building2,
  AlertCircle,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { SimplifiedProject } from "../../types/simplified-projects.types";
import type {
  ProjectLetter,
  LetterPriority,
  LetterType,
  LetterAttachment,
} from "../../types/project-letters.types";
import { projectLettersService } from "../../services/project-letters.service";
import { readAttachmentFile } from "@/modules/tasks/components/TaskAttachmentList";

interface UploadProjectLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: SimplifiedProject[];
  defaultProjectId?: string;
  onLetterCreated: (letter: ProjectLetter) => void;
}

const PRIORITIES: { id: LetterPriority; labelFa: string; labelEn: string; color: string }[] = [
  { id: "normal", labelFa: "عادی", labelEn: "Normal", color: "border-border text-foreground" },
  { id: "urgent", labelFa: "فوری", labelEn: "Urgent", color: "border-amber-500/40 text-amber-600 bg-amber-500/10" },
  { id: "confidential", labelFa: "آنی / محرمانه", labelEn: "Confidential", color: "border-rose-500/40 text-rose-600 bg-rose-500/10" },
];

const LETTER_TYPES: { id: LetterType; labelFa: string; labelEn: string }[] = [
  { id: "official", labelFa: "نامه رسمی اداری", labelEn: "Official Letter" },
  { id: "transmittal", labelFa: "ترانسمیتال مهندسی", labelEn: "Engineering Transmittal" },
  { id: "commercial", labelFa: "مکاتبات مالی / قرارداد", labelEn: "Commercial / Contract" },
  { id: "technical", labelFa: "استعلام و فنی", labelEn: "Technical Inquiry" },
];

export function UploadProjectLetterModal({
  open,
  onOpenChange,
  projects,
  defaultProjectId,
  onLetterCreated,
}: UploadProjectLetterModalProps) {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || projects[0]?.id || ""
  );
  const [letterNumber, setLetterNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [senderDepartment, setSenderDepartment] = useState("بخش اداری و دبیرخانه فنی");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState<LetterPriority>("normal");
  const [letterType, setLetterType] = useState<LetterType>("official");
  const [description, setDescription] = useState("");
  const [draftFile, setDraftFile] = useState<LetterAttachment | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync recipient when project changes
  const handleProjectSelect = (pId: string) => {
    setSelectedProjectId(pId);
    const proj = projects.find((p) => p.id === pId);
    if (proj && !recipient.trim()) {
      setRecipient(proj.client);
    }
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsReadingFile(true);
    try {
      const att = await readAttachmentFile(file);
      setDraftFile({
        fileName: att.name,
        fileSize: att.size,
        fileType: att.type,
        url: att.url || "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || "بخش اداری",
      });
      toast.success(isRtl ? `فایل "${file.name}" پیوست شد.` : `File "${file.name}" attached.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process file");
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error(isRtl ? "لطفاً پروژه مربوطه را انتخاب کنید." : "Please select a project.");
      return;
    }
    if (!letterNumber.trim()) {
      toast.error(isRtl ? "شماره نامه الزامی است." : "Letter number is required.");
      return;
    }
    if (!subject.trim()) {
      toast.error(isRtl ? "موضوع نامه الزامی است." : "Letter subject is required.");
      return;
    }
    if (!recipient.trim()) {
      toast.error(isRtl ? "گیرنده / مخاطب نامه الزامی است." : "Recipient is required.");
      return;
    }
    if (!draftFile) {
      toast.error(
        isRtl
          ? "بارگذاری فایل نامه (پیش‌نویس یا اسکن) الزامی است."
          : "Draft file upload is required."
      );
      return;
    }

    const proj = projects.find((p) => p.id === selectedProjectId);

    setIsSubmitting(true);
    try {
      const created = await projectLettersService.createLetter(selectedProjectId, {
        projectId: selectedProjectId,
        projectName: proj?.name || "",
        espNumber: proj?.espNumber || "",
        letterNumber: letterNumber.trim(),
        subject: subject.trim(),
        recipient: recipient.trim(),
        senderDepartment: senderDepartment.trim(),
        date,
        priority,
        letterType,
        description: description.trim(),
        draftFile,
        draftBy: {
          userId: user?.id,
          userName: user?.name || "بخش اداری",
          userRole: user?.role || "office_admin",
        },
      });

      toast.success(
        isRtl
          ? "نامه با موفقیت بارگذاری شد و جهت تایید برای مدیر ارسال گردید."
          : "Letter uploaded and submitted for manager approval."
      );
      onLetterCreated(created);
      onOpenChange(false);

      // Reset form
      setLetterNumber("");
      setSubject("");
      setRecipient("");
      setDescription("");
      setDraftFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project letter");
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
              <UploadCloud className="size-5" />
            </div>
            <span>{isRtl ? "ثبت و بارگذاری نامه جدید پروژه" : "Upload & Draft Project Letter"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {isRtl
              ? "نامه بارگذاری‌شده توسط بخش اداری ثبت شده و پس از بررسی و تایید مدیر پروژه، آماده ارسال رسمی خواهد شد."
              : "Letters uploaded by office staff will be routed to the manager for review & approval before dispatch."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Project Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              <span>{isRtl ? "پروژه مربوطه *" : "Related Project *"}</span>
            </Label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full h-11 rounded-xl bg-muted/30 border border-border/60 px-3 text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.espNumber} — {p.name} ({p.client})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Letter Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                {isRtl ? "شماره نامه رسمی *" : "Letter Number *"}
              </Label>
              <Input
                value={letterNumber}
                onChange={(e) => setLetterNumber(e.target.value)}
                placeholder={isRtl ? "مثال: ESP-1405/ADM-042" : "e.g. ESP-1405/ADM-042"}
                className="h-11 rounded-xl text-xs sm:text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>{isRtl ? "تاریخ نامه *" : "Letter Date *"}</span>
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl text-xs sm:text-sm font-mono"
                required
              />
            </div>
          </div>

          {/* 3. Recipient & Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">
              {isRtl ? "گیرنده / سازمان مخاطب *" : "Recipient / Client *"}
            </Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={isRtl ? "مثال: شرکت پرگاس ایران - مدیریت محترم مهندسی" : "e.g. Pargasiran Co."}
              className="h-11 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">
              {isRtl ? "موضوع نامه *" : "Letter Subject *"}
            </Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={isRtl ? "مثال: ارسال نقشه‌های چیدمان جهت تایید کارفرما (DFA)" : "Letter Subject..."}
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              required
            />
          </div>

          {/* 4. Priority & Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                {isRtl ? "اولویت نامه" : "Priority"}
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSel = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={cn(
                        "py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer",
                        isSel
                          ? cn("ring-2 ring-primary/30 shadow-xs", p.color)
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      {isRtl ? p.labelFa : p.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                {isRtl ? "نوع مکاتبه" : "Type"}
              </Label>
              <select
                value={letterType}
                onChange={(e) => setLetterType(e.target.value as LetterType)}
                className="w-full h-10 rounded-xl bg-muted/30 border border-border/60 px-3 text-xs font-medium text-foreground outline-none"
              >
                {LETTER_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isRtl ? t.labelFa : t.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Description / Summary notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">
              {isRtl ? "توضیحات و خلاصه محتوای نامه (اختیاری)" : "Description / Summary Notes"}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRtl ? "نکات تکمیلی برای مدیر یا متن چکیده نامه..." : "Summary notes for manager review..."}
              className="rounded-xl text-xs sm:text-sm min-h-[70px] resize-none"
            />
          </div>

          {/* 6. Letter File Upload (Drag & Drop or click) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>{isRtl ? "فایل نامه / پیش‌نویس (PDF، اسکن یا سند) *" : "Letter Draft / Scan File *"}</span>
              <span className="text-[11px] font-normal text-muted-foreground">
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

            {draftFile ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 truncate">
                      {draftFile.fileName}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      {draftFile.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs rounded-xl h-8 px-2.5 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                  >
                    {isRtl ? "تغییر فایل" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDraftFile(null)}
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
                  "p-6 sm:p-8 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-primary/[0.02] flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all text-center",
                  isReadingFile && "pointer-events-none opacity-60"
                )}
              >
                {isReadingFile ? (
                  <Loader2 className="size-7 text-primary animate-spin" />
                ) : (
                  <UploadCloud className="size-7 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "برای انتخاب یا درگ کردن فایل نامه اینجا کلیک کنید" : "Click to select or drag letter file here"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isRtl ? "فرمت‌های مجاز: PDF, Word, JPG, PNG" : "Allowed formats: PDF, Word, JPG, PNG"}
                  </p>
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
              className="rounded-full px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              <span>{isRtl ? "ارسال جهت تایید مدیر" : "Submit for Manager Approval"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
