// src/modules/bug-reports/components/BugReportSubmissionDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  Bug,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  Info,
  Monitor,
  Sparkles,
  Target,
  Crosshair,
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import {
  getClientEnvironment,
  captureCurrentScreen,
  APP_MODULE_NAMES,
  detectActiveModule,
} from "../utils/smart-capture";
import type { BugCategory, BugSeverity, BugAttachment, InspectedElementData } from "../types";
import { ElementHunterOverlay } from "./ElementHunterOverlay";

const CATEGORIES: BugCategory[] = [
  "Functionality",
  "UI / UX",
  "Performance",
  "Authentication",
  "Data / Database",
  "Integration",
  "Security",
  "Other",
];

const SEVERITIES: { id: BugSeverity; labelFa: string; labelEn: string; color: string }[] = [
  { id: "Low", labelFa: "کم‌اهمیت", labelEn: "Low", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  { id: "Medium", labelFa: "متوسط", labelEn: "Medium", color: "bg-sky-500/10 text-sky-600 border-sky-500/30" },
  { id: "High", labelFa: "مهم و فوری", labelEn: "High", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { id: "Critical", labelFa: "بحرانی / انسداد کار", labelEn: "Critical", color: "bg-red-500/10 text-red-600 border-red-500/30" },
];

interface BugReportSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (ticketNumber: string) => void;
  startWithHunter?: boolean;
}

export function BugReportSubmissionDialog({
  open,
  onOpenChange,
  onSubmitted,
  startWithHunter = false,
}: BugReportSubmissionDialogProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BugCategory>("Functionality");
  const [severity, setSeverity] = useState<BugSeverity>("Medium");
  const [selectedModule, setSelectedModule] = useState("dashboard");

  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [inspectedElement, setInspectedElement] = useState<InspectedElementData | null>(null);
  const [isHunting, setIsHunting] = useState(false);
  const [attachments, setAttachments] = useState<BugAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Initialize auto-detected module & hunter mode if requested
  useEffect(() => {
    if (open) {
      const mod = detectActiveModule(pathname);
      setSelectedModule(mod.id);
      setError(null);
      setSubmittedTicket(null);
      if (startWithHunter) {
        setIsHunting(true);
      }
    } else {
      setIsHunting(false);
    }
  }, [open, pathname, startWithHunter]);

  const handleElementSelected = (data: InspectedElementData) => {
    setInspectedElement(data);
    setIsHunting(false);

    // If title is not set yet, provide helpful pre-filled title
    if (!title.trim()) {
      const tagLabel = `<${data.tagName}${data.id ? `#${data.id}` : ""}>`;
      setTitle(
        isRtl
          ? `اشکال در المان ${tagLabel}`
          : `Issue with element ${tagLabel}`
      );
    }
  };

  const handleCaptureScreen = async () => {
    setIsCapturingScreen(true);
    try {
      const dataUrl = await captureCurrentScreen();
      if (dataUrl) {
        setScreenshotDataUrl(dataUrl);
      }
    } finally {
      setIsCapturingScreen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          setError(isRtl ? `حجم فایل ${file.name} بیشتر از ۱۰ مگابایت است.` : `File ${file.name} exceeds 10MB limit.`);
          continue;
        }
        const uploaded = await bugReportsService.uploadAttachment(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err: any) {
      setError(err?.message || (isRtl ? "خطا در آپلود فایل" : "Failed to upload file"));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isRtl ? "لطفاً عنوان خطا را وارد نمایید." : "Please enter the bug title.");
      return;
    }
    if (!description.trim()) {
      setError(isRtl ? "لطفاً توضیحات لازم جهت بازتولید خطا را شرح دهید." : "Please provide error description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const env = getClientEnvironment(pathname);

      const created = await bugReportsService.createBugReport({
        title: title.trim(),
        description: description.trim(),
        category,
        moduleId: selectedModule,
        severity,
        screenshotDataUrl: screenshotDataUrl || undefined,
        attachments,
        environment: env,
        inspectedElement: inspectedElement || undefined,
        reporterId: user?.id || "u-guest",
        reporterName: user?.fullName || user?.name || "Anonymous User",
        reporterEmail: user?.email || "",
        reporterRole: user?.role || "user",
      });

      setSubmittedTicket(created.ticketNumber);
      onSubmitted?.(created.ticketNumber);
    } catch (err: any) {
      setError(err?.message || (isRtl ? "خطا در ارسال تیکت" : "Failed to submit bug report"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory("Functionality");
    setSeverity("Medium");
    setScreenshotDataUrl(null);
    setInspectedElement(null);
    setIsHunting(false);
    setAttachments([]);
    setError(null);
    setSubmittedTicket(null);
    onOpenChange(false);
  };

  return (
    <>
      {/* Precision Element Hunter Active Overlay */}
      <ElementHunterOverlay
        active={isHunting}
        onSelectElement={handleElementSelected}
        onCancel={() => setIsHunting(false)}
      />

      <Dialog open={open && !isHunting} onOpenChange={onOpenChange}>
      <DialogContent
        data-quick-actions-modal="true"
        className="sm:max-w-[620px] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-[20px] border-border/80 shadow-2xl"
      >
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bug className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isRtl ? "گزارش خطا و اشکال فنی (Bug Report)" : "Report Technical Issue or Bug"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "اشکال مشاهده‌شده را ثبت کنید تا تیم فنی در سریع‌ترین زمان بررسی نماید."
                  : "Submit issue details and technical context for the development team."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submittedTicket ? (
          /* Success Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                {isRtl ? "گزارش با موفقیت ثبت گردید" : "Bug Report Submitted Successfully"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {isRtl
                  ? "تیکت شما با کد اختصاصی زیر در سیستم پیگیری ثبت شد و به تیم فنی ارجاع یافت."
                  : "Your ticket has been recorded with the ID below and assigned for investigation."}
              </p>
            </div>

            <div className="p-3 px-6 rounded-xl bg-muted/60 border border-border/60 font-mono text-lg font-bold text-primary tracking-wider select-all">
              {submittedTicket}
            </div>

            <div className="flex items-center gap-3 pt-4 w-full justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl px-5"
              >
                {isRtl ? "بستن پنجره" : "Close"}
              </Button>
              <Button
                asChild
                className="rounded-xl px-5 gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <a href={`/${locale}/bug-reports/${submittedTicket}`}>
                  <span>{isRtl ? "مشاهده تیکت در سامانه" : "View Ticket"}</span>
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-start">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Smart Capture Environment Summary */}
            <div className="p-3 rounded-xl bg-primary/[0.04] border border-primary/20 flex items-start gap-2.5">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground flex-1 leading-relaxed">
                <span className="font-semibold text-foreground me-1">
                  {isRtl ? "ثبت هوشمند مشخصات فنی:" : "Smart Capture Active:"}
                </span>
                {isRtl
                  ? "مشخصات مرورگر، وضوح تصویر و آدرس صفحه به صورت خودکار جهت عیب‌یابی دقیق ثبت خواهد شد."
                  : "Browser, screen viewport, and current page context will be attached automatically."}
              </div>
            </div>

            {/* Precision Element Hunter Section */}
            {inspectedElement ? (
              <div className="p-3.5 rounded-xl border border-red-500/50 bg-red-500/[0.04] space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                    <Target className="size-4 shrink-0" />
                    <span>
                      {isRtl
                        ? "المان نشانه‌گیری‌شده در صفحه (Inspected Element)"
                        : "Inspected DOM Element Target"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsHunting(true)}
                      className="h-7 px-2.5 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-lg gap-1.5 cursor-pointer"
                    >
                      <Crosshair className="size-3.5" />
                      <span>{isRtl ? "نشانه‌گیری مجدد" : "Re-target"}</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => setInspectedElement(null)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title={isRtl ? "حذف المان" : "Remove element"}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tag & Selector Badge */}
                <div className="p-2 px-2.5 rounded-lg bg-background border border-border/80 font-mono text-[11px] text-foreground flex items-center justify-between gap-2 overflow-x-auto shadow-2xs">
                  <span className="font-bold text-red-600 dark:text-red-400 shrink-0">
                    &lt;{inspectedElement.tagName}
                    {inspectedElement.id ? `#${inspectedElement.id}` : ""}
                    &gt;
                  </span>
                  <span className="text-muted-foreground truncate text-[10.5px]">
                    {inspectedElement.selector}
                  </span>
                </div>

                {/* Geometry & Text Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-background/70 border border-border/60">
                    <span className="text-muted-foreground block text-[10px]">
                      {isRtl ? "موقعیت در صفحه" : "Coordinates"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      X: {inspectedElement.rect.left}px, Y: {inspectedElement.rect.top}px
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/70 border border-border/60">
                    <span className="text-muted-foreground block text-[10px]">
                      {isRtl ? "ابعاد المان" : "Dimensions"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {inspectedElement.rect.width} × {inspectedElement.rect.height} px
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-background/70 border border-border/60">
                    <span className="text-muted-foreground block text-[10px]">
                      {isRtl ? "متن / محتوای المان" : "Content Text"}
                    </span>
                    <span className="font-medium text-foreground truncate block">
                      {inspectedElement.textSnippet || (isRtl ? "فاقد متن" : "No text")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-red-500/40 bg-red-500/[0.02] hover:bg-red-500/[0.04] transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Target className="size-4" />
                  </div>
                  <div className="text-start min-w-0">
                    <div className="text-xs font-bold text-foreground">
                      {isRtl ? "نشانه‌گیری مستقیم المان در صفحه" : "Inspect Element on Page"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {isRtl
                        ? "با نشانه‌گیر روی دکمه، جدول یا بخش خطادار کلیک کنید تا مشخصات آن ثبت شود."
                        : "Click on any button, table, or section to automatically capture its metadata."}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHunting(true)}
                  className="rounded-lg h-8 px-3 text-xs font-semibold gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer transition-all"
                >
                  <Crosshair className="size-3.5" />
                  <span>{isRtl ? "فعال‌سازی نشانه‌گیر" : "Start Hunter"}</span>
                </Button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{isRtl ? "عنوان خطا" : "Bug Title"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={isRtl ? "مثال: عدم ذخیره اطلاعات در فرم ثبت پروژه" : "e.g. Data not saving on project form"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl h-10 text-sm"
              />
            </div>

            {/* Category & Module */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isRtl ? "دسته‌بندی خطا" : "Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BugCategory)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
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

            {/* Severity Badges */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isRtl ? "سطح شدت خطا" : "Severity Level"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEVERITIES.map((s) => {
                  const isSelected = severity === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSeverity(s.id)}
                      className={cn(
                        "h-9 rounded-xl border text-xs font-medium transition-all duration-150 flex items-center justify-center cursor-pointer select-none",
                        isSelected
                          ? `${s.color} ring-2 ring-primary/40 font-bold shadow-xs`
                          : "border-border/60 hover:border-border text-muted-foreground bg-muted/20"
                      )}
                    >
                      {isRtl ? s.labelFa : s.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{isRtl ? "شرح مشکل و مراحل بازتولید" : "Description & Reproduction Steps"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={
                  isRtl
                    ? "چه اقدامی انجام دادید و چه نتیجه‌ای رخ داد؟ پیام خطای احتمالی را بنویسید..."
                    : "What steps did you take and what happened? Include any error messages..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Optional Screenshot Capture */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Camera className="size-4 text-primary" />
                  <span>{isRtl ? "تصویر از صفحه جاری (اسکرین‌شات)" : "Screenshot of Current Page"}</span>
                </span>
                {!screenshotDataUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCaptureScreen}
                    disabled={isCapturingScreen}
                    className="rounded-lg h-7 text-[11px] gap-1.5 cursor-pointer"
                  >
                    {isCapturingScreen ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Camera className="size-3.5" />
                    )}
                    <span>{isRtl ? "تصویربرداری از صفحه" : "Capture Page"}</span>
                  </Button>
                )}
              </div>

              {screenshotDataUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border/80 group">
                  <img
                    src={screenshotDataUrl}
                    alt="Captured Screenshot"
                    className="w-full max-h-40 object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setScreenshotDataUrl(null)}
                      className="rounded-lg h-8 text-xs gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      <span>{isRtl ? "حذف تصویر" : "Remove"}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  {isRtl
                    ? "در صورت تمایل روی دکمه تصویربرداری کلیک کنید تا نمای صفحه همراه با گزارش ارسال شود."
                    : "Optionally click capture to include a visual snapshot of the page with the report."}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Upload className="size-3.5 text-muted-foreground" />
                  <span>{isRtl ? "فایل‌های ضمیمه (اختیاری)" : "Attachments (Optional)"}</span>
                </label>
                <label className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <span>{isRtl ? "افزودن فایل" : "Add File"}</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>{isRtl ? "در حال آپلود فایل..." : "Uploading file..."}</span>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((att) => (
                    <Badge
                      key={att.id}
                      variant="outline"
                      className="rounded-lg py-1 px-2.5 text-[11px] gap-1.5 bg-muted/40 font-normal"
                    >
                      <span className="truncate max-w-[140px]">{att.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-10 px-5 text-xs font-semibold"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-10 px-6 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Bug className="size-4" />
                )}
                <span>{isRtl ? "ثبت و ارسال گزارش خطا" : "Submit Bug Report"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

