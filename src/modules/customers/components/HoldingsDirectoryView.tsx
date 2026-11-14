// src/modules/customers/components/HoldingsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  PieChart,
  TrendingUp,
  MapPin,
  User,
  Calendar,
  Factory,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowUpRight,
  ArrowUpDown,
  Phone,
  BookUser,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import { IRANIAN_PLANTS } from "../data/plants.data";
import { getAllUnifiedPlants } from "../utils/petro-unifier";
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import type { Holding, HoldingSubsidiary } from "../types/holdings.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type HoldingSortOption = "default" | "subs_desc" | "year_desc" | "year_asc" | "name_asc";

// Helper to resolve subsidiary logo from plant catalog or customer data
function getSubsidiaryLogo(sub: HoldingSubsidiary): string | undefined {
  if (sub.logoUrl) return sub.logoUrl;
  const allPlants = getAllUnifiedPlants();
  if (sub.plantId) {
    const pl = allPlants.find((p) => p.id === sub.plantId);
    if (pl?.logoUrl) return pl.logoUrl;
  }
  const clean = sub.nameFa.replace(/شرکت|پتروشیمی|صنایع/g, "").trim();
  const matched = allPlants.find(
    (p) => p.complexNameFa.includes(clean) || p.nameFa.includes(clean)
  );
  if (matched?.logoUrl) return matched.logoUrl;
  return undefined;
}

export function HoldingsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const urlHoldingId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<HoldingSortOption>("default");
  const [expandedHoldingIds, setExpandedHoldingIds] = useState<Set<string>>(() => {
    return urlHoldingId ? new Set([urlHoldingId]) : new Set(["pgpic"]);
  });
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  useEffect(() => {
    if (urlHoldingId) {
      setExpandedHoldingIds((prev) => new Set([...prev, urlHoldingId]));
      const found = IRANIAN_HOLDINGS.find((h) => h.id === urlHoldingId);
      if (found) {
        setSelectedHolding(found);
      }
    }
  }, [urlHoldingId]);

  const toggleHolding = (id: string) => {
    setExpandedHoldingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredHoldings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = IRANIAN_HOLDINGS.filter((h) => {
      if (!q) return true;

      const matchName =
        h.nameFa.toLowerCase().includes(q) ||
        h.nameEn.toLowerCase().includes(q) ||
        h.companyAbbrv.toLowerCase().includes(q) ||
        (h.tseSymbol && h.tseSymbol.toLowerCase().includes(q)) ||
        h.headquartersFa.toLowerCase().includes(q) ||
        (h.officeAddressFa && h.officeAddressFa.toLowerCase().includes(q)) ||
        (h.officePhone && h.officePhone.toLowerCase().includes(q)) ||
        (h.postalCode && h.postalCode.toLowerCase().includes(q)) ||
        (h.nationalIdNumber && h.nationalIdNumber.toLowerCase().includes(q)) ||
        h.ceoNameFa.toLowerCase().includes(q);

      const matchSubs = h.subsidiaries.some(
        (s) =>
          s.nameFa.toLowerCase().includes(q) ||
          (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
          (s.tseSymbol && s.tseSymbol.toLowerCase().includes(q)) ||
          s.products?.some((p) => p.toLowerCase().includes(q))
      );

      const matchTags = h.tags.some((t) => t.toLowerCase().includes(q));

      return matchName || matchSubs || matchTags;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "subs_desc":
          return b.subsidiaries.length - a.subsidiaries.length;
        case "year_desc":
          return b.establishedYear - a.establishedYear;
        case "year_asc":
          return a.establishedYear - b.establishedYear;
        case "name_asc":
          return a.nameFa.localeCompare(b.nameFa, "fa");
        case "default":
        default:
          return 0;
      }
    });
  }, [search, sortBy]);

  // Aggregate Metrics
  const totalSubsidiaries = useMemo(() => {
    return IRANIAN_HOLDINGS.reduce((sum, h) => sum + h.subsidiaries.length, 0);
  }, []);

  return (
    <div className="space-y-6 w-full text-start animate-in fade-in duration-200">
      {/* ── 1. Top Metrics Banner ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "هلدینگ‌های پیشرو کشور" : "Major Holdings"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(IRANIAN_HOLDINGS.length, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "هلدینگ مگا" : "Holdings"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Factory className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "شرکت‌ها و پتروشیمی‌های تابعه" : "Subsidiary Companies"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalSubsidiaries, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "مجتمع صنعتی" : "Complexes"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "ظرفیت سالانه کل هلدینگ‌ها" : "Total Annual Capacity"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(75, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "میلیون تن" : "Million Tons"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <PieChart className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "ارزش بازار در بورس تهران" : "Combined Market Cap"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(1300, isRtl)}+{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "هزار میلیارد ت" : "T Tomans"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Info Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isRtl
                ? "جستجو در نام هلدینگ، نماد بورس (فارس، تاپیکو، پارسان)، شرکت‌های تابعه..."
                : "Search holding name, TSE symbol, subsidiaries, products..."
            }
            className="ps-10 h-10 rounded-xl text-xs sm:text-sm bg-background border-border/70"
          />
        </div>

        {/* Actions bar: Expand/Collapse All + Sort */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (expandedHoldingIds.size === filteredHoldings.length) {
                setExpandedHoldingIds(new Set());
              } else {
                setExpandedHoldingIds(new Set(filteredHoldings.map((h) => h.id)));
              }
            }}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer font-medium border-border/80 hover:bg-muted/30"
          >
            {filteredHoldings.length > 0 && expandedHoldingIds.size === filteredHoldings.length ? (
              <>
                <ChevronUp className="size-3.5 text-primary" />
                <span>{isRtl ? "بستن همه هلدینگ‌ها" : "Collapse All"}</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 text-primary" />
                <span>{isRtl ? "باز کردن همه هلدینگ‌ها" : "Expand All"}</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1 shrink-0 font-medium">
              <ArrowUpDown className="size-3.5 text-primary" />
              <span>{isRtl ? "مرتب‌سازی:" : "Sort:"}</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as HoldingSortOption)}
              className="h-9 px-3 text-xs rounded-xl border border-border/80 bg-background text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
            >
              <option value="default">{isRtl ? "ارزش بازار و اهمیت صنعتی" : "Market Importance"}</option>
              <option value="subs_desc">{isRtl ? "بیشترین شرکت‌های زیرمجموعه" : "Most Subsidiaries"}</option>
              <option value="year_desc">{isRtl ? "جدیدترین سال تاسیس" : "Newest Est."}</option>
              <option value="year_asc">{isRtl ? "با سابقه‌ترین و قدیمی‌ترین" : "Oldest Est."}</option>
              <option value="name_asc">{isRtl ? "نام هلدینگ (الفبایی)" : "Alphabetical (A-Z)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Holdings Segmented Accordion List (Uncluttered when collapsed) ── */}
      <div className="space-y-3">
        {filteredHoldings.map((holding) => {
          const isExpanded = expandedHoldingIds.has(holding.id);

          return (
            <div
              key={holding.id}
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs",
                isExpanded
                  ? "border-primary/50 bg-card ring-1 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/[0.03]"
              )}
            >
              {/* ── Segmented Accordion Header (Compact & Clean in collapsed state) ── */}
              <div
                onClick={() => toggleHolding(holding.id)}
                className="p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleHolding(holding.id);
                  }
                }}
              >
                {/* Left: Logo & Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative size-12 sm:size-13 rounded-2xl bg-white dark:bg-card border border-border/80 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {holding.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={holding.logoUrl}
                        alt={holding.nameFa}
                        className="size-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="size-full rounded-xl bg-primary/10 text-primary font-bold font-mono text-sm flex items-center justify-center">
                        {holding.companyAbbrv.slice(0, 3)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                        {holding.nameFa}
                      </h2>
                      {holding.tseSymbol && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 font-bold text-xs px-2 py-0.5"
                        >
                          {isRtl ? `نماد: ${holding.tseSymbol}` : `TSE: ${holding.tseSymbol}`}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10.5px] font-mono px-1.5 py-0">
                        {holding.companyAbbrv}
                      </Badge>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {holding.nameEn}
                    </p>
                  </div>
                </div>

                {/* Right / Middle: Segment Pills & Accordion Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap md:flex-nowrap justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                  {/* Subsidiaries Count Chip */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40 border border-border/60 text-foreground tabular-nums">
                    <Factory className="size-3.5 text-primary shrink-0" />
                    <span>{formatLocaleNumber(holding.subsidiaries.length, isRtl)} {isRtl ? "پتروشیمی تابعه" : "Subsidiaries"}</span>
                  </span>

                  {/* Annual Capacity Chip */}
                  <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground tabular-nums">
                    <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate max-w-[160px]">{formatLocaleNumber(holding.annualCapacityFa.split(" ")[0], isRtl)} {isRtl ? "م تن/سال" : "M Tons/Yr"}</span>
                  </span>

                  {/* Established Year Chip */}
                  <span className="hidden sm:inline-flex text-[11px] px-2 py-1 rounded-xl bg-muted/20 border border-border/40 text-muted-foreground tabular-nums">
                    {isRtl ? `تاسیس ${formatLocaleNumber(holding.establishedYear, true)}` : `Est. ${holding.establishedYear}`}
                  </span>

                  {/* Full Profile Trigger Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHolding(holding);
                    }}
                    className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-1 font-semibold"
                    title={isRtl ? "مشاهده شناسنامه کامل و صورت‌های مالی" : "Full Profile"}
                  >
                    <Info className="size-3.5" />
                    <span className="hidden sm:inline">{isRtl ? "شناسنامه" : "Profile"}</span>
                  </Button>

                  {/* Codal Link Icon */}
                  {holding.codalUrl && (
                    <a
                      href={holding.codalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="size-8 rounded-xl border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
                      title={isRtl ? "گزارش‌های کدال" : "Codal Reports"}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}

                  {/* Chevron Toggle */}
                  <div
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center text-muted-foreground transition-transform duration-200 shrink-0",
                      isExpanded ? "rotate-180 text-primary bg-primary/10" : "bg-muted/40"
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </div>
              </div>

              {/* ── Expanded Content (Smooth pure opacity fade-in, no vertical slides) ── */}
              {isExpanded && (
                <div className="border-t border-border/70 bg-muted/[0.08] p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
                  {/* 1. Overview Bar */}
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed text-justify">
                      {holding.descriptionFa}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "مدیرعامل" : "CEO"}</span>
                        <span className="font-semibold text-foreground truncate block mt-0.5">{holding.ceoNameFa}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "دفتر مرکزی" : "Headquarters"}</span>
                        <span className="font-semibold text-foreground truncate block mt-0.5" title={holding.headquartersFa}>
                          {holding.headquartersFa.split("،")[0]}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "ظرفیت اسمی سالانه" : "Annual Capacity"}</span>
                        <span className="font-semibold text-foreground truncate block mt-0.5">{holding.annualCapacityFa}</span>
                      </div>
                    </div>

                    {/* Shareholders Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <PieChart className="size-3.5 text-primary" />
                          <span>{isRtl ? "ترکیب سهامداران عمده (Codal):" : "Major Shareholders:"}</span>
                        </span>
                        <span className="text-muted-foreground text-[10.5px]">
                          {holding.shareholders.map((s) => `${s.nameFa.split(" ")[0]} (${s.percentage}%)`).slice(0, 3).join(" • ")}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
                        {holding.shareholders.map((sh, idx) => {
                          const colors = ["bg-primary", "bg-blue-600", "bg-emerald-600", "bg-amber-500", "bg-purple-600", "bg-slate-400"];
                          return (
                            <div
                              key={idx}
                              style={{ width: `${sh.percentage}%` }}
                              title={`${sh.nameFa}: ${sh.percentage}%`}
                              className={cn("h-full transition-all", colors[idx % colors.length])}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Petrochemical Cards Grid (اطلاعات محدود، اسم، لوگو و لینک به «همه») */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                        <Layers className="size-4 text-primary" />
                        <span>{isRtl ? `شرکت‌ها و مجتمع‌های پتروشیمی تابعه (${holding.subsidiaries.length} شرکت):` : `Petrochemical Subsidiaries (${holding.subsidiaries.length}):`}</span>
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {isRtl ? "برای اطلاعات کامل، قراردادها و تجهیزات بر روی «اطلاعات کامل در همه» کلیک کنید" : "Click 'Full Info in All' for complete records"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {holding.subsidiaries.map((sub) => {
                        const subLogo = getSubsidiaryLogo(sub);
                        const cleanName = sub.nameFa.replace(/شرکت|پتروشیمی/g, "").trim();

                        return (
                          <div
                            key={sub.id}
                            className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all duration-150 flex flex-col justify-between gap-3 group"
                          >
                            <div className="space-y-2.5">
                              {/* Top Row: Logo, Name & Badges */}
                              <div className="flex items-start gap-2.5">
                                <div className="size-10 sm:size-11 rounded-xl bg-white dark:bg-card border border-border/80 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                  {subLogo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={subLogo}
                                      alt={sub.nameFa}
                                      className="size-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Factory className="size-5 text-muted-foreground/60" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate leading-snug" title={sub.nameFa}>
                                    {sub.nameFa}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {sub.tseSymbol && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                                        {sub.tseSymbol}
                                      </Badge>
                                    )}
                                    <Badge
                                      className={cn(
                                        "text-[9.5px] px-1.5 py-0 border font-semibold tabular-nums",
                                        sub.ownershipPercentage >= 70
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                          : "bg-primary/10 text-primary border-primary/20"
                                      )}
                                    >
                                      {formatLocaleNumber(sub.ownershipPercentage, isRtl)}% {isRtl ? "مالکیت" : "Own"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Limited Info: Industry & Plant Location */}
                              <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/40">
                                <div className="text-[11px] text-foreground/85 font-medium truncate" title={sub.industry}>
                                  {sub.industry}
                                </div>
                                {sub.plantLocation && (
                                  <div className="text-[10.5px] text-muted-foreground flex items-center gap-1 truncate" title={sub.plantLocation}>
                                    <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                                    <span className="truncate">{sub.plantLocation.split(" - ")[0]}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions: Link to "All" (قسمت همه) + Plant Specs + Phonebook */}
                            <div className="pt-2 border-t border-border/50 flex items-center gap-1.5">
                              <Link
                                href={`/customers?search=${encodeURIComponent(cleanName)}`}
                                className="flex-1 h-7 px-2 text-[11px] font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg border border-primary/20 flex items-center justify-center gap-1 transition-all"
                                title={isRtl ? "مشاهده پرونده کامل، قراردادها و تجهیزات در تب همه" : "View full dossier in All"}
                              >
                                <span>{isRtl ? "اطلاعات کامل در «همه»" : "Full Info in All"}</span>
                                <ArrowUpRight className="size-3 shrink-0" />
                              </Link>

                              <Link
                                href={`/customers?tab=phonebook&company=${encodeURIComponent(cleanName)}`}
                                className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-primary rounded-lg border border-border/60 hover:bg-muted/30 flex items-center justify-center gap-1 transition-colors shrink-0"
                                title={isRtl ? "دفترچه تلفن و مخاطبین" : "Contacts"}
                              >
                                <BookUser className="size-3 shrink-0" />
                                <span className="hidden xl:inline">{isRtl ? "تماس" : "Contacts"}</span>
                              </Link>

                              {sub.plantId && (
                                <Link
                                  href={`/customers?tab=plants&id=${sub.plantId}`}
                                  className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded-lg border border-border/60 hover:bg-muted/30 flex items-center justify-center gap-1 transition-colors shrink-0"
                                  title={isRtl ? "مشاهده مشخصات فنی فرآیندی در تب پلنت‌ها" : "View technical plant"}
                                >
                                  <Factory className="size-3 shrink-0" />
                                  <span className="hidden xl:inline">{isRtl ? "پلنت" : "Plant"}</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Holding Sources & Footer */}
                  <div className="p-3 sm:px-4 bg-background/80 rounded-xl border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-foreground/80">{isRtl ? "مراجع داده:" : "Data:"}</span>
                      <span>{isRtl ? "سامانه کدال • سازمان بورس • شرکت ملی صنایع پتروشیمی (NPC)" : "Codal • TSE • NPC"}</span>
                    </div>

                    <div className="flex items-center gap-2 ms-auto">
                      {holding.codalUrl && (
                        <a
                          href={holding.codalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>{isRtl ? "کدال" : "Codal"}</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                      {holding.tsetmcUrl && (
                        <a
                          href={holding.tsetmcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1"
                        >
                          <span>{isRtl ? "دیده‌بان بورس" : "TSETMC"}</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredHoldings.length === 0 && (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
            {isRtl ? "هلدینگی با این مشخصات یافت نشد." : "No holding matched your query."}
          </div>
        )}
      </div>

      {/* ── 4. Full Holding Profile Modal ── */}
      {selectedHolding && (
        <Dialog open={Boolean(selectedHolding)} onOpenChange={() => setSelectedHolding(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[24px]">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0 flex flex-col items-center gap-1.5">
                  <div className="size-20 sm:size-24 rounded-2xl bg-white dark:bg-card border border-border/80 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden transition-all duration-200 group-hover:shadow-md group-hover:border-primary/40">
                    {selectedHolding.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedHolding.logoUrl}
                        alt={selectedHolding.nameFa}
                        className="size-full object-contain transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="size-full rounded-xl bg-primary/10 text-primary font-bold font-mono text-base flex items-center justify-center">
                        {selectedHolding.companyAbbrv}
                      </div>
                    )}
                  </div>
                  {selectedHolding.logoUrl && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await downloadLogo(selectedHolding.logoUrl, selectedHolding.nameFa);
                        if (ok) {
                          toast.success(isRtl ? "لوگوی هلدینگ با موفقیت دانلود شد." : "Holding logo downloaded successfully.");
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-primary/10 px-2 py-0.5 rounded-lg border border-border/60"
                      title={isRtl ? "دانلود فایل لوگوی باکیفیت" : "Download Logo"}
                    >
                      <Download className="size-3" />
                      <span>{isRtl ? "دانلود لوگو" : "Download"}</span>
                    </button>
                  )}
                </div>

                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selectedHolding.nameFa}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedHolding.nameEn} • {isRtl ? `نماد بورس: ${selectedHolding.tseSymbol || "---"}` : `TSE: ${selectedHolding.tseSymbol}`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-start">
              {/* Strategic Highlights */}
              <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/20 space-y-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>{isRtl ? "مزیت‌های استراتژیک و اهمیت اقتصادی هلدینگ:" : "Strategic Highlights:"}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                  {selectedHolding.strategicHighlightsFa.map((h, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shareholders Detailed Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <PieChart className="size-4 text-primary" />
                  <span>{isRtl ? "سهامداران ثبت‌شده در سامانه کدال بورس:" : "Registered Shareholders (Codal):"}</span>
                </h4>
                <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden text-xs">
                  {selectedHolding.shareholders.map((sh, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-card">
                      <span className="font-semibold text-foreground">{sh.nameFa}</span>
                      <span className={cn("font-bold text-primary text-sm tabular-nums", isRtl && "fa-num")}>
                        {formatLocaleNumber(sh.percentage, isRtl)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corporate Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "نشانی کامل دفتر مرکزی" : "HQ Address"}</span>
                  <span className="font-medium text-foreground block leading-relaxed">{selectedHolding.officeAddressFa || selectedHolding.headquartersFa}</span>
                  {selectedHolding.postalCode && (
                    <span className="text-[11px] text-muted-foreground block mt-1 tabular-nums">
                      {isRtl ? `کد پستی: ${formatLocaleNumber(selectedHolding.postalCode, true)}` : `Postal Code: ${selectedHolding.postalCode}`}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "اطلاعات تماس و وب‌سایت" : "Contact & Web"}</span>
                  {selectedHolding.officePhone && (
                    <div className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                      <Phone className="size-3 text-primary shrink-0" />
                      <span dir="ltr">{selectedHolding.officePhone}</span>
                    </div>
                  )}
                  {selectedHolding.website ? (
                    <a
                      href={selectedHolding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono font-medium flex items-center gap-1 pt-0.5"
                    >
                      <span className="truncate">{selectedHolding.website.replace("https://", "").replace("http://", "")}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : (
                    <span>---</span>
                  )}
                  {selectedHolding.nationalIdNumber && (
                    <div className="text-[10.5px] text-muted-foreground pt-1 border-t border-border/40 tabular-nums">
                      {isRtl
                        ? `شناسه ملی: ${formatLocaleNumber(selectedHolding.nationalIdNumber, true)}`
                        : `National ID: ${selectedHolding.nationalIdNumber}`}
                      {selectedHolding.registrationNumber
                        ? isRtl
                          ? ` • شماره ثبت: ${formatLocaleNumber(selectedHolding.registrationNumber, true)}`
                          : ` • Reg. No: ${selectedHolding.registrationNumber}`
                        : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Sources List */}
              {selectedHolding.sources && selectedHolding.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "اسناد و مراجع اطلاعات حسابرسی‌شده:" : "Verified Data References:"}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedHolding.sources.map((src, sIdx) => (
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

