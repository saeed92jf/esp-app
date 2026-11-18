// src/modules/warehouse/components/WarehouseModuleShell.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { AppHeader } from "@/components/layout/app-header";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Package,
  MapPin,
  ArrowLeftRight,
  FileText,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Truck,
  TrendingUp,
  Warehouse,
  Filter,
  Layers,
  ArrowUpRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";

type WarehouseTab = "inventory" | "locations" | "transactions" | "receipts";

interface WarehouseItem {
  id: string;
  sku: string;
  nameFa: string;
  nameEn: string;
  categoryFa: string;
  categoryEn: string;
  location: string;
  quantity: number;
  unitFa: string;
  unitEn: string;
  minLevel: number;
  status: "in_stock" | "low_stock" | "critical";
  lastUpdated: string;
}

const MOCK_WAREHOUSE_ITEMS: WarehouseItem[] = [
  {
    id: "wh-01",
    sku: "SKU-WW-316L-025",
    nameFa: "سیم وِج‌وایر استنلس استیل 316L (گام 0.25mm)",
    nameEn: "Stainless Steel 316L Wedge Wire (0.25mm Slot)",
    categoryFa: "مواد اولیه و مش وایر",
    categoryEn: "Raw Materials & Wire",
    location: "بخش A - قفسه ۱۲ - ردیف ۳",
    quantity: 480,
    unitFa: "کیلوگرم",
    unitEn: "kg",
    minLevel: 100,
    status: "in_stock",
    lastUpdated: "۱۴۰۳/۰۸/۲۴",
  },
  {
    id: "wh-02",
    sku: "SKU-SC-INOX-904L",
    nameFa: "پروفیل اسکیلپ اینکونل و آلیاژ 904L رآکتور",
    nameEn: "Reactor Scallop Profile Alloy 904L",
    categoryFa: "اینترنال‌های فرآیندی",
    categoryEn: "Process Internals",
    location: "بخش B - پالت ۷",
    quantity: 34,
    unitFa: "شاخه",
    unitEn: "pcs",
    minLevel: 15,
    status: "in_stock",
    lastUpdated: "۱۴۰۳/۰۸/۲۲",
  },
  {
    id: "wh-03",
    sku: "SKU-CP-SS321-DN150",
    nameFa: "سنترپایپ سوراخ‌دار رآکتور کاتالیستی DN150",
    nameEn: "Catalyst Perforated Center Pipe DN150",
    categoryFa: "تجهیزات رآکتور",
    categoryEn: "Reactor Equipment",
    location: "بخش B - قفسه ۳",
    quantity: 8,
    unitFa: "شاخه",
    unitEn: "pcs",
    minLevel: 10,
    status: "low_stock",
    lastUpdated: "۱۴۰۳/۰۸/۲۶",
  },
  {
    id: "wh-04",
    sku: "SKU-BLT-B8M-M16",
    nameFa: "پیچ و مهره استنلس استیل A193 B8M / Gr.8M سایز M16",
    nameEn: "SS Stud Bolt A193 B8M / 8M Size M16",
    categoryFa: "اتصالات و فستنرها",
    categoryEn: "Fasteners & Hardware",
    location: "بخش C - کشو ۴۵",
    quantity: 1250,
    unitFa: "دستگاه",
    unitEn: "sets",
    minLevel: 300,
    status: "in_stock",
    lastUpdated: "۱۴۰۳/۰۸/۱۸",
  },
  {
    id: "wh-05",
    sku: "SKU-GSK-SPWD-316",
    nameFa: "گسکت اسپیرال وند 316L با فیلر گرافیت کلاس 300",
    nameEn: "Spiral Wound Gasket 316L Graphite Class 300",
    categoryFa: "آب‌بندی و گسکت‌ها",
    categoryEn: "Seals & Gaskets",
    location: "بخش C - قفسه ۸",
    quantity: 14,
    unitFa: "عدد",
    unitEn: "pcs",
    minLevel: 25,
    status: "low_stock",
    lastUpdated: "۱۴۰۳/۰۸/۲۵",
  },
  {
    id: "wh-06",
    sku: "SKU-FLG-WN-316-6IN",
    nameFa: "فلنج ولدینگ نک 6 اینچ کلاس 150 استنلس استیل 316",
    nameEn: "Weld Neck Flange 6\" Class 150 SS 316",
    categoryFa: "لوله و اتصالات",
    categoryEn: "Piping & Flanges",
    location: "بخش A - پالت ۳",
    quantity: 2,
    unitFa: "عدد",
    unitEn: "pcs",
    minLevel: 8,
    status: "critical",
    lastUpdated: "۱۴۰۳/۰۸/۲۷",
  },
  {
    id: "wh-07",
    sku: "SKU-CAT-BSK-MOD",
    nameFa: "ماژول قطعه‌بندی‌شده بسکت ساپورت کاتالیست",
    nameEn: "Segmented Catalyst Basket Module",
    categoryFa: "اینترنال‌های فرآیندی",
    categoryEn: "Process Internals",
    location: "بخش D - سالن قطعات سنگین",
    quantity: 19,
    unitFa: "واحد",
    unitEn: "units",
    minLevel: 5,
    status: "in_stock",
    lastUpdated: "۱۴۰۳/۰۸/۲۷",
  },
];

const CATEGORIES = [
  { id: "all", labelFa: "همه دسته‌بندی‌ها", labelEn: "All Categories" },
  { id: "raw", labelFa: "مواد اولیه و مش وایر", labelEn: "Raw Materials" },
  { id: "internals", labelFa: "اینترنال‌های فرآیندی", labelEn: "Process Internals" },
  { id: "reactor", labelFa: "تجهیزات رآکتور", labelEn: "Reactor Equipment" },
  { id: "fasteners", labelFa: "اتصالات و فستنرها", labelEn: "Fasteners & Hardware" },
  { id: "seals", labelFa: "آب‌بندی و گسکت‌ها", labelEn: "Seals & Gaskets" },
  { id: "piping", labelFa: "لوله و اتصالات", labelEn: "Piping & Flanges" },
];

export function WarehouseModuleShell() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [activeTab, setActiveTab] = useState<WarehouseTab>("inventory");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const navItems = useMemo(
    () => [
      {
        id: "inventory" as WarehouseTab,
        label: isRtl ? "موجودی قطعات و انبار" : "Inventory & Parts",
        icon: Package,
      },
      {
        id: "locations" as WarehouseTab,
        label: isRtl ? "قفسه‌بندی و جایگاه‌ها" : "Bays & Locations",
        icon: MapPin,
      },
      {
        id: "transactions" as WarehouseTab,
        label: isRtl ? "گردش کالا (ورود/خروج)" : "Stock Transactions",
        icon: ArrowLeftRight,
      },
      {
        id: "receipts" as WarehouseTab,
        label: isRtl ? "رسیدها و حواله‌ها" : "Vouchers & Receipts",
        icon: FileText,
      },
    ],
    [isRtl]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_WAREHOUSE_ITEMS.filter((item) => {
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
  }, [search, selectedCategory]);

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Title: ESP Warehouse) ── */}
      <AppHeader
        tag="ESP Warehouse"
        subTag={isRtl ? "انبارداری و مدیریت قطعات کارخانه" : "Factory Warehouse & Inventory"}
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── 2. Unified Collapsible Sidebar Navigation ── */}
        <aside
          className={cn(
            "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6",
            "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
            sidebarOpen
              ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
          )}
        >
          <TooltipProvider delayDuration={150}>
            <div className="flex flex-col gap-1.5 px-2.5 sm:px-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                const buttonEl = (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3.5 w-full rounded-xl transition-all duration-150 text-sm font-medium cursor-pointer",
                      sidebarOpen ? "px-3.5 py-2.5" : "justify-center p-2.5 sm:p-3",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonEl;
              })}
            </div>
          </TooltipProvider>
        </aside>

        {/* ── 3. Main Content Container (Jump-Free Pure Fade Transition) ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Boxes className="size-5.5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "تعداد اقلام ثبت‌شده (SKU)" : "Registered SKUs"}
                  </div>
                  <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
                    {formatLocaleNumber(1420, isRtl)}{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "قلم کالا" : "SKUs"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Warehouse className="size-5.5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "موجودی فیزیکی کل قطعات" : "Total Physical Units"}
                  </div>
                  <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
                    {formatLocaleNumber(28540, isRtl)}{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "واحد" : "Units"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="size-5.5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "اقلام در حد سفارش" : "Low Stock Alerts"}
                  </div>
                  <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
                    {formatLocaleNumber(12, isRtl)}{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "هشدار" : "Alerts"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Truck className="size-5.5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "محموله‌های در راه" : "Inbound Shipments"}
                  </div>
                  <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
                    {formatLocaleNumber(4, isRtl)}{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "بارنامه" : "Shipments"}</span>
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
                    placeholder={
                      isRtl
                        ? "جستجوی قطعه، کد کالا (SKU)، جایگاه قفسه یا دسته‌بندی..."
                        : "Search by part title, SKU, location or category..."
                    }
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
                    className="h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>{isRtl ? "ثبت ورودی جدید کالا" : "New Stock Entry"}</span>
                  </Button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
                  <Filter className="size-3" />
                  <span>{isRtl ? "گروه کالایی:" : "Category:"}</span>
                </span>

                {CATEGORIES.map((cat) => {
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
                    <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "شناسه کالا (SKU)" : "SKU"}</TableHead>
                    <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "عنوان قطعه و مشخصات فنی" : "Part Description"}</TableHead>
                    <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "گروه انبار" : "Category"}</TableHead>
                    <TableHead className="text-xs font-bold text-foreground py-3.5">{isRtl ? "موقعیت در انبار" : "Storage Location"}</TableHead>
                    <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{isRtl ? "موجودی جاری" : "Current Stock"}</TableHead>
                    <TableHead className="text-xs font-bold text-foreground py-3.5 text-center">{isRtl ? "وضعیت انبار" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <TableCell className="py-3 font-mono text-xs font-bold text-primary">
                        {item.sku}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-foreground">{isRtl ? item.nameFa : item.nameEn}</div>
                          <div className="text-[11px] text-muted-foreground font-sans">{isRtl ? item.nameEn : item.nameFa}</div>
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
                            <span>{isRtl ? "موجود در انبار" : "In Stock"}</span>
                          </Badge>
                        )}
                        {item.status === "low_stock" && (
                          <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
                            <AlertTriangle className="size-3" />
                            <span>{isRtl ? "حد نصاب سفارش" : "Low Stock"}</span>
                          </Badge>
                        )}
                        {item.status === "critical" && (
                          <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold gap-1">
                            <AlertTriangle className="size-3" />
                            <span>{isRtl ? "کسری بحرانی" : "Critical"}</span>
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
