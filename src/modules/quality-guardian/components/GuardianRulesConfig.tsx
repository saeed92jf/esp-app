// src/modules/quality-guardian/components/GuardianRulesConfig.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_GUARDIAN_CONFIG } from "../config/guardian.config";
import { ShieldCheck, Wrench, FileCode, CheckCircle2 } from "lucide-react";

export function GuardianRulesConfig() {
  const t = useTranslations("QualityGuardian");
  const { rules, targetDirectories, extensions, ignorePatterns } = DEFAULT_GUARDIAN_CONFIG;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Scope Card */}
      <Card className="shadow-xs border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileCode className="size-4 text-primary" />
            {t("config.scopeTitle")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("config.scopeDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="font-semibold text-muted-foreground block mb-1">
                {t("config.targets")}
              </span>
              <div className="flex flex-wrap gap-1">
                {targetDirectories.map((d) => (
                  <Badge key={d} variant="secondary" className="font-mono text-[10px]">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="font-semibold text-muted-foreground block mb-1">
                {t("config.extensions")}
              </span>
              <div className="flex flex-wrap gap-1">
                {extensions.map((ext) => (
                  <Badge key={ext} variant="outline" className="font-mono text-[10px]">
                    {ext}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="font-semibold text-muted-foreground block mb-1">
                {t("config.ignored")}
              </span>
              <div className="flex flex-wrap gap-1">
                {ignorePatterns.slice(0, 6).map((ign) => (
                  <Badge key={ign} variant="secondary" className="font-mono text-[10px]">
                    {ign}
                  </Badge>
                ))}
                {ignorePatterns.length > 6 && (
                  <span className="text-[10px] text-muted-foreground self-center">
                    +{ignorePatterns.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card className="shadow-xs border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            {t("config.rulesTitle")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("config.rulesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border text-xs">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground">
                      {rule.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-mono">
                      {rule.category}
                    </Badge>
                    {rule.canAutoRemediate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4.5 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1"
                      >
                        <Wrench className="size-2.5" />
                        {t("config.autoFixable")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={rule.defaultSeverity === "critical" ? "destructive" : "secondary"}
                    className="text-[10px] h-5 capitalize"
                  >
                    {rule.defaultSeverity}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1"
                  >
                    <CheckCircle2 className="size-3" />
                    {t("config.active")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

