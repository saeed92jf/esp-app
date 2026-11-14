// src/modules/bug-reports/components/IdeaDialog.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import { APP_MODULE_NAMES, detectActiveModule } from "../utils/smart-capture";

interface IdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeaDialog({ open, onOpenChange }: IdeaDialogProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedBenefit, setExpectedBenefit] = useState("");
  const [selectedModule, setSelectedModule] = useState("dashboard");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (open) {
      const mod = detectActiveModule(pathname);
      setSelectedModule(mod.id);
      setError(null);
      setIsSuccess(false);
    }
  }, [open, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isRtl ? "عنوان ایده الزامی است." : "Idea title is required.");
      return;
    }
    if (!description.trim()) {
      setError(isRtl ? "شرح ایده الزامی است." : "Idea description is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await bugReportsService.createIdea({
        title: title.trim(),
        description: description.trim(),
        expectedBenefit: expectedBenefit.trim(),
        moduleId: selectedModule,
        userId: user?.id || "u-guest",
        userName: user?.fullName || user?.name || "User",
        userEmail: user?.email || "",
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit idea");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setExpectedBenefit("");
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quick-actions-modal="true"
        className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[20px] border-border/80 shadow-2xl"
      >
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isRtl ? "پیشنهاد قابلیت یا ایده جدید" : "Suggest an Idea"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "ایده‌های نوآورانه جهت سهولت کار، ابزارهای تخصصی یا ویژگی‌های جدید سامانه."
                  : "Propose new features, engineering tools, or workflow improvements."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {isRtl ? "ایده شما با موفقیت ثبت شد" : "Idea Submitted Successfully"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isRtl
                ? "از نوآوری و مشارکت شما سپاسگزاریم. ایده شما در جلسات توسعه محصول مطرح خواهد شد."
                : "Thank you for contributing! Your proposal will be evaluated in our product planning."}
            </p>
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
                <span>{isRtl ? "عنوان ایده" : "Idea Title"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={isRtl ? "مثال: ایجاد داشبورد تجمیعی پایش قراردادها" : "e.g. Contract analytics overview dashboard"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isRtl ? "ماژول یا بخش مرتبط" : "Related Module"}
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{isRtl ? "شرح قابلیت و نیاز" : "Description & Proposed Solution"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={isRtl ? "این قابلیت چه کاری انجام می‌دهد و چگونه به کاربران کمک می‌کند؟" : "What does this feature do and how does it help users?"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isRtl ? "مزیت مورد انتظار (اختیاری)" : "Expected Benefit (Optional)"}
              </label>
              <Input
                placeholder={isRtl ? "مثال: کاهش زمان استخراج داده‌ها به نصف" : "e.g. Cuts manual reporting time by 50%"}
                value={expectedBenefit}
                onChange={(e) => setExpectedBenefit(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-semibold">
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl h-10 px-6 text-xs font-bold gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-md">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Lightbulb className="size-4" />}
                <span>{isRtl ? "ارسال ایده" : "Submit Idea"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

