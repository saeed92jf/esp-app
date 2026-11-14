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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import type { Holding, HoldingSubsidiary } from "../types/holdings.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function HoldingsDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const urlHoldingId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [expandedHoldingId, setExpandedHoldingId] = useState<string | null>("pgpic");
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  useEffect(() => {
    if (urlHoldingId) {
      setExpandedHoldingId(urlHoldingId);
      const found = IRANIAN_HOLDINGS.find((h) => h.id === urlHoldingId);
      if (found) {
        setSelectedHolding(found);
      }
    }
  }, [urlHoldingId]);

  const filteredHoldings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return IRANIAN_HOLDINGS;

    return IRANIAN_HOLDINGS.filter((h) => {
      const matchName =
        h.nameFa.toLowerCase().includes(q) ||
        h.nameEn.toLowerCase().includes(q) ||
        h.companyAbbrv.toLowerCase().includes(q) ||
        (h.tseSymbol && h.tseSymbol.toLowerCase().includes(q)) ||
        h.headquartersFa.toLowerCase().includes(q) ||
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
  }, [search]);

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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              {IRANIAN_HOLDINGS.length} <span className="text-xs font-normal text-muted-foreground">{isRtl ? "هلدینگ مگا" : "Holdings"}</span>
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              {totalSubsidiaries}+ <span className="text-xs font-normal text-muted-foreground">{isRtl ? "مجتمع صنعتی" : "Complexes"}</span>
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              ۷۵+ <span className="text-xs font-normal text-muted-foreground">{isRtl ? "میلیون تن" : "Million Tons"}</span>
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
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
              ۱،۳۰۰+ <span className="text-xs font-normal text-muted-foreground">{isRtl ? "هزار میلیارد ت" : "T Tomans"}</span>
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span>
            {isRtl
              ? "داده‌های مستند رسمی کدال (Codal) و سازمان بورس اوراق بهادار تهران"
              : "Official Codal and Tehran Stock Exchange (TSE) verified data"}
          </span>
        </div>
      </div>

      {/* ── 3. Holdings Cards List ── */}
      <div className="space-y-4">
        {filteredHoldings.map((holding) => {
          const isExpanded = expandedHoldingId === holding.id;

          return (
            <div
              key={holding.id}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs transition-all duration-200 hover:border-primary/40"
            >
              {/* Card Header Summary */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="relative size-14 rounded-2xl bg-white dark:bg-card border border-border/80 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                          {holding.nameFa}
                        </h2>
                        {holding.tseSymbol && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 font-bold font-mono text-xs px-2.5 py-0.5"
                          >
                            {isRtl ? `نماد بورس: ${holding.tseSymbol}` : `TSE: ${holding.tseSymbol}`}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {holding.companyAbbrv}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {holding.nameEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {holding.codalUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer"
                      >
                        <a href={holding.codalUrl} target="_blank" rel="noopener noreferrer">
                          <span>{isRtl ? "گزارش‌های کدال" : "Codal Reports"}</span>
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHolding(holding)}
                      className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer text-primary border-primary/30 hover:bg-primary hover:text-white"
                    >
                      <Info className="size-3.5" />
                      <span>{isRtl ? "شناسنامه کامل" : "Full Profile"}</span>
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed text-justify">
                  {holding.descriptionFa}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "ظرفیت سالانه" : "Annual Capacity"}</span>
                    <span className="font-semibold text-foreground truncate block mt-0.5">{holding.annualCapacityFa}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "مدیرعامل" : "CEO"}</span>
                    <span className="font-semibold text-foreground truncate block mt-0.5">{holding.ceoNameFa}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "تعداد زیرمجموعه‌ها" : "Subsidiaries"}</span>
                    <span className="font-bold font-mono text-primary block mt-0.5">{holding.subsidiaries.length} {isRtl ? "مجتمع تابعه" : "Companies"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "دفتر مرکزی" : "Headquarters"}</span>
                    <span className="font-semibold text-foreground truncate block mt-0.5">{holding.headquartersFa.split("،")[0]}</span>
                  </div>
                </div>

                {/* Shareholders Distribution Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <PieChart className="size-3.5 text-primary" />
                      <span>{isRtl ? "ترکیب سهامداران عمده (Codal):" : "Major Shareholders (Codal):"}</span>
                    </span>
                    <span className="text-muted-foreground text-[10.5px]">
                      {holding.shareholders.map((s) => `${s.nameFa.split(" ")[0]} (${s.percentage}%)`).slice(0, 3).join(" • ")}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
                    {holding.shareholders.map((sh, idx) => {
                      const colors = [
                        "bg-primary",
                        "bg-blue-600",
                        "bg-emerald-600",
                        "bg-amber-500",
                        "bg-purple-600",
                        "bg-slate-400",
                      ];
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

                {/* Toggle Subsidiaries Button */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setExpandedHoldingId(isExpanded ? null : holding.id)}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <span>
                      {isExpanded
                        ? isRtl
                          ? "بستن فهرست شرکت‌های تابعه"
                          : "Hide Subsidiaries"
                        : isRtl
                        ? `مشاهده شرکت‌های زیرمجموعه و پتروشیمی‌های تابعه (${holding.subsidiaries.length} شرکت)`
                        : `View Subsidiaries & Plants (${holding.subsidiaries.length} Companies)`}
                    </span>
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  <span className="text-[11px] text-muted-foreground">
                    {isRtl ? `تاسیس: سال ${holding.establishedYear}` : `Est. ${holding.establishedYear}`}
                  </span>
                </div>
              </div>

              {/* Collapsible Subsidiaries List */}
              {isExpanded && (
                <div className="border-t border-border/70 bg-muted/[0.15] p-5 sm:p-6 space-y-3 animate-in fade-in duration-150">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <span>{isRtl ? "پتروشیمی‌ها و مجتمع‌های تحت مالکیت هلدینگ:" : "Subsidiary Companies & Complexes:"}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {holding.subsidiaries.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{sub.nameFa}</span>
                              {sub.tseSymbol && (
                                <Badge variant="secondary" className="text-[10.5px] px-1.5 py-0 font-mono">
                                  {sub.tseSymbol}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{sub.industry}</div>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs font-mono font-bold shrink-0",
                              sub.ownershipPercentage >= 70
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-primary/10 text-primary border-primary/30"
                            )}
                          >
                            {sub.ownershipPercentage}% {isRtl ? "مالکیت" : "Ownership"}
                          </Badge>
                        </div>

                        {sub.capacity && (
                          <div className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                            <Factory className="size-3 text-muted-foreground shrink-0" />
                            <span>{sub.capacity}</span>
                          </div>
                        )}

                        {sub.products && sub.products.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                            {sub.products.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40 font-medium"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Cross-Link Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px]">
                          {sub.plantLocation ? (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 truncate max-w-[170px]">
                              <MapPin className="size-3 shrink-0" />
                              <span className="truncate">{sub.plantLocation}</span>
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-1.5 ms-auto">
                            {sub.plantId && (
                              <Link
                                href={`/customers?tab=plants&id=${sub.plantId}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                              >
                                <Factory className="size-3" />
                                <span>{isRtl ? "مشاهده پلنت" : "View Plant"}</span>
                              </Link>
                            )}
                            {sub.isCustomerOfEsp && (
                              <Link
                                href={`/customers?search=${encodeURIComponent(sub.nameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                                title={isRtl ? "جستجو در بانک مشتریان Euroslot" : "Search in Euroslot clients"}
                              >
                                <CheckCircle2 className="size-3 text-emerald-500" />
                                <span>{isRtl ? "کارفرمای ESP" : "ESP Client"}</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Card Sources & Information Footer ── */}
              <div className="p-4 sm:px-6 bg-muted/20 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground/90 shrink-0">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>{isRtl ? "منابع و مراجع داده:" : "Data Sources:"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {holding.sources && holding.sources.length > 0 ? (
                      holding.sources.map((src, sIdx) => (
                        <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border/70 text-foreground/80">
                          {src.url ? (
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                              <span>{src.publisherFa}</span>
                              <ExternalLink className="size-2.5 opacity-60" />
                            </a>
                          ) : (
                            <span>{src.publisherFa}</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-[11px]">
                        {isRtl ? "سازمان بورس و اوراق بهادار تهران • سامانه کدال • شرکت ملی صنایع پتروشیمی (NPC)" : "TSE • Codal • NPC"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ms-auto shrink-0">
                  {holding.codalUrl && (
                    <a
                      href={holding.codalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span>{isRtl ? "صورت‌های مالی کدال" : "Codal Reports"}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {holding.tsetmcUrl && (
                    <a
                      href={holding.tsetmcUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-foreground/80 hover:text-foreground hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-background hover:bg-muted/40 transition-colors"
                    >
                      <span>{isRtl ? "دیده‌بان بورس TSETMC" : "TSETMC"}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
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
              <div className="flex items-center gap-3.5">
                <div className="relative size-14 rounded-2xl bg-white dark:bg-card border border-border/80 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {selectedHolding.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedHolding.logoUrl}
                      alt={selectedHolding.nameFa}
                      className="size-full object-contain"
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
                      <span className="font-mono font-bold text-primary text-sm">{sh.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corporate Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "نشانی دفتر مرکزی" : "HQ Address"}</span>
                  <span className="font-medium text-foreground block">{selectedHolding.headquartersFa}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{isRtl ? "وب‌سایت رسمی" : "Website"}</span>
                  {selectedHolding.website ? (
                    <a
                      href={selectedHolding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono font-medium flex items-center gap-1"
                    >
                      <span>{selectedHolding.website.replace("https://", "")}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>---</span>
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

