// src/modules/bug-reports/components/SupportRequestDialog.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  Headset,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Upload,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import { APP_MODULE_NAMES, detectActiveModule } from "../utils/smart-capture";
import type { BugAttachment } from "../types";

const SUPPORT_CATEGORIES = [
  "Technical Assistance",
  "Account Access",
  "Software Request",
  "Hardware Request",
  "General Support",
  "Other",
];

interface SupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportRequestDialog({
  open,
  onOpenChange,
}: SupportRequestDialogProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical Assistance");
  const [selectedModule, setSelectedModule] = useState("dashboard");
  const [priority, setPriority] = useState("Medium");
  const [attachments, setAttachments] = useState<BugAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      const mod = detectActiveModule(pathname);
      setSelectedModule(mod.id);
      setError(null);
      setSubmittedTicket(null);
    }
  }, [open, pathname]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const uploaded = await bugReportsService.uploadAttachment(files[i]);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError(isRtl ? "موضوع درخواست الزامی است." : "Subject is required.");
      return;
    }
    if (!description.trim()) {
      setError(isRtl ? "متن شرح درخواست الزامی است." : "Description is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await bugReportsService.createSupportRequest({
        subject: subject.trim(),
        description: description.trim(),
        category,
        moduleId: selectedModule,
        priority,
        attachments,
        userId: user?.id || "u-guest",
        userName: user?.fullName || user?.name || "User",
        userEmail: user?.email || "",
      });
      setSubmittedTicket(res.ticketNumber);
    } catch (err: any) {
      setError(err?.message || "Failed to submit support request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setDescription("");
    setCategory("Technical Assistance");
    setAttachments([]);
    setError(null);
    setSubmittedTicket(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quick-actions-modal="true"
        className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[20px] border-border/80 shadow-2xl"
      >
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <Headset className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isRtl ? "درخواست پشتیبانی و راهنمایی" : "Support Request"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "درخواست راهنمایی یا پشتیبانی فنی خود را ارسال کنید تا کارشناسان پاسخ دهند."
                  : "Submit assistance requests to the support & IT department."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submittedTicket ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                {isRtl ? "درخواست با موفقیت ثبت شد" : "Support Request Submitted"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {isRtl
                  ? "کد پیگیری درخواست شما به شرح زیر است:"
                  : "Your support request ID is:"}
              </p>
            </div>
            <div className="p-3 px-6 rounded-xl bg-muted/60 border border-border/60 font-mono text-lg font-bold text-sky-600 tracking-wider select-all">
              {submittedTicket}
            </div>
            <Button onClick={handleReset} className="rounded-xl px-6 mt-4">
              {isRtl ? "بستن" : "Close"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-start">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{isRtl ? "موضوع درخواست" : "Subject"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={isRtl ? "مثال: نیاز به دسترسی به ماژول پروژه‌ها" : "e.g. Need access to projects module"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="rounded-xl h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isRtl ? "نوع پشتیبانی" : "Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {SUPPORT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isRtl ? "ماژول مربوطه" : "Related Module"}
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {Object.entries(APP_MODULE_NAMES).map(([id, names]) => (
                    <option key={id} value={id}>
                      {isRtl ? names.fa : names.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{isRtl ? "شرح کامل درخواست" : "Description"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={isRtl ? "جزئیات مشکل یا نیازمندی خود را بنویسید..." : "Describe your request in detail..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Upload className="size-3.5 text-muted-foreground" />
                  <span>{isRtl ? "پیوست مدارک یا فایل" : "Attachments"}</span>
                </label>
                <label className="text-[11px] font-medium text-primary hover:underline cursor-pointer">
                  <span>{isRtl ? "افزودن فایل" : "Add File"}</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((att) => (
                    <Badge key={att.id} variant="outline" className="rounded-lg py-1 px-2.5 text-[11px] gap-1.5 bg-muted/40">
                      <span className="truncate max-w-[140px]">{att.fileName}</span>
                      <button type="button" onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-semibold">
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl h-10 px-6 text-xs font-bold gap-2 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-md">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Headset className="size-4" />}
                <span>{isRtl ? "ارسال درخواست" : "Submit Request"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

