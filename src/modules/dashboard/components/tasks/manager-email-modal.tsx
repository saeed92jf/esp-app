"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  X,
  Calendar,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardTask } from "../../services/dashboard.service";

interface ManagerEmailModalProps {
  task: DashboardTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagerEmailModal({
  task,
  open,
  onOpenChange,
}: ManagerEmailModalProps) {
  const t = useTranslations("Dashboard.tasks.emailModal");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const [copied, setCopied] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Preserve the last non-null task so exit animations render smoothly
  const lastTaskRef = React.useRef<DashboardTask | null>(task);
  if (task) {
    lastTaskRef.current = task;
  }
  const activeTask = task || lastTaskRef.current;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close modal
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  if (!mounted || typeof document === "undefined") return null;

  const senderEmail = "sharifi@euroslotpars.com";
  const recipientEmail = "saeed.jalili@euroslotpars.com";
  const dateStr = activeTask?.dueDate || "1405/02/10";

  const handleCopy = () => {
    if (!activeTask) return;
    const text = `From: ${activeTask.creatorName || "مهندس شریفی (مدیر فنی)"} <${senderEmail}>\nTo: ${activeTask.assignedToName || "سعید جلیلی"} <${recipientEmail}>\nSubject: [Euroslot Pars] ${t("subjectPrefix")} ${activeTask.title}\n\n${activeTask.description || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {open && activeTask && (
        <motion.div
          key="email-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md select-none overflow-y-auto"
          dir={dir}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onOpenChange(false);
            }
          }}
        >
          <motion.div
            key="email-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col max-h-[85vh] m-auto pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground leading-none">
                    {t("title")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label={t("close")}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* ── Email Content ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs sm:text-sm">
              {/* Header Metadata */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border/30 pb-1.5 gap-2">
                  <span className="text-muted-foreground shrink-0">{t("from")}:</span>
                  <span className="font-medium text-foreground/90 font-mono truncate text-end" dir="ltr">
                    {activeTask.creatorName || "مهندس شریفی (مدیر فنی)"} &lt;{senderEmail}&gt;
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border/30 pb-1.5 gap-2">
                  <span className="text-muted-foreground shrink-0">{t("to")}:</span>
                  <span className="font-medium text-foreground/90 font-mono truncate text-end" dir="ltr">
                    {activeTask.assignedToName || "سعید جلیلی"} &lt;{recipientEmail}&gt;
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">{t("subject")}:</span>
                  <span className="font-semibold text-primary truncate max-w-[280px]">
                    {t("subjectPrefix")} {activeTask.title}
                  </span>
                </div>
              </div>

              {/* Email Body Card */}
              <div className="p-4 rounded-xl border border-border/60 bg-white dark:bg-card/70 space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-border/30">
                  <Building2 className="size-4" />
                  <span>EUROSLOT PARS CORE • TASK NOTIFICATION</span>
                </div>

                <p className="text-foreground/90 leading-relaxed">
                  {t("salutation", { name: activeTask.assignedToName || "سعید جلیلی" })}
                </p>

                <p className="text-foreground/80 leading-relaxed">
                  {t("bodyNotice", { manager: activeTask.creatorName || "مهندس شریفی (مدیر فنی)" })}
                </p>

                {/* Task Info Box */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="font-semibold text-foreground text-sm">
                    {activeTask.title}
                  </div>
                  {activeTask.description && (
                    <div className="text-xs text-muted-foreground leading-normal">
                      {activeTask.description}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-primary" />
                      <span className="fa-num">{t("due")}: {dateStr}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                      {activeTask.priority}
                    </span>
                  </div>
                </div>

                <p className="text-foreground/75 leading-relaxed text-xs">
                  {t("bodyFooter")}
                </p>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs gap-1.5 h-8 font-medium cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{copied ? t("copied") : t("copyEmail")}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8 px-4 font-medium shadow-xs cursor-pointer"
              >
                {t("close")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
