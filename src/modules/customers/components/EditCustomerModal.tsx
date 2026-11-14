// src/modules/customers/components/EditCustomerModal.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  X,
  Building2,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Globe,
  Phone,
  MapPin,
  Pencil,
  Image as ImageIcon,
  Factory,
  Flame,
  Cpu,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { customersService } from "../services/customers.service";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import { storeCustomPlant, customerToPlantFacility } from "../utils/petro-unifier";
import type { Customer, CustomerCreateInput } from "../types/customers.types";
import type { PlantProcessType } from "../types/plants.types";

interface EditCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: (updatedCustomer: Customer) => void;
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
  "Mining Industry",
  "سایر صنایع",
];

const COMMON_CITIES = [
  "عسلویه",
  "بندر ماهشهر",
  "تهران",
  "اهواز",
  "بندرعباس",
  "بوشهر",
  "کنگان",
  "اراک",
  "اصفهان",
  "تبریز",
  "شیراز",
  "مشهد",
  "ایلام",
  "قزوین",
];

const PROCESS_TYPES: { id: PlantProcessType; labelFa: string; labelEn: string }[] = [
  { id: "olefin", labelFa: "واحد الفین (اتیلن / پروپیلن)", labelEn: "Olefin" },
  { id: "aromatic", labelFa: "واحد آروماتیک (بنزن / پارازایلین)", labelEn: "Aromatic" },
  { id: "methanol", labelFa: "واحد متانول (مگامتانول)", labelEn: "Methanol" },
  { id: "urea_ammonia", labelFa: "واحد اوره و آمونیاک", labelEn: "Urea & Ammonia" },
  { id: "polymer", labelFa: "واحد پلیمر (HDPE/LDPE/PP)", labelEn: "Polymer" },
  { id: "refinery", labelFa: "پالایشگاه و میعانات گازی", labelEn: "Refinery" },
  { id: "utility", labelFa: "یوتیلیتی متمرکز", labelEn: "Utility" },
  { id: "chemicals", labelFa: "صنایع شیمیایی و پایین‌دستی", labelEn: "Chemicals" },
];

export function EditCustomerModal({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated,
}: EditCustomerModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<"general" | "petro" | "legal">("general");

  // General
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
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Petrochemical
  const [isPetro, setIsPetro] = useState(true);
  const [processType, setProcessType] = useState<PlantProcessType>("olefin");
  const [complexNameFa, setComplexNameFa] = useState("");
  const [plantCode, setPlantCode] = useState("");
  const [unitTypeFa, setUnitTypeFa] = useState("");
  const [phaseFa, setPhaseFa] = useState("");
  const [holdingId, setHoldingId] = useState("holding-pgpic");
  const [owner1Fa, setOwner1Fa] = useState("");
  const [nominalCapacityFa, setNominalCapacityFa] = useState("");
  const [capacityTonsPerYear, setCapacityTonsPerYear] = useState<number | "">("");
  const [feedstockFa, setFeedstockFa] = useState("");
  const [licensorsText, setLicensorsText] = useState("");
  const [engineeringText, setEngineeringText] = useState("");
  const [productsText, setProductsText] = useState("");
  const [reactorOrFurnaceInfoFa, setReactorOrFurnaceInfoFa] = useState("");
  const [espInstalledBase, setEspInstalledBase] = useState("");
  const [commissionedYear, setCommissionedYear] = useState<number | "">("");
  const [tseSymbol, setTseSymbol] = useState("");

  // Legal
  const [economicCode, setEconomicCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const holdingOptions = useMemo(() => {
    return [
      ...IRANIAN_HOLDINGS.map((h) => ({ value: h.id, label: h.nameFa })),
      { value: "private", label: isRtl ? "بخش خصوصی" : "Private" },
      { value: "governmental", label: isRtl ? "بخش دولتی" : "Governmental" },
    ];
  }, [isRtl]);

  useEffect(() => {
    if (customer) {
      setPersianTitle(customer.persian_title_fa || "");
      setCompanyNameEn(customer.company_name_en || "");
      setAbbrv(customer.company_abbrv || "");
      setIndustry(customer.industry || "Petrochemical");
      setCity(customer.city || "");
      setWebsite(customer.website || "");
      setTel1(customer.tel_code1 || "");
      setTel2(customer.tel_code2 || "");
      setOfficeAddress(customer.office_address_fa || "");
      setPlantAddress(customer.plant_address_fa || "");
      setEconomicCode(customer.economic_code || "");
      setNationalId(customer.national_id_number || "");
      setRegNumber(customer.registration_number || "");
      setPostalCode(customer.postal_code || "");
      setLogoUrl(customer.logo_url || "");

      // Petro
      setIsPetro(Boolean(customer.is_petrochemical || customer.process_type || customer.industry === "Petrochemical"));
      setProcessType((customer.process_type as PlantProcessType) || "olefin");
      setComplexNameFa(customer.complex_name_fa || "");
      setPlantCode(customer.plant_code || "");
      setUnitTypeFa(customer.unit_type_fa || "");
      setPhaseFa(customer.phase_fa || "");
      setHoldingId(customer.holding_id || "holding-pgpic");
      setOwner1Fa(customer.owner1_fa || "");
      setNominalCapacityFa(customer.nominal_capacity_fa || "");
      setCapacityTonsPerYear(customer.capacity_tons_per_year ?? "");
      setFeedstockFa(customer.feedstock_fa || "");
      setLicensorsText(customer.licensors ? customer.licensors.join(", ") : "");
      setEngineeringText(customer.engineering_companies ? customer.engineering_companies.join(", ") : "");
      setProductsText(customer.main_products_fa ? customer.main_products_fa.join(", ") : "");
      setReactorOrFurnaceInfoFa(customer.reactor_or_furnace_info_fa || "");
      setEspInstalledBase(customer.esp_installed_base || "");
      setTseSymbol(customer.tse_symbol || "");
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

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
      const selectedHolding = IRANIAN_HOLDINGS.find((h) => h.id === holdingId);
      const licensors = licensorsText.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);
      const engineeringCompanies = engineeringText.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);
      const mainProductsFa = productsText.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);

      const payload: Partial<CustomerCreateInput> = {
        persian_title_fa: persianTitle.trim() || companyNameEn.trim(),
        company_name_en: companyNameEn.trim(),
        company_abbrv: abbrv.trim() || undefined,
        industry: isPetro ? "Petrochemical" : (industry.trim() || "سایر صنایع"),
        city: city.trim() || undefined,
        website: website.trim() || undefined,
        tel_code1: tel1.trim() || undefined,
        tel_code2: tel2.trim() || undefined,
        office_address_fa: officeAddress.trim() || undefined,
        plant_address_fa: plantAddress.trim() || undefined,
        economic_code: economicCode.trim() || undefined,
        national_id_number: nationalId.trim() || undefined,
        registration_number: regNumber.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,

        is_petrochemical: isPetro,
        process_type: isPetro ? processType : undefined,
        plant_code: plantCode.trim() || undefined,
        complex_name_fa: complexNameFa.trim() || persianTitle.trim() || undefined,
        unit_type_fa: unitTypeFa.trim() || undefined,
        phase_fa: phaseFa.trim() || undefined,
        holding_id: holdingId || undefined,
        holding_name_fa: selectedHolding?.nameFa || undefined,
        owner1_fa: owner1Fa.trim() || undefined,
        nominal_capacity_fa: nominalCapacityFa.trim() || undefined,
        capacity_tons_per_year: typeof capacityTonsPerYear === "number" ? capacityTonsPerYear : undefined,
        feedstock_fa: feedstockFa.trim() || undefined,
        licensors: licensors.length > 0 ? licensors : undefined,
        engineering_companies: engineeringCompanies.length > 0 ? engineeringCompanies : undefined,
        main_products_fa: mainProductsFa.length > 0 ? mainProductsFa : undefined,
        reactor_or_furnace_info_fa: reactorOrFurnaceInfoFa.trim() || undefined,
        esp_installed_base: espInstalledBase.trim() || undefined,
        commissioned_year: typeof commissionedYear === "number" ? commissionedYear : undefined,
        tse_symbol: tseSymbol.trim() || undefined,
      };

      const updated = await customersService.updateCustomer(customer.id, payload);

      if (isPetro) {
        const facility = customerToPlantFacility(updated);
        storeCustomPlant(facility);
      }

      toast.success(isRtl ? "اطلاعات کارفرما با موفقیت به‌روزرسانی شد." : "Customer updated successfully.");
      onCustomerUpdated(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ویرایش کارفرما" : "Failed to update customer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Pencil className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isRtl ? "ویرایش اطلاعات کارفرما و پلنت (ادمین)" : "Edit Customer & Plant (Admin)"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {customer.persian_title_fa || customer.company_name_en}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-1 border-b border-border/60 bg-background">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-9 p-0.5 bg-muted/60 rounded-lg">
              <TabsTrigger value="general" className="text-xs font-semibold">
                {isRtl ? "۱. مشخصات شرکت" : "1. Company"}
              </TabsTrigger>
              <TabsTrigger value="petro" className="text-xs font-semibold">
                {isRtl ? "۲. مشخصات فنی پلنت" : "2. Petro Specs"}
              </TabsTrigger>
              <TabsTrigger value="legal" className="text-xs font-semibold">
                {isRtl ? "۳. اطلاعات حقوقی" : "3. Legal"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border bg-muted/20">
                <div className="relative size-14 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="object-contain size-full p-1" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground block">
                    {isRtl ? "لوگوی شرکت" : "Logo"}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs rounded-lg mt-1 gap-1"
                  >
                    {isUploadingLogo ? <Loader2 className="size-3 animate-spin" /> : <UploadCloud className="size-3" />}
                    <span>{isRtl ? "تغییر لوگو..." : "Change..."}</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "نام رسمی (فارسی) *" : "Persian Name *"}</Label>
                  <Input
                    value={persianTitle}
                    onChange={(e) => setPersianTitle(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "نام لاتین" : "English Name"}</Label>
                  <Input
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "نماد اختصاری" : "Abbrv"}</Label>
                  <Input
                    value={abbrv}
                    onChange={(e) => setAbbrv(e.target.value.toUpperCase())}
                    className="h-9 text-xs rounded-lg text-left uppercase font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "صنعت" : "Industry"}</Label>
                  <Combobox
                    options={COMMON_INDUSTRIES.map((i) => ({ id: i, value: i, label: i }))}
                    value={industry}
                    onChange={(v) => setIndustry(v)}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "شهر" : "City"}</Label>
                  <Combobox
                    options={COMMON_CITIES.map((c) => ({ id: c, value: c, label: c }))}
                    value={city}
                    onChange={(v) => setCity(v)}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "وب‌سایت" : "Website"}</Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "تلفن دفتر مرکزی" : "Phone"}</Label>
                  <Input
                    value={tel1}
                    onChange={(e) => setTel1(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "آدرس دفتر مرکزی" : "Address"}</Label>
                <Textarea
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="min-h-[50px] text-xs rounded-lg"
                />
              </div>
            </div>
          )}

          {activeTab === "petro" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Switch checked={isPetro} onCheckedChange={setIsPetro} id="edit-petro-switch" />
                  <Label htmlFor="edit-petro-switch" className="text-xs font-bold cursor-pointer">
                    {isRtl ? "واحد فرآیندی / مجتمع پتروشیمی فعال است" : "Petrochemical Unit Active"}
                  </Label>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "نوع واحد فرآیندی تخصصی" : "Process Type"}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PROCESS_TYPES.map((pt) => (
                    <Button
                      key={pt.id}
                      type="button"
                      variant={processType === pt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProcessType(pt.id)}
                      className={cn(
                        "h-auto p-2 justify-start text-xs font-normal border transition-colors cursor-pointer",
                        processType === pt.id ? "font-bold" : "border-border/70 hover:bg-muted/40"
                      )}
                    >
                      <span className="truncate block">{pt.labelFa}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "کد پلنت (e.g. OLEFIN-10)" : "Plant Code"}</Label>
                  <Input
                    value={plantCode}
                    onChange={(e) => setPlantCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs rounded-lg text-left uppercase font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "هلدینگ مادر" : "Parent Holding"}</Label>
                  <Combobox
                    options={holdingOptions}
                    value={holdingId}
                    onChange={(v) => setHoldingId(v)}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "نماد بورس (TSE)" : "TSE Ticker"}</Label>
                  <Input
                    value={tseSymbol}
                    onChange={(e) => setTseSymbol(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "ظرفیت اسمی سالانه" : "Capacity Text"}</Label>
                  <Input
                    value={nominalCapacityFa}
                    onChange={(e) => setNominalCapacityFa(e.target.value)}
                    placeholder="۱،۳۲۰،۰۰۰ تن در سال"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "ظرفیت عددی (تن/سال)" : "Capacity Number"}</Label>
                  <Input
                    type="number"
                    value={capacityTonsPerYear}
                    onChange={(e) => setCapacityTonsPerYear(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1320000"
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "لایسنسورها" : "Licensors"}</Label>
                  <Input
                    value={licensorsText}
                    onChange={(e) => setLicensorsText(e.target.value)}
                    placeholder="Technip, Linde"
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "محصولات اصلی" : "Products"}</Label>
                  <Input
                    value={productsText}
                    onChange={(e) => setProductsText(e.target.value)}
                    placeholder="اتیلن، پروپیلن"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-primary">{isRtl ? "تجهیزات ونت اسلات و سینی‌های ESP" : "ESP Installed Base"}</Label>
                <Input
                  value={espInstalledBase}
                  onChange={(e) => setEspInstalledBase(e.target.value)}
                  className="h-9 text-xs rounded-lg border-primary/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "مشخصات کوره‌ها / راکتورها" : "Furnaces & Reactors"}</Label>
                <Input
                  value={reactorOrFurnaceInfoFa}
                  onChange={(e) => setReactorOrFurnaceInfoFa(e.target.value)}
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "شناسه ملی" : "National ID"}</Label>
                  <Input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "کد اقتصادی" : "Economic Code"}</Label>
                  <Input
                    value={economicCode}
                    onChange={(e) => setEconomicCode(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "شماره ثبت" : "Reg Number"}</Label>
                  <Input
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRtl ? "کد پستی ۱۰ رقمی" : "Postal Code"}</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-9 text-xs rounded-lg text-left font-sans"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-9 px-4 text-xs"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl h-9 px-6 text-xs font-bold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{isRtl ? "در حال ذخیره..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>{isRtl ? "ذخیره تغییرات" : "Save Changes"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
