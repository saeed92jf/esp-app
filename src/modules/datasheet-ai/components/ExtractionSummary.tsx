// src/modules/datasheet-ai/components/ExtractionSummary.tsx
"use client";

import React from "react";
import { ExtractionSummaryData } from "../types/datasheet.types";
import {
  Tag,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Building2,
  FileCheck2,
} from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface ExtractionSummaryProps {
  summary?: ExtractionSummaryData | null;
  className?: string;
}

export function ExtractionSummary({ summary, className }: ExtractionSummaryProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (!summary) return null;

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {/* 1. Tag & Equipment */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-2 p-3.5 rounded-2xl border border-border/70 bg-card/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span className="font-semibold">{isRtl ? "تجهیز صنعتی" : "Equipment"}</span>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold">
            {summary.tagNumber || "--"}
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground truncate" title={summary.equipmentName}>
          {summary.equipmentName || (isRtl ? "نامشخص" : "Unspecified")}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={summary.equipmentType}>
          {summary.equipmentType || (isRtl ? "استاندارد ASME" : "ASME Standard")}
        </p>
      </div>

      {/* 2. Extracted Parameters */}
      <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
          <span>{isRtl ? "پارامترهای استخراج‌شده" : "Extracted"}</span>
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
            {summary.totalExtracted}
          </span>
          <span className="text-[10px] text-emerald-600/80">{isRtl ? "مورد" : "items"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1">
          {isRtl ? "تطابق کامل ساختار" : "Complete match"}
        </span>
      </div>

      {/* 3. Missing Parameters */}
      <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">
          <span>{isRtl ? "اقلام مفقود" : "Missing"}</span>
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
            {summary.totalMissing}
          </span>
          <span className="text-[10px] text-amber-600/80">{isRtl ? "مورد" : "items"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1">
          {isRtl ? "نیاز به بررسی تکمیلی" : "Requires review"}
        </span>
      </div>

      {/* 4. Ambiguous Parameters */}
      <div className="p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1">
          <span>{isRtl ? "موارد مبهم" : "Ambiguous"}</span>
          <HelpCircle className="size-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
            {summary.totalAmbiguous}
          </span>
          <span className="text-[10px] text-purple-600/80">{isRtl ? "مورد" : "items"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1">
          {isRtl ? "ضریب اطمینان مرزی" : "Borderline score"}
        </span>
      </div>

      {/* 5. Overall Confidence & Accuracy */}
      <div className="p-3.5 rounded-2xl border border-sky-500/30 bg-sky-500/5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-400 font-semibold mb-1">
          <span>{isRtl ? "دقت پردازش هوش" : "Confidence"}</span>
          <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-sky-700 dark:text-sky-300 font-mono">
            {Math.round(summary.overallConfidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-sky-200 dark:bg-sky-950/60 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="bg-sky-600 dark:bg-sky-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(summary.overallConfidence * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

