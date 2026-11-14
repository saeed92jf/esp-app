// src/modules/customers/components/HoldingDetailModal.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Factory,
  PieChart,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Download,
  Phone,
  ArrowUpRight,
  X,
  Layers,
  Info,
  Copy,
  Check,
  User,
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
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import type { Holding, HoldingSubsidiary } from "../types/holdings.types";
import { getAllUnifiedPlants } from "../utils/petro-unifier";
import {
  getHoldingDisplayName,
  getHoldingDisplayDescription,
  getHoldingDisplayCapacity,
  getHoldingDisplayMarketCap,
  getHoldingDisplayHeadquarters,
  getHoldingDisplayCeo,
  getHoldingDisplayHighlights,
  getShareholderDisplayName,
  getSubsidiaryDisplayName,
  getSubsidiaryDisplayIndustry,
} from "../utils/holding-translations";

interface HoldingDetailModalProps {
  holding: Holding | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export function HoldingDetailModal({
  holding,
  isOpen,
  onClose,
}: HoldingDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !holding) return null;

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "کپی شد" : "Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const displayName = getHoldingDisplayName(holding, isRtl);
  const displayDescription = getHoldingDisplayDescription(holding, isRtl);

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
            {/* Logo Card */}
            <div className="relative group/logo size-20 sm:size-24 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {holding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={holding.logoUrl}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain select-none transition-transform duration-200 group-hover/logo:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="size-full rounded-xl bg-primary/10 text-primary font-bold font-mono text-base flex items-center justify-center">
                  {holding.companyAbbrv.slice(0, 4)}
                </div>
              )}
            </div>

            {/* Holding Title & Tags */}
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10.5px] py-0 px-2 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? "هلدینگ مگا و فعال" : "Major Conglomerate"}</span>
                </Badge>

                {holding.tseSymbol && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 font-bold bg-primary/10 text-primary border-primary/20">
                    {isRtl ? `نماد بورس: ${holding.tseSymbol}` : `TSE: ${holding.companyAbbrv}`}
                  </Badge>
                )}

                <Badge variant="outline" className="text-[10.5px] py-0 px-2 h-5 border-border font-mono font-bold">
                  {holding.companyAbbrv}
                </Badge>
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground truncate font-sans">
                {isRtl ? holding.nameEn : holding.companyAbbrv}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {holding.logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await downloadLogo(holding.logoUrl, holding.nameFa);
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

            {holding.codalUrl && (
              <a
                href={holding.codalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors text-xs font-semibold text-muted-foreground gap-1"
                title={isRtl ? "مشاهده در سامانه جامع کدال" : "View on Codal"}
              >
                <span>{isRtl ? "کدال" : "Codal"}</span>
                <ExternalLink className="size-3.5" />
              </a>
            )}

            {holding.website && (
              <a
                href={holding.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center size-8 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                title={holding.website}
              >
                <ExternalLink className="size-4" />
              </a>
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
                  <Building2 className="size-4" />
                  <span>{isRtl ? "مشخصات و سهامداران" : "Overview & Shareholders"}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="subsidiaries"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Factory className="size-4" />
                  <span>{isRtl ? "شرکت‌ها و مجتمع‌های تابعه" : "Subsidiaries & Plants"}</span>
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4.5 rounded-full font-bold bg-primary text-primary-foreground">
                    {formatLocaleNumber(holding.subsidiaries.length, isRtl)}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="strategy"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <TrendingUp className="size-4" />
                  <span>{isRtl ? "مزیت‌های استراتژیک و ارزش بازار" : "Strategic Advantages"}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="sources"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <ShieldCheck className="size-4" />
                  <span>{isRtl ? "مراجع و اسناد رسمی" : "Official Sources"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {/* ── TAB 1: OVERVIEW & SHAREHOLDERS ── */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Description Preview */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Info className="size-4 text-primary" />
                    <span>{isRtl ? "معرفی اجمالی هلدینگ" : "Conglomerate Overview"}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground text-justify">
                    {displayDescription}
                  </p>
                </div>

                {/* Corporate Details Table */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <span>{isRtl ? "مشخصات ثبتی و شرکتی" : "Corporate & Registration Specifications"}</span>
                  </h3>

                  <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="w-1/3 sm:w-1/4 font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "نام کامل هلدینگ" : "Full Corporate Name"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-foreground py-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span>{isRtl ? holding.nameFa : holding.nameEn}</span>
                              <Badge variant="outline" className="text-[10px] w-fit font-mono font-bold">
                                {holding.companyAbbrv}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>

                        {holding.ceoNameFa && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "مدیرعامل" : "Chief Executive Officer (CEO)"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-bold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <User className="size-3.5 text-primary" />
                                <span>{getHoldingDisplayCeo(holding, isRtl)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "دفتر مرکزی و ستاد" : "Headquarters"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 text-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary shrink-0" />
                              <span>{getHoldingDisplayHeadquarters(holding, isRtl)}</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {holding.officeAddressFa && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "نشانی پستی دقیق" : "Postal Address"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground leading-relaxed">
                              {isRtl ? holding.officeAddressFa : getHoldingDisplayHeadquarters(holding, false)}
                            </TableCell>
                          </TableRow>
                        )}

                        {holding.postalCode && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "کد پستی" : "Postal Code"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-mono text-foreground">
                              {holding.postalCode}
                            </TableCell>
                          </TableRow>
                        )}

                        {holding.establishedYear && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "سال تأسیس" : "Established Year"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-muted-foreground" />
                                <span className={cn(isRtl && "fa-num")}>{formatLocaleNumber(holding.establishedYear, isRtl)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {holding.nationalIdNumber && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "شناسه ملی / ثبت" : "National ID / Reg. No."}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-mono text-foreground">
                              <span>{holding.nationalIdNumber}</span>
                              {holding.registrationNumber && (
                                <span className="text-muted-foreground ms-2">
                                  ({isRtl ? `ثبت: ${holding.registrationNumber}` : `Reg: ${holding.registrationNumber}`})
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Direct Contact Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-primary" />
                        <span>{isRtl ? "تلفن تماس مرکزی" : "Central Telephone"}</span>
                      </span>
                      {holding.officePhone && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleCopy(holding.officePhone || "", "phone", e)}
                          className="size-6 text-muted-foreground hover:text-foreground"
                          title={isRtl ? "کپی شماره" : "Copy"}
                        >
                          {copiedField === "phone" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </Button>
                      )}
                    </div>
                    <div>
                      {holding.officePhone ? (
                        <a
                          href={`tel:${holding.officePhone}`}
                          className="text-xs sm:text-sm font-mono font-bold text-foreground hover:text-primary transition-colors ltr inline-block"
                        >
                          {holding.officePhone}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">{isRtl ? "ثبت نشده" : "Not registered"}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ExternalLink className="size-3.5 text-primary" />
                      <span>{isRtl ? "پایگاه اینترنتی رسمی" : "Official Website"}</span>
                    </div>
                    <div>
                      {holding.website ? (
                        <a
                          href={holding.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{holding.website.replace(/^https?:\/\//, "")}</span>
                          <ArrowUpRight className="size-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">{isRtl ? "ثبت نشده" : "Not registered"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Major Shareholders Table */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <PieChart className="size-4 text-primary" />
                    <span>{isRtl ? "ترکیب سهامداران عمده و ساختار مالکیت" : "Major Shareholders Structure"}</span>
                  </h3>

                  <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card divide-y divide-border/60 text-xs">
                    {holding.shareholders.map((sh, idx) => (
                      <div key={idx} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <span className="font-semibold text-foreground flex-1 min-w-0 truncate">
                          {getShareholderDisplayName(sh, isRtl)}
                        </span>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="w-24 sm:w-32 h-2 rounded-full bg-muted/60 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(sh.percentage, 100)}%` }}
                            />
                          </div>
                          <span className={cn("font-bold text-primary font-mono text-sm tabular-nums min-w-[50px] text-end", isRtl && "fa-num")}>
                            {formatLocaleNumber(sh.percentage, isRtl)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 2: SUBSIDIARIES & PLANTS ── */}
              <TabsContent value="subsidiaries" className="space-y-4 mt-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Factory className="size-4 text-primary" />
                    <span>{isRtl ? "فهرست مجتمع‌ها و شرکت‌های تابعه" : "Subsidiary Companies & Complexes"}</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {isRtl ? (
                      <span>مجموعاً <strong className="text-primary">{formatLocaleNumber(holding.subsidiaries.length, true)}</strong> شرکت تابعه</span>
                    ) : (
                      <span><strong className="text-primary">{holding.subsidiaries.length}</strong> subsidiaries</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {holding.subsidiaries.map((sub) => {
                    const subLogo = getSubsidiaryLogo(sub);
                    const subName = getSubsidiaryDisplayName(sub, isRtl);
                    const subIndustry = getSubsidiaryDisplayIndustry(sub, isRtl);

                    return (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-11 rounded-xl bg-white dark:bg-zinc-900 border border-border/80 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                {subLogo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={subLogo}
                                    alt={subName}
                                    className="max-h-full max-w-full object-contain select-none"
                                  />
                                ) : (
                                  <Building2 className="size-5 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                  {subName}
                                </h4>
                                <div className="text-[11px] text-muted-foreground truncate font-sans">
                                  {subIndustry}
                                </div>
                              </div>
                            </div>

                            <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-primary/10 text-primary border-primary/20 font-bold shrink-0">
                              {sub.ownershipPercentage}%
                            </Badge>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                              <span>{isRtl ? "موقعیت مجتمع:" : "Location:"}</span>
                              <span className="font-medium text-foreground">
                                {sub.plantLocation ? (isRtl ? sub.plantLocation : (sub.plantLocation.includes("عسلویه") ? "Assaluyeh Energy Zone" : sub.plantLocation.includes("ماهشهر") ? "Mahshahr Petrochemical Zone" : "Iran")) : "—"}
                              </span>
                            </div>
                            {sub.capacity && (
                              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                <span>{isRtl ? "ظرفیت سالانه:" : "Capacity:"}</span>
                                <span className="font-semibold text-foreground">
                                  {isRtl ? sub.capacity : sub.capacity.replace(/میلیون تن در سال/g, "M Tons/Yr").replace(/هزار تن در سال/g, "K Tons/Yr").replace(/تن در سال/g, "Tons/Yr")}
                                </span>
                              </div>
                            )}
                          </div>

                          {sub.products && sub.products.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {sub.products.slice(0, 3).map((prod, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium"
                                >
                                  {prod}
                                </span>
                              ))}
                              {sub.products.length > 3 && (
                                <span className="text-[10px] px-1 py-0.5 rounded-md bg-muted/40 text-muted-foreground/80 font-mono">
                                  +{sub.products.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {sub.plantId && (
                          <div className="pt-2 border-t border-border/60">
                            <Link
                              href={`/customers/plants?q=${encodeURIComponent(sub.nameFa)}`}
                              className="text-[11px] font-bold text-primary hover:underline flex items-center justify-between"
                            >
                              <span>{isRtl ? "مشاهده پلنت در دایرکتوری" : "View Plant Details"}</span>
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* ── TAB 3: STRATEGIC ADVANTAGES & MARKET ── */}
              <TabsContent value="strategy" className="space-y-6 mt-0">
                {/* Metrics Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-primary" />
                      <span>{isRtl ? "ظرفیت اسمی سالانه تولید" : "Total Annual Capacity"}</span>
                    </span>
                    <div className="text-base sm:text-lg font-bold text-foreground">
                      {getHoldingDisplayCapacity(holding, isRtl)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <PieChart className="size-3.5 text-emerald-500" />
                      <span>{isRtl ? "ارزش بازار و سهم در بورس" : "Market Valuation"}</span>
                    </span>
                    <div className="text-base sm:text-lg font-bold text-foreground">
                      {getHoldingDisplayMarketCap(holding, isRtl)}
                    </div>
                  </div>
                </div>

                {/* Strategic Highlights List */}
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                    <ShieldCheck className="size-4.5" />
                    <span>{isRtl ? "مزیت‌های استراتژیک و اهمیت کلان هلدینگ" : "Strategic Advantages & Economic Impact"}</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 list-disc list-inside leading-relaxed">
                    {getHoldingDisplayHighlights(holding, isRtl).map((h, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Euroslot Pars Engineering Support */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                  <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span>{isRtl ? "خدمات و تجهیزات مهندسی یوروصلات پارس" : "Euroslot Pars Engineering Services"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-justify">
                    {isRtl ? (
                      <>
                        شرکت مهندسی <strong>یوروصلات پارس</strong> به عنوان شریک راهبردی و تامین‌کننده دانش‌بنیان، تجهیزات حساس اینترنال رآکتور، توری‌های وِج‌وایر، سنترپایپ‌ها، بسکت‌های کاتالیستی و سیستم‌های پیشرفته فیلتراسیون را برای مجتمع‌های پتروشیمی تابعه این هلدینگ در عسلویه و ماهشهر بومی‌سازی و تامین می‌نماید.
                      </>
                    ) : (
                      <>
                        <strong>Euroslot Pars</strong> supplies high-precision reactor internals, wedge wire screens, catalyst baskets, center pipes, and filtration packages tailored for the operational complexes of this holding across major petrochemical zones.
                      </>
                    )}
                  </p>
                </div>
              </TabsContent>

              {/* ── TAB 4: OFFICIAL SOURCES ── */}
              <TabsContent value="sources" className="space-y-4 mt-0">
                <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>{isRtl ? "اسناد مالی، کدال و مراجع رسمی اطلاعات" : "Audited Financial & Official References"}</span>
                </h3>

                <div className="space-y-2">
                  {holding.sources && holding.sources.length > 0 ? (
                    holding.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground">
                            {isRtl ? src.titleFa : "Official Audited Report & Disclosure (Codal/NPC)"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {isRtl ? src.publisherFa : "Codal / TSE / National Petrochemical Company"}
                          </div>
                        </div>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 font-semibold text-xs shrink-0"
                          >
                            <span>{isRtl ? "مشاهده سند" : "View"}</span>
                            <ArrowUpRight className="size-3" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-1">
                      <div>{isRtl ? "صورت‌های مالی حسابرسی‌شده منتشرشده در سامانه کدال (Codal)" : "Audited financial statements published on Codal."}</div>
                      <div>{isRtl ? "آمارهای رسمی وزارت نفت و شرکت ملی صنایع پتروشیمی (NPC)" : "Official Ministry of Petroleum & NPC operational statistics."}</div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* ── 3. Modal Footer ── */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="hidden sm:inline">
              {isRtl ? "بانک اطلاعات جامع هلدینگ‌های پیشرو پتروشیمی و انرژی ایران" : "Iran Major Energy & Petrochemical Holdings Directory"}
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
