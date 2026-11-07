// src/modules/customers/components/CustomerDetailModal.tsx
"use client";

import React from "react";
import { useLocale } from "next-intl";
import {
  X,
  Building2,
  Globe,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  Shield,
  Hash,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "../types/customers.types";

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
}: CustomerDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (!isOpen || !customer) return null;

  const websiteUrl = customer.website
    ? customer.website.startsWith("http")
      ? customer.website
      : `https://${customer.website}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl border border-border bg-background p-2 flex items-center justify-center shrink-0 shadow-sm">
              {customer.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={customer.logo_url}
                  alt={customer.persian_title_fa || customer.company_name_en}
                  className="object-contain size-full"
                />
              ) : (
                <Building2 className="size-8 text-primary/70" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {customer.persian_title_fa || customer.company_name_en}
                </h2>
                {customer.is_custom && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    {isRtl ? "سفارشی" : "Custom"}
                  </Badge>
                )}
              </div>
              {customer.company_name_en && customer.company_name_en !== customer.persian_title_fa && (
                <p className="text-xs text-muted-foreground font-sans">
                  {customer.company_name_en}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {customer.industry && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    <Briefcase className="size-3 me-1 inline-block" />
                    {customer.industry}
                  </Badge>
                )}
                {customer.city && (
                  <Badge variant="outline" className="text-[11px] font-medium">
                    <MapPin className="size-3 me-1 inline-block text-primary" />
                    {customer.city}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick contact banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.website ? (
              <a
                href={websiteUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
              >
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Globe className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {isRtl ? "وب‌سایت رسمی" : "Website"}
                  </div>
                  <div className="text-foreground font-mono truncate font-semibold flex items-center gap-1">
                    <span>{customer.website}</span>
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
                    {isRtl ? "تلفن تماس" : "Phone"}
                  </div>
                  <div className="text-foreground font-mono font-semibold" dir="ltr">
                    {customer.tel_code1}
                  </div>
                </div>
              </a>
            ) : null}
          </div>

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

            {customer.plant_address_fa && (
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  <span>{isRtl ? "آدرس مجتمع / کارخانه:" : "Plant / Site Address:"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {customer.plant_address_fa}
                </p>
              </div>
            )}
          </div>

          {/* Identification & Financial details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60">
            {customer.economic_code && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {isRtl ? "کد اقتصادی" : "Economic Code"}
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {customer.economic_code}
                </div>
              </div>
            )}

            {customer.national_id_number && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {isRtl ? "شناسه ملی" : "National ID"}
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {customer.national_id_number}
                </div>
              </div>
            )}

            {customer.registration_number && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {isRtl ? "شماره ثبت" : "Reg Number"}
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {customer.registration_number}
                </div>
              </div>
            )}

            {customer.postal_code && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {isRtl ? "کد پستی" : "Postal Code"}
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {customer.postal_code}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
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

