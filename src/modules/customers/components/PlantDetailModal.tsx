// src/modules/customers/components/PlantDetailModal.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  X,
  Factory,
  Flame,
  Cpu,
  Landmark,
  Boxes,
  TrendingUp,
  ArrowUpRight,
  BookUser,
  Download,
  ShieldCheck,
  Sparkles,
  Info,
  Building2,
  ExternalLink,
  MapPin,
  Calendar,
  Gauge,
  Check,
  Layers,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { downloadLogo } from "../utils/download-logo";
import { getUnifiedHoldingInfo } from "../utils/petro-unifier";
import {
  getPlantDisplayName,
  getPlantDisplayComplex,
  getPlantDisplayProcessLabel,
  getPlantDisplayZoneLabel,
  getPlantDisplayDescription,
  getPlantDisplayCapacity,
  getPlantDisplayFeedstock,
  getPlantDisplayProduct,
  getPlantDisplayHolding,
  getPlantDisplayYear,
} from "../utils/plant-translations";
import type { PlantFacility, PlantProcessType } from "../types/plants.types";

interface PlantDetailModalProps {
  plant: PlantFacility | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export function PlantDetailModal({ plant, isOpen, onClose }: PlantDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<string>("overview");

  if (!isOpen || !plant) return null;

  const displayName = getPlantDisplayName(plant, isRtl);
  const displayComplex = getPlantDisplayComplex(plant, isRtl);
  const displayProcess = getPlantDisplayProcessLabel(plant.processType, isRtl);
  const displayZone = getPlantDisplayZoneLabel(plant.locationZone, isRtl);
  const displayCapacity = getPlantDisplayCapacity(plant, isRtl);
  const displayDescription = getPlantDisplayDescription(plant, isRtl);
  const displayYear = getPlantDisplayYear(plant, isRtl);

  const holdingInfo = getUnifiedHoldingInfo(plant);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-4xl md:max-w-4xl lg:max-w-5xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-h-[92vh] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-card border-border rounded-2xl sm:rounded-3xl shadow-2xl z-[100]"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>

        {/* ── 1. Modal Top Banner / Header (Sticky) ── */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-border/80 bg-muted/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            {/* Logo Card with Hover Download */}
            <div className="relative group/logo size-20 sm:size-24 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {plant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={plant.logoUrl}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain select-none transition-transform duration-200 group-hover/logo:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="size-full rounded-xl bg-primary/10 text-primary font-bold font-mono text-base flex items-center justify-center">
                  <Factory className="size-8" />
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn("text-[10.5px] py-0 px-2 h-5 font-semibold border", getProcessBadgeColor(plant.processType))}
                >
                  <Factory className="size-3 me-1 shrink-0" />
                  <span>{displayProcess}</span>
                </Badge>

                <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 font-medium border-border/70">
                  <MapPin className="size-3 me-1 shrink-0 text-primary" />
                  <span>{displayZone}</span>
                </Badge>

                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 font-mono font-bold text-primary bg-primary/5 border-primary/20">
                  {plant.code}
                </Badge>

                {plant.tseSymbol && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 font-bold bg-primary/10 text-primary border-primary/20">
                    {isRtl ? `نماد: ${plant.tseSymbol}` : `TSE: ${plant.tseSymbol}`}
                  </Badge>
                )}

                {plant.phaseFa && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 font-medium text-muted-foreground border-border/60">
                    {plant.phaseFa}
                  </Badge>
                )}
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground truncate font-sans">
                {displayComplex}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {plant.logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await downloadLogo(plant.logoUrl || "", displayName);
                  if (ok) {
                    toast.success(isRtl ? "لوگو دانلود شد." : "Logo downloaded.");
                  }
                }}
                className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
                title={isRtl ? "دانلود فایل باکیفیت لوگو" : "Download Logo"}
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">{isRtl ? "دانلود لوگو" : "Download"}</span>
              </Button>
            )}

            {plant.holdingId && plant.holdingId !== "private" && (
              <Link
                href={`/customers?tab=holdings&id=${plant.holdingId}`}
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold gap-1"
                title={isRtl ? "مشاهده پرونده هلدینگ مادر" : "View Parent Holding"}
              >
                <Landmark className="size-3.5" />
                <span className="hidden sm:inline">{isRtl ? "هلدینگ مادر" : "Holding"}</span>
              </Link>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* ── 2. Modal Body with Tabs ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 gap-0"
          >
            {/* Tabs Navigation Bar */}
            <div className="px-4 sm:px-6 pt-3 border-b border-border/80 bg-background/95 shrink-0 overflow-x-auto no-scrollbar">
              <TabsList variant="line" className="h-10 gap-2 sm:gap-4 p-0">
                <TabsTrigger
                  value="overview"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Factory className="size-4" />
                  <span>{isRtl ? "مشخصات و ظرفیت تولید" : "Overview & Capacity"}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="technology"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Cpu className="size-4" />
                  <span>{isRtl ? "لایسنسورها و فرآیند" : "Licensors & Process"}</span>
                  {plant.licensors?.length > 0 && (
                    <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4.5 rounded-full font-bold bg-primary text-primary-foreground">
                      {plant.licensors.length}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="euroslot"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Sparkles className="size-4" />
                  <span>{isRtl ? "تجهیزات بومی‌سازی شده ESP" : "Euroslot Pars Installed Base"}</span>
                  {plant.espInstalledBase && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 rounded-full font-bold border-primary text-primary bg-primary/10">
                      ✓
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="governance"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Landmark className="size-4" />
                  <span>{isRtl ? "هلدینگ، سهامداری و مراجع" : "Holding & Governance"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tab Contents */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {/* ── TAB 1: OVERVIEW & CAPACITY ── */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Description Box */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Info className="size-4 text-primary" />
                    <span>{isRtl ? "شرح فرآیند و کارکرد مجتمع" : "Process Overview & Operation"}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground text-justify">
                    {displayDescription}
                  </p>
                </div>

                {/* Technical Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
                    <div className="text-[10.5px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Gauge className="size-3.5 text-primary" />
                      <span>{isRtl ? "ظرفیت اسمی سالانه" : "Nominal Capacity"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-foreground truncate">
                      {displayCapacity}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
                    <div className="text-[10.5px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-amber-500" />
                      <span>{isRtl ? "سال راه‌اندازی" : "Commissioning Year"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                      {displayYear}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
                    <div className="text-[10.5px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-emerald-500" />
                      <span>{isRtl ? "منطقه عملیاتی" : "Operational Zone"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-foreground truncate">
                      {displayZone}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
                    <div className="text-[10.5px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Layers className="size-3.5 text-blue-500" />
                      <span>{isRtl ? "کد اختصاصی واحد" : "Unit Code"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-foreground font-mono">
                      {plant.code}
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Factory className="size-4 text-primary" />
                    <span>{isRtl ? "جدول مشخصات فنی و عملیاتی" : "Technical & Operational Specifications"}</span>
                  </h3>

                  <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="w-1/3 sm:w-1/4 font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "نام مجتمع پتروشیمی مادر" : "Parent Petrochemical Complex"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-foreground py-2.5">
                            {displayComplex}
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "نوع واحد فرآیندی تخصصی" : "Process Unit Classification"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 font-medium text-foreground">
                            {displayProcess} {plant.unitTypeFa ? `(${plant.unitTypeFa})` : ""}
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "موقعیت جغرافیایی و استان" : "Geographic Site & Province"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 text-foreground leading-relaxed">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary shrink-0" />
                              <span>{isRtl ? plant.locationFa : `${displayZone}, Iran`}</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "خوراک مصرفی فرآیند" : "Process Feedstock"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 font-medium text-foreground">
                            {getPlantDisplayFeedstock(plant, isRtl)}
                          </TableCell>
                        </TableRow>

                        {plant.feedstockSourceFa && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "تأمین‌کننده خوراک" : "Feedstock Supplier"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground font-mono">
                              {plant.feedstockSourceFa}
                            </TableCell>
                          </TableRow>
                        )}

                        {plant.phaseFa && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "فاز یا بخش پروژه" : "Phase / Project Section"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground">
                              {plant.phaseFa}
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "وضعیت عملیاتی" : "Operational Status"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{isRtl ? "در حال بهره‌برداری تجاری" : "Commercial Operation"}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Quick Action Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Link
                    href={`/customers?search=${encodeURIComponent(plant.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/[0.03] transition-all shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Search className="size-4" />
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {isRtl ? "فهرست کارفرمایان و پرونده کامل" : "Client Directory Record"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isRtl ? "مشاهده شرکت در تب مشتریان" : "Inspect company record in Clients"}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>

                  <Link
                    href={`/customers?tab=phonebook&company=${encodeURIComponent(plant.complexNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/[0.03] transition-all shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <BookUser className="size-4" />
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {isRtl ? "دفترچه تلفن و مخاطبین مجتمع" : "Phonebook & Contacts"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isRtl ? "شماره تماس کارشناسان و مدیران" : "View plant personnel & contacts"}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </TabsContent>

              {/* ── TAB 2: LICENSORS & PROCESS ── */}
              <TabsContent value="technology" className="space-y-6 mt-0">
                {/* Licensors Showcase */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                      <Boxes className="size-4 text-primary" />
                      <span>{isRtl ? "لایسنسورها و صاحبان دانش فنی فرآیند:" : "Process Licensors & Technology Providers:"}</span>
                    </div>
                    <Link
                      href="/customers?tab=licensors"
                      onClick={onClose}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{isRtl ? "مشاهده دایرکتوری لایسنسورها" : "Licensors Directory"}</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {plant.licensors && plant.licensors.length > 0 ? (
                      plant.licensors.map((lic, idx) => (
                        <Link
                          key={idx}
                          href={`/customers?tab=licensors&q=${encodeURIComponent(lic)}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors"
                        >
                          <Boxes className="size-3.5" />
                          <span>{lic}</span>
                          <ArrowUpRight className="size-3 opacity-60" />
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">{isRtl ? "تحت لیسانس معتبر فرآیندی" : "Standard Process License"}</span>
                    )}
                  </div>
                </div>

                {/* Main Chemical Output */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-500" />
                    <span>{isRtl ? "فرآورده‌ها و محصولات اصلی تولیدی واحد:" : "Primary & Intermediate Chemical Products:"}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {plant.mainProductsFa.map((prod, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs py-1 px-2.5 bg-muted/30 text-foreground border-border/80 font-medium"
                      >
                        {getPlantDisplayProduct(prod, isRtl)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cracking Furnaces & Pyrolysis Reactors Card */}
                {plant.reactorOrFurnaceInfoFa && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 space-y-2.5">
                    <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 text-xs sm:text-sm">
                      <Flame className="size-4.5" />
                      <span>{isRtl ? "مشخصات کوره‌های کراکینگ و راکتورهای پیرولیز:" : "Cracking Furnaces & Pyrolysis Reactors:"}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                      {plant.reactorOrFurnaceInfoFa}
                    </p>
                  </div>
                )}

                {/* Engineering & EPC Contractors */}
                {plant.engineeringCompanies && plant.engineeringCompanies.length > 0 && (
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Building2 className="size-3.5 text-primary" />
                      <span>{isRtl ? "پیمانکاران مهندسی و اجرای طرح (EPC / Detail Design):" : "Engineering & EPC Contractors:"}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {plant.engineeringCompanies.map((eng, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-0.5 px-2">
                          {eng}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 3: EUROSLOT PARS INSTALLED BASE ── */}
              <TabsContent value="euroslot" className="space-y-6 mt-0">
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/25 space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                    <Sparkles className="size-4.5" />
                    <span>{isRtl ? "تجهیزات و خدمات مهندسی یوروصلات پارس (Euroslot Pars)" : "Euroslot Pars Engineering Solutions"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                    {isRtl ? (
                      <>
                        شرکت مهندسی <strong>یوروصلات پارس</strong> به عنوان شریک راهبردی و تامین‌کننده دانش‌بنیان، توری‌های اسکرین وِج‌وایر (Wedge Wire Screens)، تجهیزات دقیق اینترنال رآکتور، سنترپایپ‌ها، بسکت‌های کاتالیستی، سینی‌های فرآیندی و المان‌های پیشرفته فیلتراسیون را برای راکتورها و خطوط فرآیندی این مجتمع مهندسی، بومی‌سازی و تامین می‌نماید.
                      </>
                    ) : (
                      <>
                        <strong>Euroslot Pars</strong> supplies high-precision wedge wire screens, reactor internals, catalyst baskets, center pipes, process trays, and filtration packages tailored for the operational units of this plant.
                      </>
                    )}
                  </p>
                </div>

                {/* Specific Installed Base Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های ثبت‌شده این پلنت (Installed Base):" : "Registered ESP Installed Base in this Plant:"}</span>
                  </div>

                  {plant.espInstalledBase ? (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs sm:text-sm leading-relaxed text-foreground font-medium">
                      {plant.espInstalledBase}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-xs text-muted-foreground space-y-1">
                      <div>{isRtl ? "تجهیزات اینترنال رآکتور، سینی‌های فرآیندی و اسکرین‌های تحت فشار در حال بهره‌برداری و تامین قطعات یدکی." : "Reactor internals, process trays, and pressure screens operational with spare parts support."}</div>
                    </div>
                  )}
                </div>

                {/* Core Advantages List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "مزیت‌های فنی قطعات یوروصلات پارس در این واحد:" : "Key Technical Advantages of Euroslot Pars Solutions:"}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
                    <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{isRtl ? "مقاومت مکانیکی فوق‌العاده در برابر فشار دیفرانسیلی بالا" : "Superior mechanical strength under extreme differential pressures"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{isRtl ? "دقت میکرونی شیارها و جلوگیری قطعی از فرار کاتالیست" : "Micronic slot precision preventing catalyst migration"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{isRtl ? "سطح مقطع پیوسته V شکل بدون گرفتگی (Anti-Clogging)" : "Continuous V-shape profile for zero clogging performance"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{isRtl ? "پشتیبانی کامل در اورهال، مهندسی معکوس و تحویل سریع" : "Full turnaround support, reverse engineering & rapid delivery"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 4: HOLDING & GOVERNANCE ── */}
              <TabsContent value="governance" className="space-y-6 mt-0">
                {/* Parent Holding Card */}
                {holdingInfo ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-white dark:bg-zinc-900 border border-border/80 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {holdingInfo.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={holdingInfo.logoUrl}
                              alt={holdingInfo.nameFa}
                              className="size-full object-contain"
                            />
                          ) : (
                            <Landmark className="size-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground font-medium">
                            {isRtl ? "هلدینگ مادر و سهامدار عمده:" : "Parent Conglomerate:"}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-foreground">
                            {isRtl ? holdingInfo.nameFa : holdingInfo.nameEn}
                          </h4>
                        </div>
                      </div>

                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {holdingInfo.companyAbbrv}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                      {isRtl ? holdingInfo.descriptionFa : (holdingInfo.descriptionEn || "Major industrial holding conglomerate.")}
                    </p>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <Link
                        href={`/customers?tab=holdings&id=${holdingInfo.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <Landmark className="size-3.5" />
                        <span>{isRtl ? `مشاهده پرونده کامل ${holdingInfo.nameFa}` : `View ${holdingInfo.companyAbbrv} Holding Profile`}</span>
                        <ArrowUpRight className="size-3" />
                      </Link>

                      {holdingInfo.codalUrl && (
                        <a
                          href={holdingInfo.codalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          <span>{isRtl ? "کدال" : "Codal"}</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Landmark className="size-3.5 text-primary" />
                      <span>{isRtl ? "هلدینگ یا شرکت مادر:" : "Parent Group:"}</span>
                    </span>
                    <div className="text-xs font-semibold text-foreground">
                      {getPlantDisplayHolding(plant, isRtl)}
                    </div>
                  </div>
                )}

                {/* Ownership Structure */}
                {(plant.owner1Fa || plant.owner2Fa) && (
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2 text-xs">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-primary" />
                      <span>{isRtl ? "سهامداران و ساختار مالکیتی:" : "Shareholders & Ownership:"}</span>
                    </span>
                    <div className="space-y-1.5 text-muted-foreground pt-1">
                      {plant.owner1Fa && <div className="flex items-center gap-1.5">• <span>{plant.owner1Fa}</span></div>}
                      {plant.owner2Fa && <div className="flex items-center gap-1.5">• <span>{plant.owner2Fa}</span></div>}
                    </div>
                  </div>
                )}

                {/* Verified Data Sources */}
                {plant.sources && plant.sources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <span>{isRtl ? "مراجع رسمی اطلاعات این پلنت:" : "Official References & NPC Records:"}</span>
                    </h4>
                    <div className="space-y-1.5">
                      {plant.sources.map((src, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
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
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* ── 3. Modal Footer ── */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="hidden sm:inline">
              {isRtl
                ? "بانک اطلاعات جامع پلنت‌ها و مجتمع‌های پتروشیمی ایران"
                : "Iran Petrochemical & Refinery Plants Directory"}
            </span>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-5 h-8 cursor-pointer"
          >
            {isRtl ? "بستن" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
