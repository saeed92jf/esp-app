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
                <span>{isRtl ? "وزن تقریبی" : "Est. Weight"}</span>
              </div>
              <div className={cn("text-base sm:text-lg font-bold text-foreground mt-1 tabular-nums", isRtl && "fa-num")}>
                {formatLocaleNumber(item.weightKg || item.quantity, isRtl)}{" "}
                <span className="text-xs font-normal text-muted-foreground font-sans">
                  {isRtl ? "کیلوگرم" : "kg"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="size-3.5 text-emerald-500" />
                <span>{isRtl ? "آخرین گردش" : "Last Movement"}</span>
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

            {item.lotNumber && (
              <div className="flex items-center justify-between p-3.5 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Tag className="size-4 text-amber-500" />
                  <span>{isRtl ? "شماره بهر / بهر کیفی (LOT)" : "Lot / Batch No"}</span>
                </span>
                <span className="font-mono font-bold text-primary">
                  {item.lotNumber}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3.5 bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-4 text-blue-500" />
                <span>{isRtl ? "تامین‌کننده / سازنده" : "Supplier / Manufacturer"}</span>
              </span>
              <span className="font-semibold text-foreground">
                {isRtl ? item.supplierFa || "یورواسلات پارس" : item.supplierEn || "Euroslot Pars"}
              </span>
            </div>
          </div>

          {/* Storage Conditions & Engineering Notes */}
          {(item.notesFa || item.notesEn) && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <FileSpreadsheet className="size-4" />
                <span>{t("dialogs.notesLabel")}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {isRtl ? item.notesFa : item.notesEn}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            {isRtl ? "سامانه انبارداری صنعتی یورواسلات" : "Euroslot Industrial Warehouse ERP"}
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
