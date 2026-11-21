// src/modules/warehouse/components/WarehouseItemDetailModal.tsx
"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
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
import {
  Package,
  MapPin,
  Calendar,
  Layers,
  Building2,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileSpreadsheet,
  Ruler,
  Briefcase,
  FileText,
  Clock,
  BookmarkCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseItem } from "../types/warehouse.types";

interface WarehouseItemDetailModalProps {
  item: WarehouseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WarehouseItemDetailModal({
  item,
  isOpen,
  onClose,
}: WarehouseItemDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        {/* Top Header Banner */}
        <div className="bg-muted/40 p-5 sm:p-6 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Package className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-primary tracking-wide">
                    {item.sku}
                  </span>
                  {item.status === "in_stock" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>{t("status.inStock")}</span>
                    </Badge>
                  )}
                  {item.status === "low_stock" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                      <AlertTriangle className="size-3" />
                      <span>{t("status.lowStock")}</span>
                    </Badge>
                  )}
                  {item.status === "critical" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold gap-1">
                      <AlertTriangle className="size-3" />
                      <span>{t("status.critical")}</span>
                    </Badge>
                  )}
                  {item.status === "in_progress" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1">
                      <Clock className="size-3" />
                      <span>{isRtl ? "در حال ساخت / تولید" : "In Manufacture"}</span>
                    </Badge>
                  )}
                  {item.status === "booked" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold gap-1">
                      <BookmarkCheck className="size-3" />
                      <span>{isRtl ? "رزرو پروژه" : "Booked"}</span>
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {isRtl ? item.nameFa : item.nameEn}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-sans">
                  {isRtl ? item.nameEn : item.nameFa}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                <span>{t("table.currentStock")}</span>
              </div>
              <div className={cn("text-base sm:text-lg font-bold text-foreground mt-1 tabular-nums", isRtl && "fa-num")}>
                {formatLocaleNumber(item.quantity, isRtl)}{" "}
                <span className="text-xs font-normal text-muted-foreground font-sans">
                  {isRtl ? item.unitFa : item.unitEn}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span>{t("dialogs.minLevelLabel")}</span>
              </div>
              <div className={cn("text-base sm:text-lg font-bold text-foreground mt-1 tabular-nums", isRtl && "fa-num")}>
                {formatLocaleNumber(item.minLevel, isRtl)}{" "}
                <span className="text-xs font-normal text-muted-foreground font-sans">
                  {isRtl ? item.unitFa : item.unitEn}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                <Scale className="size-3.5 text-blue-500" />
                <span>{isRtl ? "وزن کل (کیلوگرم)" : "Weight (kg)"}</span>
              </div>
              <div className={cn("text-base sm:text-lg font-bold text-foreground mt-1 tabular-nums", isRtl && "fa-num")}>
                {item.weightKg ? (
                  <>
                    {formatLocaleNumber(item.weightKg, isRtl)}{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">
                      {isRtl ? "کیلوگرم" : "kg"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="size-3.5 text-emerald-500" />
                <span>{isRtl ? "تاریخ ثبت / ویرایش" : "Record Date"}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground mt-1">
                {item.lastUpdated}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="rounded-2xl border border-border/70 divide-y divide-border/60 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-3.5 bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                <span>{t("table.category")}</span>
              </span>
              <span className="font-semibold text-foreground">
                {isRtl ? item.categoryFa : item.categoryEn}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-4 text-rose-500" />
                <span>{t("table.storageLocation")}</span>
              </span>
              <span className="font-semibold text-foreground">
                {item.location}
              </span>
            </div>

            {item.dimensions && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Ruler className="size-4 text-sky-500" />
                  <span>{isRtl ? "ابعاد و مشخصات هندسی" : "Dimensions"}</span>
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {item.dimensions}
                </span>
              </div>
            )}

            {item.materialGrade && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>{isRtl ? "آلیاژ و گرید متریال" : "Material Grade"}</span>
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {item.materialGrade}
                </span>
              </div>
            )}

            {item.client && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-4 text-blue-500" />
                  <span>{isRtl ? "کارفرما / پروژه اختصاصی" : "Client / Project"}</span>
                </span>
                <span className="font-semibold text-foreground">
                  {item.client}
                </span>
              </div>
            )}

            {item.jobNo && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="size-4 text-amber-500" />
                  <span>{isRtl ? "شماره سفارش کارخانه (Job No)" : "Job No"}</span>
                </span>
                <span className="font-mono font-bold text-primary">
                  {item.jobNo}
                </span>
              </div>
            )}

            {item.packingList && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-indigo-500" />
                  <span>{isRtl ? "پکینگ لیست مرجع (Packing List)" : "Packing List"}</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {item.packingList}
                </span>
              </div>
            )}
          </div>

          {/* Storage Conditions & Engineering Notes */}
          {(item.remarks || item.notesFa) && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <FileSpreadsheet className="size-4" />
                <span>{t("dialogs.notesLabel")} / {isRtl ? "توضیحات و ریمارک" : "Remarks"}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.remarks || (isRtl ? item.notesFa : item.notesEn)}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            {isRtl ? "گزارش رسمی مواد اولیه کارخانه یورواسلات پارس" : "Euroslot Pars Raw Materials Official Registry"}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
          >
            {t("actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
