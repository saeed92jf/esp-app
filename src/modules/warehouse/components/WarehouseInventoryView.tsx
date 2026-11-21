// src/modules/warehouse/components/WarehouseInventoryView.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Package,
  MapPin,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Warehouse,
  Filter,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  BookmarkCheck,
  Building2,
  Loader2,
  Ruler,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Check,
  RotateCcw,
  Scale,
  FileSpreadsheet,
  Briefcase,
  FileText,
  Layers,
  CircleDot,
  GitFork,
  Wrench,
  Sliders,
  Disc,
  LayoutGrid,
  ShieldCheck,
  Circle,
  Columns,
  Gauge,
  Atom,
  Spline,
  Activity,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseItem, StockStatus } from "../types/warehouse.types";
import { WAREHOUSE_CATEGORIES, INITIAL_WAREHOUSE_ITEMS } from "../data/mock-warehouse";
import { WarehouseService } from "../services/warehouse.service";
import { WarehouseStockEntryModal } from "./WarehouseStockEntryModal";

interface ColumnFilters {
  skuQuery: string;
  nameQuery: string;
  materials: string[];
  dimensionsQuery: string;
  locations: string[];
  clientQuery: string;
  statuses: string[];
}

const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  skuQuery: "",
  nameQuery: "",
  materials: [],
  dimensionsQuery: "",
  locations: [],
  clientQuery: "",
  statuses: [],
};

type AccordionTab = "specs" | "storage" | "client" | "remarks";

interface ActiveAccordionState {
  itemId: string;
  tab: AccordionTab;
}

const CATEGORY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  all: { icon: Boxes, color: "text-primary", bg: "bg-primary/10" },
  "Plates & Sheets": { icon: Layers, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  "Pipes & Tubes": { icon: CircleDot, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  "Fittings": { icon: GitFork, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  "Bolts & Nuts": { icon: Wrench, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  "Industrial Rods": { icon: Ruler, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  "Thin Plates & Bars": { icon: Sliders, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  "Coils & Strips": { icon: Disc, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  "Industrial Mesh": { icon: LayoutGrid, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
  "Gaskets & Seals": { icon: ShieldCheck, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
  "Washers": { icon: Circle, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
  "Structural Profiles & Angles": { icon: Columns, color: "text-lime-600 dark:text-lime-400", bg: "bg-lime-500/10" },
  "Valves": { icon: Gauge, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  "Random Packing": { icon: Boxes, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  "Polypropylene & Polymers": { icon: Atom, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10" },
  "Rods & Wires": { icon: Spline, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  "Wires": { icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  "Bubble Caps & Risers": { icon: Cpu, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  "Flanges": { icon: Disc, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
};

export function WarehouseInventoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  // Items State
  const [items, setItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE_ITEMS.slice(0, 30));
  const [totalItems, setTotalItems] = useState(18470);
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [colFilters, setColFilters] = useState<ColumnFilters>(INITIAL_COLUMN_FILTERS);

  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Expandable Row & Flap State
  const [openFlapItemId, setOpenFlapItemId] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<ActiveAccordionState | null>(null);

  // Modals State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Category Carousel Ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalSkus: 18470,
    inStockCount: 12500,
    inProgressCount: 3800,
    bookedCount: 1400,
    lowStockCount: 770,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial and refreshed fetch
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await WarehouseService.getItems({
        page: 1,
        pageSize,
        search: debouncedSearch,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      if (res && res.items) {
        setItems(res.items);
        setTotalItems(res.total);
        setPage(1);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.warn("Could not fetch warehouse items via API, using fallback", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Progressive "Load More" handler
  const handleLoadMore = async () => {
    if (loadingMore || items.length >= totalItems) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await WarehouseService.getItems({
        page: nextPage,
        pageSize,
        search: debouncedSearch,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      if (res && res.items && res.items.length > 0) {
        setItems((prev) => [...prev, ...res.items]);
        setPage(nextPage);
        setTotalItems(res.total);
      }
    } catch (err) {
      console.error("Failed to load more warehouse items", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Category carousel scroll handler
  const scrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 300;
    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? (isRtl ? scrollAmount : -scrollAmount) : (isRtl ? -scrollAmount : scrollAmount),
      behavior: "smooth",
    });
  };

  // Distinct values for column filter dropdowns
  const uniqueMaterials = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      if (it.materialGrade?.trim()) s.add(it.materialGrade.trim());
    });
    return Array.from(s).sort();
  }, [items]);

  const uniqueLocations = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      if (it.location?.trim()) s.add(it.location.trim());
    });
    return Array.from(s).sort();
  }, [items]);

  // Sorting handler
  const handleSort = (field: string, explicitDir?: "asc" | "desc") => {
    if (sortField === field && !explicitDir) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(explicitDir || "asc");
    }
  };

  // Toggle array item helper
  const toggleArrayItem = (arr: string[], val: string) => {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  };

  // Check active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (debouncedSearch.trim()) count++;
    if (colFilters.skuQuery.trim()) count++;
    if (colFilters.nameQuery.trim()) count++;
    if (colFilters.materials.length > 0) count++;
    if (colFilters.dimensionsQuery.trim()) count++;
    if (colFilters.locations.length > 0) count++;
    if (colFilters.clientQuery.trim()) count++;
    if (colFilters.statuses.length > 0) count++;
    return count;
  }, [selectedCategory, selectedStatus, debouncedSearch, colFilters]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSearch("");
    setDebouncedSearch("");
    setColFilters(INITIAL_COLUMN_FILTERS);
    setSortField(null);
  };

  // Filtered & Sorted items on client-side
  const displayedItems = useMemo(() => {
    let result = [...items];

    // Column Filters
    if (colFilters.skuQuery.trim()) {
      const q = colFilters.skuQuery.trim().toLowerCase();
      result = result.filter((it) => it.sku?.toLowerCase().includes(q));
    }

    if (colFilters.nameQuery.trim()) {
      const q = colFilters.nameQuery.trim().toLowerCase();
      result = result.filter(
        (it) => it.nameFa?.toLowerCase().includes(q) || it.nameEn?.toLowerCase().includes(q)
      );
    }

    if (colFilters.materials.length > 0) {
      result = result.filter((it) => it.materialGrade && colFilters.materials.includes(it.materialGrade.trim()));
    }

    if (colFilters.dimensionsQuery.trim()) {
      const q = colFilters.dimensionsQuery.trim().toLowerCase();
      result = result.filter((it) => it.dimensions?.toLowerCase().includes(q));
    }

    if (colFilters.locations.length > 0) {
      result = result.filter((it) => it.location && colFilters.locations.includes(it.location.trim()));
    }

    if (colFilters.clientQuery.trim()) {
      const q = colFilters.clientQuery.trim().toLowerCase();
      result = result.filter(
        (it) => it.client?.toLowerCase().includes(q) || it.jobNo?.toLowerCase().includes(q)
      );
    }

    if (colFilters.statuses.length > 0) {
      result = result.filter((it) => colFilters.statuses.includes(it.status));
    }

    // Sort
    if (sortField) {
      result.sort((a: any, b: any) => {
        let valA = a[sortField] ?? "";
        let valB = b[sortField] ?? "";
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDir === "asc" ? valA - valB : valB - valA;
        }
        return sortDir === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [items, colFilters, sortField, sortDir]);

  // Toggle Accordion / Flap
  const toggleAccordion = (itemId: string, tab: AccordionTab) => {
    if (activeAccordion?.itemId === itemId && activeAccordion.tab === tab) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion({ itemId, tab });
      setOpenFlapItemId(itemId);
    }
  };

  const handleRowClick = (item: WarehouseItem) => {
    if (openFlapItemId === item.id) {
      if (activeAccordion?.itemId === item.id) {
        setActiveAccordion(null);
      } else {
        setActiveAccordion({ itemId: item.id, tab: "specs" });
      }
    } else {
      setOpenFlapItemId(item.id);
      setActiveAccordion({ itemId: item.id, tab: "specs" });
    }
  };

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

  // Helper for rendering Excel Header
  const renderExcelHeader = ({
    title,
    field,
    align = "start",
    isFiltered,
    onClear,
    children,
  }: {
    title: string;
    field: string;
    align?: "start" | "center" | "end";
    isFiltered: boolean;
    onClear: () => void;
    children?: React.ReactNode;
  }) => {
    const isSorted = sortField === field;
    return (
      <th
        className={cn(
          "py-3 px-3 text-xs font-bold transition-colors select-none border-b border-border/80 text-foreground/90",
          align === "center" ? "text-center" : "text-start"
        )}
      >
        <div className={cn("inline-flex items-center gap-1.5", align === "center" && "justify-center")}>
          <button
            type="button"
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer outline-none font-bold text-xs"
            title={`${title} - ${isRtl ? "مرتب‌سازی" : "Sort"}`}
          >
            <span>{title}</span>
            {isSorted ? (
              sortDir === "asc" ? (
                <ArrowUp className="size-3 text-primary stroke-[2.5]" />
              ) : (
                <ArrowDown className="size-3 text-primary stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="size-3 opacity-30 hover:opacity-80 transition-opacity" />
            )}
          </button>

          {children && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "size-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer outline-none",
                    isFiltered
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
                  )}
                  title={isRtl ? "فیلتر ستون" : "Filter column"}
                >
                  <Filter className="size-3" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={align === "start" ? "start" : "center"}
                sideOffset={6}
                dir={isRtl ? "rtl" : "ltr"}
                className="w-64 p-3 bg-popover border border-border/60 shadow-xl rounded-2xl text-xs flex flex-col gap-2.5 z-50"
              >
                <div className="flex flex-col gap-1 pb-2 border-b border-border/40">
                  <span className="font-bold text-foreground text-[11px] text-muted-foreground">
                    {title}
                  </span>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(field, "asc")}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 h-auto rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                        isSorted && sortDir === "asc" && "text-primary font-bold bg-primary/10"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUp className="size-3.5" />
                        <span>{isRtl ? "مرتب‌سازی صعودی" : "Sort Ascending"}</span>
                      </span>
                      {isSorted && sortDir === "asc" && <Check className="size-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(field, "desc")}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 h-auto rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                        isSorted && sortDir === "desc" && "text-primary font-bold bg-primary/10"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowDown className="size-3.5" />
                        <span>{isRtl ? "مرتب‌سازی نزولی" : "Sort Descending"}</span>
                      </span>
                      {isSorted && sortDir === "desc" && <Check className="size-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar pe-1">
                  {children}
                </div>

                {isFiltered && (
                  <div className="pt-2 border-t border-border/40 flex justify-end">
                    <button
                      type="button"
                      onClick={onClear}
                      className="text-[11px] font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>{isRtl ? "حذف فیلتر این ستون" : "Clear filter"}</span>
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top Metrics Cards ── */}
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

      {/* ── 2. Category Filter Cards (Horizontal Carousel with Navigation) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {isRtl ? "دسته‌بندی‌های اقلام خام و قطعات انبار" : "Warehouse Material Categories"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({WAREHOUSE_CATEGORIES.length} {isRtl ? "گروه" : "groups"})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="size-7 rounded-xl border border-border/70 bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={isRtl ? "حرکت به راست" : "Scroll Left"}
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="size-7 rounded-xl border border-border/70 bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={isRtl ? "حرکت به چپ" : "Scroll Right"}
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Carousel Cards Container */}
        <div
          ref={categoryScrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
        >
          {WAREHOUSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const meta = CATEGORY_ICONS[cat.id] || { icon: Boxes, color: "text-primary", bg: "bg-primary/10" };
            const Icon = meta.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected && cat.id !== "all" ? "all" : cat.id);
                  setPage(1);
                }}
                className={cn(
                  "group relative min-w-[210px] sm:min-w-[230px] h-[78px] p-3 rounded-2xl border text-start transition-all duration-200 select-none shrink-0 cursor-pointer flex items-center gap-3",
                  isSelected
                    ? "bg-primary/[0.08] dark:bg-primary/20 border-primary ring-2 ring-primary/30 shadow-xs"
                    : "bg-card border-border/70 hover:border-border hover:bg-muted/40"
                )}
              >
                {/* Visual Icon Badge */}
                <div
                  className={cn(
                    "size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                    meta.bg,
                    meta.color
                  )}
                >
                  <Icon className="size-6" />
                </div>

                {/* Title & Count */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={cn(
                      "text-xs font-bold truncate leading-snug transition-colors",
                      isSelected ? "text-primary font-black" : "text-foreground group-hover:text-primary"
                    )}
                    title={isRtl ? cat.labelFa : cat.labelEn}
                  >
                    {isRtl ? cat.labelFa : cat.labelEn}
                  </span>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      )}
                    >
                      <span className={cn(isRtl && "fa-num")}>
                        {formatLocaleNumber(cat.count || 0, isRtl)}
                      </span>
                      <span className="text-[9px] font-sans font-normal opacity-85">
                        {isRtl ? "قلم" : "SKUs"}
                      </span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Search, Filter & Actions Bar ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی سراسری کالا، آلیاژ، ابعاد، کارفرما، شماره سفارش (Job No) یا پکینگ لیست..." : "Global search SKU, alloy, dimensions, client, job no, or packing list..."}
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
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-10 px-3.5 rounded-xl border-destructive/30 text-destructive text-xs font-semibold gap-1.5 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{isRtl ? "حذف فیلترها" : "Clear filters"}</span>
                <span className="size-4.5 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center fa-num font-bold">
                  {activeFiltersCount}
                </span>
              </Button>
            )}

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
      </div>

      {/* ── 4. Practical Inventory Table with Excel Column Filters & Row Flap ── */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-2xs z-20 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start border-separate border-spacing-0 min-w-[1100px]">
            {/* High-Contrast Excel Table Header */}
            <thead className="bg-slate-100/90 dark:bg-slate-800/95 sticky top-0 z-10 backdrop-blur-md border-b-2 border-border/60">
              <tr>
                {/* 1. Row Index (#) */}
                <th className="py-3 px-3 text-center text-xs font-bold text-muted-foreground w-14 border-b border-border/80">
                  #
                </th>

                {/* 2. SKU (کد کالا) */}
                {renderExcelHeader({
                  title: t("table.sku") || "کد کالا (SKU)",
                  field: "sku",
                  align: "start",
                  isFiltered: Boolean(colFilters.skuQuery),
                  onClear: () => setColFilters((prev) => ({ ...prev, skuQuery: "" })),
                  children: (
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "جستجوی کد کالا" : "Search SKU"}
                      </span>
                      <Input
                        value={colFilters.skuQuery}
                        onChange={(e) => setColFilters((prev) => ({ ...prev, skuQuery: e.target.value }))}
                        placeholder="e.g. ESP-PLT-..."
                        dir="ltr"
                        className="h-8 text-xs bg-muted/40 border-border/50 rounded-lg"
                      />
                    </div>
                  ),
                })}

                {/* 3. Description & Name (شرح و مشخصات قطعه) */}
                {renderExcelHeader({
                  title: isRtl ? "نام و شرح قطعه" : "Part Description",
                  field: "nameFa",
                  align: "start",
                  isFiltered: Boolean(colFilters.nameQuery),
                  onClear: () => setColFilters((prev) => ({ ...prev, nameQuery: "" })),
                  children: (
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "جستجو در شرح قطعه" : "Search Description"}
                      </span>
                      <Input
                        value={colFilters.nameQuery}
                        onChange={(e) => setColFilters((prev) => ({ ...prev, nameQuery: e.target.value }))}
                        placeholder={isRtl ? "نام قطعه یا کلمه کلیدی..." : "Keyword..."}
                        className="h-8 text-xs bg-muted/40 border-border/50 rounded-lg"
                      />
                    </div>
                  ),
                })}

                {/* 4. Material Grade (آلیاژ / متریال) */}
                {renderExcelHeader({
                  title: isRtl ? "آلیاژ / متریال" : "Material",
                  field: "materialGrade",
                  align: "start",
                  isFiltered: colFilters.materials.length > 0,
                  onClear: () => setColFilters((prev) => ({ ...prev, materials: [] })),
                  children: (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "فیلتر بر اساس متریال" : "Filter by Material"}
                      </span>
                      {uniqueMaterials.slice(0, 15).map((mat) => (
                        <label key={mat} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                          <Checkbox
                            checked={colFilters.materials.includes(mat)}
                            onCheckedChange={() =>
                              setColFilters((prev) => ({
                                ...prev,
                                materials: toggleArrayItem(prev.materials, mat),
                              }))
                            }
                          />
                          <span className="font-mono text-xs">{mat}</span>
                        </label>
                      ))}
                    </div>
                  ),
                })}

                {/* 5. Dimensions (ابعاد) */}
                {renderExcelHeader({
                  title: isRtl ? "ابعاد (Dimension)" : "Dimensions",
                  field: "dimensions",
                  align: "start",
                  isFiltered: Boolean(colFilters.dimensionsQuery),
                  onClear: () => setColFilters((prev) => ({ ...prev, dimensionsQuery: "" })),
                  children: (
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "جستجوی سایز یا ضخامت" : "Search dimensions"}
                      </span>
                      <Input
                        value={colFilters.dimensionsQuery}
                        onChange={(e) => setColFilters((prev) => ({ ...prev, dimensionsQuery: e.target.value }))}
                        placeholder="e.g. 1000mm, 0.3mm..."
                        dir="ltr"
                        className="h-8 text-xs bg-muted/40 border-border/50 rounded-lg"
                      />
                    </div>
                  ),
                })}

                {/* 6. Storage Location (موقعیت انبار) */}
                {renderExcelHeader({
                  title: isRtl ? "انبار / جایگاه" : "Storage Bay",
                  field: "location",
                  align: "start",
                  isFiltered: colFilters.locations.length > 0,
                  onClear: () => setColFilters((prev) => ({ ...prev, locations: [] })),
                  children: (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "فیلتر موقعیت‌های انبار" : "Filter Storage Location"}
                      </span>
                      {uniqueLocations.map((loc) => (
                        <label key={loc} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                          <Checkbox
                            checked={colFilters.locations.includes(loc)}
                            onCheckedChange={() =>
                              setColFilters((prev) => ({
                                ...prev,
                                locations: toggleArrayItem(prev.locations, loc),
                              }))
                            }
                          />
                          <span className="text-xs">{loc}</span>
                        </label>
                      ))}
                    </div>
                  ),
                })}

                {/* 7. Current Stock Quantity (موجودی) */}
                {renderExcelHeader({
                  title: isRtl ? "موجودی" : "Stock Qty",
                  field: "quantity",
                  align: "center",
                  isFiltered: false,
                  onClear: () => {},
                })}

                {/* 8. Client / Job No (کارفرما / سفارش) */}
                {renderExcelHeader({
                  title: isRtl ? "کارفرما / سفارش" : "Client / Job No",
                  field: "client",
                  align: "start",
                  isFiltered: Boolean(colFilters.clientQuery),
                  onClear: () => setColFilters((prev) => ({ ...prev, clientQuery: "" })),
                  children: (
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "جستجوی کارفرما یا کد سفارش" : "Search Client / Job No"}
                      </span>
                      <Input
                        value={colFilters.clientQuery}
                        onChange={(e) => setColFilters((prev) => ({ ...prev, clientQuery: e.target.value }))}
                        placeholder={isRtl ? "نام کارفرما یا کد سفارش..." : "Client or Job No..."}
                        className="h-8 text-xs bg-muted/40 border-border/50 rounded-lg"
                      />
                    </div>
                  ),
                })}

                {/* 9. Status (وضعیت) */}
                {renderExcelHeader({
                  title: isRtl ? "وضعیت" : "Status",
                  field: "status",
                  align: "center",
                  isFiltered: colFilters.statuses.length > 0,
                  onClear: () => setColFilters((prev) => ({ ...prev, statuses: [] })),
                  children: (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-foreground/80 text-[10px]">
                        {isRtl ? "فیلتر بر اساس وضعیت" : "Filter by Status"}
                      </span>
                      {STATUS_TABS.filter((s) => s.id !== "all").map((st) => (
                        <label key={st.id} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                          <Checkbox
                            checked={colFilters.statuses.includes(st.id)}
                            onCheckedChange={() =>
                              setColFilters((prev) => ({
                                ...prev,
                                statuses: toggleArrayItem(prev.statuses, st.id),
                              }))
                            }
                          />
                          <span className="text-xs">{isRtl ? st.labelFa : st.labelEn}</span>
                        </label>
                      ))}
                    </div>
                  ),
                })}

                {/* 10. Actions / Flap Toggle (عملیات و لبه) */}
                <th className="py-3 px-3 text-center text-xs font-bold text-muted-foreground w-16 border-b border-border/80">
                  {isRtl ? "لبه" : "Tab"}
                </th>
              </tr>
            </thead>

            {displayedItems.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-muted-foreground">
                    {isRtl ? "هیچ کالایی با فیلترهای مشخص‌شده یافت نشد." : "No warehouse items found with specified filters."}
                  </td>
                </tr>
              </tbody>
            ) : (
              displayedItems.map((item, index) => {
                const isRowActive = openFlapItemId === item.id;
                const isAccordionOpen = activeAccordion?.itemId === item.id;

                return (
                  <tbody key={item.id} className="group/row">
                    {/* ── 1. Main Practical Row ── */}
                    <tr
                      onClick={() => handleRowClick(item)}
                      className={cn(
                        "transition-colors duration-150 cursor-pointer select-none",
                        isRowActive
                          ? "bg-primary/[0.06] dark:bg-primary/15 [&>td]:border-b [&>td]:border-primary/25"
                          : "bg-card hover:bg-slate-50/80 dark:hover:bg-slate-800/40 [&>td]:border-b [&>td]:border-border/40"
                      )}
                    >
                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-xs text-muted-foreground font-semibold align-middle">
                        <span className={cn(isRtl && "fa-num")}>{index + 1}</span>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono text-xs font-bold text-primary whitespace-nowrap align-middle">
                        {item.sku}
                      </td>

                      {/* Name & Category */}
                      <td className="py-2.5 px-3.5 text-start align-middle">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-foreground group-hover/row:text-primary transition-colors line-clamp-1 max-w-[280px]">
                            {isRtl ? item.nameFa : item.nameEn}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-sans line-clamp-1">
                            {item.categoryFa} {item.sheet ? `(${item.sheet})` : ""}
                          </div>
                        </div>
                      </td>

                      {/* Material Grade */}
                      <td className="py-2.5 px-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap align-middle">
                        {item.materialGrade || "-"}
                      </td>

                      {/* Dimensions */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap align-middle">
                        {item.dimensions || "-"}
                      </td>

                      {/* Storage Location */}
                      <td className="py-2.5 px-3 text-xs text-foreground font-medium align-middle">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </td>

                      {/* Current Quantity */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle">
                        <span className={cn("text-xs font-bold tabular-nums", isRtl && "fa-num")}>
                          {formatLocaleNumber(item.quantity, isRtl)}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {isRtl ? item.unitFa : item.unitEn}
                          </span>
                        </span>
                      </td>

                      {/* Client / Job No */}
                      <td className="py-2.5 px-3 text-xs text-muted-foreground align-middle">
                        {item.client ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block truncate max-w-[140px]">
                              {item.client}
                            </span>
                            {item.jobNo && (
                              <div className="font-mono text-[10px] text-primary">{item.jobNo}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle">
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
                      </td>

                      {/* Flap Toggle Icon */}
                      <td className="py-2.5 px-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRowClick(item)}
                          className={cn(
                            "size-7 rounded-lg transition-colors cursor-pointer",
                            isRowActive
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          title={isRtl ? "مشاهده لبه اطلاعات" : "Toggle details tab"}
                        >
                          {isRowActive ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                      </td>
                    </tr>

                    {/* ── 2. Expandable Row & Icon Flap (لبه ایکون برای هر سطر دقیقا مثل یوزر تیبل در ادمین) ── */}
                    <tr className="border-0 relative z-0">
                      <td colSpan={10} className="p-0 border-0">
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                            isAccordionOpen || isRowActive
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0 pointer-events-none"
                          )}
                        >
                          <div className="overflow-hidden min-h-0">
                            <div
                              className={cn(
                                "w-full flex flex-col px-3 sm:px-4 relative",
                                isRtl ? "items-end" : "items-start",
                                isAccordionOpen ? "pb-4" : "pb-2.5"
                              )}
                              dir="ltr"
                            >
                              {/* Top Subtle Continuous Shadow */}
                              <div className="w-full h-1.5 bg-gradient-to-b from-slate-900/[0.06] dark:from-black/30 to-transparent pointer-events-none absolute top-0 inset-x-0 z-10" />

                              {/* Accordion Content Panel */}
                              <AnimatePresence initial={false}>
                                {isAccordionOpen && activeAccordion && (
                                  <motion.div
                                    key={`acc-panel-${item.id}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    dir={isRtl ? "rtl" : "ltr"}
                                    className="w-full bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-x border-b border-border/50 rounded-2xl p-4 sm:p-5 mt-1 shadow-sm"
                                  >
                                    {/* Panel Top Header Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                                      <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                          <Package className="size-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-bold text-foreground">
                                              {isRtl ? item.nameFa : item.nameEn}
                                            </h4>
                                            <Badge variant="outline" className="text-[10px] font-mono bg-muted text-muted-foreground border-border/50">
                                              {item.sku}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground font-sans">
                                            {isRtl ? item.nameEn : item.nameFa}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-mono font-bold px-2.5 py-1 bg-primary/10 text-primary border-primary/25"
                                        >
                                          {formatLocaleNumber(item.quantity, isRtl)} {isRtl ? item.unitFa : item.unitEn}
                                        </Badge>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => setActiveAccordion(null)}
                                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                          title={isRtl ? "بستن لبه" : "Close panel"}
                                        >
                                          <X className="size-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Active Accordion Content View */}
                                    <div className="pt-4">
                                      {/* Tab 1: Technical Specs & Dimensions */}
                                      {activeAccordion.tab === "specs" && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "گروه کالایی / نوع ورق" : "Category / Sheet"}
                                            </span>
                                            <span className="text-xs font-bold text-foreground mt-1 block">
                                              {item.categoryFa} {item.sheet ? `(${item.sheet})` : ""}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "آلیاژ و گرید متریال" : "Material Grade"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-foreground mt-1 block">
                                              {item.materialGrade || "-"}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "ابعاد هندسی (Dimensions)" : "Dimensions"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-primary mt-1 block">
                                              {item.dimensions || "-"}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "وزن برآورد شده (کیلوگرم)" : "Estimated Weight (kg)"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-foreground mt-1 block">
                                              {item.weightKg ? `${formatLocaleNumber(item.weightKg, isRtl)} kg` : "-"}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Tab 2: Storage Bay & Location */}
                                      {activeAccordion.tab === "storage" && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "سالن و زون فیزیکی انبار" : "Warehouse Bay & Zone"}
                                            </span>
                                            <span className="text-xs font-bold text-foreground mt-1 flex items-center gap-1.5">
                                              <MapPin className="size-3.5 text-primary" />
                                              <span>{item.location}</span>
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "موجودی قابل تخصیص" : "Available Stock"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block fa-num">
                                              {formatLocaleNumber(item.quantity, isRtl)} {isRtl ? item.unitFa : item.unitEn}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "حد آستانه سفارش (Min Level)" : "Min Reorder Level"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block fa-num">
                                              {formatLocaleNumber(item.minLevel, isRtl)} {isRtl ? item.unitFa : item.unitEn}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "تاریخ ثبت و ویرایش" : "Last Updated"}
                                            </span>
                                            <span className="text-xs font-bold text-foreground mt-1 block">
                                              {item.lastUpdated || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Tab 3: Client & Order Info */}
                                      {activeAccordion.tab === "client" && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "کارفرما / پروژه اختصاصی" : "Client / Project"}
                                            </span>
                                            <span className="text-xs font-bold text-foreground mt-1 block">
                                              {item.client || (isRtl ? "انبار عمومی کارخانه" : "General Factory Stock")}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "کد سفارش کارخانه (Job No)" : "Factory Job No"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-primary mt-1 block">
                                              {item.jobNo || "-"}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "پکینگ لیست مرجع (PL)" : "Packing List (PL)"}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-foreground mt-1 block">
                                              {item.packingList || "-"}
                                            </span>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-background/80 border border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-medium block">
                                              {isRtl ? "وضعیت رزرو پروژه" : "Booking Status"}
                                            </span>
                                            <span className="text-xs font-semibold text-foreground mt-1 block">
                                              {item.status === "booked" ? (isRtl ? "تخصیص‌یافته به پروژه" : "Allocated") : (isRtl ? "آزاد در انبار" : "Unallocated")}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Tab 4: Engineering Remarks & Inspection */}
                                      {activeAccordion.tab === "remarks" && (
                                        <div className="p-4 rounded-2xl bg-background/80 border border-border/50 space-y-2">
                                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                            <FileSpreadsheet className="size-4" />
                                            <span>{isRtl ? "توضیحات فنی، استاندارد و بازرسی کیفیت" : "Technical & Inspection Remarks"}</span>
                                          </div>
                                          <p className="text-xs leading-relaxed text-muted-foreground">
                                            {item.remarks || item.notesFa || (isRtl ? "توضیحات تکمیلی برای این ردیف کالا ثبت نشده است." : "No additional remarks recorded for this SKU.")}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* ── B. Icon Tab Flap (لبه ایکون برای هر سطر دقیقا مثل یوزر تیبل در ادمین) ── */}
                              <div
                                dir={isRtl ? "rtl" : "ltr"}
                                className={cn(
                                  "flex items-center justify-between px-3 py-1 transition-colors select-none shrink-0",
                                  isAccordionOpen ? "-mt-px" : "mt-0",
                                  "rounded-b-xl border-x border-b border-border/50",
                                  "bg-slate-100/95 dark:bg-slate-800/95",
                                  isRowActive ? "text-foreground" : "text-muted-foreground",
                                  !isAccordionOpen && (isRowActive ? "hover:bg-slate-200/90 dark:hover:bg-slate-700/90" : "hover:bg-slate-200/80 dark:hover:bg-slate-700/80")
                                )}
                              >
                                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                  {/* Flap Tab 1: Specs */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => toggleAccordion(item.id, "specs")}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer h-auto",
                                      isAccordionOpen && activeAccordion?.tab === "specs"
                                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold hover:bg-primary/90"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={isRtl ? "مشخصات فنی و ابعاد" : "Specs & Dimensions"}
                                  >
                                    <Ruler size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "مشخصات فنی و ابعاد" : "Specs"}</span>
                                  </Button>

                                  {/* Flap Tab 2: Storage */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => toggleAccordion(item.id, "storage")}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer h-auto",
                                      isAccordionOpen && activeAccordion?.tab === "storage"
                                        ? "bg-emerald-600 text-white shadow-2xs font-semibold hover:bg-emerald-700"
                                        : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={isRtl ? "انبار و جایگاه" : "Storage Bay"}
                                  >
                                    <MapPin size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "انبار و جایگاه" : "Storage"}</span>
                                  </Button>

                                  {/* Flap Tab 3: Client & Job */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => toggleAccordion(item.id, "client")}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer h-auto",
                                      isAccordionOpen && activeAccordion?.tab === "client"
                                        ? "bg-blue-600 text-white shadow-2xs font-semibold hover:bg-blue-700"
                                        : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={isRtl ? "کارفرما و سفارش" : "Client & Order"}
                                  >
                                    <Briefcase size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "کارفرما و سفارش" : "Client"}</span>
                                  </Button>

                                  {/* Flap Tab 4: Remarks */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => toggleAccordion(item.id, "remarks")}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer h-auto",
                                      isAccordionOpen && activeAccordion?.tab === "remarks"
                                        ? "bg-amber-600 text-white shadow-2xs font-semibold hover:bg-amber-700"
                                        : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={isRtl ? "توضیحات و ریمارک" : "Remarks"}
                                  >
                                    <FileSpreadsheet size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "توضیحات و ریمارک" : "Remarks"}</span>
                                  </Button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {isAccordionOpen && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => {
                                        setActiveAccordion(null);
                                        setOpenFlapItemId(null);
                                      }}
                                      className="text-[11px] text-muted-foreground hover:text-foreground h-auto p-1 rounded-md cursor-pointer"
                                    >
                                      <X size={13} className="shrink-0 me-1" />
                                      <span>{isRtl ? "بستن لبه" : "Close"}</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                );
              })
            )}
          </table>
        </div>

        {/* ── 5. Progressive "Load More" Expansion Bar (بجای صفحه‌بندی عددی) ── */}
        <div className="p-4 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Progress / Status Text */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Boxes className="size-4 text-primary shrink-0" />
            <span>
              {isRtl ? (
                <>
                  نمایش <span className="font-bold text-foreground fa-num">{displayedItems.length}</span> قلم از کل{" "}
                  <span className="font-bold text-primary fa-num">{formatLocaleNumber(totalItems, true)}</span> قلم موجود در انبار
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-foreground">{displayedItems.length}</span> of{" "}
                  <span className="font-bold text-primary">{formatLocaleNumber(totalItems, false)}</span> warehouse items
                </>
              )}
            </span>
          </div>

          {/* Load More Button or All Loaded Label */}
          <div>
            {items.length < totalItems ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loadingMore || loading}
                onClick={handleLoadMore}
                className="h-10 px-6 rounded-xl font-semibold gap-2 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors shadow-2xs cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{isRtl ? "در حال دریافت اقلام بیشتر..." : "Loading more items..."}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" />
                    <span>{isRtl ? "بارگذاری اقلام بیشتر (+۳۰ قلم)" : "Load More Items (+30 SKUs)"}</span>
                  </>
                )}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isRtl ? "تمامی اقلام منطبق بر فیلتر بارگذاری شده‌اند." : "All matching items have been loaded."}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stock Entry Modal */}
      <WarehouseStockEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleAddNewItem}
      />
    </div>
  );
}
