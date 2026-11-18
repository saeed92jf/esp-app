// src/modules/warehouse/components/WarehouseInventoryView.tsx
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
  Package,
  MapPin,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Truck,
  Warehouse,
  Filter,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseItem } from "../types/warehouse.types";
import { WAREHOUSE_CATEGORIES, INITIAL_WAREHOUSE_ITEMS } from "../data/mock-warehouse";
import { WarehouseItemDetailModal } from "./WarehouseItemDetailModal";
import { WarehouseStockEntryModal } from "./WarehouseStockEntryModal";

export function WarehouseInventoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [items, setItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE_ITEMS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedCategory !== "all") {
        if (selectedCategory === "raw" && !item.categoryEn.includes("Raw")) return false;
        if (selectedCategory === "internals" && !item.categoryEn.includes("Internals")) return false;
        if (selectedCategory === "reactor" && !item.categoryEn.includes("Reactor")) return false;
        if (selectedCategory === "fasteners" && !item.categoryEn.includes("Fasteners")) return false;
        if (selectedCategory === "seals" && !item.categoryEn.includes("Seals")) return false;
        if (selectedCategory === "piping" && !item.categoryEn.includes("Piping")) return false;
      }

      if (!q) return true;
      return (
        item.sku.toLowerCase().includes(q) ||
        item.nameFa.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.categoryFa.toLowerCase().includes(q)
      );
    });
  }, [items, search, selectedCategory]);

  const totalSKUs = items.length;
  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
  const lowStockCount = items.filter((it) => it.status !== "in_stock").length;

  const handleAddNewItem = (newItem: WarehouseItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Boxes className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.registeredSkus")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(1420 + totalSKUs, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.skus")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Warehouse className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.totalPhysicalUnits")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(28540 + totalUnits, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.units")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.lowStockAlerts")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(lowStockCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.alerts")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Truck className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.inboundShipments")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(4, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.shipments")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("actions.searchPlaceholder")}
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

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setIsEntryModalOpen(true)}
              className="h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>{t("actions.newStockEntry")}</span>
            </Button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{t("actions.filterCategory")}</span>
          </span>

          {WAREHOUSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "h-7 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                {isRtl ? cat.labelFa : cat.labelEn}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.sku")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.partDescription")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.category")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.storageLocation")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.currentStock")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.status")}</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailOpen(true);
                }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <TableCell className="py-3 font-mono text-xs font-bold text-primary">
                  {item.sku}
                </TableCell>
                <TableCell className="py-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {isRtl ? item.nameFa : item.nameEn}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? item.nameEn : item.nameFa}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground font-medium">
                  {isRtl ? item.categoryFa : item.categoryEn}
                </TableCell>
                <TableCell className="py-3 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span className={cn("text-xs font-bold tabular-nums", isRtl && "fa-num")}>
                    {formatLocaleNumber(item.quantity, isRtl)} {isRtl ? item.unitFa : item.unitEn}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-center">
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
                </TableCell>
                <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailOpen(true);
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

      {/* Item Detail Modal */}
      <WarehouseItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
      />

      {/* Stock Entry Modal */}
      <WarehouseStockEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleAddNewItem}
      />
    </div>
  );
}
