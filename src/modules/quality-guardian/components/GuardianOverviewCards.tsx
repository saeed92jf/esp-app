// src/modules/quality-guardian/components/GuardianOverviewCards.tsx
"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Clock,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ScanSummary } from "../types/guardian.types";

interface GuardianOverviewCardsProps {
  summary: ScanSummary | null;
  loading?: boolean;
}

export function GuardianOverviewCards({
  summary,
  loading = false,
}: GuardianOverviewCardsProps) {
  const t = useTranslations("QualityGuardian");
  const locale = useLocale();

  const healthScore = summary?.healthScore ?? 100;
  const critical = summary?.bySeverity.critical ?? 0;
  const high = summary?.bySeverity.high ?? 0;
  const medium = summary?.bySeverity.medium ?? 0;
  const low = summary?.bySeverity.low ?? 0;
  const totalViolations = summary?.totalViolations ?? 0;
  const filesScanned = summary?.totalFilesScanned ?? 0;
  const remediated = summary?.byStatus.remediated ?? 0;
  const ignored = summary?.byStatus.ignored ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(locale === "fa" ? "fa-IR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
      {/* 1. Health Score */}
      <Card className="relative overflow-hidden border shadow-xs transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("metrics.healthScore")}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-extrabold tracking-tight",
                  getScoreColor(healthScore)
                )}
              >
                {loading ? "--" : `${healthScore}%`}
              </span>
              <span className="text-xs text-muted-foreground">
                {healthScore >= 80
                  ? t("metrics.statusGood")
                  : healthScore >= 50
                  ? t("metrics.statusModerate")
                  : t("metrics.statusCritical")}
              </span>
            </div>
            <div className="w-full mt-2">
              <Progress value={healthScore} className="h-1.5" />
            </div>
          </div>
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl border",
              getScoreBg(healthScore)
            )}
          >
            <Activity
              className={cn("size-6", getScoreColor(healthScore))}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Critical & High Violations */}
      <Card className="relative overflow-hidden border shadow-xs transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("metrics.criticalAndHigh")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {loading ? "--" : critical + high}
              </span>
              <div className="flex items-center gap-1.5">
                {critical > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    {critical} {t("severity.critical")}
                  </Badge>
                )}
                {high > 0 && (
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400"
                  >
                    {high} {t("severity.high")}
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 truncate">
              {t("metrics.requiresAction")}
            </span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="size-6 text-rose-600 dark:text-rose-400" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Medium & Low / Remediated */}
      <Card className="relative overflow-hidden border shadow-xs transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("metrics.mediumAndLow")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {loading ? "--" : medium + low}
              </span>
              {remediated > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                >
                  {remediated} {t("metrics.fixed")}
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 truncate">
              {ignored > 0
                ? `${ignored} ${t("metrics.ignored")}`
                : t("metrics.minorOrStyle")}
            </span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="size-6 text-amber-500 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Files & Scan Status */}
      <Card className="relative overflow-hidden border shadow-xs transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("metrics.scannedFiles")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">
                {loading ? "--" : filesScanned}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary?.scanDurationMs ? `${summary.scanDurationMs}ms` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 truncate">
              <Clock className="size-3 shrink-0" />
              <span>{formatTime(summary?.scannedAt)}</span>
            </div>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <FileCode className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

