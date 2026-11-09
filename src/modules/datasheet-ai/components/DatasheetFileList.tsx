// src/modules/datasheet-ai/components/DatasheetFileList.tsx
"use client";

import React from "react";
import { DatasheetDocument } from "../types/datasheet.types";
import {
  FileText,
  Trash2,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface DatasheetFileListProps {
  documents: DatasheetDocument[];
  selectedDocumentId?: string | null;
  onSelectDocument: (doc: DatasheetDocument) => void;
  onDeleteDocument: (docId: string) => void;
  className?: string;
}

export function DatasheetFileList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onDeleteDocument,
  className,
}: DatasheetFileListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-3 shadow-xs", className)}>
      <div className="flex items-center justify-between px-1 pb-1 border-b border-border/50 text-xs font-bold text-foreground">
        <span>{isRtl ? "آرشیو دیتاشیت‌های فعال" : "Active Datasheets"}</span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {documents.length} {isRtl ? "مورد" : "docs"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
        {documents.map((doc) => {
          const isSelected = selectedDocumentId === doc.id;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group",
                isSelected
                  ? "bg-primary/10 border-primary shadow-2xs font-semibold"
                  : "bg-background hover:bg-muted/40 border-border/60 hover:border-border"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 text-xs",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-foreground truncate max-w-[170px] sm:max-w-[220px]" title={doc.name}>
                    {doc.name}
                  </h5>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                    <span>{doc.sizeFormatted}</span>
                    <span>•</span>
                    <span>{doc.pageCount} P.</span>
                    {doc.summary?.tagNumber && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-bold">{doc.summary.tagNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {doc.status === "completed" ? (
                  <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5" />
                  </span>
                ) : doc.status === "failed" ? (
                  <span className="size-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="size-3.5" />
                  </span>
                ) : (
                  <span className="size-5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Loader2 className="size-3.5 animate-spin" />
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title={isRtl ? "حذف" : "Delete"}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
