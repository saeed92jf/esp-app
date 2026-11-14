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
  Phone,
  Mail,
  Copy,
  BookOpen,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
  { id: "polymers_rubber", labelFa: "لاستیک و الاستومرها", labelEn: "Rubber & Polymers" },
  { id: "specialty_chemicals", labelFa: "مواد شیمیایی تخصصی", labelEn: "Specialty Chemicals" },
  { id: "general_epc", labelFa: "پیمانکاری عمومی EPC", labelEn: "General EPC" },
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3 fill-current", className)} viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

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
  const [selectedLicensor, setSelectedLicensor] = useState<Licensor | null>(null);

  // Persistent Custom Logos (localStorage)
  const [customLogos, setCustomLogos] = useState<Record<string, string>>({});
  const [editingLogoLicensor, setEditingLogoLicensor] = useState<Licensor | null>(null);
  const [logoInputValue, setLogoInputValue] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [historyLang, setHistoryLang] = useState<"fa" | "en">(isRtl ? "fa" : "en");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "کپی شد" : "Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

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
            <div className="space-y-3.5">
              {filteredLicensors.map((licensor) => {
                const currentLogo = getLicensorLogo(licensor);
                const hasLogo = Boolean(currentLogo);
                const isSelected = selectedLicensor?.id === licensor.id;
                const displayName = getLicensorDisplayName(licensor, isRtl);
                const displayDescription = getLicensorDisplayDescription(licensor, isRtl);

                return (
                  <div
                    key={licensor.id}
                    onClick={() => handleSelectLicensor(licensor)}
                    className={cn(
                      "rounded-2xl border p-4 sm:p-4.5 transition-all duration-150 flex flex-col gap-3 cursor-pointer group text-start relative",
                      isSelected
                        ? "bg-primary/[0.05] border-primary shadow-sm ring-1 ring-primary/40 dark:bg-primary/[0.08]"
                        : "bg-card border-border/80 hover:border-primary/40 hover:bg-muted/30 shadow-xs"
                    )}
                  >
                    {/* Active Selection Indicator Bar */}
                    {isSelected && (
                      <div className="absolute start-0 top-3 bottom-3 w-1.5 bg-primary rounded-e-full" />
                    )}

                    {/* 1. Large Logo on Top */}
                    <div className="relative group/logo-thumb w-full">
                      <div className="w-full h-28 sm:h-32 rounded-xl bg-white dark:bg-zinc-900 border border-border/80 p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-primary/50 transition-all">
                        {hasLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={currentLogo}
                            alt={displayName}
                            className="max-h-20 sm:max-h-24 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105 select-none"
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

                      {/* Quick In-List Edit Button */}
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

                    {/* 2. Single-language Name & Description below */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={cn(
                          "text-base sm:text-lg font-black tracking-tight leading-snug transition-colors truncate",
                          isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                        )}>
                          {displayName}
                        </h4>

                        {isSelected && (
                          <Badge variant="default" className="text-[9.5px] py-0 px-2 h-4.5 bg-primary text-primary-foreground font-bold shrink-0">
                            {isRtl ? "فعال" : "Active"}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {displayDescription}
                      </p>
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
                    {getLicensorDisplayName(selectedLicensor, isRtl)}
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
                      {getLicensorDisplayName(selectedLicensor, isRtl)}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground font-sans mt-0.5 truncate">
                      {isRtl ? selectedLicensor.nameEn : selectedLicensor.nameFa}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 font-semibold gap-1.5">
                      <Globe className="size-3 text-primary" />
                      <span>{selectedLicensor.countryFa}</span>
                      <span className="text-[10px] text-muted-foreground font-sans">({selectedLicensor.countryEn})</span>
                    </Badge>

                    <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 font-medium tabular-nums">
                      <Calendar className="size-3 me-1 text-muted-foreground" />
                      <span>{isRtl ? `تأسیس: ${formatLocaleNumber(selectedLicensor.establishedYear, true)}` : `Est. ${selectedLicensor.establishedYear}`}</span>
                    </Badge>

                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10.5px] py-0.5 px-2 font-bold gap-1 rounded-md",
                        (!selectedLicensor.currentSituationEn || selectedLicensor.currentSituationEn.toLowerCase() === "active")
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      <span>{selectedLicensor.currentSituationFa || (isRtl ? "فعال و معتبر" : "Active")}</span>
                    </Badge>
                  </div>
                </div>

                {/* 3. Bilingual Specifications Table (جدول مشخصات شرکتی و تماس دو زبانه) */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      <span>{isRtl ? "جدول مشخصات شرکتی و ارتباطی:" : "Corporate & Contact Specs:"}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-sans">Bilingual / دو زبانه</span>
                  </div>

                  <div className="rounded-xl border border-border/70 overflow-hidden bg-background/50">
                    <Table className="text-xs">
                      <TableBody>
                        {/* Row: Official Name */}
                        <TableRow className="border-border/50 hover:bg-muted/40">
                          <TableCell className="w-[38%] font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                            <span className="block text-[11px] text-foreground font-bold">{isRtl ? "نام رسمی" : "Official Name"}</span>
                            <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Official Name" : "نام رسمی"}</span>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-top font-sans">
                            <div className="font-bold text-foreground text-xs leading-snug">
                              {selectedLicensor.nameEn}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-sans">
                              {selectedLicensor.nameFa}
                            </div>
                            {selectedLicensor.licenseId && (
                              <span className="inline-block mt-1 text-[9.5px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                                License #{selectedLicensor.licenseId}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Row: Country & Origin */}
                        <TableRow className="border-border/50 hover:bg-muted/40">
                          <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                            <span className="block text-[11px] text-foreground font-bold">{isRtl ? "کشور مبدأ" : "Country / Origin"}</span>
                            <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Country of Origin" : "کشور مبدأ"}</span>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-top">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10.5px] py-0 px-2 font-semibold border-primary/30 text-primary">
                                {selectedLicensor.countryCode}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs">{selectedLicensor.countryFa}</span>
                              <span className="text-[11px] text-muted-foreground font-sans">({selectedLicensor.countryEn})</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Row: Headquarters / Location */}
                        <TableRow className="border-border/50 hover:bg-muted/40">
                          <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                            <span className="block text-[11px] text-foreground font-bold">{isRtl ? "مقر مرکزی" : "Headquarters"}</span>
                            <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Headquarters" : "مرکز اصلی"}</span>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-top">
                            <span className="text-foreground font-medium text-xs flex items-center gap-1.5">
                              <MapPin className="size-3 text-muted-foreground shrink-0" />
                              <span>{selectedLicensor.headquartersFa || selectedLicensor.locationEn}</span>
                            </span>
                            {selectedLicensor.headquartersEn && selectedLicensor.headquartersEn !== selectedLicensor.headquartersFa && (
                              <span className="text-[11px] text-muted-foreground font-sans block mt-0.5 ps-4.5">
                                {selectedLicensor.headquartersEn}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Row: Address & Postal Code */}
                        {(selectedLicensor.addressEn || selectedLicensor.locationEn) && (
                          <TableRow className="border-border/50 hover:bg-muted/40">
                            <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                              <span className="block text-[11px] text-foreground font-bold">{isRtl ? "نشانی پستی" : "Address & Postal"}</span>
                              <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Postal Address" : "آدرس رسمی"}</span>
                            </TableCell>
                            <TableCell className="py-2 px-3 align-top">
                              <span className="text-foreground text-xs font-sans block leading-relaxed" dir="ltr">
                                {selectedLicensor.addressEn || selectedLicensor.locationEn}
                              </span>
                              {selectedLicensor.postCode && (
                                <span className="text-[10.5px] text-muted-foreground font-mono block mt-0.5">
                                  Postal Code: {selectedLicensor.postCode}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Row: Operating Status / Situation */}
                        <TableRow className="border-border/50 hover:bg-muted/40">
                          <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                            <span className="block text-[11px] text-foreground font-bold">{isRtl ? "وضعیت فعالیت" : "Current Status"}</span>
                            <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Operating Situation" : "وضعیت کنونی"}</span>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-top">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10.5px] py-0.5 px-2 font-bold gap-1 rounded-md",
                                  (!selectedLicensor.currentSituationEn || selectedLicensor.currentSituationEn.toLowerCase() === "active")
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                                )}
                              >
                                <span className="size-1.5 rounded-full bg-current" />
                                <span>{selectedLicensor.currentSituationFa || (isRtl ? "فعال و معتبر" : "Active")}</span>
                              </Badge>
                              {selectedLicensor.currentSituationEn && selectedLicensor.currentSituationEn.toLowerCase() !== "active" && (
                                <span className="text-[10.5px] text-muted-foreground font-sans block">
                                  ({selectedLicensor.currentSituationEn})
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Row: Direct Telephone */}
                        {selectedLicensor.telNo && (
                          <TableRow className="border-border/50 hover:bg-muted/40">
                            <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                              <span className="block text-[11px] text-foreground font-bold">{isRtl ? "تلفن تماس" : "Telephone"}</span>
                              <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Direct Phone" : "تماس مستقیم"}</span>
                            </TableCell>
                            <TableCell className="py-2 px-3 align-top">
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href={`tel:${selectedLicensor.telNo}`}
                                  dir="ltr"
                                  className="text-xs font-bold text-foreground hover:text-primary font-mono inline-flex items-center gap-1.5"
                                >
                                  <Phone className="size-3 text-muted-foreground" />
                                  <span>{selectedLicensor.telNo}</span>
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => handleCopy(selectedLicensor.telNo || "", "tel", e)}
                                  className="size-6 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                                  title={isRtl ? "کپی تلفن" : "Copy"}
                                >
                                  {copiedField === "tel" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Row: Email */}
                        {selectedLicensor.email && (
                          <TableRow className="border-border/50 hover:bg-muted/40">
                            <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                              <span className="block text-[11px] text-foreground font-bold">{isRtl ? "پست الکترونیک" : "Official Email"}</span>
                              <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "E-Mail" : "ایمیل رسمی"}</span>
                            </TableCell>
                            <TableCell className="py-2 px-3 align-top">
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href={`mailto:${selectedLicensor.email}`}
                                  dir="ltr"
                                  className="text-xs font-semibold text-primary hover:underline font-sans truncate max-w-[200px] inline-flex items-center gap-1.5"
                                >
                                  <Mail className="size-3 text-muted-foreground shrink-0" />
                                  <span>{selectedLicensor.email}</span>
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => handleCopy(selectedLicensor.email || "", "mail", e)}
                                  className="size-6 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                                  title={isRtl ? "کپی ایمیل" : "Copy"}
                                >
                                  {copiedField === "mail" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Row: Official Web & Social */}
                        <TableRow className="hover:bg-muted/40">
                          <TableCell className="font-semibold text-muted-foreground bg-muted/20 py-2 px-3 align-top">
                            <span className="block text-[11px] text-foreground font-bold">{isRtl ? "پایگاه و شبکه‌ها" : "Web & Links"}</span>
                            <span className="block text-[9.5px] text-muted-foreground font-sans">{isRtl ? "Website / Links" : "وبگاه رسمی"}</span>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-top">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {selectedLicensor.website && (
                                <a
                                  href={selectedLicensor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                  <Globe className="size-3" />
                                  <span>{isRtl ? "وب‌سایت رسمی" : "Website"}</span>
                                  <ExternalLink className="size-2.5" />
                                </a>
                              )}
                              {selectedLicensor.linkedIn && (
                                <a
                                  href={selectedLicensor.linkedIn}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  <LinkedInIcon className="size-3" />
                                  <span>LinkedIn</span>
                                  <ExternalLink className="size-2.5" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 4. Bilingual History & Process Overview (تاریخچه و معرفی دو زبانه) */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      <span>{isRtl ? "تاریخچه و معرفی فرآیندی:" : "History & Process Overview:"}</span>
                    </span>
                    <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/60">
                      <button
                        type="button"
                        onClick={() => setHistoryLang("fa")}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer",
                          historyLang === "fa" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        فارسی
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryLang("en")}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer font-sans",
                          historyLang === "en" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/20 border border-border/60 text-xs leading-relaxed">
                    {historyLang === "fa" ? (
                      <p className="text-foreground/90 leading-relaxed text-justify">
                        {selectedLicensor.descriptionFa}
                      </p>
                    ) : (
                      <p className="text-foreground/90 font-sans leading-relaxed text-justify" dir="ltr">
                        {selectedLicensor.historyEn || selectedLicensor.descriptionEn || selectedLicensor.descriptionFa}
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Euroslot Pars Equipment Relevance Box */}
                <div className="rounded-2xl bg-primary/[0.05] border border-primary/25 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Wrench className="size-4 shrink-0" />
                    <span>{isRtl ? "نقش تخصصی در تجهیزات یورواسلات پارس:" : "Euroslot Pars Internals & Solutions:"}</span>
                  </div>
                  <p className="text-xs text-foreground/85 leading-relaxed">
                    {selectedLicensor.espRelevanceFa}
                  </p>
                </div>

                {/* 6. Key Technologies */}
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

                {/* 7. Licensed Plants Table (جدول پلنت‌های لایسنس‌شده) */}
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

                  {selectedLicensor.licensedPlants.length > 0 ? (
                    <div className="rounded-xl border border-border/70 overflow-hidden bg-background/50">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow className="border-border/60">
                            <TableHead className="text-[10.5px] font-bold py-2 px-2.5">{isRtl ? "مجتمع و واحد" : "Complex & Unit"}</TableHead>
                            <TableHead className="text-[10.5px] font-bold py-2 px-2.5">{isRtl ? "فناوری و ظرفیت" : "Process & Cap."}</TableHead>
                            <TableHead className="text-[10.5px] font-bold py-2 px-2.5 text-end">{isRtl ? "سال" : "Year"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedLicensor.licensedPlants.map((p, pIdx) => (
                            <TableRow key={pIdx} className="border-border/50 hover:bg-muted/30">
                              <TableCell className="py-2 px-2.5 align-top">
                                <Link
                                  href={`/customers?search=${encodeURIComponent(p.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                                  className="font-bold text-primary hover:underline text-xs inline-flex items-center gap-1 truncate max-w-[170px]"
                                  title={p.complexNameFa}
                                >
                                  <span>{p.complexNameFa}</span>
                                  <ArrowUpRight className="size-2.5 shrink-0 opacity-70" />
                                </Link>
                                <span className="text-[10.5px] text-muted-foreground block truncate max-w-[170px]">
                                  {p.plantNameFa}
                                </span>
                              </TableCell>
                              <TableCell className="py-2 px-2.5 align-top">
                                <span className="font-medium text-foreground text-[11px] block truncate max-w-[150px]">
                                  {p.unitTypeFa}
                                </span>
                                {p.nominalCapacityFa && (
                                  <span className="text-[10px] text-muted-foreground font-sans block">
                                    {p.nominalCapacityFa}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-2 px-2.5 align-top text-end font-mono text-[10.5px] text-muted-foreground">
                                {p.year || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center">
                      <span className="text-[11px] text-muted-foreground">
                        {isRtl
                          ? "اطلاعات پروژه‌ها و پلنت‌های تحت لایسنس این شرکت در مراجع ایران در حال بروزرسانی و اعتبارسنجی است."
                          : "Project references and licensed facilities for this company are currently being updated."}
                      </span>
                    </div>
                  )}
                </div>

                {/* 8. Verified Sources */}
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

