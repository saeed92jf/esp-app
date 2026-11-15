// src/modules/quality-guardian/components/GuardianRemediationModal.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { ShieldCheck, Wrench, AlertCircle, Loader2 } from "lucide-react";
import type { QualityViolation, RemediationResult } from "../types/guardian.types";

interface GuardianRemediationModalProps {
  violation: QualityViolation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmApply: (violation: QualityViolation) => Promise<void>;
}

export function GuardianRemediationModal({
  violation,
  open,
  onOpenChange,
  onConfirmApply,
}: GuardianRemediationModalProps) {
  const t = useTranslations("QualityGuardian");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [previewResult, setPreviewResult] = useState<RemediationResult | null>(null);

  useEffect(() => {
    if (!violation || !open) {
      setPreviewResult(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch("/api/admin/quality-guardian/remediate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ violationId: violation.id, dryRun: true }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.result) {
          setPreviewResult(data.result);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch preview diff:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [violation, open]);

  const handleApply = async () => {
    if (!violation) return;
    setApplying(true);
    try {
      await onConfirmApply(violation);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Wrench className="size-5" />
            <DialogTitle className="text-base sm:text-lg font-bold">
              {t("remediation.previewTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("remediation.previewDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          {/* Target File */}
          <div className="text-xs font-mono bg-muted/50 p-2.5 rounded-md border break-all">
            <span className="text-muted-foreground me-2 select-none">Target:</span>
            {violation.filePath}:{violation.line}
          </div>

          {/* Diff Box */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("remediation.diffPreview")}
            </span>
            <div className="rounded-lg border bg-zinc-950 p-3 text-zinc-100 font-mono text-xs overflow-x-auto text-start dir-ltr min-h-[80px] flex items-center justify-center">
              {loading ? (
                <div className="flex items-center gap-2 text-zinc-400 py-4">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("remediation.generatingDiff")}</span>
                </div>
              ) : previewResult?.diff ? (
                <pre className="text-xs whitespace-pre w-full">
                  {previewResult.diff.split("\n").map((line, idx) => {
                    const isMinus = line.startsWith("-");
                    const isPlus = line.startsWith("+");
                    return (
                      <div
                        key={idx}
                        className={
                          isMinus
                            ? "text-rose-400 bg-rose-500/10 px-1 rounded-xs"
                            : isPlus
                            ? "text-emerald-400 bg-emerald-500/10 px-1 rounded-xs"
                            : "text-zinc-400"
                        }
                      >
                        {line}
                      </div>
                    );
                  })}
                </pre>
              ) : (
                <div className="text-zinc-400 text-xs py-4 text-center">
                  {previewResult?.message || t("remediation.noDiffAvailable")}
                </div>
              )}
            </div>
          </div>

          {/* Safety Guarantee */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground block">
                {t("remediation.safeGuaranteeTitle")}
              </span>
              <span>{t("remediation.safeGuaranteeDesc")}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            disabled={applying}
            onClick={() => onOpenChange(false)}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-xs h-8 gap-1.5"
            disabled={loading || applying || !previewResult?.success}
            onClick={handleApply}
          >
            {applying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Wrench className="size-3.5" />
            )}
            {applying ? t("actions.applying") : t("actions.applyFixNow")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

