// src/modules/customers/components/CustomerDetailModal.tsx
"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatLocaleNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getUnifiedPlantInfo, getUnifiedHoldingInfo, isPetrochemicalCustomer } from "../utils/petro-unifier";
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
      return isRtl ? "پتروشیمی" : "Petrochemical";
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

  const plantInfo = useMemo(() => {
    return customer ? getUnifiedPlantInfo(customer) : null;
  }, [customer]);

  const holdingInfo = useMemo(() => {
    return customer ? getUnifiedHoldingInfo(customer) : null;
  }, [customer]);

  const isPetro = useMemo(() => {
    return isPetrochemicalCustomer(customer) || !!plantInfo;
  }, [customer, plantInfo]);

  if (!isOpen || !customer) return null;

  const websiteUrl = customer.website
    ? customer.website.startsWith("http")
      ? customer.website
      : `https://${customer.website}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-4">
            {/* Logo Showcase with Download Action */}
            <div className="relative group shrink-0 flex flex-col items-center gap-1.5">
              <div className="size-20 sm:size-24 rounded-2xl sm:rounded-3xl border border-border/80 bg-white dark:bg-card p-2 sm:p-2.5 flex items-center justify-center shadow-sm overflow-hidden transition-all duration-200 group-hover:shadow-md group-hover:border-primary/40">
                {customer.logo_url || plantInfo?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.logo_url || plantInfo?.logoUrl || ""}
                    alt={customer.persian_title_fa || customer.company_name_en}
                    className="object-contain size-full transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <Building2 className="size-10 sm:size-12 text-primary/60" />
                )}
              </div>
              {(customer.logo_url || plantInfo?.logoUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const url = customer.logo_url || plantInfo?.logoUrl;
                    const ok = await downloadLogo(url, customer.persian_title_fa || customer.company_name_en);
                    if (ok) {
                      toast.success(isRtl ? "لوگوی شرکت با موفقیت دانلود شد." : "Company logo downloaded successfully.");
                    }
                  }}
                  className="h-6 px-2 text-[10.5px] gap-1 font-semibold text-muted-foreground hover:text-primary rounded-lg border-border/60"
                  title={isRtl ? "دانلود فایل لوگوی باکیفیت" : "Download Logo"}
                >
                  <Download className="size-3" />
                  <span>{isRtl ? "دانلود لوگو" : "Download"}</span>
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {customer.persian_title_fa || customer.company_name_en}
                </h2>
                {customer.is_custom && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    {isRtl ? "ثبت‌شده سفارشی" : "Custom"}
                  </Badge>
                )}
                {plantInfo?.code && (
                  <Badge variant="outline" className="text-[10.5px] font-bold border-primary/30 text-primary bg-primary/5">
                    {plantInfo.code}
                  </Badge>
                )}
              </div>

              {customer.company_name_en && customer.company_name_en !== customer.persian_title_fa && (
                <p className="text-xs text-muted-foreground font-sans">
                  {customer.company_name_en}
                </p>
              )}

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {plantInfo ? (
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] font-semibold border", getProcessBadgeColor(plantInfo.processType))}
                  >
                    <Factory className="size-3 me-1 inline-block" />
                    <span>{plantInfo.unitTypeFa || getProcessLabel(plantInfo.processType, isRtl)}</span>
                  </Badge>
                ) : customer.industry ? (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    <Briefcase className="size-3 me-1 inline-block" />
                    {customer.industry}
                  </Badge>
                ) : null}

                {(customer.city || plantInfo?.locationFa) && (
                  <Badge variant="outline" className="text-[11px] font-medium">
                    <MapPin className="size-3 me-1 inline-block text-primary" />
                    {customer.city || plantInfo?.cityFa || plantInfo?.locationFa}
                  </Badge>
                )}

                {(customer.tse_symbol || plantInfo?.tseSymbol) && (
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {isRtl ? `نماد بورس: ${customer.tse_symbol || plantInfo?.tseSymbol}` : `TSE: ${customer.tse_symbol || plantInfo?.tseSymbol}`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.website || plantInfo?.website ? (
              <a
                href={websiteUrl || plantInfo?.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
              >
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Globe className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "وب‌سایت رسمی" : "Official Website"}
                  </div>
                  <div className="text-foreground truncate font-semibold flex items-center gap-1 font-sans">
                    <span>{customer.website || plantInfo?.website}</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                  </div>
                </div>
              </a>
            ) : null}

            {customer.tel_code1 ? (
              <a
                href={`tel:${customer.tel_code1.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-xs"
              >
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "تلفن تماس" : "Contact Phone"}
                  </div>
                  <div className="text-foreground font-semibold font-sans" dir="ltr">
                    {customer.tel_code1}
                  </div>
                </div>
              </a>
            ) : null}

            <Link
              href={`/customers?tab=phonebook&company=${encodeURIComponent(customer.persian_title_fa || customer.company_name_en)}`}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-xs"
            >
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookUser className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-muted-foreground font-medium">
                  {isRtl ? "دفترچه تلفن و ایمیل‌ها" : "Phonebook & Contacts"}
                </div>
                <div className="text-primary font-semibold truncate flex items-center gap-1">
                  <span>{isRtl ? "مشاهده افراد و دپارتمان‌ها" : "View Personnel"}</span>
                  <ArrowUpRight className="size-3" />
                </div>
              </div>
            </Link>
          </div>

          {/* ── Petrochemical Technical Dossier (If Petrochemical) ── */}
          {plantInfo && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-primary/[0.03] border border-primary/20">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Factory className="size-4 text-primary" />
                  <span>{isRtl ? "پرونده فنی و فرآیندی پتروشیمی:" : "Petrochemical Process Engineering Specs:"}</span>
                </h3>
                {plantInfo.holdingNameFa && (
                  <Badge variant="secondary" className="text-xs font-semibold">
                    <Landmark className="size-3 me-1 inline-block" />
                    <span>{isRtl ? `هلدینگ: ${plantInfo.holdingNameFa}` : `Holding: ${plantInfo.holdingNameFa}`}</span>
                  </Badge>
                )}
              </div>

              {/* Technical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {plantInfo.nominalCapacityFa && (
                  <div className="p-2.5 rounded-xl bg-card border border-border/80 space-y-0.5">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "ظرفیت نامی سالانه" : "Capacity"}</span>
                    <span className="font-semibold text-foreground block truncate">{plantInfo.nominalCapacityFa}</span>
                  </div>
                )}

                {plantInfo.feedstockFa && (
                  <div className="p-2.5 rounded-xl bg-card border border-border/80 space-y-0.5">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "خوراک فرآیندی" : "Feedstock"}</span>
                    <span className="font-semibold text-foreground block truncate">{plantInfo.feedstockFa}</span>
                  </div>
                )}

                {plantInfo.commissionedYear && (
                  <div className="p-2.5 rounded-xl bg-card border border-border/80 space-y-0.5">
                    <span className="text-[10.5px] text-muted-foreground block">{isRtl ? "سال راه‌اندازی" : "Commission Year"}</span>
                    <span className="font-semibold text-foreground block tabular-nums">
                      {isRtl ? formatLocaleNumber(plantInfo.commissionedYear, true) : plantInfo.commissionedYear}
                    </span>
                  </div>
                )}
              </div>

              {/* Licensors & Engineering */}
              {plantInfo.licensors && plantInfo.licensors.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Boxes className="size-3 text-primary" />
                    <span>{isRtl ? "لایسنسورها و صاحبان دانش فنی:" : "Licensors:"}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plantInfo.licensors.map((lic, lIdx) => (
                      <Badge key={lIdx} variant="secondary" className="text-[11px]">
                        {lic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Products */}
              {plantInfo.mainProductsFa && plantInfo.mainProductsFa.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                    <TrendingUp className="size-3 text-primary" />
                    <span>{isRtl ? "محصولات اصلی:" : "Main Products:"}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plantInfo.mainProductsFa.map((prod, pIdx) => (
                      <Badge key={pIdx} variant="outline" className="text-[11px] bg-background border-border/80">
                        {prod}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Furnaces or Reactor Info */}
              {plantInfo.reactorOrFurnaceInfoFa && (
                <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-1 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Flame className="size-3.5" />
                    <span>{isRtl ? "مشخصات کوره‌ها / راکتورهای پیرولیز:" : "Furnaces & Reactors:"}</span>
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {plantInfo.reactorOrFurnaceInfoFa}
                  </p>
                </div>
              )}

              {/* ESP Installed Base */}
              {plantInfo.espInstalledBase && (
                <div className="p-3 rounded-xl bg-primary/[0.05] border border-primary/25 space-y-1 text-xs">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Cpu className="size-3.5" />
                    <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های صنعتی ESP:" : "Euroslot Pars Installed Base:"}</span>
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {plantInfo.espInstalledBase}
                  </p>
                </div>
              )}

              {/* Quick links to Holding or Plant View */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/50 flex-wrap">
                {plantInfo.holdingId && plantInfo.holdingId !== "private" && (
                  <Link
                    href={`/customers?tab=holdings&id=${plantInfo.holdingId}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Landmark className="size-3.5" />
                    <span>{isRtl ? `مشاهده برگه هلدینگ مادر (${plantInfo.holdingNameFa || "هلدینگ"})` : "View Parent Holding"}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                )}

                <Link
                  href={`/customers?tab=plants&id=${plantInfo.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Factory className="size-3.5 text-primary" />
                  <span>{isRtl ? "مشاهده در کاتالوگ پلنت‌های ایران" : "View in Plants Directory"}</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="space-y-3">
            {customer.office_address_fa && (
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  <span>{isRtl ? "آدرس دفتر مرکزی:" : "Head Office Address:"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {customer.office_address_fa}
                </p>
              </div>
            )}

            {(customer.plant_address_fa || plantInfo?.locationFa) && (
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  <span>{isRtl ? "آدرس مجتمع / کارخانه:" : "Plant / Site Address:"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {customer.plant_address_fa || plantInfo?.locationFa}
                </p>
              </div>
            )}
          </div>

          {/* Identification & Financial details */}
          {(customer.economic_code || customer.national_id_number || customer.registration_number || customer.postal_code) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60">
              {customer.economic_code && (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {isRtl ? "کد اقتصادی" : "Economic Code"}
                  </div>
                  <div className="text-xs font-semibold text-foreground tabular-nums">
                    {isRtl ? formatLocaleNumber(customer.economic_code, true) : customer.economic_code}
                  </div>
                </div>
              )}

              {customer.national_id_number && (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {isRtl ? "شناسه ملی" : "National ID"}
                  </div>
                  <div className="text-xs font-semibold text-foreground tabular-nums">
                    {isRtl ? formatLocaleNumber(customer.national_id_number, true) : customer.national_id_number}
                  </div>
                </div>
              )}

              {customer.registration_number && (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {isRtl ? "شماره ثبت" : "Reg Number"}
                  </div>
                  <div className="text-xs font-semibold text-foreground tabular-nums">
                    {isRtl ? formatLocaleNumber(customer.registration_number, true) : customer.registration_number}
                  </div>
                </div>
              )}

              {customer.postal_code && (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {isRtl ? "کد پستی" : "Postal Code"}
                  </div>
                  <div className="text-xs font-semibold text-foreground tabular-nums">
                    {isRtl ? formatLocaleNumber(customer.postal_code, true) : customer.postal_code}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
          <div>
            {isAdmin && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="rounded-xl text-xs h-9 px-3.5 gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              >
                <Pencil className="size-3.5" />
                <span>{isRtl ? "ویرایش مشخصات (ادمین)" : "Edit Customer (Admin)"}</span>
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs h-9 px-4"
          >
            {isRtl ? "بستن" : "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
}
