// src/modules/warehouse/components/WarehouseTransactionsView.tsx
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
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  FileCheck2,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseTransaction, MovementType } from "../types/warehouse.types";
import { MOCK_WAREHOUSE_TRANSACTIONS } from "../data/mock-warehouse";

export function WarehouseTransactionsView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [transactions] = useState<WarehouseTransaction[]>(MOCK_WAREHOUSE_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<MovementType | "all">("all");

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tr) => {
      if (selectedType !== "all" && tr.type !== selectedType) return false;
      if (!q) return true;
      return (
        tr.transId.toLowerCase().includes(q) ||
        tr.sku.toLowerCase().includes(q) ||
        tr.itemNameFa.toLowerCase().includes(q) ||
        tr.itemNameEn.toLowerCase().includes(q) ||
        tr.referenceDoc.toLowerCase().includes(q) ||
        tr.fromLocation.toLowerCase().includes(q) ||
        tr.toLocation.toLowerCase().includes(q)
      );
    });
  }, [transactions, search, selectedType]);

  const MOVEMENT_FILTERS = [
    { id: "all", label: t("movementTypes.all") },
    { id: "inbound", label: t("movementTypes.inbound") },
    { id: "outbound", label: t("movementTypes.outbound") },
    { id: "transfer", label: t("movementTypes.transfer") },
    { id: "return", label: t("movementTypes.return") },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Activity className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.todayMovements")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(transactions.length, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.records")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.inboundVolume")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(254, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "واحد/کیلو" : "Units"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.outboundVolume")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(16, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "قطعه به خط" : "To Lines"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.pendingQc")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(1, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.records")}</span>
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
            placeholder={t("actions.searchTransactions")}
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

        {/* Movement Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{t("actions.filterType")}</span>
          </span>

          {MOVEMENT_FILTERS.map((f) => {
            const isSelected = selectedType === f.id;
            return (
              <Button
                key={f.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => setSelectedType(f.id as MovementType | "all")}
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

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.transId")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.transType")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.partDescription")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.quantity")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.route")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.refDoc")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.operator")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tr) => (
              <TableRow key={tr.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <TableCell className="py-3 font-mono text-xs font-bold text-primary">
                  {tr.transId}
                  <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                    {tr.date} {tr.time}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {tr.type === "inbound" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                      <ArrowDownLeft className="size-3" />
                      <span>{isRtl ? "ورود به انبار" : "Inbound"}</span>
                    </Badge>
                  )}
                  {tr.type === "outbound" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1">
                      <ArrowUpRight className="size-3" />
                      <span>{isRtl ? "خروج به تولید" : "Outbound"}</span>
                    </Badge>
                  )}
                  {tr.type === "transfer" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold gap-1">
                      <ArrowLeftRight className="size-3" />
                      <span>{isRtl ? "جابه‌جایی" : "Transfer"}</span>
                    </Badge>
                  )}
                  {tr.type === "return" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                      <RotateCcw className="size-3" />
                      <span>{isRtl ? "مرجوعی" : "Return"}</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground">
                      {isRtl ? tr.itemNameFa : tr.itemNameEn}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {tr.sku}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span className={cn("text-xs font-bold tabular-nums", isRtl && "fa-num")}>
                    {formatLocaleNumber(tr.quantity, isRtl)} {isRtl ? tr.unitFa : tr.unitEn}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-foreground font-medium">{tr.toLocation}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{tr.fromLocation}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3 font-mono text-xs font-semibold text-muted-foreground">
                  {tr.referenceDoc}
                </TableCell>
                <TableCell className="py-3 text-xs text-foreground font-medium">
                  {isRtl ? tr.operatorFa : tr.operatorEn}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {tr.status === "completed" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>{t("status.completed")}</span>
                    </Badge>
                  )}
                  {tr.status === "pending_qc" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                      <Clock className="size-3" />
                      <span>{t("status.pendingQc")}</span>
                    </Badge>
                  )}
                  {tr.status === "in_progress" && (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1">
                      <Clock className="size-3" />
                      <span>{t("status.inProgress")}</span>
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
