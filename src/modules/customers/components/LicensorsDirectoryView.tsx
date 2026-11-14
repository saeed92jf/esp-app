// src/modules/customers/components/LicensorsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Award,
  Search,
  Globe,
  Factory,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ArrowUpRight,
  Filter,
  X,
  Download,
  Cpu,
  Check,
  MapPin,
  Calendar,
  Camera,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  Wrench,
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
import { downloadLogo } from "../utils/download-logo";
import { customersService } from "../services/customers.service";
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

  // Persistent Custom Logos (localStorage)
  const [customLogos, setCustomLogos] = useState<Record<string, string>>({});
  const [editingLogoLicensor, setEditingLogoLicensor] = useState<Licensor | null>(null);
  const [logoInputValue, setLogoInputValue] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleSelectLicensor = (licensor: Licensor) => {
    setSelectedLicensor(licensor);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

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

  // Ensure an active licensor is always selected for Master-Detail preview (like phonebook)
  useEffect(() => {
    if (!selectedLicensor && filteredLicensors.length > 0) {
      setSelectedLicensor(filteredLicensors[0]);
    } else if (selectedLicensor && !filteredLicensors.some((l) => l.id === selectedLicensor.id)) {
      if (filteredLicensors.length > 0) {
        setSelectedLicensor(filteredLicensors[0]);
      }
    }
  }, [filteredLicensors, selectedLicensor]);

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

      {/* ── 2. Master-Detail Two-Column Layout (Like Phonebook Directory) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-5 xl:gap-6 w-full min-w-0">
        {/* ── COLUMN 1: Licensors Companies List (Vertical under each other) ── */}
        <div className="flex-1 min-w-0 w-full space-y-3.5">
          {/* Search & Category Filter Bar */}
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

          {/* Vertical Licensors List (under each other) */}
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
            <div className="space-y-3">
              {filteredLicensors.map((licensor) => {
                const currentLogo = getLicensorLogo(licensor);
                const hasLogo = Boolean(currentLogo);
                const isSelected = selectedLicensor?.id === licensor.id;

                return (
                  <div
                    key={licensor.id}
                    onClick={() => handleSelectLicensor(licensor)}
                    className={cn(
                      "rounded-2xl border p-3.5 sm:p-4 transition-all duration-150 flex items-center justify-between gap-3.5 sm:gap-4 cursor-pointer group text-start relative",
                      isSelected
                        ? "bg-primary/[0.05] border-primary shadow-sm ring-1 ring-primary/40 dark:bg-primary/[0.08]"
                        : "bg-card border-border/80 hover:border-primary/40 hover:bg-muted/30 shadow-xs"
                    )}
                  >
                    {/* Active Selection Indicator Bar */}
                    {isSelected && (
                      <div className="absolute start-0 top-3 bottom-3 w-1 bg-primary rounded-e-full" />
                    )}

                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                      {/* Big Logo Container */}
                      <div className="relative group/logo-thumb shrink-0">
                        <div className="w-20 sm:w-24 h-18 sm:h-20 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:border-primary/50 transition-all">
                          {hasLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={currentLogo}
                              alt={licensor.nameFa}
                              className="size-full object-contain transition-transform duration-200 group-hover:scale-105 select-none"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center gap-0.5 text-muted-foreground/60 group-hover:text-primary transition-colors">
                              <Camera className="size-5" />
                              <span className="text-[9px] font-semibold">{isRtl ? "بدون لوگو" : "No Logo"}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick In-List Edit Button */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditLogo(licensor);
                          }}
                          className="size-5.5 rounded-md absolute -top-1.5 -end-1.5 bg-background border border-border shadow-xs opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all"
                          title={isRtl ? "ویرایش و تغییر لوگو" : "Edit Logo"}
                        >
                          <Pencil className="size-2.5" />
                        </Button>
                      </div>

                      {/* Name Link & Identity */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-base sm:text-lg font-black tracking-tight leading-snug transition-colors truncate",
                            isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                          )}>
                            {licensor.nameFa}
                          </span>

                          {isSelected && (
                            <Badge variant="default" className="text-[9.5px] py-0 px-2 h-4.5 bg-primary text-primary-foreground font-bold shrink-0">
                              {isRtl ? "فعال" : "Active"}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground font-sans truncate">
                          {licensor.nameEn}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
                          <Badge variant="secondary" className="text-[10.5px] px-2 py-0 font-medium gap-1">
                            <Globe className="size-2.5 text-primary" />
                            <span>{licensor.countryFa}</span>
                          </Badge>

                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {isRtl ? `تأسیس: ${formatLocaleNumber(licensor.establishedYear, true)}` : `Est. ${licensor.establishedYear}`}
                          </span>

                          <Badge variant="outline" className="text-[10px] px-2 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
                            <Factory className="size-2.5" />
                            <span>{formatLocaleNumber(licensor.licensedPlants.length, isRtl)} {isRtl ? "پلنت در ایران" : "units"}</span>
                          </Badge>
                        </div>

                        {/* Top 2 Key Technologies */}
                        <div className="hidden sm:flex items-center gap-1.5 pt-1 flex-wrap">
                          {licensor.keyTechnologies.slice(0, 2).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-muted/60 text-muted-foreground border border-border/60 px-2 py-0.2 rounded-md font-medium truncate max-w-[200px]"
                            >
                              {tech}
                            </span>
                          ))}
                          {licensor.keyTechnologies.length > 2 && (
                            <span className="text-[9.5px] text-muted-foreground font-semibold">
                              +{formatLocaleNumber(licensor.keyTechnologies.length - 2, isRtl)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chevron Arrow */}
                    <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors ps-1">
                      {isRtl ? <ChevronLeft className="size-4.5" /> : <ChevronDown className="size-4.5 -rotate-90" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── COLUMN 2: Sticky Details Column (Like Phonebook Preview Card) ── */}
        <div
          ref={detailsRef}
          className="w-full lg:w-[460px] xl:w-[500px] shrink-0 lg:sticky lg:top-[calc(var(--header-height,64px)+0.75rem)] self-start transition-all z-20"
        >
          {selectedLicensor ? (
            <div className="w-full flex flex-col max-h-[calc(100vh-var(--header-height,64px)-2rem)] bg-card rounded-[24px] border border-border/80 shadow-md overflow-hidden animate-in fade-in duration-150">
              {/* Pinned Top Bar */}
              <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Award className="size-4 text-primary shrink-0" />
                  <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[200px]">
                    {selectedLicensor.nameFa}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditLogo(selectedLicensor)}
                    className="size-7 text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
                    title={isRtl ? "ویرایش و بارگذاری لوگو" : "Edit / Upload Logo"}
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  {getLicensorLogo(selectedLicensor) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const currentLogo = getLicensorLogo(selectedLicensor);
                        const ok = await downloadLogo(currentLogo, selectedLicensor.nameFa);
                        if (ok) {
                          toast.success(isRtl ? "لوگوی لایسنسور دانلود شد." : "Licensor logo downloaded.");
                        }
                      }}
                      className="size-7 text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
                      title={isRtl ? "دانلود فایل لوگوی باکیفیت" : "Download Logo"}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  )}

                  {selectedLicensor.website && (
                    <a
                      href={selectedLicensor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                      title={selectedLicensor.website}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 scrollbar-thin">
                {/* 1. Large Hero Logo Showcase */}
                {(() => {
                  const detailLogo = getLicensorLogo(selectedLicensor);
                  return detailLogo ? (
                    <div className="w-full h-36 sm:h-40 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-4 flex items-center justify-center relative overflow-hidden shadow-xs group/hero-logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={detailLogo}
                        alt={selectedLicensor.nameFa}
                        className="max-h-28 sm:max-h-32 max-w-[85%] object-contain select-none group-hover/hero-logo:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/hero-logo:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => openEditLogo(selectedLicensor)}
                          className="size-7 rounded-lg bg-background/90 backdrop-blur-xs border border-border shadow-xs hover:bg-primary hover:text-primary-foreground transition-all"
                          title={isRtl ? "ویرایش لوگو" : "Edit Logo"}
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => openEditLogo(selectedLicensor)}
                      className="w-full h-32 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-primary/[0.03] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center p-4 group/empty"
                      title={isRtl ? "برای بارگذاری لوگوی لایسنسور کلیک کنید" : "Click to upload logo"}
                    >
                      <div className="size-10 rounded-xl bg-muted/60 group-hover/empty:bg-primary/10 flex items-center justify-center transition-colors">
                        <Camera className="size-5 text-muted-foreground group-hover/empty:text-primary transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-foreground/80 group-hover/empty:text-primary transition-colors">
                        {isRtl ? "لوگو ثبت نشده است (برای آپلود کلیک کنید)" : "No Logo Uploaded"}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-2 gap-1 border-border group-hover/empty:border-primary/40 group-hover/empty:text-primary">
                        <Plus className="size-3" />
                        <span>{isRtl ? "بارگذاری لوگو" : "Upload Logo"}</span>
                      </Badge>
                    </div>
                  );
                })()}

                {/* 2. Main Identity & Badges */}
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                      {selectedLicensor.nameFa}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground font-sans mt-0.5 truncate">
                      {selectedLicensor.nameEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 font-semibold gap-1.5">
                      <Globe className="size-3 text-primary" />
                      <span>{selectedLicensor.countryFa}</span>
                    </Badge>

                    <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 font-medium tabular-nums">
                      <Calendar className="size-3 me-1 text-muted-foreground" />
                      <span>{isRtl ? `تأسیس: ${formatLocaleNumber(selectedLicensor.establishedYear, true)}` : `Est. ${selectedLicensor.establishedYear}`}</span>
                    </Badge>

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate max-w-[200px]">{selectedLicensor.headquartersFa}</span>
                    </span>
                  </div>
                </div>

                {/* 3. Process Description */}
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-bold text-foreground block">
                    {isRtl ? "معرفی و سوابق تخصصی فرآیند:" : "Process Overview:"}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedLicensor.descriptionFa}
                  </p>
                </div>

                {/* 4. Euroslot Pars Equipment Relevance Box */}
                <div className="rounded-2xl bg-primary/[0.05] border border-primary/25 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Wrench className="size-4 shrink-0" />
                    <span>{isRtl ? "نقش تخصصی در تجهیزات یورواسلات پارس:" : "Euroslot Pars Internals & Solutions:"}</span>
                  </div>
                  <p className="text-xs text-foreground/85 leading-relaxed">
                    {selectedLicensor.espRelevanceFa}
                  </p>
                </div>

                {/* 5. Key Technologies */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-primary" />
                    <span>{isRtl ? "بسته‌ها و تکنولوژی‌های شاخص فرآیندی:" : "Key Technologies:"}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLicensor.keyTechnologies.map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10.5px] bg-primary/[0.04] text-primary border-primary/20 font-medium px-2.5 py-0.5"
                      >
                        <span>{tech}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 6. Licensed Plants in Iran */}
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Factory className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isRtl ? "پلنت‌ها و مجتمع‌های احداث‌شده در ایران:" : "Licensed Iranian Plants:"}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {formatLocaleNumber(selectedLicensor.licensedPlants.length, isRtl)} {isRtl ? "پلنت فعال" : "Plants"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {selectedLicensor.licensedPlants.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-foreground truncate">
                            {p.plantNameFa}
                          </span>
                          {p.year && (
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                              {p.year}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground">
                          <span className="truncate">{p.unitTypeFa}</span>
                          {p.nominalCapacityFa && (
                            <span className="text-foreground/90 font-medium shrink-0 font-sans">
                              {p.nominalCapacityFa}
                            </span>
                          )}
                        </div>

                        <div className="pt-1 flex items-center justify-between border-t border-border/40 text-[10.5px]">
                          <Link
                            href={`/customers?search=${encodeURIComponent(p.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                            className="text-primary hover:underline inline-flex items-center gap-1 font-semibold truncate"
                          >
                            <span>{p.complexNameFa}</span>
                            <ArrowUpRight className="size-3 shrink-0" />
                          </Link>

                          {p.holdingNameFa && (
                            <span className="text-muted-foreground/80 truncate max-w-[140px]" title={p.holdingNameFa}>
                              {p.holdingNameFa}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Verified Sources */}
                {selectedLicensor.sources && selectedLicensor.sources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      <span>{isRtl ? "مراجع و اسناد رسمی معتبر:" : "Verified Sources:"}</span>
                    </span>
                    <div className="space-y-1.5">
                      {selectedLicensor.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/50 text-[11px]"
                        >
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground truncate block">{src.titleFa}</span>
                            <span className="text-[10px] text-muted-foreground block">{src.publisherFa}</span>
                          </div>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 text-[10.5px] font-semibold shrink-0 ps-2"
                            >
                              <span>{isRtl ? "مشاهده" : "View"}</span>
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-80 rounded-[24px] border border-dashed border-border bg-card flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-2">
              <Award className="size-10 text-muted-foreground/40" />
              <span className="text-xs font-medium">{isRtl ? "لایسنسوری برای مشاهده جزئیات انتخاب کنید." : "Select a licensor to view details."}</span>
            </div>
          )}
        </div>
      </div>



      {/* ── 5. Edit Licensor Logo Dialog ── */}
      {editingLogoLicensor && (
        <Dialog open={Boolean(editingLogoLicensor)} onOpenChange={() => setEditingLogoLicensor(null)}>
          <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">
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

