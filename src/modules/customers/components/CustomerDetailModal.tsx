// src/modules/customers/components/CustomerDetailModal.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  X,
  Building2,
  Globe,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
  Pencil,
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
  Copy,
  Check,
  Layers,
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
import { formatLocaleNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getUnifiedPlantInfo, getUnifiedHoldingInfo } from "../utils/petro-unifier";
import { downloadLogo } from "../utils/download-logo";
import type { Customer } from "../types/customers.types";
import type { PlantProcessType } from "../types/plants.types";

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (customer: Customer) => void;
}

function getProcessBadgeColor(type: PlantProcessType): string {
  switch (type) {
    case "olefin":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    case "aromatic":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
    case "methanol":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
    case "urea_ammonia":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "polymer":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
    case "refinery":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30";
    case "utility":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30";
    case "chemicals":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getProcessLabel(type: PlantProcessType, isRtl: boolean): string {
  switch (type) {
    case "olefin":
      return isRtl ? "واحد الفین (اتیلن / پروپیلن)" : "Olefin Unit";
    case "aromatic":
      return isRtl ? "واحد آروماتیک" : "Aromatic Unit";
    case "methanol":
      return isRtl ? "واحد متانول" : "Methanol Unit";
    case "urea_ammonia":
      return isRtl ? "واحد اوره و آمونیاک" : "Urea & Ammonia";
    case "polymer":
      return isRtl ? "واحد پلیمر" : "Polymer Plant";
    case "refinery":
      return isRtl ? "پالایشگاه و میعانات" : "Refinery";
    case "utility":
      return isRtl ? "یوتیلیتی متمرکز" : "Utility";
    case "chemicals":
      return isRtl ? "صنایع شیمیایی" : "Chemicals";
    default:
      return isRtl ? "مجتمع پتروشیمی" : "Petrochemical Complex";
  }
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  isAdmin = false,
  onEdit,
}: CustomerDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const plantInfo = useMemo(() => {
    return customer ? getUnifiedPlantInfo(customer) : null;
  }, [customer]);

  const holdingInfo = useMemo(() => {
    return customer ? getUnifiedHoldingInfo(customer) : null;
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "کپی شد" : "Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const displayName = isRtl
    ? customer.persian_title_fa || customer.company_name_en
    : customer.company_name_en || customer.persian_title_fa;

  const subtitleName = isRtl
    ? customer.company_name_en
    : customer.persian_title_fa;

  const logoUrl = customer.logo_url || plantInfo?.logoUrl;
  const websiteUrl = customer.website
    ? customer.website.startsWith("http")
      ? customer.website
      : `https://${customer.website}`
    : null;

  const espInstalledText = customer.esp_installed_base || plantInfo?.espInstalledBase;

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
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain select-none transition-transform duration-200 group-hover/logo:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="size-full rounded-xl bg-primary/10 text-primary font-bold font-mono text-base flex items-center justify-center">
                  <Building2 className="size-8" />
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {plantInfo ? (
                  <Badge
                    variant="outline"
                    className={cn("text-[10.5px] py-0 px-2 h-5 font-semibold border", getProcessBadgeColor(plantInfo.processType))}
                  >
                    <Factory className="size-3 me-1 shrink-0" />
                    <span>{plantInfo.unitTypeFa || getProcessLabel(plantInfo.processType, isRtl)}</span>
                  </Badge>
                ) : customer.industry ? (
                  <Badge variant="secondary" className="text-[10.5px] py-0 px-2 h-5 font-medium">
                    <Briefcase className="size-3 me-1 shrink-0" />
                    <span>{customer.industry}</span>
                  </Badge>
                ) : null}

                {(customer.city || plantInfo?.locationFa) && (
                  <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 font-medium border-border/70">
                    <MapPin className="size-3 me-1 shrink-0 text-primary" />
                    <span>{customer.city || plantInfo?.cityFa || plantInfo?.locationFa}</span>
                  </Badge>
                )}

                {(customer.tse_symbol || plantInfo?.tseSymbol) && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 font-bold bg-primary/10 text-primary border-primary/20">
                    {isRtl ? `نماد: ${customer.tse_symbol || plantInfo?.tseSymbol}` : `TSE: ${customer.tse_symbol || plantInfo?.tseSymbol}`}
                  </Badge>
                )}

                {plantInfo?.code && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 font-mono font-bold text-muted-foreground">
                    {plantInfo.code}
                  </Badge>
                )}

                {customer.is_custom && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    {isRtl ? "ثبت سفارشی" : "Custom"}
                  </Badge>
                )}
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                {displayName}
              </h2>
              {subtitleName && subtitleName !== displayName && (
                <p className="text-xs text-muted-foreground truncate font-sans">
                  {subtitleName}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await downloadLogo(logoUrl, displayName);
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

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center size-8 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                title={customer.website || "Website"}
              >
                <Globe className="size-4" />
              </a>
            )}

            {customer.tel_code1 && (
              <a
                href={`tel:${customer.tel_code1.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center justify-center size-8 rounded-xl border border-border bg-background hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors text-muted-foreground"
                title={customer.tel_code1}
              >
                <Phone className="size-4" />
              </a>
            )}

            {isAdmin && onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="h-8 rounded-xl text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 cursor-pointer"
                title={isRtl ? "ویرایش مشخصات" : "Edit"}
              >
                <Pencil className="size-3.5" />
                <span className="hidden sm:inline">{isRtl ? "ویرایش" : "Edit"}</span>
              </Button>
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
                  <span>{isRtl ? "مشخصات و کانال‌های ارتباطی" : "Overview & Contacts"}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="technical"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Factory className="size-4" />
                  <span>{isRtl ? "شناسنامه فنی و فرآیندی" : "Process & Plant Specs"}</span>
                  {plantInfo && (
                    <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4.5 rounded-full font-bold bg-primary text-primary-foreground">
                      {isRtl ? "پلنت فعال" : "Active Plant"}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="euroslot"
                  className="gap-2 text-xs sm:text-sm font-semibold pb-2.5 data-active:text-primary"
                >
                  <Cpu className="size-4" />
                  <span>{isRtl ? "تجهیزات بومی‌سازی شده ESP" : "Euroslot Pars Installed Base"}</span>
                  {espInstalledText && (
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
                  <span>{isRtl ? "ساختار حاکمیتی و هلدینگ" : "Corporate & Holding"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tab Contents */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {/* ── TAB 1: OVERVIEW & CONTACTS ── */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Contact Channels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Website Card */}
                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="size-3.5 text-primary" />
                        <span>{isRtl ? "پایگاه اینترنتی رسمی" : "Official Website"}</span>
                      </span>
                      {websiteUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleCopy(websiteUrl, "web", e)}
                          className="size-6 text-muted-foreground hover:text-foreground"
                          title={isRtl ? "کپی آدرس سایت" : "Copy"}
                        >
                          {copiedField === "web" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </Button>
                      )}
                    </div>
                    <div>
                      {websiteUrl ? (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate font-mono"
                        >
                          <span className="truncate">{customer.website?.replace(/^https?:\/\//, "")}</span>
                          <ArrowUpRight className="size-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">{isRtl ? "ثبت نشده" : "Not registered"}</span>
                      )}
                    </div>
                  </div>

                  {/* Telephone Card */}
                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1.5 flex flex-col justify-between">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-emerald-500" />
                        <span>{isRtl ? "تلفن تماس مرکزی" : "Central Phone"}</span>
                      </span>
                      {customer.tel_code1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleCopy(customer.tel_code1 || "", "phone", e)}
                          className="size-6 text-muted-foreground hover:text-foreground"
                          title={isRtl ? "کپی شماره" : "Copy"}
                        >
                          {copiedField === "phone" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </Button>
                      )}
                    </div>
                    <div>
                      {customer.tel_code1 ? (
                        <a
                          href={`tel:${customer.tel_code1.replace(/[^0-9+]/g, "")}`}
                          className="text-xs sm:text-sm font-mono font-bold text-foreground hover:text-primary transition-colors ltr inline-block"
                        >
                          {customer.tel_code1}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">{isRtl ? "ثبت نشده" : "Not registered"}</span>
                      )}
                    </div>
                  </div>

                  {/* Direct Link to Phonebook Directory */}
                  <Link
                    href={`/customers?tab=phonebook&company=${encodeURIComponent(customer.persian_title_fa || customer.company_name_en)}`}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/[0.03] transition-all shadow-2xs space-y-1.5 flex flex-col justify-between group"
                  >
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookUser className="size-3.5 text-primary" />
                        <span>{isRtl ? "دفترچه تلفن مخاطبین" : "Contacts Directory"}</span>
                      </span>
                      <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-xs font-bold text-primary group-hover:underline">
                      {isRtl ? "مشاهده کارشناسان و مدیران" : "View Personnel & Emails"}
                    </div>
                  </Link>
                </div>

                {/* Corporate Details Table */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <span>{isRtl ? "مشخصات شرکتی و شناسه حقوقی" : "Corporate & Legal Identification"}</span>
                  </h3>

                  <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="w-1/3 sm:w-1/4 font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "نام کامل شرکت" : "Corporate Name"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-foreground py-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span>{customer.persian_title_fa || customer.company_name_en}</span>
                              {customer.company_abbrv && (
                                <Badge variant="outline" className="text-[10px] w-fit font-mono font-bold">
                                  {customer.company_abbrv}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {customer.company_name_en && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "نام لاتین و بین‌المللی" : "English / Trade Name"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-sans text-foreground">
                              {customer.company_name_en}
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                            {isRtl ? "حوزه فعالیت و صنعت" : "Industry & Sector"}
                          </TableCell>
                          <TableCell className="text-xs py-2.5 font-medium text-foreground">
                            {customer.industry || (plantInfo ? getProcessLabel(plantInfo.processType, isRtl) : "—")}
                          </TableCell>
                        </TableRow>

                        {customer.office_address_fa && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "نشانی دفتر مرکزی" : "Head Office Address"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground leading-relaxed">
                              <div className="flex items-start gap-1.5">
                                <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                                <span>{customer.office_address_fa}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {(customer.plant_address_fa || plantInfo?.locationFa) && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "نشانی مجتمع / کارخانه" : "Plant / Site Address"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 text-foreground leading-relaxed">
                              <div className="flex items-start gap-1.5">
                                <Building2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                                <span>{customer.plant_address_fa || plantInfo?.locationFa}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {customer.postal_code && (
                          <TableRow className="border-b border-border/60 hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "کد پستی" : "Postal Code"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-mono text-foreground">
                              <span>{customer.postal_code}</span>
                            </TableCell>
                          </TableRow>
                        )}

                        {(customer.national_id_number || customer.registration_number || customer.economic_code) && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell className="font-semibold text-xs text-muted-foreground bg-muted/20 py-2.5">
                              {isRtl ? "شناسه‌های ثبتی و مالیاتی" : "Registration & Tax IDs"}
                            </TableCell>
                            <TableCell className="text-xs py-2.5 font-mono text-foreground">
                              <div className="flex flex-wrap items-center gap-3">
                                {customer.national_id_number && (
                                  <span>
                                    <span className="text-muted-foreground font-sans text-[11px]">{isRtl ? "شناسه ملی: " : "National ID: "}</span>
                                    <strong>{customer.national_id_number}</strong>
                                  </span>
                                )}
                                {customer.registration_number && (
                                  <span>
                                    <span className="text-muted-foreground font-sans text-[11px]">{isRtl ? "شماره ثبت: " : "Reg No: "}</span>
                                    <strong>{customer.registration_number}</strong>
                                  </span>
                                )}
                                {customer.economic_code && (
                                  <span>
                                    <span className="text-muted-foreground font-sans text-[11px]">{isRtl ? "کد اقتصادی: " : "Economic Code: "}</span>
                                    <strong>{customer.economic_code}</strong>
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 2: TECHNICAL & PROCESS SPECS ── */}
              <TabsContent value="technical" className="space-y-6 mt-0">
                {plantInfo ? (
                  <div className="space-y-5">
                    {/* Technical Overview Banner */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Factory className="size-4 text-primary" />
                          <span>{isRtl ? "مشخصات فنی و ظرفیت اسمی مجتمع" : "Technical Process Specifications"}</span>
                        </div>
                        {plantInfo.code && (
                          <Badge variant="outline" className="font-mono text-xs font-bold text-primary bg-primary/5">
                            {plantInfo.code}
                          </Badge>
                        )}
                      </div>

                      {/* Technical Metrics 4-Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
                          <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "ظرفیت نامی سالانه" : "Nominal Capacity"}</span>
                          <span className="font-bold text-foreground block truncate">
                            {plantInfo.nominalCapacityFa || "—"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
                          <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "خوراک فرآیندی" : "Feedstock"}</span>
                          <span className="font-bold text-foreground block truncate">
                            {plantInfo.feedstockFa || "—"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
                          <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "سال راه‌اندازی" : "Commission Year"}</span>
                          <span className="font-bold text-foreground block tabular-nums">
                            {plantInfo.commissionedYear
                              ? (isRtl ? formatLocaleNumber(plantInfo.commissionedYear, true) : plantInfo.commissionedYear)
                              : "—"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
                          <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "منطقه عملیاتی" : "Operational Zone"}</span>
                          <span className="font-bold text-foreground block truncate">
                            {plantInfo.locationZone === "assaluyeh"
                              ? (isRtl ? "منطقه ویژه عسلویه" : "Assaluyeh Zone")
                              : plantInfo.locationZone === "mahshahr"
                              ? (isRtl ? "منطقه ویژه ماهشهر" : "Mahshahr Zone")
                              : (isRtl ? "سایر استان‌ها" : "Provincial Site")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Licensors & Technology Providers */}
                    {plantInfo.licensors && plantInfo.licensors.length > 0 && (
                      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                        <div className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Boxes className="size-4 text-primary" />
                            <span>{isRtl ? "لایسنسورها و صاحبان دانش فنی فرآیند:" : "Process Licensors & Technology Owners:"}</span>
                          </span>
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
                          {plantInfo.licensors.map((lic, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs py-1 px-2.5 bg-primary/10 text-primary border-primary/20 font-semibold"
                            >
                              {lic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Products */}
                    {plantInfo.mainProductsFa && plantInfo.mainProductsFa.length > 0 && (
                      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <TrendingUp className="size-4 text-emerald-500" />
                          <span>{isRtl ? "محصولات اصلی و فرآورده‌های تولیدی مجتمع:" : "Primary & Secondary Chemical Output:"}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {plantInfo.mainProductsFa.map((prod, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs py-0.5 px-2 bg-muted/40 text-foreground border-border"
                            >
                              {prod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Furnaces & Pyrolysis Reactors */}
                    {plantInfo.reactorOrFurnaceInfoFa && (
                      <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 space-y-2 text-xs">
                        <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs sm:text-sm">
                          <Flame className="size-4" />
                          <span>{isRtl ? "مشخصات کوره‌های کراکینگ و راکتورهای پیرولیز:" : "Cracking Furnaces & Pyrolysis Reactors:"}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                          {plantInfo.reactorOrFurnaceInfoFa}
                        </p>
                      </div>
                    )}

                    {/* CTA Link to Plants Directory */}
                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        href={`/customers?tab=plants&id=${plantInfo.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <Factory className="size-3.5" />
                        <span>{isRtl ? "مشاهده پرونده تفصیلی در دایرکتوری پلنت‌های پتروشیمی ایران" : "View Full Record in Petrochemical Plants Directory"}</span>
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card space-y-2">
                    <Factory className="size-10 mx-auto text-muted-foreground/40" />
                    <h4 className="text-sm font-bold text-foreground">
                      {isRtl ? "مشخصات کارخانه صنعتی و تجهیزات فرآیندی" : "Industrial Plant & Facility Profile"}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {isRtl
                        ? "این کارفرما به عنوان مجتمع صنعتی، تولیدی یا پیمانکاری در سیستم ثبت شده است. اطلاعات تجهیزات نصب‌شده در تب یوروصلات پارس قابل مشاهده است."
                        : "This client is registered as an industrial manufacturing or EPC entity. Installed equipment specs can be inspected in the Euroslot Pars tab."}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 3: EUROSLOT PARS INSTALLED BASE ── */}
              <TabsContent value="euroslot" className="space-y-6 mt-0">
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/25 space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                    <Sparkles className="size-4.5" />
                    <span>{isRtl ? "خدمات و تجهیزات مهندسی یوروصلات پارس (Euroslot Pars)" : "Euroslot Pars Engineering Solutions"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                    {isRtl ? (
                      <>
                        شرکت مهندسی <strong>یوروصلات پارس</strong> به عنوان سازنده و تامین‌کننده دانش‌بنیان، توری‌های اسکرین وِج‌وایر (Wedge Wire)، تجهیزات دقیق اینترنال رآکتور، سنترپایپ‌ها، بسکت‌های کاتالیستی، سینی‌های فرآیندی و پکیج‌های فیلتراسیون صنعتی را برای این مجموعه صنعتی و خطوط تولید آن مهندسی، بومی‌سازی و پشتیبانی فنی می‌نماید.
                      </>
                    ) : (
                      <>
                        <strong>Euroslot Pars</strong> supplies and localized high-precision wedge wire screens, reactor internals, catalyst baskets, center pipes, process trays, and filtration packages tailored for the operational units of this industrial client.
                      </>
                    )}
                  </p>
                </div>

                {/* Specific Installed Base Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های ثبت‌شده این کارفرما (Installed Base):" : "Registered ESP Installed Base & Equipment:"}</span>
                  </div>

                  {espInstalledText ? (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs sm:text-sm leading-relaxed text-foreground font-medium">
                      {espInstalledText}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-xs text-muted-foreground space-y-1">
                      <div>{isRtl ? "تجهیزات اینترنال رآکتور، سینی‌های فرآیندی و المان‌های فیلتراسیون تحت قرارداد و استعلام فنی." : "Reactor internals, process trays, and filtration elements under technical inquiry."}</div>
                      <div>{isRtl ? "برای ثبت تجهیزات جدید این کارفرما از دکمه ویرایش (ادمین) استفاده فرمایید." : "Use Admin Edit to specify custom installed base equipment for this client."}</div>
                    </div>
                  )}
                </div>

                {/* Core Advantages List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{isRtl ? "مزیت‌های فنی محصولات یوروصلات پارس برای این واحد:" : "Key Technical Advantages of Euroslot Pars Products:"}</span>
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

              {/* ── TAB 4: CORPORATE GOVERNANCE & HOLDING ── */}
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
                            {isRtl ? "هلدینگ مادر و سهامدار عمده:" : "Parent Conglomerate & Majority Shareholder:"}
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
                        <span>{isRtl ? `مشاهده شناسنامه کامل ${holdingInfo.nameFa}` : `View ${holdingInfo.companyAbbrv} Holding Profile`}</span>
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
                  <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Landmark className="size-4 text-primary" />
                      <span>{isRtl ? "مالکیت و ساختار سهامداری" : "Corporate Ownership & Structure"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isRtl
                        ? "این شرکت به صورت مستقل یا در قالب سهامی خاص / عام فعالیت می‌نماید و مستقیماً توسط هیئت مدیره خود راهبری می‌شود."
                        : "This company operates as an independent enterprise or private/public joint-stock entity."}
                    </p>
                  </div>
                )}

                {/* TSE and Capital Market References */}
                {(customer.tse_symbol || plantInfo?.tseSymbol) && (
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" />
                      <span>{isRtl ? "حضور در بورس اوراق بهادار تهران (TSE):" : "Tehran Stock Exchange (TSE) Listing:"}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary border-primary/20 px-2.5 py-1">
                        {isRtl ? `نماد معاملاتی: ${customer.tse_symbol || plantInfo?.tseSymbol}` : `Symbol: ${customer.tse_symbol || plantInfo?.tseSymbol}`}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {isRtl ? "تحت نظارت سازمان بورس و اوراق بهادار ایران" : "Regulated under Securities and Exchange Organization"}
                      </span>
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
                ? "بانک اطلاعات جامع کارفرمایان و مشتریان صنعتی یوروصلات پارس"
                : "Euroslot Pars Clients & Industrial Customers Directory"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="rounded-xl text-xs font-semibold h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 cursor-pointer"
              >
                <Pencil className="size-3.5 me-1" />
                <span>{isRtl ? "ویرایش مشخصات (ادمین)" : "Edit Customer"}</span>
              </Button>
            )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
