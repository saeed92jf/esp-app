// src/modules/customers/components/HoldingsDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Factory,
  TrendingUp,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowUpDown,
  X,
  Download,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import { HoldingDetailModal } from "./HoldingDetailModal";
import {
  getHoldingDisplayName,
  getHoldingDisplayDescription,
} from "../utils/holding-translations";
import type { Holding } from "../types/holdings.types";

export type HoldingSortOption = "default" | "subs_desc" | "year_desc" | "year_asc" | "name_asc";

export function HoldingsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const urlHoldingId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<HoldingSortOption>("default");
  const [detailHolding, setDetailHolding] = useState<Holding | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Auto-open modal if URL has ?id=xxx
  useEffect(() => {
    if (urlHoldingId) {
      const found = IRANIAN_HOLDINGS.find((h) => h.id === urlHoldingId);
      if (found) {
        setDetailHolding(found);
        setIsDetailModalOpen(true);
      }
    }
  }, [urlHoldingId]);

  const handleOpenDetail = (holding: Holding) => {
    setDetailHolding(holding);
    setIsDetailModalOpen(true);
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
          return isRtl
            ? a.nameFa.localeCompare(b.nameFa, "fa")
            : a.nameEn.localeCompare(b.nameEn, "en");
        case "default":
        default:
          return 0;
      }
    });
  }, [search, sortBy, isRtl]);

  // Aggregate Metrics
  const totalHoldings = IRANIAN_HOLDINGS.length;
  const totalSubsidiaries = useMemo(() => {
    return IRANIAN_HOLDINGS.reduce((sum, h) => sum + h.subsidiaries.length, 0);
  }, []);

  return (
    <div className="space-y-6 w-full text-start animate-in fade-in duration-150">
      {/* ── 1. Top Metrics Banner ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "هلدینگ‌های پیشرو کشور" : "Major Conglomerates"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalHoldings, isRtl)}{" "}
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
              {isRtl ? "شرکت‌ها و مجتمع‌های تابعه" : "Subsidiary Companies"}
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
              {isRtl ? "ظرفیت سالانه کل هلدینگ‌ها" : "Combined Capacity"}
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

      {/* ── 2. Search & Controls Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isRtl
                ? "جستجو در نام هلدینگ، نماد بورس (فارس، تاپیکو، پارسان)، شرکت‌های تابعه..."
                : "Search holding name, symbol (PGPIC, TAPPICO, Parsan), subsidiaries..."
            }
            className="ps-10 pe-9 h-10 rounded-xl text-xs sm:text-sm bg-background border-border/70"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearch("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Counter and Sort Controls */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0 flex-wrap">
          <div className="text-xs text-muted-foreground">
            {isRtl ? (
              <span>نمایش <strong className="text-foreground">{formatLocaleNumber(filteredHoldings.length, true)}</strong> هلدینگ</span>
            ) : (
              <span>Showing <strong className="text-foreground">{filteredHoldings.length}</strong> holdings</span>
            )}
          </div>

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

      {/* ── 3. Holdings Cards Grid (همون کارتی و خوشگل مثل لایسنسورها) ── */}
      {filteredHoldings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <Building2 className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">
            {isRtl ? "هلدینگی با این مشخصات یافت نشد." : "No holdings found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRtl
              ? "عبارت جستجو یا فیلترهای اعمال شده را تغییر دهید."
              : "Try adjusting your search criteria."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearch("")}
            className="rounded-xl text-xs"
          >
            {isRtl ? "پاک کردن جستجو" : "Reset Search"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredHoldings.map((holding) => {
            const displayName = getHoldingDisplayName(holding, isRtl);
            const displayDescription = getHoldingDisplayDescription(holding, isRtl);

            return (
              <div
                key={holding.id}
                onClick={() => handleOpenDetail(holding)}
                className="group rounded-2xl border border-border/80 hover:border-primary/50 bg-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer text-start relative overflow-hidden"
              >
                {/* Top Section: Logo & Core Info */}
                <div className="space-y-4">
                  {/* 1. Large Crisp Logo Showcase */}
                  <div className="relative group/logo-thumb w-full">
                    <div className="w-full h-36 sm:h-40 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-border/70 p-4 sm:p-5 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-primary/40 group-hover:shadow-xs transition-all">
                      {holding.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={holding.logoUrl}
                          alt={displayName}
                          className="max-h-24 sm:max-h-28 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105 select-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-1.5 text-primary/70 group-hover:text-primary transition-colors">
                          <Building2 className="size-10" />
                          <span className="text-sm font-bold font-mono tracking-wider">{holding.companyAbbrv}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Logo Download Button */}
                    {holding.logoUrl && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = await downloadLogo(holding.logoUrl || "", holding.nameFa);
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
                      className="text-[10px] py-0 px-2 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{isRtl ? "هلدینگ مگا و فعال" : "Major Conglomerate"}</span>
                    </Badge>

                    {holding.tseSymbol ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 px-2 h-5 font-bold bg-primary/10 text-primary border-primary/20"
                      >
                        {isRtl ? `نماد: ${holding.tseSymbol}` : `TSE: ${holding.companyAbbrv}`}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 px-2 h-5 font-medium bg-muted text-muted-foreground"
                      >
                        {isRtl ? "سهامی خاص / بین‌المللی" : "Global / Private"}
                      </Badge>
                    )}

                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 h-5 font-mono font-bold text-muted-foreground ms-auto"
                    >
                      {holding.companyAbbrv}
                    </Badge>
                  </div>

                  {/* 3. Holding Title & Subtitle */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">
                      {isRtl ? holding.nameEn : holding.companyAbbrv}
                    </p>
                  </div>

                  {/* 4. Description (2 lines maximum) */}
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {displayDescription}
                  </p>
                </div>

                {/* Bottom Section: Key Stats & CTA */}
                <div className="pt-4 mt-4 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                    {/* Subsidiaries count */}
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
                      <Factory className="size-3.5 text-primary shrink-0" />
                      <span>{formatLocaleNumber(holding.subsidiaries.length, isRtl)} {isRtl ? "شرکت تابعه" : "Subsidiaries"}</span>
                    </span>

                    {/* Est. Year */}
                    <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                      <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                      <span>{isRtl ? `تاسیس ${formatLocaleNumber(holding.establishedYear, true)}` : `Est. ${holding.establishedYear}`}</span>
                    </span>
                  </div>

                  {/* View Details Action Button */}
                  <div className="w-full h-8.5 rounded-xl bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground border border-border/70 group-hover:border-primary flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground transition-all shadow-2xs">
                    <Info className="size-3.5" />
                    <span>{isRtl ? "مشاهده جزئیات و شرکت‌های تابعه" : "View Details & Subsidiaries"}</span>
                    <ArrowUpRight className="size-3.5 ms-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Luxury Tabbed Holding Detail Popup Modal ── */}
      <HoldingDetailModal
        holding={detailHolding}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailHolding(null);
        }}
      />
    </div>
  );
}
