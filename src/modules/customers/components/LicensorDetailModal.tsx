// src/modules/customers/components/LicensorDetailModal.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Download,
  Pencil,
  Copy,
  Check,
  Factory,
  Cpu,
  Wrench,
  ShieldCheck,
  BookOpen,
  X,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
  Calendar,
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
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { downloadLogo } from "../utils/download-logo";
import type { Licensor } from "../types/licensors.types";

interface LicensorDetailModalProps {
  licensor: Licensor | null;
  isOpen: boolean;
  onClose: () => void;
  onEditLogo?: (licensor: Licensor) => void;
  customLogo?: string;
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5 fill-current", className)} viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function LicensorDetailModal({
  licensor,
  isOpen,
  onClose,
  onEditLogo,
  customLogo,
}: LicensorDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [historyLang, setHistoryLang] = useState<"fa" | "en">(isRtl ? "fa" : "en");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !licensor) return null;

  const currentLogo = customLogo !== undefined ? customLogo : (licensor.logoUrl || "");

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "کپی شد" : "Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cleanNameFa = licensor.nameFa.replace(/\s*\([A-Za-z0-9\s/.\-&]+\)/g, "").trim() || licensor.nameFa;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-4xl md:max-w-4xl lg:max-w-5xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-h-[92vh] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-card border-border rounded-2xl sm:rounded-3xl shadow-2xl z-[100]"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{licensor.nameFa}</DialogTitle>
        </DialogHeader>

        {/* ── 1. Modal Top Banner / Header (Sticky) ── */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-border/80 bg-muted/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            {/* Logo Hero Card */}
            <div className="relative group/logo size-20 sm:size-24 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {currentLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentLogo}
                  alt={cleanNameFa}
                  className="max-h-full max-w-full object-contain select-none transition-transform duration-200 group-hover/logo:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/60">
                  <Building2 className="size-8 sm:size-9" />
                  <span className="text-[9px] font-medium mt-0.5">{isRtl ? "بدون لوگو" : "No Logo"}</span>
                </div>
              )}

              {onEditLogo && (
                <button
                  type="button"
                  onClick={() => onEditLogo(licensor)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-2xs opacity-0 group-hover/logo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>{isRtl ? "تغییر" : "Change"}</span>
                </button>
              )}
            </div>

            {/* Licensor Title & Tags */}
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10.5px] py-0 px-2 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? "لایسنسور فعال و معتبر" : "Active Licensor"}</span>
                </Badge>

                {licensor.licenseId && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-mono">
                    ID: {licensor.licenseId}
                  </Badge>
                )}

                <Badge variant="outline" className="text-[10.5px] py-0 px-2 h-5 border-border gap-1 font-medium">
                  <span>{licensor.countryCode === "IR" ? "🇮🇷" : licensor.countryCode === "DE" ? "🇩🇪" : licensor.countryCode === "NL" ? "🇳🇱" : licensor.countryCode === "IT" ? "🇮🇹" : licensor.countryCode === "JP" ? "🇯🇵" : licensor.countryCode === "US" ? "🇺🇸" : licensor.countryCode === "DK" ? "🇩🇰" : licensor.countryCode === "CH" ? "🇨🇭" : "🌐"}</span>
                  <span>{isRtl ? licensor.countryFa : licensor.countryEn}</span>
                </Badge>
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                {isRtl ? cleanNameFa : licensor.nameEn}
              </h2>
              <p className="text-xs text-muted-foreground truncate font-sans">
                {isRtl ? licensor.nameEn : (licensor.headquartersEn || licensor.countryEn)}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {currentLogo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await downloadLogo(currentLogo, licensor.nameFa);
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

            {onEditLogo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditLogo(licensor)}
                className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
                title={isRtl ? "ویرایش و بارگذاری لوگو" : "Edit Logo"}
              >
                <Pencil className="size-3.5" />
                <span className="hidden sm:inline">{isRtl ? "ویرایش لوگو" : "Edit"}</span>
              </Button>
            )}

            {licensor.website && (
              <a
                href={licensor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center size-8 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                title={licensor.website}
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
            {/* Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 border-b border-border/80 bg-background/95 shrink-0 overflow-x-auto no-scrollbar">
              <TabsList variant="line" className="h-10 gap-2 sm:gap-4 p-0">
                <TabsTrigger
                  value="overview"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Building2 className="size-4" />
                  <span>{isRtl ? "مشخصات و ارتباطات" : "Overview & Contacts"}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="processes"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Cpu className="size-4" />
                  <span>{isRtl ? "فرآیندها و تکنولوژی‌ها" : "Processes & Tech"}</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4.5 rounded-full">
                    {licensor.keyTechnologies.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="plants"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Factory className="size-4" />
                  <span>{isRtl ? "واحدهای لایسنس‌شده ایران" : "Licensed Units"}</span>
                  <Badge
                    variant={licensor.licensedPlants.length > 0 ? "default" : "outline"}
                    className={cn(
                      "text-[10px] py-0 px-1.5 h-4.5 rounded-full font-bold",
                      licensor.licensedPlants.length > 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {formatLocaleNumber(licensor.licensedPlants.length, isRtl)}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="history"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <BookOpen className="size-4" />
                  <span>{isRtl ? "تاریخچه و مراجع" : "History & Sources"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tabs Content Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {/* ── TAB 1: OVERVIEW & CONTACTS ── */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Description Preview */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Info className="size-4 text-primary" />
                    <span>{isRtl ? "معرفی اجمالی لایسنسور" : "Licensor Overview"}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground text-justify">
                    {isRtl ? licensor.descriptionFa : (licensor.descriptionEn || licensor.descriptionFa)}
                  </p>
                </div>

                {/* Corporate Details & Legal Specs Table */}
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
                            {isRtl ? "نام رسمی ثبتی" : "Official Legal Name"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-foreground py-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span>{licensor.nameEn}</span>
                              {licensor.licenseId && (
                                <Badge variant="outline" className="text-[10px] w-fit font-mono">
                                  ID #{licensor.licenseId}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "کشور مبدأ و ثبت" : "Country of Origin"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{licensor.countryCode === "IR" ? "🇮🇷" : licensor.countryCode === "DE" ? "🇩🇪" : licensor.countryCode === "NL" ? "🇳🇱" : licensor.countryCode === "IT" ? "🇮🇹" : licensor.countryCode === "JP" ? "🇯🇵" : licensor.countryCode === "US" ? "🇺🇸" : licensor.countryCode === "DK" ? "🇩🇰" : licensor.countryCode === "CH" ? "🇨🇭" : "🌐"}</span>
                              <span className="font-bold text-foreground">{licensor.countryFa}</span>
                              <span className="text-muted-foreground font-sans">({licensor.countryEn})</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "دفتر مرکزی و ستاد" : "Global Headquarters"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 text-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary shrink-0" />
                              <span>{isRtl ? licensor.headquartersFa : (licensor.headquartersEn || licensor.headquartersFa)}</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {(licensor.addressFa || licensor.addressEn) && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "نشانی پستی شرکت" : "Postal Address"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground">
                              <div className="space-y-0.5">
                                <div>{licensor.addressFa || licensor.addressEn}</div>
                                {licensor.addressEn && licensor.addressFa && (
                                  <div className="text-[11px] text-muted-foreground font-sans">{licensor.addressEn}</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {licensor.postCode && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "کد پستی" : "Postal Code"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-mono text-foreground">
                              {licensor.postCode}
                            </TableCell>
                          </TableRow>
                        )}

                        {licensor.establishedYear && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "سال تأسیس" : "Established Year"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-muted-foreground" />
                                <span className={cn(isRtl && "fa-num")}>{formatLocaleNumber(licensor.establishedYear, isRtl)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "وضعیت عملیاتی" : "Operating Status"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5">
                            <Badge variant="outline" className="text-[10px] py-0 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
                              {licensor.currentSituationFa || (isRtl ? "فعال در صنعت بین‌المللی" : "Active & Operating")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Contact Channels Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Phone className="size-4 text-primary" />
                    <span>{isRtl ? "پل‌های ارتباطی مستقیم" : "Communication Channels"}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Telephone */}
                    <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5 text-primary" />
                          <span>{isRtl ? "تلفن تماس بین‌الملل" : "Telephone"}</span>
                        </span>
                        {licensor.telNo && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => handleCopy(licensor.telNo || "", "tel", e)}
                            className="size-6 text-muted-foreground hover:text-foreground"
                            title={isRtl ? "کپی شماره" : "Copy phone"}
                          >
                            {copiedField === "tel" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </Button>
                        )}
                      </div>
                      <div>
                        {licensor.telNo ? (
                          <a
                            href={`tel:${licensor.telNo}`}
                            className="text-xs sm:text-sm font-mono font-bold text-foreground hover:text-primary transition-colors ltr inline-block"
                          >
                            {licensor.telNo}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            {isRtl ? "ثبت نشده" : "Not registered"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5 text-primary" />
                          <span>{isRtl ? "پست الکترونیک رسمی" : "Official Email"}</span>
                        </span>
                        {licensor.email && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => handleCopy(licensor.email || "", "email", e)}
                            className="size-6 text-muted-foreground hover:text-foreground"
                            title={isRtl ? "کپی ایمیل" : "Copy email"}
                          >
                            {copiedField === "email" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </Button>
                        )}
                      </div>
                      <div>
                        {licensor.email ? (
                          <a
                            href={`mailto:${licensor.email}`}
                            className="text-xs sm:text-sm font-mono font-bold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {licensor.email}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            {isRtl ? "ثبت نشده" : "Not registered"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Globe className="size-3.5 text-primary" />
                        <span>{isRtl ? "وب‌سایت رسمی شرکت" : "Official Website"}</span>
                      </div>
                      <div>
                        {licensor.website ? (
                          <a
                            href={licensor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{licensor.website.replace(/^https?:\/\//, "")}</span>
                            <ArrowUpRight className="size-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            {isRtl ? "ثبت نشده" : "Not registered"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <LinkedInIcon className="text-blue-600" />
                        <span>{isRtl ? "صفحه لینکدین رسمی" : "LinkedIn Profile"}</span>
                      </div>
                      <div>
                        {licensor.linkedIn ? (
                          <a
                            href={licensor.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{licensor.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/company\//, "")}</span>
                            <ArrowUpRight className="size-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            {isRtl ? "ثبت نشده" : "Not registered"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Contact Person (from Master Excel) */}
                {(licensor.contactPerson || licensor.contactPersonEmail || licensor.mobileContactPerson) && (
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.03] space-y-2">
                    <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Building2 className="size-4" />
                      <span>{isRtl ? "اطلاعات کارشناس / رابط فنی لایسنسور" : "Licensor Representative"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {licensor.contactPerson && (
                        <div>
                          <span className="text-muted-foreground font-semibold">{isRtl ? "نام: " : "Name: "}</span>
                          <span className="font-bold text-foreground">{licensor.contactPerson}</span>
                        </div>
                      )}
                      {licensor.contactPersonEmail && (
                        <div>
                          <span className="text-muted-foreground font-semibold">{isRtl ? "ایمیل: " : "Email: "}</span>
                          <a href={`mailto:${licensor.contactPersonEmail}`} className="font-mono text-primary hover:underline">
                            {licensor.contactPersonEmail}
                          </a>
                        </div>
                      )}
                      {licensor.mobileContactPerson && (
                        <div>
                          <span className="text-muted-foreground font-semibold">{isRtl ? "موبایل: " : "Mobile: "}</span>
                          <a href={`tel:${licensor.mobileContactPerson}`} className="font-mono text-foreground hover:text-primary">
                            {licensor.mobileContactPerson}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 2: PROCESSES & TECHNOLOGIES ── */}
              <TabsContent value="processes" className="space-y-6 mt-0">
                {/* Key Technologies Badges */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span>{isRtl ? "پکیج‌ها و فناوری‌های فرآیندی اختصاصی" : "Key Process Technologies"}</span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {licensor.keyTechnologies.map((tech, idx) => {
                      const displayTech = isRtl
                        ? tech
                        : tech.replace(/\s*\([^\)]*[\u0600-\u06FF][^\)]*\)/g, "").trim();

                      // If still contains Persian in English mode, check if there is Latin acronym/words
                      const finalTech = !isRtl && /[\u0600-\u06FF]/.test(displayTech)
                        ? displayTech.replace(/[\u0600-\u06FF\u200c]+/g, "").replace(/^[()/\s-]+|[()/\s-]+$/g, "").trim() || "Advanced Process Package"
                        : displayTech;

                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs py-1.5 px-3 rounded-xl bg-card border border-border/80 shadow-2xs hover:border-primary/50 transition-colors font-medium text-foreground gap-1.5"
                        >
                          <span className="size-1.5 rounded-full bg-primary" />
                          <span>{finalTech}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Euroslot Pars Solutions Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent border border-primary/30 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
                    <Wrench className="size-4.5" />
                    <span>{isRtl ? "راه‌حل‌های مهندسی و اینترنال‌های یوروصلات پارس" : "Euroslot Pars Engineering Solutions"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                    {isRtl ? (
                      <>
                        شرکت مهندسی <strong>یوروصلات پارس</strong> سازنده تخصصی تجهیزات اینترنال رآکتور، توری‌های گوه ای (Wedge Wire)، بسکت‌های کاتالیستی، سنترپایپ‌ها، اسکیلپ‌ها و توزیع‌کننده‌های مایع و گاز کاملاً سازگار با استانداردها و مشخصات فنی این لایسنسور برای مجتمع‌های پتروشیمی و پالایشگاهی ایران است.
                      </>
                    ) : (
                      <>
                        <strong>Euroslot Pars</strong> engineers and manufactures high-precision reactor internals, wedge wire screens, catalyst baskets, center pipes, scallops, and gas/liquid distribution systems strictly compliant with this licensor&apos;s technical standards.
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-background/80 border border-primary/20 font-medium text-primary">
                      {isRtl ? "توری‌های وِج‌وایر (Wedge Wire)" : "Wedge Wire Screens"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-background/80 border border-primary/20 font-medium text-primary">
                      {isRtl ? "بسکت و ساپورت گرید کاتالیست" : "Catalyst Baskets & Support"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-background/80 border border-primary/20 font-medium text-primary">
                      {isRtl ? "اسکیلپ و سنترپایپ رآکتور" : "Scallops & Center Pipes"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-background/80 border border-primary/20 font-medium text-primary">
                      {isRtl ? "توزیع‌کننده‌های جریان (Distributors)" : "Feed Distributors"}
                    </span>
                  </div>
                </div>

                {/* Process Categories */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <span>{isRtl ? "دسته‌بندی‌های زنجیره ارزش" : "Process Categories"}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {licensor.processCategories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="text-xs py-1 px-3 rounded-xl border-border capitalize">
                        {cat.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 3: LICENSED PLANTS IN IRAN ── */}
              <TabsContent value="plants" className="space-y-4 mt-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Factory className="size-4 text-primary" />
                    <span>{isRtl ? "مجتمع‌ها و واحدهای لایسنس‌شده در ایران" : "Operating Units in Iran"}</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {isRtl ? (
                      <span>مجموعاً <strong className="text-primary">{formatLocaleNumber(licensor.licensedPlants.length, true)}</strong> واحد ثبتی</span>
                    ) : (
                      <span><strong className="text-primary">{licensor.licensedPlants.length}</strong> registered units</span>
                    )}
                  </span>
                </div>

                {licensor.licensedPlants.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/20 text-center space-y-2">
                    <Factory className="size-10 mx-auto text-muted-foreground/40" />
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {isRtl ? "واحد عملیاتی در بانک داده‌های جاری ثبت نشده است" : "No currently licensed plants registered"}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {isRtl
                        ? "این شرکت آماده ارائه دانش فنی و تجهیزات برای طرح‌های توسعه جدید صنایع نفت، گاز، پتروشیمی و پالایشگاهی کشور است."
                        : "This licensor's process packages are available for new petrochemical and refining development projects."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs font-bold text-foreground py-3">
                            {isRtl ? "نام واحد / مجتمع" : "Unit / Complex"}
                          </TableHead>
                          <TableHead className="text-xs font-bold text-foreground py-3">
                            {isRtl ? "فرآیند و پکیج فنی" : "Process Package"}
                          </TableHead>
                          <TableHead className="text-xs font-bold text-foreground py-3">
                            {isRtl ? "هلدینگ مادر" : "Holding"}
                          </TableHead>
                          <TableHead className="text-xs font-bold text-foreground py-3 text-center">
                            {isRtl ? "ظرفیت اسمی" : "Capacity"}
                          </TableHead>
                          <TableHead className="text-xs font-bold text-foreground py-3 text-center">
                            {isRtl ? "سال" : "Year"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licensor.licensedPlants.map((plant, idx) => (
                          <TableRow key={idx} className="border-b border-border/50 hover:bg-muted/30">
                            <TableCell className="py-3">
                              <Link
                                href={`/customers/plants?q=${encodeURIComponent(plant.complexNameFa || plant.plantNameFa)}`}
                                className="group/link block space-y-0.5"
                              >
                                <span className="text-xs font-bold text-primary group-hover/link:underline flex items-center gap-1">
                                  <span>{plant.plantNameFa}</span>
                                  <ArrowUpRight className="size-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </span>
                                <span className="text-[11px] text-muted-foreground block">
                                  {plant.complexNameFa}
                                </span>
                              </Link>
                            </TableCell>

                            <TableCell className="py-3 text-xs font-medium text-foreground">
                              {plant.unitTypeFa}
                            </TableCell>

                            <TableCell className="py-3 text-xs text-muted-foreground">
                              {plant.holdingNameFa || "—"}
                            </TableCell>

                            <TableCell className="py-3 text-xs font-semibold text-center text-foreground tabular-nums">
                              {plant.nominalCapacityFa}
                            </TableCell>

                            <TableCell className="py-3 text-xs font-mono text-center text-muted-foreground">
                              {plant.year ? formatLocaleNumber(plant.year, isRtl) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 4: HISTORY & SOURCES ── */}
              <TabsContent value="history" className="space-y-6 mt-0">
                {/* Language Switcher */}
                <div className="flex items-center justify-between gap-3 pb-1 border-b border-border/50">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span>{isRtl ? "تاریخچه، پیدایش و سیر تکامل" : "Corporate History & Evolution"}</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
                    <Button
                      type="button"
                      variant={historyLang === "fa" ? "default" : "ghost"}
                      size="xs"
                      onClick={() => setHistoryLang("fa")}
                      className="h-6 px-2.5 text-xs rounded-lg font-semibold"
                    >
                      فارسی
                    </Button>
                    <Button
                      type="button"
                      variant={historyLang === "en" ? "default" : "ghost"}
                      size="xs"
                      onClick={() => setHistoryLang("en")}
                      className="h-6 px-2.5 text-xs rounded-lg font-semibold font-sans"
                    >
                      English
                    </Button>
                  </div>
                </div>

                {/* History Text */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 text-justify">
                    {historyLang === "fa"
                      ? (licensor.historyFa || licensor.descriptionFa)
                      : (licensor.historyEn || licensor.descriptionEn || licensor.historyFa || licensor.descriptionFa)}
                  </p>
                </div>

                {/* Verified Sources */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "مراجع و اعتبارسنجی اسناد" : "Verified Data Sources"}</span>
                  </h4>
                  <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {licensor.sources && licensor.sources.length > 0 ? (
                        licensor.sources.map((src, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] py-1 px-2.5 bg-background border-border text-foreground font-medium">
                            {src.titleFa} ({src.publisherFa})
                          </Badge>
                        ))
                      ) : (
                        <>
                          <Badge variant="outline" className="text-[11px] py-1 px-2.5 bg-background border-border text-foreground font-medium">
                            {isRtl ? "کتاب مرجع فرآیندهای پتروشیمی ایران" : "Iranian Petrochemical Process Handbook"}
                          </Badge>
                          <Badge variant="outline" className="text-[11px] py-1 px-2.5 bg-background border-border text-foreground font-medium">
                            {isRtl ? "گزارش‌های رسمی شرکت ملی صنایع پتروشیمی (NPC)" : "NPC Official Technical Disclosures"}
                          </Badge>
                          <Badge variant="outline" className="text-[11px] py-1 px-2.5 bg-background border-border text-foreground font-medium">
                            {isRtl ? "کاتالوگ‌های رسمی لایسنسور" : "Licensor Official Process Manuals"}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
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
              {isRtl ? "بانک جامع اطلاعات لایسنسورهای فرآیندی صنعت پتروشیمی" : "Comprehensive Process Licensors Knowledge Base"}
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
