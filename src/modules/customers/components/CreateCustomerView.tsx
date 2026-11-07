// src/modules/customers/components/CreateCustomerView.tsx
"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "next-intl";
import {
  Building2,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Globe,
  Phone,
  MapPin,
  Image as ImageIcon,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { customersService } from "../services/customers.service";
import type { Customer, CustomerCreateInput } from "../types/customers.types";

interface CreateCustomerViewProps {
  onCustomerCreated: (customer: Customer) => void;
  onCancel: () => void;
}

const COMMON_INDUSTRIES = [
  "Petrochemical",
  "Oil Refinery",
  "Gas Refinery",
  "Chemical Industry",
  "Steel Industry",
  "Power Plant",
  "Manufacture",
  "Engineering",
  "Water Treatment",
  "EPC",
  "Trading & Contracting",
  "Cement & Lime",
  "Food Industry",
  "Mining Industry",
  "سایر صنایع",
];

const COMMON_CITIES = [
  "تهران",
  "اصفهان",
  "مشهد",
  "تبریز",
  "شیراز",
  "اهواز",
  "بندرعباس",
  "بوشهر",
  "عسلویه",
  "کنگان",
  "بندر ماهشهر",
  "اراک",
  "یزد",
  "قزوین",
  "کرمان",
];

export function CreateCustomerView({
  onCustomerCreated,
  onCancel,
}: CreateCustomerViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [persianTitle, setPersianTitle] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [abbrv, setAbbrv] = useState("");
  const [industry, setIndustry] = useState("Petrochemical");
  const [city, setCity] = useState("تهران");
  const [website, setWebsite] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [plantAddress, setPlantAddress] = useState("");
  const [economicCode, setEconomicCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(isRtl ? "لطفاً یک فایل تصویری انتخاب کنید." : "Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isRtl ? "حجم لوگو نباید بیش از ۵ مگابایت باشد." : "Logo file must be under 5MB.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const res = await customersService.uploadLogo(file);
      setLogoUrl(res.url);
      toast.success(isRtl ? "لوگو با موفقیت آپلود شد." : "Logo uploaded successfully.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در آپلود لوگو" : "Failed to upload logo"));
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persianTitle.trim() && !companyNameEn.trim()) {
      toast.error(isRtl ? "نام شرکت الزامی است." : "Company name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CustomerCreateInput = {
        persian_title_fa: persianTitle.trim() || companyNameEn.trim(),
        company_name_en: companyNameEn.trim(),
        company_abbrv: abbrv.trim() || undefined,
        industry: industry.trim() || "سایر صنایع",
        city: city.trim() || undefined,
        website: website.trim() || undefined,
        tel_code1: tel1.trim() || undefined,
        tel_code2: tel2.trim() || undefined,
        office_address_fa: officeAddress.trim() || undefined,
        plant_address_fa: plantAddress.trim() || undefined,
        economic_code: economicCode.trim() || undefined,
        national_id_number: nationalId.trim() || undefined,
        registration_number: regNumber.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      };

      const created = await customersService.createCustomer(payload);
      toast.success(isRtl ? "کارفرمای جدید با موفقیت ثبت شد." : "Customer created successfully.");
      onCustomerCreated(created);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ثبت کارفرما" : "Failed to save customer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FolderPlus className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isRtl ? "ساخت و تعریف کارفرمای جدید" : "Create New Customer / Client"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "اطلاعات ثبت‌شده بلافاصله در دیتابیس کارفرمایان ذخیره و در کامبوباکس ساخت پروژه و کلیه بخش‌ها فعال می‌شود."
                : "Customer will be saved in database and instantly available across project creation wizards and directory."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shrink-0 self-start sm:self-center"
        >
          {isRtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          <span>{isRtl ? "بازگشت به فهرست" : "Back to Directory"}</span>
        </Button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        {/* Logo upload row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/20">
          <div className="relative size-20 rounded-2xl border border-border/80 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo preview" className="object-contain size-full p-1.5" />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-xs font-bold text-foreground">
              {isRtl ? "نشان و لوگوی شرکت کارفرما (اختیاری)" : "Company Logo (Optional)"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isRtl ? "فرمت‌های پشتیبانی‌شده: PNG, JPG, SVG تا حداکثر ۵ مگابایت" : "Supported: PNG, JPG, SVG up to 5MB"}
            </div>
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoFileChange}
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs rounded-lg gap-1.5"
              >
                {isUploadingLogo ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="size-3.5" />
                )}
                {isRtl ? "آپلود فایل لوگو..." : "Upload Logo..."}
              </Button>
              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoUrl("")}
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {isRtl ? "حذف لوگو" : "Remove"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Company Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isRtl ? "نام / عنوان رسمی شرکت (فارسی) *" : "Official Company Name (Persian) *"}
            </label>
            <Input
              value={persianTitle}
              onChange={(e) => setPersianTitle(e.target.value)}
              placeholder={isRtl ? "مثال: شرکت پتروشیمی زاگرس" : "e.g. Zagros Petrochemical Co."}
              className="h-11 text-sm rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isRtl ? "نام انگلیسی شرکت (Company Name En)" : "Company Name (English)"}
            </label>
            <Input
              value={companyNameEn}
              onChange={(e) => setCompanyNameEn(e.target.value)}
              placeholder="e.g. Zagros Petrochemical Co."
              className="h-11 text-sm rounded-xl font-sans"
            />
          </div>
        </div>

        {/* Industry, City, Abbreviation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              {isRtl ? "حوزه فعالیت و صنعت (Industry) *" : "Industry *"}
            </label>
            <Combobox
              options={COMMON_INDUSTRIES.map((ind) => ({ value: ind, label: ind }))}
              value={industry}
              onChange={(val) => setIndustry(val || "Petrochemical")}
              placeholder={isRtl ? "انتخاب یا جستجوی صنعت..." : "Select industry..."}
              className="h-11 text-sm rounded-xl w-full"
              allowClear={false}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isRtl ? "شهر / استان" : "City"}
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={isRtl ? "مثال: عسلویه" : "e.g. Asalouyeh"}
              className="h-11 text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Phone & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-primary" />
              <span>{isRtl ? "شماره تماس رسمی" : "Phone Number"}</span>
            </label>
            <Input
              value={tel1}
              onChange={(e) => setTel1(e.target.value)}
              placeholder="+98-21-..."
              className="h-11 text-sm rounded-xl font-mono text-left"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              <span>{isRtl ? "وب‌سایت رسمی" : "Website"}</span>
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.company.com"
              className="h-11 text-sm rounded-xl font-mono text-left"
              dir="ltr"
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span>{isRtl ? "آدرس دفتر مرکزی (تهران یا شهر مبدا)" : "Head Office Address"}</span>
            </label>
            <Textarea
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder={isRtl ? "تهران، خیابان..." : "Head Office address..."}
              rows={2}
              className="text-xs rounded-xl resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              <span>{isRtl ? "آدرس مجتمع / کارخانه (Plant / Site Address)" : "Plant / Factory Address"}</span>
            </label>
            <Textarea
              value={plantAddress}
              onChange={(e) => setPlantAddress(e.target.value)}
              placeholder={isRtl ? "منطقه ویژه اقتصادی، سایت..." : "Plant site address..."}
              rows={2}
              className="text-xs rounded-xl resize-none"
            />
          </div>
        </div>

        {/* Legal / Tax Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/20 border border-border/70">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              {isRtl ? "کد اقتصادی" : "Economic Code"}
            </label>
            <Input
              value={economicCode}
              onChange={(e) => setEconomicCode(e.target.value)}
              placeholder="411..."
              className="h-9 text-xs rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              {isRtl ? "شناسه ملی" : "National ID"}
            </label>
            <Input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="101..."
              className="h-9 text-xs rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              {isRtl ? "شماره ثبت" : "Registration No."}
            </label>
            <Input
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="12345"
              className="h-9 text-xs rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl h-11 px-6 text-sm"
            disabled={isSubmitting}
          >
            {isRtl ? "انصراف" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!persianTitle.trim() && !companyNameEn.trim())}
            className="rounded-xl h-11 px-8 text-sm font-semibold gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{isRtl ? "در حال ثبت کارفرما..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>{isRtl ? "ثبت نهایی در جدول کارفرماها" : "Save Customer"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
