// src/modules/warehouse/components/WarehouseReceiptsView.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  X,
  FileCheck2,
  FilePlus2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseVoucher, VoucherType } from "../types/warehouse.types";
import { MOCK_WAREHOUSE_VOUCHERS } from "../data/mock-warehouse";
import { WarehouseVoucherModal } from "./WarehouseVoucherModal";

export function WarehouseReceiptsView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [vouchers] = useState<WarehouseVoucher[]>(MOCK_WAREHOUSE_VOUCHERS);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<VoucherType | "all">("all");
  const [selectedVoucher, setSelectedVoucher] = useState<WarehouseVoucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const filteredVouchers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vouchers.filter((vch) => {
      if (selectedType !== "all" && vch.type !== selectedType) return false;
      if (!q) return true;
      return (
        vch.voucherNo.toLowerCase().includes(q) ||
        vch.titleFa.toLowerCase().includes(q) ||
        vch.titleEn.toLowerCase().includes(q) ||
        vch.counterpartyFa.toLowerCase().includes(q) ||
        vch.counterpartyEn.toLowerCase().includes(q)
      );
    });
  }, [vouchers, search, selectedType]);

  const VOUCHER_FILTERS = [
    { id: "all", label: t("voucherTypes.all") },
    { id: "mrv", label: t("voucherTypes.mrv") },
    { id: "sio", label: t("voucherTypes.sio") },
    { id: "transfer", label: t("voucherTypes.transfer") },
    { id: "stock_count", label: t("voucherTypes.stockCount") },
  ];

  const approvedCount = vouchers.filter((v) => v.status === "approved").length;
  const pendingCount = vouchers.filter((v) => v.status === "pending_qc").length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardList className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.totalVouchers")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(158, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.documents")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.approvedMrv")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(42, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.documents")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileCheck2 className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.issuedSio")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(112, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.documents")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.awaitingApproval")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(pendingCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.documents")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("actions.searchReceipts")}
            className="ps-10 h-10 rounded-xl text-xs sm:text-sm bg-background border-border/70"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearch("")}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Voucher Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{t("actions.filterVoucher")}</span>
          </span>

          {VOUCHER_FILTERS.map((f) => {
            const isSelected = selectedType === f.id;
            return (
              <Button
                key={f.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => setSelectedType(f.id as VoucherType | "all")}
                className={cn(
                  "h-7 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                {f.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Receipts & Vouchers Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.voucherNo")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.voucherType")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.subject")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.counterparty")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.issueDate")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.itemsCount")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.status")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVouchers.map((vch) => (
              <TableRow
                key={vch.id}
                onClick={() => {
                  setSelectedVoucher(vch);
                  setIsVoucherModalOpen(true);
                }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <TableCell className="py-3 font-mono text-xs font-bold text-primary">
                  {vch.voucherNo}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary border-primary/25 font-semibold">
                    {vch.type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {isRtl ? vch.titleFa : vch.titleEn}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? vch.titleEn : vch.titleFa}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-xs text-foreground font-medium">
                  {isRtl ? vch.counterpartyFa : vch.counterpartyEn}
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground font-semibold">
                  {vch.issueDate}
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span className={cn("text-xs font-bold tabular-nums", isRtl && "fa-num")}>
                    {formatLocaleNumber(vch.itemCount, isRtl)} {isRtl ? "قلم" : "items"}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  {vch.status === "approved" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>{t("status.approved")}</span>
                    </Badge>
                  )}
                  {vch.status === "pending_qc" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                      <Clock className="size-3" />
                      <span>{t("status.pendingQc")}</span>
                    </Badge>
                  )}
                  {vch.status === "draft" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-muted text-muted-foreground font-semibold gap-1">
                      <span>{t("status.draft")}</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setSelectedVoucher(vch);
                      setIsVoucherModalOpen(true);
                    }}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    title={t("actions.viewDetails")}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Official Voucher Preview Modal */}
      <WarehouseVoucherModal
        voucher={selectedVoucher}
        isOpen={isVoucherModalOpen}
        onClose={() => {
          setIsVoucherModalOpen(false);
          setSelectedVoucher(null);
        }}
      />
    </div>
  );
}
