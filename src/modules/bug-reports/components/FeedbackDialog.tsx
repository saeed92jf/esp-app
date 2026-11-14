// src/modules/bug-reports/components/FeedbackDialog.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  MessageSquare,
  Star,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import { APP_MODULE_NAMES, detectActiveModule } from "../utils/smart-capture";

const FEEDBACK_TYPES = [
  "General Feedback",
  "UI / UX",
  "Usability",
  "Performance",
  "Other",
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const { user } = useAuth();

  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [selectedModule, setSelectedModule] = useState("dashboard");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

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
    if (!message.trim()) {
      setError(isRtl ? "لطفاً پیام بازخورد خود را بنویسید." : "Please enter your feedback message.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await bugReportsService.createFeedback({
        feedbackType,
        moduleId: selectedModule,
        rating,
        message: message.trim(),
        userId: user?.id || "u-guest",
        userName: user?.fullName || user?.name || "User",
        userEmail: user?.email || "",
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setRating(5);
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quick-actions-modal="true"
        className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[20px] border-border/80 shadow-2xl"
      >
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isRtl ? "ارسال نظر و بازخورد" : "Send Feedback"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "دیدگاه‌ها، تجربه کاربری و پیشنهادات خود را با ما در میان بگذارید."
                  : "Share your experience and thoughts to help us improve."}
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
              {isRtl ? "با سپاس از بازخورد ارزشمند شما" : "Thank you for your feedback!"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isRtl
                ? "پیام شما دریافت شد و در جلسات ارتقای سامانه بررسی خواهد گردید."
                : "Your feedback has been received and will be reviewed by our team."}
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

            {/* Rating Stars */}
            <div className="space-y-1.5 text-center p-3 rounded-xl bg-muted/20 border border-border/60">
              <label className="text-xs font-semibold text-foreground block">
                {isRtl ? "امتیاز شما به تجربه کاری در این بخش:" : "Rate your experience:"}
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        star <= rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-muted-foreground/30 hover:text-amber-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isRtl ? "نوع بازخورد" : "Type"}
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {FEEDBACK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
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
                <span>{isRtl ? "متن بازخورد" : "Your Feedback"}</span>
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={isRtl ? "دیدگاه‌ها، کاستی‌ها یا نقاط قوت مورد نظرتان را بنویسید..." : "Write your thoughts and observations here..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-semibold">
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl h-10 px-6 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                <span>{isRtl ? "ارسال بازخورد" : "Submit Feedback"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

