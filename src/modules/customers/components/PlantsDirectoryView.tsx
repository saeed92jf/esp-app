// src/modules/customers/components/PlantsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Factory,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  Gauge,
  Cpu,
  ArrowUpRight,
  ArrowUpDown,
  Calendar,
  BarChart3,
  Download,
  X,
  Droplets,
  Boxes,
  Zap,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAllUnifiedPlants } from "../utils/petro-unifier";
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import { PlantDetailModal } from "./PlantDetailModal";
import {
  getPlantDisplayName,
  getPlantDisplayComplex,
  getPlantDisplayProcessLabel,
  getPlantDisplayZoneLabel,
  getPlantDisplayDescription,
  getPlantDisplayCapacity,
  getPlantDisplayYear,
} from "../utils/plant-translations";
import type { PlantFacility, PlantProcessType } from "../types/plants.types";

export type PlantSortOption =
  | "default"
  | "capacity_desc"
  | "capacity_asc"
  | "year_desc"
  | "year_asc"
  | "code_asc"
  | "name_asc";

const PROCESS_TABS: {
  id: PlantProcessType | "all";
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}[] = [
  { id: "all", labelFa: "همه پلنت‌ها", labelEn: "All Plants", icon: Factory },
  { id: "olefin", labelFa: "واحدهای الفین (اتیلن/پروپیلن)", labelEn: "Olefin Steam Crackers", icon: Flame, highlight: true },
  { id: "aromatic", labelFa: "آروماتیک (بنزن/زایلین)", labelEn: "Aromatics", icon: Boxes },
  { id: "methanol", labelFa: "متانول", labelEn: "Methanol", icon: Droplets },
  { id: "urea_ammonia", labelFa: "اوره و آمونیاک", labelEn: "Urea & Ammonia", icon: Sparkles },
  { id: "polymer", labelFa: "پلیمر و PET/PVC", labelEn: "Polymers", icon: Layers },
  { id: "refinery", labelFa: "پالایشگاه‌های نفت و گاز", labelEn: "Refineries", icon: Factory },
  { id: "chemicals", labelFa: "صنایع شیمیایی و واسطه", labelEn: "Chemicals", icon: Cpu },
  { id: "utility", labelFa: "یوتیلیتی متمرکز", labelEn: "Utilities", icon: Zap },
];

function getProcessBadgeColor(type: PlantProcessType): string {
  switch (type) {
    case "olefin":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "aromatic":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30";
    case "methanol":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
    case "urea_ammonia":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "polymer":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
    case "refinery":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    case "chemicals":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
    case "utility":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30";
    default:
      return "bg-primary/10 text-primary border-primary/30";
  }
}

export function PlantsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const urlPlantId = searchParams.get("id");

  const [selectedProcess, setSelectedProcess] = useState<PlantProcessType | "all">("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<PlantSortOption>("default");

  const [selectedPlant, setSelectedPlant] = useState<PlantFacility | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [allPlants, setAllPlants] = useState<PlantFacility[]>(() => getAllUnifiedPlants());

  useEffect(() => {
    setAllPlants(getAllUnifiedPlants());
    const onStorage = () => setAllPlants(getAllUnifiedPlants());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Auto-open modal if URL has ?id=xxx
  useEffect(() => {
    if (urlPlantId) {
      const found = allPlants.find((p) => p.id === urlPlantId);
      if (found) {
        setSelectedPlant(found);
        setIsDetailModalOpen(true);
      }
    }
  }, [urlPlantId, allPlants]);

  const handleOpenDetail = (plant: PlantFacility) => {
    setSelectedPlant(plant);
    setIsDetailModalOpen(true);
  };

  // Filtered and Sorted dataset
  const filteredPlants = useMemo(() => {
    const list = allPlants.filter((plant) => {
      // Process filter
      if (selectedProcess !== "all" && plant.processType !== selectedProcess) {
        return false;
      }

      // Zone filter
      if (selectedZone !== "all" && plant.locationZone !== selectedZone) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName =
          plant.nameFa.toLowerCase().includes(q) ||
          plant.nameEn.toLowerCase().includes(q) ||
          plant.complexNameFa.toLowerCase().includes(q) ||
          plant.code.toLowerCase().includes(q) ||
          plant.cityFa.toLowerCase().includes(q) ||
          plant.provinceFa.toLowerCase().includes(q) ||
          plant.feedstockFa.toLowerCase().includes(q) ||
          (plant.holdingNameFa && plant.holdingNameFa.toLowerCase().includes(q));

        const matchLicensor = plant.licensors?.some((l) => l.toLowerCase().includes(q));
        const matchProducts = plant.mainProductsFa?.some((p) => p.toLowerCase().includes(q));

        return matchName || matchLicensor || matchProducts;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "capacity_desc":
          return (b.capacityTonsPerYear ?? 0) - (a.capacityTonsPerYear ?? 0);
        case "capacity_asc":
          return (a.capacityTonsPerYear ?? 0) - (b.capacityTonsPerYear ?? 0);
        case "year_desc":
          return (b.commissionedYear ?? 0) - (a.commissionedYear ?? 0);
        case "year_asc":
          return (a.commissionedYear ?? 9999) - (b.commissionedYear ?? 9999);
        case "code_asc": {
          const numA = parseInt(a.code.replace(/\D/g, "") || "0", 10);
          const numB = parseInt(b.code.replace(/\D/g, "") || "0", 10);
          if (numA && numB && numA !== numB) return numA - numB;
          return a.code.localeCompare(b.code);
        }
        case "name_asc":
          return isRtl
            ? a.nameFa.localeCompare(b.nameFa, "fa")
            : a.nameEn.localeCompare(b.nameEn, "en");
        case "default":
        default:
          return 0;
      }
    });
  }, [allPlants, selectedProcess, selectedZone, search, sortBy, isRtl]);

  // Aggregate Metrics
  const olefinCount = useMemo(() => {
    return allPlants.filter((p) => p.processType === "olefin").length;
  }, [allPlants]);

  const totalCapacityMillionTons = useMemo(() => {
    const sum = allPlants.reduce((acc, p) => acc + (p.capacityTonsPerYear ?? 0), 0);
    return Math.round(sum / 1_000_000);
  }, [allPlants]);

  const licensorsCount = useMemo(() => {
    const set = new Set<string>();
    allPlants.forEach((p) => {
      p.licensors?.forEach((l) => {
        if (l && l.trim()) set.add(l.trim());
      });
    });
    return set.size;
  }, [allPlants]);

  return (
    <div className="space-y-6 w-full text-start animate-in fade-in duration-150">
      {/* ── 1. Top Metrics Banner ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Factory className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "کل پلنت‌ها و واحدهای شاخص" : "Process Plants"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(allPlants.length, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "واحد اصلی" : "Units"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "پتروشیمی‌های الفینی ایران" : "Olefin Steam Crackers"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(olefinCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "الفین فعال" : "Crackers"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Gauge className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "مجموع ظرفیت اسمی ثبت‌شده" : "Total Nominal Capacity"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalCapacityMillionTons, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "میلیون تن" : "Million Tons"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Cpu className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "لایسنسورهای شاخص جهانی" : "Global Licensors"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(licensorsCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "صاحب دانش فنی" : "Licensors"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Process Type Filter Pills & Search ── */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-2">
            <Filter className="size-3.5 text-primary" />
            <span>{isRtl ? "دسته‌بندی بر اساس نوع فرآیند و واحد شیمیایی:" : "Filter by Chemical Process Unit:"}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? (
              <span>نمایش <strong className="text-foreground">{formatLocaleNumber(filteredPlants.length, true)}</strong> پلنت</span>
            ) : (
              <span>Showing <strong className="text-foreground">{filteredPlants.length}</strong> plants</span>
            )}
          </span>
        </div>

        {/* Process Types Bar */}
        <div className="flex flex-wrap gap-2">
          {PROCESS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedProcess === tab.id;

            return (
              <Button
                key={tab.id}
                type="button"
                variant={isSelected ? "default" : tab.highlight ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedProcess(tab.id)}
                className={cn(
                  "h-9 px-3.5 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-all",
                  isSelected
                    ? tab.id === "olefin"
                      ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm font-bold ring-2 ring-amber-400/40"
                      : "bg-primary text-primary-foreground shadow-sm font-bold ring-2 ring-primary/40"
                    : tab.highlight
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 font-semibold"
                    : "border-border/70 hover:border-border hover:bg-muted/30"
                )}
              >
                <Icon className={cn("size-3.5 shrink-0", isSelected ? "text-white" : tab.highlight ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
              </Button>
            );
          })}
        </div>

        {/* Sub-bar: Search, Region Filter & Sort Options */}
        <div className="flex flex-col gap-3 pt-2.5 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isRtl
                    ? "جستجو در نام پلنت، مجتمع (جم، آریا ساسول، نوری...)، لایسنسور، محصولات..."
                    : "Search plant, complex (Jam, Arya Sasol, Nouri...), licensor, products..."
                }
                className="ps-9 pe-8 h-9 text-xs rounded-xl bg-background border-border/70"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSearch("")}
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1 shrink-0 font-medium">
                <ArrowUpDown className="size-3.5 text-primary" />
                <span>{isRtl ? "مرتب‌سازی:" : "Sort By:"}</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as PlantSortOption)}
                className="h-8 px-2.5 text-xs rounded-xl border border-border/80 bg-background text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
              >
                <option value="default">{isRtl ? "پیش‌فرض فرآیندی" : "Default Process Order"}</option>
                <option value="capacity_desc">{isRtl ? "بیشترین ظرفیت اسمی (نزولی)" : "Highest Capacity"}</option>
                <option value="capacity_asc">{isRtl ? "کمترین ظرفیت اسمی (صعودی)" : "Lowest Capacity"}</option>
                <option value="year_desc">{isRtl ? "جدیدترین سال احداث / راه‌اندازی" : "Newest Commissioned"}</option>
                <option value="year_asc">{isRtl ? "قدیمی‌ترین واحد / پیشگامان تاریخی" : "Oldest / Historical"}</option>
                <option value="code_asc">{isRtl ? "شماره واحد (الفین ۱ تا ۱۳ و...)" : "Unit Code"}</option>
                <option value="name_asc">{isRtl ? "نام واحد (الفبایی)" : "Alphabetical (A-Z)"}</option>
              </select>
            </div>
          </div>

          {/* Quick Filter & Sort Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
            {/* Region zone pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-muted-foreground text-[11px] me-1 shrink-0">{isRtl ? "منطقه:" : "Zone:"}</span>
              {[
                { id: "all", labelFa: "همه مناطق", labelEn: "All Zones" },
                { id: "assaluyeh", labelFa: "عسلویه (PSEEZ)", labelEn: "Assaluyeh" },
                { id: "mahshahr", labelFa: "ماهشهر (PETZONE)", labelEn: "Mahshahr" },
                { id: "other_provinces", labelFa: "سایر استان‌ها", labelEn: "Other" },
              ].map((zone) => (
                <Button
                  key={zone.id}
                  type="button"
                  variant={selectedZone === zone.id ? "default" : "outline"}
                  size="xs"
                  onClick={() => setSelectedZone(zone.id)}
                  className={cn(
                    "h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all",
                    selectedZone === zone.id
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60"
                  )}
                >
                  {isRtl ? zone.labelFa : zone.labelEn}
                </Button>
              ))}
            </div>

            {/* Quick Sort Shortcuts */}
            <div className="flex items-center gap-1.5 ms-auto">
              <Button
                type="button"
                variant={sortBy === "capacity_desc" ? "default" : "outline"}
                size="xs"
                onClick={() => setSortBy(sortBy === "capacity_desc" ? "default" : "capacity_desc")}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium gap-1 cursor-pointer",
                  sortBy === "capacity_desc"
                    ? "bg-primary text-white border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60"
                )}
                title={isRtl ? "مرتب‌سازی بر اساس بیشترین ظرفیت تولید" : "Sort by highest capacity"}
              >
                <BarChart3 className="size-3" />
                <span>{isRtl ? "بیشترین ظرفیت" : "Highest Capacity"}</span>
              </Button>

              <Button
                type="button"
                variant={sortBy === "year_desc" || sortBy === "year_asc" ? "default" : "outline"}
                size="xs"
                onClick={() => setSortBy(sortBy === "year_desc" ? "year_asc" : sortBy === "year_asc" ? "default" : "year_desc")}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium gap-1 cursor-pointer",
                  sortBy === "year_desc" || sortBy === "year_asc"
                    ? "bg-primary text-white border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60"
                )}
                title={isRtl ? "مرتب‌سازی بر اساس سال احداث و بهره‌برداری" : "Sort by commissioning year"}
              >
                <Calendar className="size-3" />
                <span>
                  {sortBy === "year_desc"
                    ? isRtl ? "جدیدترین احداث" : "Newest"
                    : sortBy === "year_asc"
                    ? isRtl ? "قدیمی‌ترین احداث" : "Oldest"
                    : isRtl ? "سال احداث" : "Commission Year"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Plants Responsive Cards Grid (کارتی خلوت و خوشگل مثل هولدینگ‌ها) ── */}
      {filteredPlants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <Factory className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">
            {isRtl ? "پلنتی با این مشخصات یافت نشد." : "No plants found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRtl
              ? "عبارت جستجو یا فیلترهای فرآیندی را تغییر دهید."
              : "Try adjusting your search criteria or process filter."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedProcess("all");
              setSelectedZone("all");
            }}
            className="rounded-xl text-xs"
          >
            {isRtl ? "پاک کردن فیلترها" : "Reset Filters"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPlants.map((plant) => {
            const displayName = getPlantDisplayName(plant, isRtl);
            const displayComplex = getPlantDisplayComplex(plant, isRtl);
            const displayProcess = getPlantDisplayProcessLabel(plant.processType, isRtl);
            const displayZone = getPlantDisplayZoneLabel(plant.locationZone, isRtl);
            const displayCapacity = getPlantDisplayCapacity(plant, isRtl);
            const displayDescription = getPlantDisplayDescription(plant, isRtl);
            const displayYear = getPlantDisplayYear(plant, isRtl);

            return (
              <div
                key={plant.id}
                onClick={() => handleOpenDetail(plant)}
                className="group rounded-2xl border border-border/80 hover:border-primary/50 bg-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer text-start relative overflow-hidden"
              >
                {/* Top Section: Logo & Core Specs */}
                <div className="space-y-4">
                  {/* 1. Large Crisp Logo Showcase */}
                  <div className="relative group/logo-thumb w-full">
                    <div className="w-full h-36 sm:h-40 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-border/70 p-4 sm:p-5 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-primary/40 group-hover:shadow-xs transition-all">
                      {plant.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={plant.logoUrl}
                          alt={displayName}
                          className="max-h-24 sm:max-h-28 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105 select-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-1.5 text-primary/70 group-hover:text-primary transition-colors">
                          <Factory className="size-10" />
                          <span className="text-sm font-bold font-mono tracking-wider">{plant.code}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Logo Download Button */}
                    {plant.logoUrl && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = await downloadLogo(plant.logoUrl || "", displayName);
                          if (ok) {
                            toast.success(isRtl ? "لوگو با موفقیت دانلود شد." : "Logo downloaded successfully.");
                          }
                        }}
                        className="size-7 rounded-lg absolute top-2.5 end-2.5 bg-background/90 backdrop-blur-xs border border-border shadow-xs opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                        title={isRtl ? "دانلود فایل باکیفیت لوگو" : "Download Logo"}
                      >
                        <Download className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* 2. Top Badges Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] py-0 px-2 h-5 font-semibold border", getProcessBadgeColor(plant.processType))}
                    >
                      <Factory className="size-3 me-1 shrink-0" />
                      <span>{displayProcess}</span>
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-2 h-5 font-medium border-border/70"
                    >
                      <span>{displayZone}</span>
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 h-5 font-mono font-bold text-primary bg-primary/5 border-primary/20 ms-auto"
                    >
                      {plant.code}
                    </Badge>
                  </div>

                  {/* 3. Plant Title & Complex Subtitle */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">
                      {displayComplex}
                    </p>
                  </div>

                  {/* 4. Description (2 lines max) */}
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {displayDescription}
                  </p>
                </div>

                {/* Bottom Section: Key Metrics & CTA */}
                <div className="pt-4 mt-4 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                    {/* Capacity metric */}
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
                      <Gauge className="size-3.5 text-primary shrink-0" />
                      <span>{displayCapacity}</span>
                    </span>

                    {/* Commissioned Year */}
                    <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                      <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                      <span>{displayYear}</span>
                    </span>
                  </div>

                  {/* View Details Action Button */}
                  <div className="w-full h-8.5 rounded-xl bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground border border-border/70 group-hover:border-primary flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground transition-all shadow-2xs">
                    <Info className="size-3.5" />
                    <span>{isRtl ? "مشاهده شناسنامه و مشخصات فنی" : "View Plant Technical Dossier"}</span>
                    <ArrowUpRight className="size-3.5 ms-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Luxury Tabbed Plant Detail Popup Modal ── */}
      <PlantDetailModal
        plant={selectedPlant}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPlant(null);
        }}
      />
    </div>
  );
}
