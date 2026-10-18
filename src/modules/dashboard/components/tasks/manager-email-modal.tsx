"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  X,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const [copied, setCopied] = React.useState(false);

  if (!open || !task) return null;

  const senderEmail = "sharifi@euroslotpars.com";
  const recipientEmail = "saeed.jalili@euroslotpars.com";
  const dateStr = task.dueDate || "1405/02/10";

  const handleCopy = () => {
    const text = `From: ${task.creatorName} <${senderEmail}>\nTo: ${task.assignedToName} <${recipientEmail}>\nSubject: [Euroslot Pars] تسک سازمانی جدید: ${task.title}\n\n${task.description || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
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
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Email Content ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs sm:text-sm">
          {/* Header Metadata */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground">{t("from")}:</span>
              <span className="font-medium text-foreground/90 font-mono" dir="ltr">
                {task.creatorName} &lt;{senderEmail}&gt;
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground">{t("to")}:</span>
              <span className="font-medium text-foreground/90 font-mono" dir="ltr">
                {task.assignedToName} &lt;{recipientEmail}&gt;
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("subject")}:</span>
              <span className="font-semibold text-primary truncate max-w-[280px]">
                {t("subjectPrefix")} {task.title}
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
              {t("salutation", { name: task.assignedToName })}
            </p>

            <p className="text-foreground/80 leading-relaxed">
              {t("bodyNotice", { manager: task.creatorName })}
            </p>

            {/* Task Info Box */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="font-semibold text-foreground text-sm">
                {task.title}
              </div>
              {task.description && (
                <div className="text-xs text-muted-foreground leading-normal">
                  {task.description}
                </div>
              )}
              <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  <span>{t("due")}: {dateStr}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                  {task.priority}
                </span>
              </div>
            </div>

            <p className="text-foreground/75 leading-relaxed text-xs">
              {t("bodyFooter")}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs gap-1.5 h-8 font-medium"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? t("copied") : t("copyEmail")}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 px-4 font-medium shadow-xs"
          >
            {t("close")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
