// src/modules/quality-guardian/components/GuardianDetailDialog.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Wrench,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { QualityViolation } from "../types/guardian.types";

interface GuardianDetailDialogProps {
  violation: QualityViolation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFix?: (violation: QualityViolation) => void;
  onIgnore?: (violation: QualityViolation, reason: string) => void;
}

export function GuardianDetailDialog({
  violation,
  open,
  onOpenChange,
  onApplyFix,
  onIgnore,
}: GuardianDetailDialogProps) {
  const t = useTranslations("QualityGuardian");
  const [copied, setCopied] = useState(false);
  const [showIgnoreInput, setShowIgnoreInput] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState("");

  if (!violation) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`${violation.filePath}:${violation.line}`);
    setCopied(true);
    toast.success(t("actions.pathCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmIgnore = () => {
    if (onIgnore) {
      onIgnore(violation, ignoreReason || "Ignored by admin");
      setShowIgnoreInput(false);
      setIgnoreReason("");
      onOpenChange(false);
    }
  };

  const getSeverityBadge = () => {
    switch (violation.severity) {
      case "critical":
        return <Badge variant="destructive">{t("severity.critical")}</Badge>;
      case "high":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          >
            {t("severity.high")}
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
          >
            {t("severity.medium")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {t("severity.low")}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {getSeverityBadge()}
            <span className="text-xs font-mono text-muted-foreground">
              {violation.ruleId}
            </span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold">
            {violation.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {violation.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* File location */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("dialog.location")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCopyPath}
              >
                {copied ? (
                  <Check className="size-3.5 me-1 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 me-1" />
                )}
                {copied ? t("actions.copied") : t("actions.copy")}
              </Button>
            </div>
            <div className="font-mono text-xs text-foreground break-all select-all">
              {violation.filePath}:{violation.line}
              {violation.column ? `:${violation.column}` : ""}
            </div>
          </div>

          {/* Code snippet preview */}
          {violation.codeSnippet && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("dialog.codeSnippet")}
              </span>
              <div className="rounded-lg border bg-zinc-950 p-3 text-zinc-100 font-mono text-xs overflow-x-auto text-start dir-ltr">
                <div className="flex items-start gap-3">
                  <span className="text-zinc-500 select-none text-end min-w-[2rem]">
                    {violation.line}
                  </span>
                  <span className="text-zinc-100 whitespace-pre">
                    {violation.codeSnippet}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {violation.recommendation && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Info className="size-3.5" />
                {t("dialog.recommendation")}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {violation.recommendation}
              </p>
            </div>
          )}

          {/* Suggested Fix */}
          {violation.suggestedFix && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Wrench className="size-3.5" />
                {t("dialog.suggestedFix")}
              </span>
              <code className="text-xs font-mono text-foreground block bg-muted/60 p-2 rounded dir-ltr text-start">
                {violation.suggestedFix}
              </code>
            </div>
          )}

          {/* Ignore input if active */}
          {showIgnoreInput && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {t("dialog.ignorePrompt")}
              </span>
              <Input
                placeholder={t("dialog.ignorePlaceholder")}
                value={ignoreReason}
                onChange={(e) => setIgnoreReason(e.target.value)}
                className="text-xs h-8"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowIgnoreInput(false)}
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  onClick={handleConfirmIgnore}
                >
                  {t("actions.confirmIgnore")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {violation.status === "pending" && !showIgnoreInput && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground h-8"
                onClick={() => setShowIgnoreInput(true)}
              >
                <EyeOff className="size-3.5 me-1.5" />
                {t("actions.ignore")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => onOpenChange(false)}
            >
              {t("actions.close")}
            </Button>
            {violation.canAutoRemediate && violation.status === "pending" && (
              <Button
                variant="default"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => onApplyFix && onApplyFix(violation)}
              >
                <Wrench className="size-3.5" />
                {t("actions.applyFix")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

