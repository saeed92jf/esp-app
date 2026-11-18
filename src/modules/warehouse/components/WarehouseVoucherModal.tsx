// src/modules/warehouse/components/WarehouseVoucherModal.tsx
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Stamp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseVoucher } from "../types/warehouse.types";

interface WarehouseVoucherModalProps {
  voucher: WarehouseVoucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WarehouseVoucherModal({
  voucher,
  isOpen,
  onClose,
}: WarehouseVoucherModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  if (!voucher) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        {/* Document Header */}
        <div className="bg-muted/40 p-5 sm:p-6 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-primary">
                    {voucher.voucherNo}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary border-primary/25 font-semibold">
                    {voucher.type.toUpperCase()}
                  </Badge>
                  {voucher.status === "approved" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>{t("status.approved")}</span>
                    </Badge>
                  )}
                  {voucher.status === "pending_qc" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                      <Clock className="size-3" />
                      <span>{t("status.pendingQc")}</span>
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {isRtl ? voucher.titleFa : voucher.titleEn}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-sans">
                  {isRtl ? voucher.titleEn : voucher.titleFa}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Meta Info */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building2 className="size-3.5 text-primary" />
                <span>{t("table.counterparty")}</span>
              </span>
              <div className="font-bold text-foreground">
                {isRtl ? voucher.counterpartyFa : voucher.counterpartyEn}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-emerald-500" />
                <span>{t("table.issueDate")}</span>
              </span>
              <div className="font-bold text-foreground">
                {voucher.issueDate}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-foreground py-2.5">
                    {t("table.sku")}
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-2.5">
                    {t("table.partDescription")}
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-2.5 text-center">
                    {t("table.quantity")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.items.map((it, idx) => (
                  <TableRow key={idx} className="border-b border-border/40 hover:bg-muted/20">
                    <TableCell className="font-mono text-xs font-bold text-primary py-2.5">
                      {it.sku}
                    </TableCell>
                    <TableCell className="text-xs text-foreground py-2.5">
                      {isRtl ? it.nameFa : it.nameEn}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-center py-2.5 tabular-nums">
                      {formatLocaleNumber(it.qty, isRtl)} {isRtl ? it.unitFa : it.unitEn}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Signatures & QC Box */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px]">
            <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2">
              <div className="text-muted-foreground font-medium">{isRtl ? "انباردار / تحویل‌دهنده" : "Warehouse Keeper"}</div>
              <div className="font-bold text-foreground">{isRtl ? "حسین ابراهیمی" : "H. Ebrahimi"}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{isRtl ? "امضای الکترونیکی ثبت شد" : "Digital Signed"}</div>
            </div>

            <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2">
              <div className="text-muted-foreground font-medium">{isRtl ? "کنترل کیفی (QC)" : "Quality Control (QC)"}</div>
              <div className="font-bold text-foreground">{isRtl ? "مهندس اکبری" : "Eng. Akbari"}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <Stamp className="size-3" />
                <span>{isRtl ? "تایید نهایی متریال" : "Material Certified"}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2">
              <div className="text-muted-foreground font-medium">{isRtl ? "مدیریت کارخانه" : "Plant Management"}</div>
              <div className="font-bold text-foreground">{isRtl ? "مهندس خسروی" : "Eng. Khosravi"}</div>
              <div className="text-[10px] text-primary font-semibold">{isRtl ? "تایید صدور سند" : "Approved"}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>{t("actions.print")}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
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
