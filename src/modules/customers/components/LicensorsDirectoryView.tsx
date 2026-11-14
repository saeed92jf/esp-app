// src/modules/customers/components/LicensorsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Award,
  Search,
  Globe,
  Building2,
  Factory,
  Landmark,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  X,
  Download,
  Cpu,
  Flame,
  Check,
  MapPin,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import { IRANIAN_LICENSORS } from "../data/licensors.data";
import type { Licensor, LicensorCategory } from "../types/licensors.types";

const CATEGORY_TABS: { id: LicensorCategory; labelFa: string; labelEn: string }[] = [
  { id: "all", labelFa: "همه لایسنسورها", labelEn: "All Licensors" },
  { id: "polyolefin", labelFa: "پلی‌الفین‌ها (PE/PP)", labelEn: "Polyolefins (PE/PP)" },
  { id: "olefin", labelFa: "الفین و کراکینگ", labelEn: "Olefins & Cracking" },
  { id: "methanol_syngas", labelFa: "متانول و گاز سنتز", labelEn: "Methanol & Syngas" },
  { id: "aromatics", labelFa: "آروماتیک‌ها و بنزن", labelEn: "Aromatics & BTX" },
  { id: "fertilizer_urea", labelFa: "اوره و آمونیاک", labelEn: "Urea & Fertilizer" },
  { id: "chlor_alkali", labelFa: "کلرآلکالی و PVC", labelEn: "Chlor-Alkali & PVC" },
  { id: "refining_gas", labelFa: "پالایش و فرآورش گاز", labelEn: "Refining & Gas" },
];

export function LicensorsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const initialLicensorId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<LicensorCategory>("all");
  const [selectedLicensor, setSelectedLicensor] = useState<Licensor | null>(null);

  useEffect(() => {
    if (initialLicensorId) {
      const found = IRANIAN_LICENSORS.find((l) => l.id === initialLicensorId);
      if (found) {
        setSelectedLicensor(found);
      }
    }
  }, [initialLicensorId]);

  const filteredLicensors = useMemo(() => {
    const q = search.trim().toLowerCase();

    return IRANIAN_LICENSORS.filter((licensor) => {
      // Category check
      if (selectedCategory !== "all") {
        if (!licensor.processCategories.includes(selectedCategory)) {
          return false;
        }
      }

      if (!q) return true;

      const matchName =
        licensor.nameFa.toLowerCase().includes(q) ||
        licensor.nameEn.toLowerCase().includes(q) ||
        licensor.countryFa.toLowerCase().includes(q) ||
        licensor.countryEn.toLowerCase().includes(q) ||
        licensor.headquartersFa.toLowerCase().includes(q);

      const matchTech = licensor.keyTechnologies.some((t) => t.toLowerCase().includes(q));

      const matchPlants = licensor.licensedPlants.some(
        (p) =>
          p.plantNameFa.toLowerCase().includes(q) ||
          p.complexNameFa.toLowerCase().includes(q) ||
          p.unitTypeFa.toLowerCase().includes(q) ||
          (p.holdingNameFa && p.holdingNameFa.toLowerCase().includes(q))
      );

      return matchName || matchTech || matchPlants;
    });
  }, [search, selectedCategory]);

  // Aggregate Metrics
  const totalLicensors = IRANIAN_LICENSORS.length;
  const uniqueCountries = useMemo(() => {
    return new Set(IRANIAN_LICENSORS.map((l) => l.countryCode)).size;
  }, []);
  const totalPlantsLicensed = useMemo(() => {
    return IRANIAN_LICENSORS.reduce((sum, l) => sum + l.licensedPlants.length, 0);
  }, []);
  const totalTechnologies = useMemo(() => {
    return IRANIAN_LICENSORS.reduce((sum, l) => sum + l.keyTechnologies.length, 0);
  }, []);

  return (
    <div className="space-y-6 w-full text-start animate-in fade-in duration-150">
      {/* ── 1. Top Metrics Banner ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "لایسنسورهای معتبر جهان" : "Global Process Licensors"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalLicensors, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "شرکت صاحب‌نام" : "Leaders"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Globe className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "کشورهای صاحب تکنولوژی" : "Countries of Origin"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(uniqueCountries, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "کشور صنعتی" : "Countries"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Factory className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "واحدهای لایسنس‌شده ایران" : "Licensed Units in Iran"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalPlantsLicensed, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "پلنت فعال" : "Plants"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Cpu className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "پکیج‌های فرآیندی ثبت‌شده" : "Key Tech Packages"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalTechnologies, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "فناوری مهندسی" : "Technologies"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Category Filters Bar ── */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isRtl
                  ? "جستجو در نام لایسنسور (لیندی، تاپسو، باسل)، تکنولوژی، مجتمع، کشور..."
                  : "Search licensor (Linde, Topsoe, Basell), technology, plant, country..."
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

          <div className="text-xs text-muted-foreground">
            {isRtl ? (
              <span>نمایش <strong className="text-foreground">{formatLocaleNumber(filteredLicensors.length, true)}</strong> لایسنسور فرآیندی</span>
            ) : (
              <span>Showing <strong className="text-foreground">{filteredLicensors.length}</strong> process licensors</span>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{isRtl ? "حوزه فرآیند:" : "Category:"}</span>
          </span>

          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="xs"
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "h-7 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                {isRtl ? tab.labelFa : tab.labelEn}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Licensors Cards Grid ── */}
      {filteredLicensors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <Award className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">
            {isRtl ? "لایسنسوری با این مشخصات یافت نشد." : "No licensors found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRtl
              ? "عبارت جستجو یا دسته‌بندی فرآیندی را تغییر دهید."
              : "Try adjusting your search criteria or process category filter."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="rounded-xl text-xs"
          >
            {isRtl ? "پاک کردن فیلترها" : "Reset Filters"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLicensors.map((licensor) => {
            return (
              <div
                key={licensor.id}
                className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-150 flex flex-col justify-between gap-4 group"
              >
                {/* Header: Logo, Name, Country */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Logo Container with Download Action */}
                      <div className="relative group/logo shrink-0 flex flex-col items-center gap-1">
                        <div className="size-16 sm:size-18 rounded-2xl border border-border/80 bg-white dark:bg-card p-1.5 sm:p-2 flex items-center justify-center shadow-xs overflow-hidden transition-all group-hover/logo:border-primary/40">
                          {licensor.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={licensor.logoUrl}
                              alt={licensor.nameFa}
                              className="size-full object-contain transition-transform group-hover/logo:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Award className="size-7 text-primary/70" />
                          )}
                        </div>

                        {licensor.logoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = await downloadLogo(licensor.logoUrl, licensor.nameFa);
                              if (ok) {
                                toast.success(isRtl ? "لوگوی لایسنسور دانلود شد." : "Licensor logo downloaded.");
                              }
                            }}
                            className="h-5 px-1.5 text-[9.5px] gap-0.5 font-semibold text-muted-foreground hover:text-primary rounded border-border/60"
                            title={isRtl ? "دانلود فایل لوگوی باکیفیت" : "Download Logo"}
                          >
                            <Download className="size-2.5" />
                            <span>{isRtl ? "لوگو" : "Logo"}</span>
                          </Button>
                        )}
                      </div>

                      {/* Name & Origin */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {licensor.nameFa}
                          </h3>
                        </div>

                        <p className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
                          {licensor.nameEn}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="secondary" className="text-[10.5px] px-2 py-0 font-medium gap-1">
                            <Globe className="size-3 text-primary" />
                            <span>{licensor.countryFa}</span>
                          </Badge>
                          <span className="text-[11px] tabular-nums">
                            {isRtl ? `تأسیس: ${formatLocaleNumber(licensor.establishedYear, true)}` : `Est. ${licensor.establishedYear}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Website Link */}
                    {licensor.website && (
                      <a
                        href={licensor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                        title={licensor.website}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Brief Technical Description */}
                  <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
                    {licensor.descriptionFa}
                  </p>

                  {/* Key Technologies Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] text-muted-foreground font-semibold block">
                      {isRtl ? "تکنولوژی‌ها و بسته‌های فرآیندی شاخص:" : "Key Technologies:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {licensor.keyTechnologies.map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-[10px] bg-primary/[0.04] text-primary border-primary/20 font-medium px-2 py-0.5"
                        >
                          <Cpu className="size-2.5 me-1 text-primary inline" />
                          <span>{tech}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Licensed Plants in Iran (Clickable Cross-links) */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Factory className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{isRtl ? "پلنت‌ها و مجتمع‌های احداث‌شده در ایران:" : "Licensed Iranian Plants:"}</span>
                      </span>
                      <span className={cn("text-[10.5px] font-bold text-muted-foreground tabular-nums", isRtl && "fa-num")}>
                        {formatLocaleNumber(licensor.licensedPlants.length, isRtl)} {isRtl ? "پلنت" : "units"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {licensor.licensedPlants.slice(0, 4).map((p, pIdx) => (
                        <Link
                          key={pIdx}
                          href={`/customers?search=${encodeURIComponent(p.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                          className="text-[10.5px] text-foreground/80 hover:text-primary bg-muted/40 hover:bg-primary/10 border border-border/60 hover:border-primary/30 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 truncate max-w-[220px]"
                          title={`${p.plantNameFa} (${p.nominalCapacityFa || ""})`}
                        >
                          <span className="truncate">{p.plantNameFa.replace('واحد ', '')}</span>
                          <ArrowUpRight className="size-2.5 shrink-0 text-muted-foreground" />
                        </Link>
                      ))}
                      {licensor.licensedPlants.length > 4 && (
                        <span
                          onClick={() => setSelectedLicensor(licensor)}
                          className="text-[10px] text-primary hover:underline cursor-pointer flex items-center px-1 font-semibold"
                        >
                          +{formatLocaleNumber(licensor.licensedPlants.length - 4, isRtl)} {isRtl ? "مورد دیگر..." : "more..."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    <span>{isRtl ? "مراجع معتبر: NPC و کدال" : "Verified: NPC & Codal"}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLicensor(licensor)}
                    className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer font-bold px-3"
                  >
                    <span>{isRtl ? "پرونده فنی و تجهیزات" : "Technical Dossier"}</span>
                    <Info className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Detailed Technical Modal ── */}
      {selectedLicensor && (
        <Dialog open={Boolean(selectedLicensor)} onOpenChange={() => setSelectedLicensor(null)}>
          <DialogContent className="sm:max-w-[740px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[24px]">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-4">
                {/* Large Logo with Download Action */}
                <div className="relative group/modal-logo shrink-0 flex flex-col items-center gap-1.5">
                  <div className="size-20 sm:size-24 rounded-2xl bg-white dark:bg-card border border-border/80 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden transition-all group-hover/modal-logo:shadow-md group-hover/modal-logo:border-primary/40">
                    {selectedLicensor.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedLicensor.logoUrl}
                        alt={selectedLicensor.nameFa}
                        className="size-full object-contain transition-transform group-hover/modal-logo:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Award className="size-10 text-primary/70" />
                    )}
                  </div>

                  {selectedLicensor.logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await downloadLogo(selectedLicensor.logoUrl, selectedLicensor.nameFa);
                        if (ok) {
                          toast.success(isRtl ? "لوگوی لایسنسور دانلود شد." : "Licensor logo downloaded.");
                        }
                      }}
                      className="h-6 px-2 text-[10px] gap-1 font-semibold text-muted-foreground hover:text-primary rounded-lg border-border/60"
                      title={isRtl ? "دانلود فایل لوگوی باکیفیت" : "Download Logo"}
                    >
                      <Download className="size-3" />
                      <span>{isRtl ? "دانلود لوگو" : "Download"}</span>
                    </Button>
                  )}
                </div>

                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selectedLicensor.nameFa}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedLicensor.nameEn} • {selectedLicensor.headquartersFa}
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10.5px]">
                      {isRtl ? `کشور مبدأ: ${selectedLicensor.countryFa}` : selectedLicensor.countryEn}
                    </Badge>
                    <Badge variant="outline" className="text-[10.5px] tabular-nums">
                      {isRtl ? `تأسیس: ${formatLocaleNumber(selectedLicensor.establishedYear, true)}` : `Est. ${selectedLicensor.establishedYear}`}
                    </Badge>
                    {selectedLicensor.website && (
                      <a
                        href={selectedLicensor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-sans"
                      >
                        <span>{selectedLicensor.website.replace("https://", "").replace("http://", "")}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-start">
              {/* Process Description */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  <span>{isRtl ? "جایگاه تکنولوژیک و سوابق در صنعت:" : "Technology Profile:"}</span>
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedLicensor.descriptionFa}
                </p>
              </div>

              {/* ESP Relevance (Euroslot Pars components) */}
              <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/25 space-y-1.5">
                <span className="text-xs font-bold text-primary flex items-center gap-2">
                  <Cpu className="size-4 text-primary" />
                  <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های یورواسلات پارس مرتبط با این فرآیند:" : "Euroslot Pars Components for this Technology:"}</span>
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedLicensor.espRelevanceFa}
                </p>
              </div>

              {/* Technologies List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span>{isRtl ? "پکیج‌های فرآیندی و لایسنس‌های کلیدی:" : "Key Licensed Processes:"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedLicensor.keyTechnologies.map((tech, tIdx) => (
                    <div key={tIdx} className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-foreground">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Licensed Plants in Iran Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Factory className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isRtl ? "فهرست کامل مجتمع‌های پتروشیمی لایسنس‌شده در ایران:" : "Licensed Facilities in Iran:"}</span>
                  </h4>
                  <span className={cn("text-xs font-semibold text-muted-foreground tabular-nums", isRtl && "fa-num")}>
                    {formatLocaleNumber(selectedLicensor.licensedPlants.length, isRtl)} {isRtl ? "واحد صنعتی" : "units"}
                  </span>
                </div>

                <div className="rounded-xl border border-border/70 overflow-hidden bg-card divide-y divide-border/60">
                  {selectedLicensor.licensedPlants.map((plant, pIdx) => (
                    <div key={pIdx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-muted/20 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                          <span>{plant.plantNameFa}</span>
                          {plant.nominalCapacityFa && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              {plant.nominalCapacityFa}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground/85">{plant.complexNameFa}</span>
                          {plant.holdingNameFa && (
                            <>
                              <span>•</span>
                              <span>{plant.holdingNameFa}</span>
                            </>
                          )}
                          {plant.year && (
                            <>
                              <span>•</span>
                              <span className="tabular-nums">{isRtl ? `راه‌اندازی: ${formatLocaleNumber(plant.year, true)}` : `Commissioned: ${plant.year}`}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/customers?search=${encodeURIComponent(plant.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                          onClick={() => setSelectedLicensor(null)}
                          className="h-7 px-2.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg border border-primary/20 flex items-center gap-1 transition-colors"
                          title={isRtl ? "مشاهده پرونده شرکت" : "View Client Dossier"}
                        >
                          <span>{isRtl ? "پرونده مجتمع" : "Dossier"}</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Sources */}
              {selectedLicensor.sources && selectedLicensor.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "مراجع اسنادی و کاتالوگ‌های رسمی لایسنسور:" : "Verified References:"}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedLicensor.sources.map((src, sIdx) => (
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

