// src/modules/customers/components/CreateCustomerView.tsx
"use client";

import React, { useState, useRef, useMemo } from "react";
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
  Factory,
  Flame,
  Cpu,
  Landmark,
  Boxes,
  FileText,
  TrendingUp,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { customersService } from "../services/customers.service";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import { storeCustomPlant, customerToPlantFacility } from "../utils/petro-unifier";
import type { Customer, CustomerCreateInput } from "../types/customers.types";
import type { PlantProcessType } from "../types/plants.types";

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
  "کرمانشاه",
  "سنندج",
  "قزوین",
  "یزد",
];

const PROCESS_TYPES: { id: PlantProcessType; labelFa: string; labelEn: string; color: string }[] = [
  { id: "olefin", labelFa: "واحد الفین (اتیلن / پروپیلن)", labelEn: "Olefin Unit", color: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  { id: "aromatic", labelFa: "واحد آروماتیک (بنزن / پارازایلین)", labelEn: "Aromatic Unit", color: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  { id: "methanol", labelFa: "واحد متانول (سنتز / مگامتانول)", labelEn: "Methanol Unit", color: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
  { id: "urea_ammonia", labelFa: "واحد اوره و آمونیاک", labelEn: "Urea & Ammonia", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  { id: "polymer", labelFa: "واحد پلیمر و پلی‌الفین‌ها (HDPE/LDPE/PP)", labelEn: "Polymer Plant", color: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
  { id: "refinery", labelFa: "پالایشگاه و میعانات گازی", labelEn: "Refinery / Condensate", color: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  { id: "utility", labelFa: "یوتیلیتی متمرکز (آب، برق، بخار)", labelEn: "Centralized Utility", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30" },
  { id: "chemicals", labelFa: "صنایع شیمیایی و پایین‌دستی", labelEn: "Chemicals & Downstream", color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30" },
];

const SUGGESTED_LICENSORS = ["Technip", "Linde", "BASF", "Haldor Topsoe", "Stamicarbon", "Toyo", "Daelim", "Uhde", "Axens", "Honeywell UOP", "Krupp Uhde", "Snamprogetti"];
const SUGGESTED_ENGINEERING = ["PIDEC", "Sazeh", "Namvaran", "Daelim", "Snamprogetti", "Chiyoda", "Tecnimont", "Nargan", "Chagalesh"];
const SUGGESTED_PRODUCTS = ["اتیلن", "پروپیلن", "بنزن", "متانول", "پلی‌اتیلن سنگین (HDPE)", "پلی‌اتیلن سبک (LDPE)", "پلی‌پروپیلن (PP)", "اوره پریل", "آمونیاک", "پارازایلین", "ارتوزایلین", "اتیلن گلیکول (MEG)"];

export function CreateCustomerView({
  onCustomerCreated,
  onCancel,
}: CreateCustomerViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Tab State
  const [activeFormTab, setActiveFormTab] = useState<"general" | "petrochemical" | "legal">("general");

  // General Fields
  const [persianTitle, setPersianTitle] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [abbrv, setAbbrv] = useState("");
  const [industry, setIndustry] = useState("Petrochemical");
  const [city, setCity] = useState("عسلویه");
  const [website, setWebsite] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [plantAddress, setPlantAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Petrochemical Specifications
  const [isPetrochemical, setIsPetrochemical] = useState(true);
  const [processType, setProcessType] = useState<PlantProcessType>("olefin");
  const [complexNameFa, setComplexNameFa] = useState("");
  const [plantCode, setPlantCode] = useState("");
  const [unitTypeFa, setUnitTypeFa] = useState("");
  const [phaseFa, setPhaseFa] = useState("");
  const [holdingId, setHoldingId] = useState("holding-pgpic");
  const [owner1Fa, setOwner1Fa] = useState("");
  const [owner2Fa, setOwner2Fa] = useState("");
  const [nominalCapacityFa, setNominalCapacityFa] = useState("");
  const [capacityTonsPerYear, setCapacityTonsPerYear] = useState<number | "">("");
  const [feedstockFa, setFeedstockFa] = useState("");
  const [feedstockSourceFa, setFeedstockSourceFa] = useState("");
  const [reactorOrFurnaceInfoFa, setReactorOrFurnaceInfoFa] = useState("");
  const [espInstalledBase, setEspInstalledBase] = useState("");
  const [locationZone, setLocationZone] = useState<"assaluyeh" | "mahshahr" | "other_provinces">("assaluyeh");
  const [status, setStatus] = useState<"operational" | "expansion" | "under_construction">("operational");
  const [commissionedYear, setCommissionedYear] = useState<number | "">("");
  const [tseSymbol, setTseSymbol] = useState("");
  const [codalUrl, setCodalUrl] = useState("");

  // Tag arrays for licensors, engineering, products
  const [licensors, setLicensors] = useState<string[]>(["Technip"]);
  const [engineeringCompanies, setEngineeringCompanies] = useState<string[]>(["PIDEC"]);
  const [mainProducts, setMainProducts] = useState<string[]>(["اتیلن", "پروپیلن"]);
  const [customTagInput, setCustomTagInput] = useState<{ licensor: string; engineering: string; product: string }>({
    licensor: "",
    engineering: "",
    product: "",
  });

  // Legal & Financial
  const [economicCode, setEconomicCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Holdings options for combobox
  const holdingOptions = useMemo(() => {
    return [
      ...IRANIAN_HOLDINGS.map((h) => ({
        value: h.id,
        label: `${h.nameFa} (${h.subsidiaries.length} شرکت)`,
      })),
      { value: "private", label: isRtl ? "بخش خصوصی مستقل" : "Independent Private" },
      { value: "governmental", label: isRtl ? "بخش دولتی / شرکت ملی نفت" : "Governmental / NIOC" },
    ];
  }, [isRtl]);

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

  const handleAddTag = (type: "licensor" | "engineering" | "product", val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (type === "licensor" && !licensors.includes(trimmed)) {
      setLicensors([...licensors, trimmed]);
      setCustomTagInput((prev) => ({ ...prev, licensor: "" }));
    } else if (type === "engineering" && !engineeringCompanies.includes(trimmed)) {
      setEngineeringCompanies([...engineeringCompanies, trimmed]);
      setCustomTagInput((prev) => ({ ...prev, engineering: "" }));
    } else if (type === "product" && !mainProducts.includes(trimmed)) {
      setMainProducts([...mainProducts, trimmed]);
      setCustomTagInput((prev) => ({ ...prev, product: "" }));
    }
  };

  const handleRemoveTag = (type: "licensor" | "engineering" | "product", val: string) => {
    if (type === "licensor") setLicensors(licensors.filter((x) => x !== val));
    if (type === "engineering") setEngineeringCompanies(engineeringCompanies.filter((x) => x !== val));
    if (type === "product") setMainProducts(mainProducts.filter((x) => x !== val));
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

      const payload: CustomerCreateInput = {
        persian_title_fa: persianTitle.trim() || companyNameEn.trim(),
        company_name_en: companyNameEn.trim(),
        company_abbrv: abbrv.trim() || undefined,
        industry: isPetrochemical ? "Petrochemical" : (industry.trim() || "سایر صنایع"),
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

        // Petrochemical fields
        is_petrochemical: isPetrochemical,
        process_type: isPetrochemical ? processType : undefined,
        plant_code: plantCode.trim() || undefined,
        complex_name_fa: complexNameFa.trim() || persianTitle.trim() || undefined,
        unit_type_fa: unitTypeFa.trim() || undefined,
        phase_fa: phaseFa.trim() || undefined,
        holding_id: holdingId || undefined,
        holding_name_fa: selectedHolding?.nameFa || undefined,
        owner1_fa: owner1Fa.trim() || undefined,
        owner2_fa: owner2Fa.trim() || undefined,
        nominal_capacity_fa: nominalCapacityFa.trim() || undefined,
        capacity_tons_per_year: typeof capacityTonsPerYear === "number" ? capacityTonsPerYear : undefined,
        feedstock_fa: feedstockFa.trim() || undefined,
        feedstock_source_fa: feedstockSourceFa.trim() || undefined,
        licensors: licensors.length > 0 ? licensors : undefined,
        engineering_companies: engineeringCompanies.length > 0 ? engineeringCompanies : undefined,
        main_products_fa: mainProducts.length > 0 ? mainProducts : undefined,
        reactor_or_furnace_info_fa: reactorOrFurnaceInfoFa.trim() || undefined,
        esp_installed_base: espInstalledBase.trim() || undefined,
        location_zone: locationZone,
        status,
        commissioned_year: typeof commissionedYear === "number" ? commissionedYear : undefined,
        tse_symbol: tseSymbol.trim() || undefined,
        codal_url: codalUrl.trim() || undefined,
      };

      const created = await customersService.createCustomer(payload);

      // Register dynamically into unified plants catalog
      if (isPetrochemical) {
        const facility = customerToPlantFacility(created);
        storeCustomPlant(facility);
      }

      toast.success(
        isRtl
          ? "کارفرما و پلنت پتروشیمی با موفقیت ثبت شد و در تمام بخش‌های سیستم یکپارچه فعال گردید."
          : "Customer and petrochemical plant created successfully across all modules."
      );
      onCustomerCreated(created);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ثبت کارفرما" : "Failed to save customer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Factory className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{isRtl ? "ساخت و تعریف واحد پتروشیمی / کارفرمای جدید" : "Create New Petrochemical Plant / Client"}</span>
              <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
                {isRtl ? "یکپارچه با سامانه" : "Unified Catalog"}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "اطلاعات ثبت‌شده بلافاصله در دیتابیس کارفرمایان، فهرست پلنت‌ها، هلدینگ‌ها و کامبوباکس ساخت پروژه‌ها فعال می‌شود."
                : "Information will be instantly unified across Customers Directory, Plants, Holdings, and Project Wizards."}
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

      {/* ── Main Form with Tabs ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeFormTab} onValueChange={(val) => setActiveFormTab(val as any)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-11 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="general" className="rounded-lg text-xs font-semibold flex items-center gap-2">
              <Building2 className="size-4" />
              <span>{isRtl ? "۱. مشخصات عمومی و هویتی" : "1. General Profile"}</span>
            </TabsTrigger>
            <TabsTrigger value="petrochemical" className="rounded-lg text-xs font-semibold flex items-center gap-2">
              <Factory className="size-4" />
              <span>{isRtl ? "۲. مشخصات فنی پتروشیمی" : "2. Petrochemical Specs"}</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="rounded-lg text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4" />
              <span>{isRtl ? "۳. شناسه‌های حقوقی و مالی" : "3. Legal & Identifiers"}</span>
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════
              TAB 1: GENERAL PROFILE
             ══════════════════════════════════════════════════════ */}
          <TabsContent value="general" className="mt-4 space-y-6">
            <Card className="rounded-2xl border-border bg-card shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>{isRtl ? "هویت شرکتی و سازمانی" : "Corporate & Company Identity"}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isRtl ? "نام رسمی، مشخصات تماس، لوگو و دفاتر شرکت" : "Official company name, contact info, logo and locations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Logo Upload Box */}
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
                    <Label className="text-xs font-bold text-foreground">
                      {isRtl ? "نشان و لوگوی شرکت (اختیاری)" : "Company Logo (Optional)"}
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      {isRtl ? "فرمت‌های پشتیبانی‌شده: PNG, JPG, SVG تا حداکثر ۵ مگابایت" : "Supported: PNG, JPG, SVG up to 5MB"}
                    </p>
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
                        {isUploadingLogo ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                        <span>{isRtl ? "آپلود فایل لوگو..." : "Upload Logo..."}</span>
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
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام رسمی شرکت (فارسی) *" : "Official Company Name (Persian) *"}
                    </Label>
                    <Input
                      value={persianTitle}
                      onChange={(e) => setPersianTitle(e.target.value)}
                      placeholder={isRtl ? "مثال: شرکت پتروشیمی جم" : "e.g. Jam Petrochemical Company"}
                      className="h-10 text-sm rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام بین‌المللی شرکت (لاتین)" : "Company Name (English)"}
                    </Label>
                    <Input
                      value={companyNameEn}
                      onChange={(e) => setCompanyNameEn(e.target.value)}
                      placeholder="e.g. Jam Petrochemical Co."
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Abbrv, Industry, City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام اختصاری / نماد شرکتی" : "Abbreviation"}
                    </Label>
                    <Input
                      value={abbrv}
                      onChange={(e) => setAbbrv(e.target.value.toUpperCase())}
                      placeholder="e.g. JPC, APC"
                      className="h-10 text-sm rounded-xl text-left uppercase font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "حوزه فعالیت / صنعت" : "Industry"}
                    </Label>
                    <Combobox
                      options={COMMON_INDUSTRIES.map((ind) => ({ id: ind, value: ind, label: ind }))}
                      value={industry}
                      onChange={(val) => setIndustry(val)}
                      placeholder={isRtl ? "انتخاب حوزه..." : "Select industry..."}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "شهر محل استقرار" : "City"}
                    </Label>
                    <Combobox
                      options={COMMON_CITIES.map((c) => ({ id: c, value: c, label: c }))}
                      value={city}
                      onChange={(val) => setCity(val)}
                      placeholder={isRtl ? "انتخاب شهر..." : "Select city..."}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Website & Phones */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="size-3.5 text-primary" />
                      <span>{isRtl ? "وب‌سایت رسمی" : "Website"}</span>
                    </Label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>{isRtl ? "تلفن دفتر مرکزی" : "HQ Phone"}</span>
                    </Label>
                    <Input
                      value={tel1}
                      onChange={(e) => setTel1(e.target.value)}
                      placeholder="021-xxxxxxxx"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>{isRtl ? "تلفن مجتمع / کارخانه" : "Plant Phone"}</span>
                    </Label>
                    <Input
                      value={tel2}
                      onChange={(e) => setTel2(e.target.value)}
                      placeholder="077-xxxxxxxx"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{isRtl ? "نشانی کامل دفتر مرکزی" : "Head Office Address"}</span>
                    </Label>
                    <Textarea
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder={isRtl ? "تهران، میدان ونک..." : "HQ full address..."}
                      className="min-h-[70px] text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Factory className="size-3.5 text-primary" />
                      <span>{isRtl ? "نشانی مجتمع / سایت پتروشیمی" : "Plant / Site Address"}</span>
                    </Label>
                    <Textarea
                      value={plantAddress}
                      onChange={(e) => setPlantAddress(e.target.value)}
                      placeholder={isRtl ? "منطقه ویژه اقتصادی انرژی پارس، فاز ۱ پتروشیمی..." : "Site address..."}
                      className="min-h-[70px] text-xs rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveFormTab("petrochemical")}
                className="rounded-xl h-10 px-5 text-xs font-bold gap-2"
              >
                <span>{isRtl ? "مرحله بعد: مشخصات فنی پتروشیمی" : "Next: Petrochemical Specs"}</span>
                {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
              </Button>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════
              TAB 2: PETROCHEMICAL & PROCESS SPECS
             ══════════════════════════════════════════════════════ */}
          <TabsContent value="petrochemical" className="mt-4 space-y-6">
            <Card className="rounded-2xl border-border bg-card shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Factory className="size-4 text-primary" />
                    <span>{isRtl ? "مشخصات فنی، فرآیندی و مهندسی پلنت" : "Petrochemical & Process Engineering"}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isRtl ? "واحدهای الفین، آروماتیک، متانول، کوره‌های پیرولیز، لایسنسورها و تجهیزات ESP" : "Process units, furnaces, licensors and ESP installed base"}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50">
                  <Switch
                    checked={isPetrochemical}
                    onCheckedChange={setIsPetrochemical}
                    id="petro-mode-toggle"
                  />
                  <Label htmlFor="petro-mode-toggle" className="text-xs font-semibold cursor-pointer">
                    {isRtl ? "فعال‌سازی پلنت پتروشیمی" : "Petro Facility Active"}
                  </Label>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Process Type Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    {isRtl ? "نوع واحد فرآیندی تخصصی پتروشیمی:" : "Petrochemical Process Type:"}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PROCESS_TYPES.map((pt) => {
                      const isSelected = processType === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => setProcessType(pt.id)}
                          className={`p-3 rounded-xl border text-start transition-all text-xs flex flex-col gap-1 ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20 font-bold"
                              : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <span className="font-semibold text-foreground truncate">{pt.labelFa}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{pt.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Complex Name, Plant Code, Unit Name, Phase */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام مجتمع پتروشیمی" : "Petrochemical Complex Name"}
                    </Label>
                    <Input
                      value={complexNameFa}
                      onChange={(e) => setComplexNameFa(e.target.value)}
                      placeholder={isRtl ? "مثال: مجتمع پتروشیمی جم" : "e.g. Jam Petrochemical Complex"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد واحد فرآیندی تخصصی" : "Plant / Unit Code"}
                    </Label>
                    <Input
                      value={plantCode}
                      onChange={(e) => setPlantCode(e.target.value.toUpperCase())}
                      placeholder="e.g. OLEFIN-10"
                      className="h-10 text-sm rounded-xl text-left uppercase font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "فاز / بخش" : "Phase / Stage"}
                    </Label>
                    <Input
                      value={phaseFa}
                      onChange={(e) => setPhaseFa(e.target.value)}
                      placeholder={isRtl ? "مثال: فاز ۱" : "e.g. Phase 1"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Holding & Ownership */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Landmark className="size-3.5 text-primary" />
                      <span>{isRtl ? "هلدینگ مادر" : "Parent Holding"}</span>
                    </Label>
                    <Combobox
                      options={holdingOptions}
                      value={holdingId}
                      onChange={(val) => setHoldingId(val)}
                      placeholder={isRtl ? "انتخاب هلدینگ..." : "Select holding..."}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "سهامدار عمده اول (درصد مالکیت)" : "Primary Shareholder"}
                    </Label>
                    <Input
                      value={owner1Fa}
                      onChange={(e) => setOwner1Fa(e.target.value)}
                      placeholder={isRtl ? "مثال: شرکت صنایع پتروشیمی خلیج فارس (۵۱٪)" : "e.g. PGPIC (51%)"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "سهامدار عمده دوم" : "Secondary Shareholder"}
                    </Label>
                    <Input
                      value={owner2Fa}
                      onChange={(e) => setOwner2Fa(e.target.value)}
                      placeholder={isRtl ? "مثال: صندوق بازنشستگی نفت" : "e.g. Oil Pension Fund"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Capacity & Feedstock */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-primary" />
                      <span>{isRtl ? "ظرفیت اسمی سالانه (شرح)" : "Nominal Annual Capacity"}</span>
                    </Label>
                    <Input
                      value={nominalCapacityFa}
                      onChange={(e) => setNominalCapacityFa(e.target.value)}
                      placeholder={isRtl ? "مثال: ۱،۳۲۰،۰۰۰ تن در سال اتیلن و پروپیلن" : "e.g. 1,320,000 MT/Year"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "ظرفیت عددی (تن/سال جهت سورت)" : "Capacity in Tons (Numeric)"}
                    </Label>
                    <Input
                      type="number"
                      value={capacityTonsPerYear}
                      onChange={(e) => setCapacityTonsPerYear(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 1320000"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "سال راه‌اندازی (احداث)" : "Commission Year"}
                    </Label>
                    <Input
                      type="number"
                      value={commissionedYear}
                      onChange={(e) => setCommissionedYear(e.target.value ? Number(e.target.value) : "")}
                      placeholder={isRtl ? "مثال: 1387" : "e.g. 2008"}
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Feedstock details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "خوراک فرآیندی واحد" : "Unit Feedstock"}
                    </Label>
                    <Input
                      value={feedstockFa}
                      onChange={(e) => setFeedstockFa(e.target.value)}
                      placeholder={isRtl ? "مثال: گاز اتان و برش‌های سبک هیدروکربوری" : "e.g. Ethane gas & light naphtha"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "تأمین‌کننده خوراک فرآیندی" : "Feedstock Supplier"}
                    </Label>
                    <Input
                      value={feedstockSourceFa}
                      onChange={(e) => setFeedstockSourceFa(e.target.value)}
                      placeholder={isRtl ? "مثال: پالایشگاه‌های فاز ۹ و ۱۰ پارس جنوبی" : "e.g. South Pars gas refineries"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Licensors Multi-Select */}
                <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Boxes className="size-3.5 text-primary" />
                      <span>{isRtl ? "صاحبان دانش فنی و لایسنسورها (Licensors):" : "Process Licensors:"}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={customTagInput.licensor}
                        onChange={(e) => setCustomTagInput({ ...customTagInput, licensor: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag("licensor", customTagInput.licensor);
                          }
                        }}
                        placeholder={isRtl ? "نام لایسنسور جدید..." : "Add licensor..."}
                        className="h-8 text-xs rounded-lg w-40 text-left font-sans"
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddTag("licensor", customTagInput.licensor)}
                        className="h-8 px-2.5 rounded-lg text-xs"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {licensors.map((lic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1.5 py-1 px-2.5 rounded-lg">
                        <span>{lic}</span>
                        <X
                          className="size-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => handleRemoveTag("licensor", lic)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40">
                    <span className="text-[10.5px] text-muted-foreground">{isRtl ? "پیشنهاد سریع:" : "Quick add:"}</span>
                    {SUGGESTED_LICENSORS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddTag("licensor", sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engineering Contractors Multi-Select */}
                <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Boxes className="size-3.5 text-primary" />
                      <span>{isRtl ? "پیمانکاران مهندسی و EPC:" : "Engineering Contractors (EPC):"}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={customTagInput.engineering}
                        onChange={(e) => setCustomTagInput({ ...customTagInput, engineering: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag("engineering", customTagInput.engineering);
                          }
                        }}
                        placeholder={isRtl ? "نام پیمانکار..." : "Add contractor..."}
                        className="h-8 text-xs rounded-lg w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddTag("engineering", customTagInput.engineering)}
                        className="h-8 px-2.5 rounded-lg text-xs"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {engineeringCompanies.map((eng, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1.5 py-1 px-2.5 rounded-lg">
                        <span>{eng}</span>
                        <X
                          className="size-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => handleRemoveTag("engineering", eng)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40">
                    <span className="text-[10.5px] text-muted-foreground">{isRtl ? "پیشنهاد سریع:" : "Quick add:"}</span>
                    {SUGGESTED_ENGINEERING.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddTag("engineering", sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Products Multi-Select */}
                <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Boxes className="size-3.5 text-primary" />
                      <span>{isRtl ? "محصولات اصلی تولیدی:" : "Main Products:"}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={customTagInput.product}
                        onChange={(e) => setCustomTagInput({ ...customTagInput, product: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag("product", customTagInput.product);
                          }
                        }}
                        placeholder={isRtl ? "نام محصول..." : "Add product..."}
                        className="h-8 text-xs rounded-lg w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddTag("product", customTagInput.product)}
                        className="h-8 px-2.5 rounded-lg text-xs"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mainProducts.map((prod, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1.5 py-1 px-2.5 rounded-lg bg-primary/10 text-primary border-primary/20">
                        <span>{prod}</span>
                        <X
                          className="size-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => handleRemoveTag("product", prod)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40">
                    <span className="text-[10.5px] text-muted-foreground">{isRtl ? "پیشنهاد سریع:" : "Quick add:"}</span>
                    {SUGGESTED_PRODUCTS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddTag("product", sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pyrolysis Furnaces & Reactors */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{isRtl ? "مشخصات فنی کوره‌ها و راکتورهای پیرولیز / کاتالیستی" : "Furnaces & Catalytic Reactors"}</span>
                  </Label>
                  <Textarea
                    value={reactorOrFurnaceInfoFa}
                    onChange={(e) => setReactorOrFurnaceInfoFa(e.target.value)}
                    placeholder={isRtl ? "مثال: دارای ۱۰ کوره الفین Technip (۶ مایع و ۴ گازی) با مشعل‌های Low-NOx..." : "e.g. 10 Technip cracking furnaces with low-NOx burners..."}
                    className="min-h-[70px] text-xs rounded-xl"
                  />
                </div>

                {/* Euroslot Pars Installed Base */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Cpu className="size-3.5" />
                    <span>{isRtl ? "تجهیزات ونت اسلات و سینی‌های صنعتی ESP (Euroslot Pars Installed Base)" : "ESP Installed Base"}</span>
                  </Label>
                  <Textarea
                    value={espInstalledBase}
                    onChange={(e) => setEspInstalledBase(e.target.value)}
                    placeholder={isRtl ? "مثال: سینی‌های سوراخ‌دار و والو برج شستشوی سود و ونت اسلات‌های استنلس استیل ۳۱۶L..." : "e.g. Valve trays for caustic wash tower and 316L vent slots..."}
                    className="min-h-[70px] text-xs rounded-xl border-primary/30"
                  />
                </div>

                {/* Zone, Status, TSE Symbol, Codal */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "منطقه استقرار" : "Zone"}
                    </Label>
                    <Combobox
                      options={[
                        { value: "assaluyeh", label: isRtl ? "عسلویه (پارس جنوبی)" : "Assaluyeh" },
                        { value: "mahshahr", label: isRtl ? "بندر ماهشهر" : "Mahshahr" },
                        { value: "other_provinces", label: isRtl ? "سایر استان‌ها" : "Other Provinces" },
                      ]}
                      value={locationZone}
                      onChange={(val) => setLocationZone(val as any)}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "وضعیت عملیاتی" : "Status"}
                    </Label>
                    <Combobox
                      options={[
                        { value: "operational", label: isRtl ? "در حال بهره‌برداری" : "Operational" },
                        { value: "expansion", label: isRtl ? "طرح توسعه" : "Expansion" },
                        { value: "under_construction", label: isRtl ? "در دست احداث" : "Under Construction" },
                      ]}
                      value={status}
                      onChange={(val) => setStatus(val as any)}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نماد بورسی (TSE)" : "TSE Ticker"}
                    </Label>
                    <Input
                      value={tseSymbol}
                      onChange={(e) => setTseSymbol(e.target.value)}
                      placeholder={isRtl ? "مثال: جم" : "e.g. JAM"}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "شناسه / لینک کدال" : "Codal URL"}
                    </Label>
                    <Input
                      value={codalUrl}
                      onChange={(e) => setCodalUrl(e.target.value)}
                      placeholder="https://codal.ir/..."
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveFormTab("general")}
                className="rounded-xl h-10 px-4 text-xs font-semibold gap-1.5"
              >
                {isRtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
                <span>{isRtl ? "مرحله قبل: مشخصات عمومی" : "Back: General"}</span>
              </Button>

              <Button
                type="button"
                onClick={() => setActiveFormTab("legal")}
                className="rounded-xl h-10 px-5 text-xs font-bold gap-2"
              >
                <span>{isRtl ? "مرحله بعد: شناسه‌های ثبتی و مالی" : "Next: Legal & Tax"}</span>
                {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
              </Button>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════
              TAB 3: LEGAL & TAX IDENTIFIERS
             ══════════════════════════════════════════════════════ */}
          <TabsContent value="legal" className="mt-4 space-y-6">
            <Card className="rounded-2xl border-border bg-card shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>{isRtl ? "شناسه‌های ثبتی، مالیاتی و کدال" : "Legal, Registration & Tax Identifiers"}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isRtl ? "شناسه ملی ۱۱ رقمی، کد اقتصادی، شماره ثبت و کد پستی شرکت" : "National ID, tax code, registration and postal codes"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "شناسه ملی (۱۱ رقمی)" : "National ID (11 Digits)"}
                    </Label>
                    <Input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="1010xxxxxxx"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد اقتصادی" : "Economic Code"}
                    </Label>
                    <Input
                      value={economicCode}
                      onChange={(e) => setEconomicCode(e.target.value)}
                      placeholder="411xxxxxxxxx"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "شماره ثبت شرکت" : "Registration Number"}
                    </Label>
                    <Input
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. 154820"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد پستی ۱۰ رقمی" : "Postal Code (10 Digits)"}
                    </Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="19xxxxxxxx"
                      className="h-10 text-sm rounded-xl text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveFormTab("petrochemical")}
                className="rounded-xl h-11 px-4 text-xs font-semibold gap-1.5"
              >
                {isRtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
                <span>{isRtl ? "مرحله قبل: مشخصات فنی" : "Back: Petrochemical"}</span>
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="rounded-xl h-11 px-5 text-xs font-semibold"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl h-11 px-7 text-xs font-bold gap-2 shadow-md shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{isRtl ? "در حال ثبت یکپارچه..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>{isRtl ? "ثبت نهایی و انتشار در سیستم" : "Save & Publish"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
