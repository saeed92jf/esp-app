// src/modules/datasheet-ai/components/ParameterTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  TechnicalParameter,
  ParameterCategory,
  ParameterVerificationStatus,
} from "../types/datasheet.types";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParameterTableProps {
  parameters: TechnicalParameter[];
  onUpdateParameter: (paramId: string, updates: Partial<TechnicalParameter>) => Promise<void>;
  onSelectPage?: (page: number) => void;
  documentTitle?: string;
}

const CATEGORIES: { id: "all" | ParameterCategory; labelFa: string; labelEn: string }[] = [
  { id: "all", labelFa: "همه پارامترها", labelEn: "All Parameters" },
  { id: "design", labelFa: "طراحی (Design)", labelEn: "Design" },
  { id: "operating", labelFa: "عملیاتی (Operating)", labelEn: "Operating" },
  { id: "materials", labelFa: "متریال (Materials)", labelEn: "Materials" },
  { id: "mechanical", labelFa: "مکانیکال (Mechanical)", labelEn: "Mechanical" },
  { id: "dimensions", labelFa: "ابعاد و وزن (Dimensions)", labelEn: "Dimensions" },
  { id: "general", labelFa: "عمومی (General)", labelEn: "General" },
];

export function ParameterTable({
  parameters,
  onUpdateParameter,
  onSelectPage,
  documentTitle,
}: ParameterTableProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ParameterCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ParameterVerificationStatus>("all");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredParameters = useMemo(() => {
    return parameters.filter((param) => {
      // Category filter
      if (selectedCategory !== "all" && param.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter !== "all" && param.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = param.key.toLowerCase().includes(q);
        const matchLabelFa = param.labelFa.toLowerCase().includes(q);
        const matchLabelEn = param.labelEn.toLowerCase().includes(q);
        const matchVal = param.value.toLowerCase().includes(q);
        if (!matchKey && !matchLabelFa && !matchLabelEn && !matchVal) return false;
      }
      return true;
    });
  }, [parameters, selectedCategory, statusFilter, searchQuery]);

  const handleStartEdit = (param: TechnicalParameter) => {
    setEditingId(param.id);
    setEditValue(param.value);
    setEditUnit(param.unit || "");
  };

  const handleSaveEdit = async (paramId: string) => {
    setIsSaving(true);
    try {
      await onUpdateParameter(paramId, {
        value: editValue.trim(),
        unit: editUnit.trim() || undefined,
        status: "modified",
      });
      setEditingId(null);
      toast.success(isRtl ? "مقدار پارامتر به‌روزرسانی شد." : "Parameter updated successfully.");
    } catch {
      toast.error(isRtl ? "خطا در ذخیره تغییرات" : "Failed to update parameter");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVerify = async (param: TechnicalParameter) => {
    const nextStatus: ParameterVerificationStatus =
      param.status === "verified" ? "flagged" : "verified";
    try {
      await onUpdateParameter(param.id, { status: nextStatus });
      toast.success(
        nextStatus === "verified"
          ? (isRtl ? "پارامتر تایید شد." : "Parameter verified.")
          : (isRtl ? "پارامتر نشانه‌گذاری شد." : "Parameter flagged for review.")
      );
    } catch {
      toast.error(isRtl ? "خطا در تغییر وضعیت" : "Failed to update status");
    }
  };

  const handleExportCSV = () => {
    if (parameters.length === 0) return;
    const headers = ["Key", "Parameter (FA)", "Parameter (EN)", "Value", "Unit", "Category", "Source Page", "Confidence", "Status"];
    const rows = parameters.map((p) => [
      p.key,
      `"${p.labelFa.replace(/"/g, '""')}"`,
      `"${p.labelEn.replace(/"/g, '""')}"`,
      `"${p.value.replace(/"/g, '""')}"`,
      p.unit || "",
      p.category,
      p.sourcePage,
      `${Math.round(p.confidence * 100)}%`,
      p.status,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle || "datasheet"}_parameters.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(isRtl ? "فایل اکسل/CSV استخراج شد." : "Parameters exported to CSV.");
  };

  const renderStatusBadge = (status: ParameterVerificationStatus) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="size-3" />
            <span>{isRtl ? "تایید شده" : "Verified"}</span>
          </span>
        );
      case "modified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <Edit2 className="size-3" />
            <span>{isRtl ? "ویرایش دستی" : "Modified"}</span>
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Flag className="size-3" />
            <span>{isRtl ? "نیاز به بررسی" : "Flagged"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <AlertCircle className="size-3" />
            <span>{isRtl ? "تایید نشده" : "Unverified"}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      {/* ── Toolbar: Search, Filters & Export ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجوی نام، تگ یا مقدار پارامتر..." : "Search parameter name, tag, or value..."}
              className="ps-9 h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isRtl ? "خروجی اکسل / CSV" : "Export Excel/CSV"}</span>
          </Button>
        </div>
      </div>

      {/* ── Category Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {isRtl ? cat.labelFa : cat.labelEn}
          </button>
        ))}
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/70 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3 text-start">{isRtl ? "پارامتر فنی" : "Parameter"}</th>
                <th className="py-2.5 px-3 text-start">{isRtl ? "مقدار استخراج‌شده" : "Extracted Value"}</th>
                <th className="py-2.5 px-3 text-start w-20">{isRtl ? "واحد" : "Unit"}</th>
                <th className="py-2.5 px-3 text-center w-24">{isRtl ? "صفحه سند" : "Source Page"}</th>
                <th className="py-2.5 px-3 text-center w-24">{isRtl ? "اطمینان هوش" : "Confidence"}</th>
                <th className="py-2.5 px-3 text-center w-28">{isRtl ? "وضعیت صحه‌گذاری" : "Status"}</th>
                <th className="py-2.5 px-3 text-center w-24">{isRtl ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {filteredParameters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-sans text-xs">
                    {isRtl ? "هیچ پارامتری با این مشخصات یافت نشد." : "No parameters match the search criteria."}
                  </td>
                </tr>
              ) : (
                filteredParameters.map((param) => {
                  const isEditing = editingId === param.id;
                  return (
                    <tr
                      key={param.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        param.status === "flagged" && "bg-rose-500/5",
                        param.status === "verified" && "bg-emerald-500/[0.02]"
                      )}
                    >
                      {/* Parameter Label */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-foreground">
                          {isRtl ? param.labelFa : param.labelEn}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {param.key}
                        </div>
                      </td>

                      {/* Extracted Value */}
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 text-xs font-bold rounded-md bg-background"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-foreground text-xs">
                            {param.value}
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <Input
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            placeholder="Unit"
                            className="h-7 text-xs rounded-md bg-background w-16"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {param.unit || "--"}
                          </span>
                        )}
                      </td>

                      {/* Source Page */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectPage?.(param.sourcePage)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-[11px] font-mono cursor-pointer"
                          title={isRtl ? `مشاهده صفحه ${param.sourcePage}` : `View Page ${param.sourcePage}`}
                        >
                          <span>P.{param.sourcePage}</span>
                          <ExternalLink className="size-2.5" />
                        </button>
                      </td>

                      {/* Confidence */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[11px] font-bold font-mono",
                            param.confidence >= 0.9
                              ? "text-emerald-600 dark:text-emerald-400"
                              : param.confidence >= 0.75
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {Math.round(param.confidence * 100)}%
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        {renderStatusBadge(param.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleSaveEdit(param.id)}
                                className="size-6 rounded flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title={isRtl ? "ذخیره" : "Save"}
                              >
                                <Check className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => setEditingId(null)}
                                className="size-6 rounded flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                title={isRtl ? "انصراف" : "Cancel"}
                              >
                                <X className="size-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(param)}
                                className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                title={isRtl ? "ویرایش دستی" : "Edit Value"}
                              >
                                <Edit2 className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleVerify(param)}
                                className={cn(
                                  "size-6 rounded flex items-center justify-center transition-colors cursor-pointer",
                                  param.status === "verified"
                                    ? "text-rose-600 hover:bg-rose-500/10"
                                    : "text-emerald-600 hover:bg-emerald-500/10"
                                )}
                                title={
                                  param.status === "verified"
                                    ? (isRtl ? "تغییر به نیاز به بررسی" : "Flag for review")
                                    : (isRtl ? "تایید صحت پارامتر" : "Verify parameter")
                                }
                              >
                                {param.status === "verified" ? (
                                  <Flag className="size-3" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
