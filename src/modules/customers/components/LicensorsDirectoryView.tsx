// src/modules/customers/components/LicensorsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Search,
  Globe,
  Factory,
  Filter,
  X,
  Cpu,
  Check,
  Camera,
  Pencil,
  Trash2,
  UploadCloud,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { customersService } from "../services/customers.service";
import { IRANIAN_LICENSORS } from "../data/licensors.data";
import { LicensorDetailModal } from "./LicensorDetailModal";
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
  { id: "polymers_rubber", labelFa: "لاستیک و الاستومرها", labelEn: "Rubber & Polymers" },
  { id: "specialty_chemicals", labelFa: "مواد شیمیایی تخصصی", labelEn: "Specialty Chemicals" },
  { id: "general_epc", labelFa: "پیمانکاری عمومی EPC", labelEn: "General EPC" },
];

function getLicensorDisplayName(licensor: Licensor, isRtl: boolean): string {
  if (isRtl) {
    const cleaned = licensor.nameFa.replace(/\s*\([A-Za-z0-9\s/.\-&]+\)/g, "").trim();
    return cleaned || licensor.nameFa;
  }
  return licensor.nameEn || licensor.nameFa;
}

function getLicensorDisplayDescription(licensor: Licensor, isRtl: boolean): string {
  if (isRtl) {
    return licensor.descriptionFa;
  }
  return licensor.descriptionEn || licensor.descriptionFa;
}

export function LicensorsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const initialLicensorId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<LicensorCategory>("all");
  const [detailLicensor, setDetailLicensor] = useState<Licensor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Persistent Custom Logos (localStorage)
  const [customLogos, setCustomLogos] = useState<Record<string, string>>({});
  const [editingLogoLicensor, setEditingLogoLicensor] = useState<Licensor | null>(null);
  const [logoInputValue, setLogoInputValue] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted logos on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("esp_licensor_logos_override");
      if (stored) {
        setCustomLogos(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const getLicensorLogo = (licensor: Licensor): string => {
    if (customLogos[licensor.id] !== undefined) {
      return customLogos[licensor.id];
    }
    return licensor.logoUrl || "";
  };

  const openEditLogo = (licensor: Licensor) => {
    setEditingLogoLicensor(licensor);
    setLogoInputValue(getLicensorLogo(licensor));
  };

  const saveCustomLogo = (licensorId: string, url: string) => {
    const updated = { ...customLogos, [licensorId]: url };
    setCustomLogos(updated);
    try {
      localStorage.setItem("esp_licensor_logos_override", JSON.stringify(updated));
    } catch {}
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLogoLicensor) return;

    // Immediately convert to data URL for instantaneous client preview & local persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoInputValue(dataUrl);
        saveCustomLogo(editingLogoLicensor.id, dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // Also attempt uploading to backend storage if reachable
    setIsUploadingLogo(true);
    try {
      const res = await customersService.uploadLogo(file);
      if (res?.url) {
        setLogoInputValue(res.url);
        saveCustomLogo(editingLogoLicensor.id, res.url);
      }
      toast.success(isRtl ? "لوگو با موفقیت بارگذاری شد." : "Logo uploaded successfully.");
    } catch {
      toast.success(isRtl ? "لوگو به صورت محلی ذخیره شد." : "Logo saved locally.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveLogo = () => {
    if (!editingLogoLicensor) return;
    saveCustomLogo(editingLogoLicensor.id, logoInputValue.trim());
    toast.success(isRtl ? "تغییرات لوگو ذخیره شد." : "Logo changes saved.");
    setEditingLogoLicensor(null);
  };

  const handleClearLogo = () => {
    if (!editingLogoLicensor) return;
    saveCustomLogo(editingLogoLicensor.id, "");
    setLogoInputValue("");
    toast.info(isRtl ? "لوگو خالی شد." : "Logo cleared.");
    setEditingLogoLicensor(null);
  };

  const handleOpenDetail = (licensor: Licensor) => {
    setDetailLicensor(licensor);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    if (initialLicensorId) {
      const found = IRANIAN_LICENSORS.find((l) => l.id === initialLicensorId);
      if (found) {
        setDetailLicensor(found);
        setIsDetailModalOpen(true);
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
        licensor.headquartersFa.toLowerCase().includes(q) ||
        (licensor.headquartersEn && licensor.headquartersEn.toLowerCase().includes(q)) ||
        (licensor.addressEn && licensor.addressEn.toLowerCase().includes(q)) ||
        (licensor.locationEn && licensor.locationEn.toLowerCase().includes(q)) ||
        (licensor.licenseId && String(licensor.licenseId).includes(q));

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

      {/* ── 2. Search & Filter Bar ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isRtl
                  ? "جستجوی لایسنسور (کازاله، تویو، تاپسو، باسل، لیندی)، کشور، تکنولوژی..."
                  : "Search licensor (Casale, Toyo, Topsoe, Basell, Linde), tech, country..."
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

          <div className="text-xs text-muted-foreground shrink-0">
            {isRtl ? (
              <span>نمایش <strong className="text-foreground">{formatLocaleNumber(filteredLicensors.length, true)}</strong> لایسنسور</span>
            ) : (
              <span>Showing <strong className="text-foreground">{filteredLicensors.length}</strong> licensors</span>
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

      {/* ── 3. Licensors Cards Grid (همون کارتی) ── */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredLicensors.map((licensor) => {
            const currentLogo = getLicensorLogo(licensor);
            const hasLogo = Boolean(currentLogo);
            const displayName = getLicensorDisplayName(licensor, isRtl);
            const displayDescription = getLicensorDisplayDescription(licensor, isRtl);

            return (
              <div
                key={licensor.id}
                onClick={() => handleOpenDetail(licensor)}
                className="group rounded-2xl border border-border/80 hover:border-primary/50 bg-card p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer text-start relative overflow-hidden"
              >
                {/* Top Section: Logo & Details */}
                <div className="space-y-3">
                  {/* 1. Large Logo Showcase */}
                  <div className="relative group/logo-thumb w-full">
                    <div className="w-full h-32 sm:h-36 rounded-xl bg-white dark:bg-zinc-900 border border-border/80 p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-primary/40 transition-all">
                      {hasLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentLogo}
                          alt={displayName}
                          className="max-h-22 sm:max-h-24 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105 select-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-1 text-muted-foreground/60 group-hover:text-primary transition-colors">
                          <Camera className="size-6" />
                          <span className="text-[10px] font-semibold">{isRtl ? "بدون لوگو" : "No Logo"}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick In-Card Edit Button */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditLogo(licensor);
                      }}
                      className="size-6 rounded-md absolute top-2 end-2 bg-background/90 backdrop-blur-xs border border-border shadow-xs opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      title={isRtl ? "ویرایش و تغییر لوگو" : "Edit Logo"}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </div>

                  {/* 2. Licensor Name & Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5 text-[11px]">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 border-border gap-1 font-medium shrink-0">
                        <span>{licensor.countryCode === "IR" ? "🇮🇷" : licensor.countryCode === "DE" ? "🇩🇪" : licensor.countryCode === "NL" ? "🇳🇱" : licensor.countryCode === "IT" ? "🇮🇹" : licensor.countryCode === "JP" ? "🇯🇵" : licensor.countryCode === "US" ? "🇺🇸" : licensor.countryCode === "DK" ? "🇩🇰" : licensor.countryCode === "CH" ? "🇨🇭" : "🌐"}</span>
                        <span>{isRtl ? licensor.countryFa : licensor.countryEn}</span>
                      </Badge>

                      {licensor.licenseId && (
                        <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0">
                          ID #{licensor.licenseId}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {displayName}
                    </h4>

                    <div className="text-[11px] text-muted-foreground line-clamp-1 font-sans">
                      {isRtl ? licensor.nameEn : licensor.nameFa}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                      {displayDescription}
                    </p>

                    {/* Key Technologies Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {licensor.keyTechnologies.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium line-clamp-1 max-w-[130px]"
                        >
                          {t}
                        </span>
                      ))}
                      {licensor.keyTechnologies.length > 2 && (
                        <span className="text-[10px] px-1 py-0.5 rounded-md bg-muted/40 text-muted-foreground/80 font-mono">
                          +{licensor.keyTechnologies.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Factory className="size-3.5 text-primary shrink-0" />
                    <span>
                      {isRtl ? `${formatLocaleNumber(licensor.licensedPlants.length, true)} واحد در ایران` : `${licensor.licensedPlants.length} units`}
                    </span>
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(licensor);
                    }}
                    className="h-7 px-2.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                  >
                    <span>{isRtl ? "جزئیات" : "Details"}</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Popup Detail Modal with Tabs (روی هدر بیاد و تب‌بندی شده) ── */}
      <LicensorDetailModal
        licensor={detailLicensor}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEditLogo={openEditLogo}
        customLogo={detailLicensor ? getLicensorLogo(detailLicensor) : undefined}
      />

      {/* ── 5. Edit Logo Modal ── */}
      {editingLogoLicensor && (
        <Dialog open={!!editingLogoLicensor} onOpenChange={(open) => !open && setEditingLogoLicensor(null)}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl z-[110]">
            <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Camera className="size-4.5 text-primary" />
                <span>{isRtl ? "ویرایش و بارگذاری لوگوی لایسنسور" : "Edit Licensor Logo"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingLogoLicensor.nameFa} ({editingLogoLicensor.nameEn})
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Live Preview Box */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isRtl ? "پیش‌نمایش لوگو:" : "Logo Preview:"}
                </Label>
                <div className="w-full h-32 rounded-xl bg-white dark:bg-zinc-900 border border-border flex items-center justify-center p-3 relative overflow-hidden">
                  {logoInputValue ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoInputValue}
                      alt="Preview"
                      className="max-h-24 max-w-[85%] object-contain select-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                      <Camera className="size-6 text-muted-foreground/50" />
                      <span>{isRtl ? "لوگویی برای نمایش وجود ندارد (خالی)" : "No logo set (Empty)"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload File Button */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isRtl ? "بارگذاری فایل از سیستم:" : "Upload from Computer:"}
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="w-full h-9 rounded-xl text-xs gap-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/[0.04] cursor-pointer"
                >
                  {isUploadingLogo ? (
                    <span className="inline-block size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="size-4 text-primary" />
                  )}
                  <span>{isRtl ? "انتخاب و آپلود فایل عکس لوگو..." : "Choose & Upload Logo Image..."}</span>
                </Button>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isRtl ? "یا وارد کردن آدرس اینترنتی لوگو (URL):" : "Or Enter Logo URL:"}
                </Label>
                <Input
                  value={logoInputValue}
                  onChange={(e) => setLogoInputValue(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="h-9 rounded-xl text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between sm:justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearLogo}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <Trash2 className="size-3.5 me-1" />
                <span>{isRtl ? "خالی کردن لوگو" : "Remove Logo"}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLogoLicensor(null)}
                  className="text-xs rounded-xl"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSaveLogo}
                  className="text-xs rounded-xl"
                >
                  <Check className="size-3.5 me-1" />
                  <span>{isRtl ? "ذخیره تغییرات" : "Save Changes"}</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
