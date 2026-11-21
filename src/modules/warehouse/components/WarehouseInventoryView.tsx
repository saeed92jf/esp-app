// src/modules/warehouse/components/WarehouseInventoryView.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  BookmarkCheck,
  Building2,
  Loader2,
  Ruler,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseItem, StockStatus } from "../types/warehouse.types";
import { WAREHOUSE_CATEGORIES, INITIAL_WAREHOUSE_ITEMS } from "../data/mock-warehouse";
import { WarehouseService } from "../services/warehouse.service";
import { WarehouseItemDetailModal } from "./WarehouseItemDetailModal";
import { WarehouseStockEntryModal } from "./WarehouseStockEntryModal";

export function WarehouseInventoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [items, setItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE_ITEMS.slice(0, 25));
  const [totalItems, setTotalItems] = useState(18470);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(Math.ceil(18470 / 25));
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [metrics, setMetrics] = useState({
    totalSkus: 18470,
    inStockCount: 12500,
    inProgressCount: 3800,
    bookedCount: 1400,
    lowStockCount: 770,
  });

  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await WarehouseService.getItems({
        page,
        pageSize,
        search: debouncedSearch,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      if (res && res.items) {
        setItems(res.items);
        setTotalItems(res.total);
        setTotalPages(res.totalPages || Math.ceil(res.total / pageSize));
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.warn("Could not fetch warehouse items via API, using fallback", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddNewItem = async (newItem: WarehouseItem) => {
    try {
      await WarehouseService.createItem(newItem);
      fetchItems();
    } catch (err) {
      setItems((prev) => [newItem, ...prev]);
    }
  };

  const STATUS_TABS = [
    { id: "all", labelFa: "همه وضعیت‌ها", labelEn: "All Status" },
    { id: "in_stock", labelFa: "موجود در انبار", labelEn: "In Stock" },
    { id: "in_progress", labelFa: "در حال ساخت / تولید", labelEn: "In Manufacture" },
    { id: "booked", labelFa: "رزرو شده پروژه", labelEn: "Booked" },
    { id: "low_stock", labelFa: "کسری و حد سفارش", labelEn: "Low Stock" },
  ];

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

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
              {formatLocaleNumber(metrics.totalSkus, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.skus")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Warehouse className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "موجود در انبار (Available)" : "Available in Stock"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(metrics.inStockCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.skus")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "در حال ساخت / سفارش (WIP)" : "In Manufacture"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(metrics.inProgressCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.skus")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookmarkCheck className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "رزرو پروژه‌ها (Allocated)" : "Allocated / Booked"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(metrics.bookedCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.skus")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Actions Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی قطعه، کد کالا، آلیاژ، ابعاد، کارفرما، شماره سفارش (Job No) یا پکینگ لیست..." : "Search by SKU, title, alloy, dimension, client, job no or packing list..."}
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{isRtl ? "وضعیت موجودی:" : "Status:"}</span>
          </span>

          {STATUS_TABS.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <Button
                key={st.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => {
                  setSelectedStatus(st.id);
                  setPage(1);
                }}
                className={cn(
                  "h-7 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                {isRtl ? st.labelFa : st.labelEn}
              </Button>
            );
          })}
        </div>

        {/* Category Filter Chips with real Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar pt-1 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 me-1">
            {t("actions.filterCategory")}
          </span>

          {WAREHOUSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={cn(
                  "h-7 px-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                {cat.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {formatLocaleNumber(cat.count, isRtl)}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-2xs z-10 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.sku")}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5 min-w-[200px]">{t("table.partDescription")}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "آلیاژ / متریال" : "Material"}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5 min-w-[140px]">{isRtl ? "ابعاد (Dimension)" : "Dimensions"}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5">{t("table.storageLocation")}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.currentStock")}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "کارفرما / پروژه" : "Client / Job"}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.status")}</TableHead>
                <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                    {isRtl ? "هیچ کالایی با این مشخصات یافت نشد." : "No warehouse items found."}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailOpen(true);
                    }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <TableCell className="py-3 font-mono text-xs font-bold text-primary whitespace-nowrap">
                      {item.sku}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {isRtl ? item.nameFa : item.nameEn}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-sans line-clamp-1">
                          {item.categoryFa} {item.sheet ? `(${item.sheet})` : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                      {item.materialGrade || "-"}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {item.dimensions || "-"}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-foreground font-medium">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center whitespace-nowrap">
                      <span className={cn("text-xs font-bold tabular-nums", isRtl && "fa-num")}>
                        {formatLocaleNumber(item.quantity, isRtl)} {isRtl ? item.unitFa : item.unitEn}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {item.client ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">{item.client}</span>
                          {item.jobNo && (
                            <div className="font-mono text-[10px] text-primary">{item.jobNo}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center whitespace-nowrap">
                      {item.status === "in_stock" && (
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>{t("status.inStock")}</span>
                        </Badge>
                      )}
                      {item.status === "in_progress" && (
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1">
                          <Clock className="size-3" />
                          <span>{isRtl ? "در حال ساخت" : "Manufacture"}</span>
                        </Badge>
                      )}
                      {item.status === "booked" && (
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold gap-1">
                          <BookmarkCheck className="size-3" />
                          <span>{isRtl ? "رزرو پروژه" : "Booked"}</span>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 sm:p-4 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-muted-foreground">
            {isRtl ? (
              <>
                نمایش ردیف <span className="font-bold text-foreground fa-num">{startIndex}</span> تا{" "}
                <span className="font-bold text-foreground fa-num">{endIndex}</span> از کل{" "}
                <span className="font-bold text-primary fa-num">{formatLocaleNumber(totalItems, true)}</span> قلم کالا
              </>
            ) : (
              <>
                Showing items <span className="font-bold text-foreground">{startIndex}</span> to{" "}
                <span className="font-bold text-foreground">{endIndex}</span> of{" "}
                <span className="font-bold text-primary">{formatLocaleNumber(totalItems, false)}</span> entries
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              title={isRtl ? "صفحه اول" : "First Page"}
              className="rounded-lg cursor-pointer disabled:opacity-40"
            >
              {isRtl ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title={isRtl ? "صفحه قبلی" : "Previous Page"}
              className="rounded-lg cursor-pointer disabled:opacity-40"
            >
              {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            </Button>

            <span className="px-2 font-mono text-xs font-semibold text-foreground">
              {page} / {totalPages || 1}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title={isRtl ? "صفحه بعدی" : "Next Page"}
              className="rounded-lg cursor-pointer disabled:opacity-40"
            >
              {isRtl ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              title={isRtl ? "صفحه آخر" : "Last Page"}
              className="rounded-lg cursor-pointer disabled:opacity-40"
            >
              {isRtl ? <ChevronsLeft className="size-3.5" /> : <ChevronsRight className="size-3.5" />}
            </Button>

            {/* Page Size Selector */}
            <div className="ms-2 flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {isRtl ? "تعداد:" : "Show:"}
              </span>
              {[25, 50, 100].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-mono font-medium cursor-pointer transition-colors",
                    pageSize === sz
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
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
