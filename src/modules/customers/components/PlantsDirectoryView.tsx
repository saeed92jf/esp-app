// src/modules/customers/components/PlantsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Factory,
  Flame,
  Search,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  Gauge,
  Cpu,
  Building2,
  ExternalLink,
  Info,
  Droplets,
  Boxes,
  Zap,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IRANIAN_PLANTS } from "../data/plants.data";
import type { PlantFacility, PlantProcessType } from "../types/plants.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PROCESS_TABS: { id: PlantProcessType | "all"; labelFa: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }[] = [
  { id: "all", labelFa: "همه پلنت‌ها", labelEn: "All Plants", icon: Factory },
  { id: "olefin", labelFa: "واحدهای الفین (اتیلن/پروپیلن)", labelEn: "Olefin Steam Crackers", icon: Flame, highlight: true },
  { id: "aromatic", labelFa: "آروماتیک (بنزن/زایلین)", labelEn: "Aromatics", icon: Boxes },
  { id: "methanol", labelFa: "متانول", labelEn: "Methanol", icon: Droplets },
  { id: "urea_ammonia", labelFa: "اوره و آمونیاک", labelEn: "Urea & Ammonia", icon: Sparkles },
  { id: "polymer", labelFa: "پلیمر و PET/PVC", labelEn: "Polymers", icon: Layers },
  { id: "refinery", labelFa: "پالایشگاه‌های نفت و گاز", labelEn: "Refineries", icon: Factory },
  { id: "utility", labelFa: "یوتیلیتی متمرکز", labelEn: "Utilities", icon: Zap },
];

export function PlantsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const urlPlantId = searchParams.get("id");

  const [selectedProcess, setSelectedProcess] = useState<PlantProcessType | "all">("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<PlantFacility | null>(null);

  useEffect(() => {
    if (urlPlantId) {
      const found = IRANIAN_PLANTS.find((p) => p.id === urlPlantId);
      if (found) {
        setSelectedPlant(found);
      }
    }
  }, [urlPlantId]);

  // Filtered dataset
  const filteredPlants = useMemo(() => {
    return IRANIAN_PLANTS.filter((plant) => {
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
          plant.feedstockFa.toLowerCase().includes(q);

        const matchLicensor = plant.licensors.some((l) => l.toLowerCase().includes(q));
        const matchProducts = plant.mainProductsFa.some((p) => p.toLowerCase().includes(q));

        return matchName || matchLicensor || matchProducts;
      }

      return true;
    });
  }, [selectedProcess, selectedZone, search]);

  // Specific Olefin plants count
  const olefinCount = useMemo(() => {
    return IRANIAN_PLANTS.filter((p) => p.processType === "olefin").length;
  }, []);

  const getProcessBadgeColor = (type: PlantProcessType) => {
    switch (type) {
      case "olefin":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "aromatic":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "methanol":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "urea_ammonia":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "polymer":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "refinery":
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
      case "utility":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  const getProcessLabel = (type: PlantProcessType) => {
    switch (type) {
      case "olefin":
        return isRtl ? "واحد الفین (اتان/نفتا کراکر)" : "Olefin Steam Cracker";
      case "aromatic":
        return isRtl ? "مجتمع آروماتیک" : "Aromatics Complex";
      case "methanol":
        return isRtl ? "واحد متانول" : "Methanol Plant";
      case "urea_ammonia":
        return isRtl ? "واحد اوره و آمونیاک" : "Urea & Ammonia Plant";
      case "polymer":
        return isRtl ? "واحد پلیمری / PET / PVC" : "Polymer Plant";
      case "refinery":
        return isRtl ? "پالایشگاه نفت و میعانات" : "Refinery Plant";
      case "utility":
        return isRtl ? "یوتیلیتی متمرکز فرآیندی" : "Central Utility";
      default:
        return isRtl ? "واحد فرآیندی" : "Process Plant";
    }
  };

  return (
    <div className="space-y-6 w-full text-start animate-in fade-in duration-200">
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              {IRANIAN_PLANTS.length} <span className="text-xs font-normal text-muted-foreground">{isRtl ? "واحد اصلی" : "Units"}</span>
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              {olefinCount} <span className="text-xs font-normal text-muted-foreground">{isRtl ? "الفین فعال" : "Crackers"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Gauge className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "ظرفیت اتیلن کراکرها" : "Total Ethylene Capacity"}
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              ۱۰.۲+ <span className="text-xs font-normal text-muted-foreground">{isRtl ? "میلیون تن" : "Million Tons"}</span>
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              ۸ <span className="text-xs font-normal text-muted-foreground">{isRtl ? "شرکت برتر" : "Licensors"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Process Type Filter Pills (Focus on Olefin & others) ── */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-2">
            <Filter className="size-3.5 text-primary" />
            <span>{isRtl ? "دسته‌بندی بر اساس نوع فرآیند و واحد شیمیایی:" : "Filter by Chemical Process Unit:"}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? `نمایش ${filteredPlants.length} پلنت` : `Showing ${filteredPlants.length} plants`}
          </span>
        </div>

        {/* Process Types Bar */}
        <div className="flex flex-wrap gap-2">
          {PROCESS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedProcess === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedProcess(tab.id)}
                className={cn(
                  "h-9 px-3.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer select-none border outline-none",
                  isSelected
                    ? tab.id === "olefin"
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm font-bold ring-2 ring-amber-400/40"
                      : "bg-primary text-white border-primary shadow-sm font-bold ring-2 ring-primary/40"
                    : tab.highlight
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 font-semibold"
                    : "bg-background text-foreground/80 border-border/70 hover:border-border hover:bg-muted/30"
                )}
              >
                <Icon className={cn("size-3.5 shrink-0", isSelected ? "text-white" : tab.highlight ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar: Region Filter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isRtl
                  ? "جستجو در نام پلنت، مجتمع (جم، آریا ساسول، نوری...)، لایسنسور (Linde, Technip...)"
                  : "Search plant, complex, licensor (Linde, Technip...), products..."
              }
              className="ps-9 h-9 text-xs rounded-xl bg-background border-border/70"
            />
          </div>

          {/* Region zone pills */}
          <div className="flex items-center gap-1.5 text-xs self-start sm:self-center overflow-x-auto">
            <span className="text-muted-foreground text-[11px] me-1 shrink-0">{isRtl ? "منطقه:" : "Zone:"}</span>
            {[
              { id: "all", labelFa: "همه مناطق", labelEn: "All Zones" },
              { id: "assaluyeh", labelFa: "عسلویه (PSEEZ)", labelEn: "Assaluyeh" },
              { id: "mahshahr", labelFa: "ماهشهر (PETZONE)", labelEn: "Mahshahr" },
              { id: "other_provinces", labelFa: "سایر استان‌ها", labelEn: "Other" },
            ].map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setSelectedZone(zone.id)}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border",
                  selectedZone === zone.id
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60"
                )}
              >
                {isRtl ? zone.labelFa : zone.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Plants Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-all duration-200"
          >
            <div className="space-y-3">
              {/* Top Row: Code, Badge & TSE Symbol */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-mono font-bold px-2.5 py-0.5 border", getProcessBadgeColor(plant.processType))}
                  >
                    {plant.code}
                  </Badge>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {getProcessLabel(plant.processType)}
                  </span>
                </div>

                {plant.tseSymbol && (
                  <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">
                    {isRtl ? `نماد: ${plant.tseSymbol}` : plant.tseSymbol}
                  </Badge>
                )}
              </div>

              {/* Plant Logo & Name & Complex */}
              <div className="flex items-start gap-3.5">
                <div className="relative size-13 sm:size-14 rounded-2xl bg-white dark:bg-card border border-border/80 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {plant.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={plant.logoUrl}
                      alt={plant.nameFa}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Factory className="size-6 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {plant.nameFa}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground/90">
                      <Building2 className="size-3.5 text-primary shrink-0" />
                      <span>{plant.complexNameFa}</span>
                    </div>
                    {plant.holdingNameFa && (
                      <>
                        <span>•</span>
                        {plant.holdingId && plant.holdingId !== "private" && plant.holdingId !== "governmental" ? (
                          <Link
                            href={`/customers?tab=holdings&id=${plant.holdingId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline px-1.5 py-0.5 rounded bg-primary/10 transition-colors"
                            title={isRtl ? "مشاهده هلدینگ در تب هلدینگ‌ها" : "View holding"}
                          >
                            <Landmark className="size-3" />
                            <span>{plant.holdingNameFa}</span>
                          </Link>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">{plant.holdingNameFa}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {plant.descriptionFa}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "ظرفیت اسمی سالانه" : "Nominal Capacity"}</span>
                  <span className="font-bold text-foreground block mt-0.5 text-xs truncate">
                    {plant.nominalCapacityFa}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "خوراک ورودی" : "Feedstock"}</span>
                  <span className="font-medium text-foreground block mt-0.5 text-xs truncate">
                    {plant.feedstockFa}
                  </span>
                </div>
              </div>

              {/* Licensors */}
              {plant.licensors && plant.licensors.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                  <span className="text-[10.5px] text-muted-foreground">{isRtl ? "لایسنسور:" : "Licensors:"}</span>
                  {plant.licensors.map((lic, lIdx) => (
                    <Badge
                      key={lIdx}
                      variant="outline"
                      className="text-[10.5px] bg-background font-medium py-0 px-2 border-border/80"
                    >
                      {lic}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Products */}
              {plant.mainProductsFa && plant.mainProductsFa.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-[10.5px] text-muted-foreground">{isRtl ? "محصولات:" : "Products:"}</span>
                  {plant.mainProductsFa.map((prod, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/40 text-foreground/80 font-medium"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card Actions & Cross Links */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate max-w-[200px]">
                  <MapPin className="size-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate">{plant.locationFa}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/customers?search=${encodeURIComponent(plant.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground rounded-lg border border-border/60 hover:bg-muted/30 inline-flex items-center gap-1 transition-colors"
                    title={isRtl ? "جستجو در بانک مشتریان یورواسلات" : "Search in clients"}
                  >
                    <Search className="size-3" />
                    <span>{isRtl ? "کارفرمایان ESP" : "ESP Clients"}</span>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlant(plant)}
                    className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer font-bold px-2.5"
                  >
                    <span>{isRtl ? "مشخصات فنی" : "Specs"}</span>
                    <Info className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Sources Footer */}
              <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                <div className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
                  <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-foreground/80">{isRtl ? "مراجع داده:" : "Sources:"}</span>
                  <span className="text-foreground/70">
                    {plant.sources ? plant.sources.map((s) => s.publisherFa).join(" • ") : (isRtl ? "شرکت ملی صنایع پتروشیمی (NPC) • کدال • لایسنسور رسمی" : "NPC • Codal • Licensors")}
                  </span>
                </div>
                <div className="flex items-center gap-2 ms-auto">
                  {plant.codalUrl && (
                    <a
                      href={plant.codalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 text-[10.5px] font-mono"
                    >
                      <span>{isRtl ? "کدال" : "Codal"}</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  )}
                  {plant.website && (
                    <a
                      href={plant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1 text-[10.5px]"
                    >
                      <span>{isRtl ? "سایت" : "Web"}</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlants.length === 0 && (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          {isRtl ? "پلنتی با این مشخصات یافت نشد." : "No plant matched your criteria."}
        </div>
      )}

      {/* ── 4. Detailed Technical Plant Modal ── */}
      {selectedPlant && (
        <Dialog open={Boolean(selectedPlant)} onOpenChange={() => setSelectedPlant(null)}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[24px]">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3.5">
                <div className="relative size-14 rounded-2xl bg-white dark:bg-card border border-border/80 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {selectedPlant.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedPlant.logoUrl}
                      alt={selectedPlant.nameFa}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Flame className="size-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selectedPlant.nameFa}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedPlant.complexNameFa} • {selectedPlant.code}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-start">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                <span className="text-xs font-bold text-foreground">{isRtl ? "شرح فرآیند و کارکرد:" : "Process Details:"}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedPlant.descriptionFa}
                </p>
              </div>

              {selectedPlant.reactorOrFurnaceInfoFa && (
                <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Flame className="size-3.5" />
                    <span>{isRtl ? "مشخصات کوره‌ها و راکتورهای پیرولیز / کاتالیستی:" : "Furnaces & Reactors:"}</span>
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                    {selectedPlant.reactorOrFurnaceInfoFa}
                  </p>
                </div>
              )}

              {selectedPlant.espInstalledBase && (
                <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/20 space-y-1.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Cpu className="size-3.5" />
                    <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های صنعتی ESP:" : "ESP Installed Base:"}</span>
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedPlant.espInstalledBase}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "موقعیت جغرافیایی" : "Location"}</span>
                  <span className="font-semibold text-foreground block">{selectedPlant.locationFa}</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "سال راه‌اندازی" : "Commission Year"}</span>
                  <span className="font-semibold text-foreground block font-mono">{selectedPlant.commissionedYear || "---"}</span>
                </div>
              </div>

              {/* Cross-Link Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                {selectedPlant.holdingId && selectedPlant.holdingId !== "private" && selectedPlant.holdingId !== "governmental" && (
                  <Link
                    href={`/customers?tab=holdings&id=${selectedPlant.holdingId}`}
                    onClick={() => setSelectedPlant(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Landmark className="size-3.5" />
                    <span>{isRtl ? `مشاهده هلدینگ مادر (${selectedPlant.holdingNameFa || "هلدینگ"})` : `View Holding (${selectedPlant.holdingNameFa})`}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                )}

                <Link
                  href={`/customers?search=${encodeURIComponent(selectedPlant.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                  onClick={() => setSelectedPlant(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border/70 hover:bg-muted/30 transition-colors"
                >
                  <Search className="size-3.5" />
                  <span>{isRtl ? "جستجو در فهرست کارفرمایان Euroslot" : "Search in Euroslot Directory"}</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>

              {/* Verified Sources */}
              {selectedPlant.sources && selectedPlant.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "اسناد و مراجع اطلاعات این پلنت:" : "Verified Sources:"}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPlant.sources.map((src, sIdx) => (
                      <div key={sIdx} className="p-2.5 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">{src.titleFa}</div>
                          <div className="text-[11px] text-muted-foreground">{src.publisherFa}</div>
                        </div>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ps-2"
                          >
                            <span>{isRtl ? "مشاهده مرجع" : "View"}</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

