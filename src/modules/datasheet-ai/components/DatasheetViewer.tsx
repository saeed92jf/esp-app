// src/modules/datasheet-ai/components/DatasheetViewer.tsx
"use client";

import React, { useState } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  Eye,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { DatasheetDocument } from "../types/datasheet.types";

interface DatasheetViewerProps {
  document?: DatasheetDocument | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function DatasheetViewer({
  document,
  currentPage,
  onPageChange,
  className,
}: DatasheetViewerProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [zoom, setZoom] = useState(1);
  const totalPages = document?.pageCount || 4;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (!document) {
    return (
      <div className={cn("rounded-2xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center p-8 text-center", className)}>
        <FileText className="size-10 text-muted-foreground/60 mb-2" />
        <p className="text-xs text-muted-foreground font-medium">
          {isRtl ? "جهت مشاهده، یک دیتاشیت انتخاب کنید." : "Select a datasheet to preview."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden h-full", className)}>
      {/* ── Viewer Top Control Bar ── */}
      <div className="flex items-center justify-between p-3 border-b border-border/60 bg-muted/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="size-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]" title={document.originalName || document.name}>
            {document.originalName || document.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({document.sizeFormatted})
          </span>
        </div>

        {/* Page Navigation & Zoom Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom Buttons */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border/40 transition-colors cursor-pointer"
            title={isRtl ? "کوچک‌نمایی" : "Zoom Out"}
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="text-[11px] font-mono text-muted-foreground min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border/40 transition-colors cursor-pointer"
            title={isRtl ? "بزرگ‌نمایی" : "Zoom In"}
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border/40 transition-colors cursor-pointer"
            title={isRtl ? "بازنشانی اندازه" : "Reset Zoom"}
          >
            <RotateCcw className="size-3" />
          </button>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Page Navigator */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={handlePrevPage}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border/40 disabled:opacity-40 transition-colors cursor-pointer"
            title={isRtl ? "صفحه قبل" : "Previous Page"}
          >
            <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-foreground px-2">
            <span>{currentPage}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalPages}</span>
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={handleNextPage}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border/40 disabled:opacity-40 transition-colors cursor-pointer"
            title={isRtl ? "صفحه بعد" : "Next Page"}
          >
            <ChevronLeft className="size-4 rtl:rotate-0 rotate-180" />
          </button>
        </div>
      </div>

      {/* ── Document Canvas Area ── */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/5 dark:bg-black/30 min-h-[460px]">
        <div
          className="relative bg-white dark:bg-slate-950 shadow-lg border border-border/80 rounded-xl transition-transform origin-center duration-150 flex flex-col p-6 w-full max-w-[580px] min-h-[720px]"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Header of Simulated PDF Datasheet */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-300 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                EUROSLOT PARS ENGINEERING
              </h2>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                TECHNICAL EQUIPMENT SPECIFICATION SHEET
              </p>
            </div>
            <div className="text-end font-mono">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                PAGE {currentPage} OF {totalPages}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                ● OCR VERIFIED (QWEN-ONPREM)
              </span>
            </div>
          </div>

          {/* Datasheet Metadata Table */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border border-slate-300 dark:border-slate-700 p-2 rounded mb-4 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <span className="text-slate-500 block">TAG NUMBER:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {document.summary?.tagNumber || "V-401-A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">DESIGN CODE:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {document.summary?.designCode || "ASME SEC VIII DIV 1"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">SERVICE:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                HIGH PRESSURE SEPARATION
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">MANUFACTURER:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {document.summary?.manufacturer || "EUROSLOT PARS"}
              </span>
            </div>
          </div>

          {/* Dynamic Page Mock Content */}
          <div className="space-y-3 flex-1 text-[11px] font-mono text-slate-800 dark:text-slate-200">
            {currentPage === 1 && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    SECTION 1: OPERATING & DESIGN CONDITIONS
                  </span>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between border-b border-amber-500/20 py-0.5">
                      <span>INTERNAL DESIGN PRESSURE:</span>
                      <span className="font-bold">45.0 barg @ 185.0 °C</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-500/20 py-0.5">
                      <span>EXTERNAL DESIGN PRESSURE:</span>
                      <span className="font-bold">FV (Full Vacuum)</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-500/20 py-0.5">
                      <span>NORMAL OPERATING PRESSURE:</span>
                      <span className="font-bold">38.5 barg</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>MAXIMUM DESIGN TEMPERATURE:</span>
                      <span className="font-bold">185.0 °C</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30">
                  <span className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
                    SECTION 2: MATERIALS OF CONSTRUCTION
                  </span>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between border-b border-sky-500/20 py-0.5">
                      <span>SHELL MATERIAL:</span>
                      <span className="font-bold">SA-516 Gr. 70 (HIC Tested)</span>
                    </div>
                    <div className="flex justify-between border-b border-sky-500/20 py-0.5">
                      <span>HEAD MATERIAL:</span>
                      <span className="font-bold">SA-516 Gr. 70</span>
                    </div>
                    <div className="flex justify-between border-b border-sky-500/20 py-0.5">
                      <span>CORROSION ALLOWANCE:</span>
                      <span className="font-bold">3.2 mm</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>INTERNALS MATERIAL:</span>
                      <span className="font-bold">SS 316L (Demister & Vane)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    SECTION 3: MECHANICAL & RADIOGRAPHY SPECIFICATION
                  </span>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between border-b border-emerald-500/20 py-0.5">
                      <span>RADIOGRAPHY (RT):</span>
                      <span className="font-bold">100% Full RT (UW-11a)</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 py-0.5">
                      <span>PWHT REQUIREMENT:</span>
                      <span className="font-bold">Yes (per UCS-56)</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 py-0.5">
                      <span>INSIDE DIAMETER (ID):</span>
                      <span className="font-bold">2200 mm</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>LENGTH T-T:</span>
                      <span className="font-bold">6500 mm</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 4 && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/30">
                  <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">
                    SECTION 4: WEIGHTS & NOZZLE SCHEDULE
                  </span>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between border-b border-purple-500/20 py-0.5">
                      <span>FABRICATION / EMPTY WEIGHT:</span>
                      <span className="font-bold">14,850 kg</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-500/20 py-0.5">
                      <span>HYDROTEST WATER WEIGHT:</span>
                      <span className="font-bold">39,500 kg</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>INLET NOZZLE N1:</span>
                      <span className="font-bold">8" 600# WNRF (Sch 80)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer of Simulated PDF */}
          <div className="border-t border-slate-300 dark:border-slate-800 pt-2 mt-auto text-[9px] text-slate-500 flex justify-between font-mono">
            <span>EUROSLOT PARS ON-PREMISE AI SYSTEM</span>
            <span>SECURE INDUSTRIAL ARCHIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

