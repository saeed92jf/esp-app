// src/app/[locale]/admin/quality-guardian/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  History,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  GuardianOverviewCards,
  GuardianViolationsTable,
  GuardianDetailDialog,
  GuardianRemediationModal,
  GuardianRulesConfig,
  GuardianHistoryTab,
} from "@/modules/quality-guardian/components";
import type {
  QualityViolation,
  ScanSummary,
  ScanHistoryEntry,
} from "@/modules/quality-guardian";

export default function QualityGuardianPage() {
  const t = useTranslations("QualityGuardian");

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [violations, setViolations] = useState<QualityViolation[]>([]);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState<{
    category?: string;
    severity?: string;
    status?: string;
    search?: string;
  }>({ status: "pending" });

  // Dialogs state
  const [inspectViolation, setInspectViolation] = useState<QualityViolation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [fixViolation, setFixViolation] = useState<QualityViolation | null>(null);
  const [fixOpen, setFixOpen] = useState(false);

  // Load scan data
  const fetchData = useCallback(
    async (currentPage = page, currentFilters = filters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", String(limit));
        if (currentFilters.category && currentFilters.category !== "all") {
          params.set("category", currentFilters.category);
        }
        if (currentFilters.severity && currentFilters.severity !== "all") {
          params.set("severity", currentFilters.severity);
        }
        if (currentFilters.status && currentFilters.status !== "all") {
          params.set("status", currentFilters.status);
        }
        if (currentFilters.search) {
          params.set("search", currentFilters.search);
        }

        const res = await fetch(`/api/admin/quality-guardian/scan?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load quality guardian data");

        const data = await res.json();
        setSummary(data.summary);
        setViolations(data.violations || []);
        setTotal(data.total || 0);
        setHistory(data.history || []);
      } catch (err: any) {
        toast.error(err?.message || "Error loading guardian data");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, filters]
  );

  useEffect(() => {
    fetchData(page, filters);
  }, [page, filters, fetchData]);

  // Run Scan
  const handleRunScan = async (full = false) => {
    setScanning(true);
    toast.info(full ? t("actions.startingFullScan") : t("actions.startingScan"));
    try {
      const res = await fetch("/api/admin/quality-guardian/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      toast.success(
        t("actions.scanComplete", {
          score: data.summary.healthScore,
          count: data.totalViolations,
        })
      );
      setPage(1);
      fetchData(1, filters);
    } catch (err: any) {
      toast.error(err?.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // Inspect
  const handleInspect = (violation: QualityViolation) => {
    setInspectViolation(violation);
    setDetailOpen(true);
  };

  // Preview Fix
  const handlePreviewFix = (violation: QualityViolation) => {
    setFixViolation(violation);
    setFixOpen(true);
  };

  // Apply Single Fix
  const handleApplyFixDirect = async (violation: QualityViolation) => {
    try {
      const res = await fetch("/api/admin/quality-guardian/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ violationId: violation.id, dryRun: false }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.result?.message || "Fix failed");
      }
      toast.success(t("actions.fixSuccess"));
      setDetailOpen(false);
      fetchData(page, filters);
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply fix");
    }
  };

  // Batch Auto-Fix
  const handleBatchAutoFix = async () => {
    const fixable = violations.filter(
      (v) => v.canAutoRemediate && v.status === "pending"
    );
    if (fixable.length === 0) {
      toast.info(t("actions.noFixableViolations"));
      return;
    }

    toast.info(t("actions.applyingBatchFixes", { count: fixable.length }));
    try {
      const res = await fetch("/api/admin/quality-guardian/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violationIds: fixable.map((v) => v.id),
          dryRun: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch fix failed");

      toast.success(
        t("actions.batchFixComplete", {
          successful: data.batchResult.successful,
          failed: data.batchResult.failed,
        })
      );
      fetchData(page, filters);
    } catch (err: any) {
      toast.error(err?.message || "Batch fix failed");
    }
  };

  // Ignore violation
  const handleIgnore = async (violation: QualityViolation, reason = "Ignored by admin") => {
    try {
      const res = await fetch("/api/admin/quality-guardian/ignore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ violationId: violation.id, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ignore violation");

      toast.success(t("actions.ignoreSuccess"));
      fetchData(page, filters);
    } catch (err: any) {
      toast.error(err?.message || "Failed to ignore violation");
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto pb-8 gap-4 font-sans animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-12 sm:size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <ShieldCheck className="size-6 sm:size-7" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {t("header.title")}
                </h1>
                <Badge variant="outline" className="text-[11px] font-bold border-primary/30 text-primary bg-primary/5">
                  {t("header.badge") || "Quality Guardian"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {t("header.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunScan(true)}
              disabled={scanning || loading}
              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={cn("size-3.5 shrink-0", scanning && "animate-spin")} />
              <span>{t("actions.fullScan")}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleRunScan(false)}
              disabled={scanning || loading}
              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              <Sparkles className="size-3.5 shrink-0" />
              <span>{t("actions.incrementalScan")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <GuardianOverviewCards summary={summary} loading={loading} />

      {/* Tabs Section */}
      <Tabs defaultValue="violations" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-9 p-1 bg-muted/60">
          <TabsTrigger value="violations" className="text-xs">
            {t("tabs.violations")}
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs">
            {t("tabs.rules")}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            {t("tabs.history")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Violations List */}
        <TabsContent value="violations" className="space-y-4 focus-visible:outline-hidden">
          <GuardianViolationsTable
            violations={violations}
            total={total}
            page={page}
            limit={limit}
            loading={loading || scanning}
            onPageChange={(newPage) => setPage(newPage)}
            onFilterChange={(newFilters) => {
              setFilters((prev) => ({ ...prev, ...newFilters }));
              setPage(1);
            }}
            onInspect={handleInspect}
            onPreviewFix={handlePreviewFix}
            onIgnore={(v) => handleIgnore(v)}
            onRunScan={handleRunScan}
            onBatchAutoFix={handleBatchAutoFix}
          />
        </TabsContent>

        {/* Tab 2: Rules & Scope */}
        <TabsContent value="rules" className="space-y-4 focus-visible:outline-hidden">
          <GuardianRulesConfig />
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="space-y-4 focus-visible:outline-hidden">
          <GuardianHistoryTab history={history} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <GuardianDetailDialog
        violation={inspectViolation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApplyFix={handleApplyFixDirect}
        onIgnore={(v, r) => handleIgnore(v, r)}
      />

      <GuardianRemediationModal
        violation={fixViolation}
        open={fixOpen}
        onOpenChange={setFixOpen}
        onConfirmApply={handleApplyFixDirect}
      />
    </div>
  );
}

