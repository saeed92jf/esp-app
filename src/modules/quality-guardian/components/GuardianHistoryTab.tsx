// src/modules/quality-guardian/components/GuardianHistoryTab.tsx
"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Activity, CheckCircle2, ShieldAlert } from "lucide-react";
import type { ScanHistoryEntry } from "../types/guardian.types";

interface GuardianHistoryTabProps {
  history: ScanHistoryEntry[];
}

export function GuardianHistoryTab({ history }: GuardianHistoryTabProps) {
  const t = useTranslations("QualityGuardian");
  const locale = useLocale();

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(locale === "fa" ? "fa-IR" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <Card className="shadow-xs border animate-in fade-in duration-150">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="size-4 text-primary" />
          {t("history.title")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("history.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {t("history.noHistory")}
          </div>
        ) : (
          <div className="divide-y divide-border text-xs">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4.5 px-1.5 ${
                        entry.healthScore >= 80
                          ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                          : entry.healthScore >= 50
                          ? "border-amber-500/40 text-amber-600 bg-amber-500/10"
                          : "border-rose-500/40 text-rose-600 bg-rose-500/10"
                      }`}
                    >
                      <Activity className="size-2.5 me-1" />
                      {entry.healthScore}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span>{entry.totalViolations} {t("history.violationsFound")}</span>
                    {entry.resolvedCount > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        {entry.resolvedCount} {t("history.resolved")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="destructive" className="text-[10px] h-4.5 px-1.5">
                    {entry.bySeverity?.critical ?? 0} {t("severity.critical")}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 border-amber-500/50 text-amber-600">
                    {entry.bySeverity?.high ?? 0} {t("severity.high")}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5">
                    {entry.bySeverity?.medium ?? 0} {t("severity.medium")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

