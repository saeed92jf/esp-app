// src/modules/customers/components/AddEditLicensorModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  Award,
  Globe,
  MapPin,
  Building2,
  Phone,
  Mail,
  User,
  BookOpen,
  Camera,
  UploadCloud,
  Check,
  X,
  Plus,
  Pencil,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { customersService } from "../services/customers.service";
import type { Licensor } from "../types/licensors.types";

interface AddEditLicensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (licensor: Licensor) => void;
  licensor?: Licensor | null;
}

export function AddEditLicensorModal({
  isOpen,
  onClose,
  onSave,
  licensor,
}: AddEditLicensorModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const isEdit = Boolean(licensor);

  const [activeTab, setActiveTab] = useState<string>("identity");

  // Form Fields
  const [licenseId, setLicenseId] = useState<string>("");
  const [nameEn, setNameEn] = useState<string>("");
  const [nameFa, setNameFa] = useState<string>("");
  const [currentSituation, setCurrentSituation] = useState<string>("Active");
  const [logoUrl, setLogoUrl] = useState<string>("");

  const [countryEn, setCountryEn] = useState<string>("");
  const [countryFa, setCountryFa] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [locationEn, setLocationEn] = useState<string>("");
  const [addressEn, setAddressEn] = useState<string>("");
  const [postCode, setPostCode] = useState<string>("");

  const [website, setWebsite] = useState<string>("");
  const [linkedIn, setLinkedIn] = useState<string>("");
  const [telNo, setTelNo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPersonEmail, setContactPersonEmail] = useState<string>("");
  const [mobileContactPerson, setMobileContactPerson] = useState<string>("");

  const [historyEn, setHistoryEn] = useState<string>("");
  const [historyFa, setHistoryFa] = useState<string>("");

  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when licensor or isOpen changes
  useEffect(() => {
    if (licensor) {
      setLicenseId(licensor.licenseId ? String(licensor.licenseId) : "");
      setNameEn(licensor.nameEn || "");
      setNameFa(licensor.nameFa || "");
      setCurrentSituation(licensor.currentSituationEn || "Active");
      setLogoUrl(licensor.logoUrl || "");

      setCountryEn(licensor.countryEn || "");
      setCountryFa(licensor.countryFa || "");
      setCountryCode(licensor.countryCode || "");
      setLocationEn(licensor.locationEn || licensor.headquartersEn || "");
      setAddressEn(licensor.addressEn || "");
      setPostCode(licensor.postCode || "");

      setWebsite(licensor.website || "");
      setLinkedIn(licensor.linkedIn || "");
      setTelNo(licensor.telNo || "");
      setEmail(licensor.email || "");
      setContactPerson(licensor.contactPerson || "");
      setContactPersonEmail(licensor.contactPersonEmail || "");
      setMobileContactPerson(licensor.mobileContactPerson || "");

      setHistoryEn(licensor.historyEn || licensor.descriptionEn || "");
      setHistoryFa(licensor.historyFa || licensor.descriptionFa || "");
    } else {
      // Defaults for new
      setLicenseId(String(Math.floor(100 + Math.random() * 900)));
      setNameEn("");
      setNameFa("");
      setCurrentSituation("Active");
      setLogoUrl("");

      setCountryEn("");
      setCountryFa("");
      setCountryCode("");
      setLocationEn("");
      setAddressEn("");
      setPostCode("");

      setWebsite("");
      setLinkedIn("");
      setTelNo("");
      setEmail("");
      setContactPerson("");
      setContactPersonEmail("");
      setMobileContactPerson("");

      setHistoryEn("");
      setHistoryFa("");
    }
    setActiveTab("identity");
  }, [licensor, isOpen]);

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);
    try {
      const res = await customersService.uploadLogo(file);
      if (res?.url) {
        setLogoUrl(res.url);
      }
      toast.success(isRtl ? "لوگو با موفقیت بارگذاری شد." : "Logo uploaded.");
    } catch {
      toast.success(isRtl ? "لوگو به صورت محلی ثبت شد." : "Logo saved locally.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim()) {
      toast.error(isRtl ? "لطفاً نام لایسنسور (انگلیسی) را وارد نمایید." : "Please enter Licensor Name.");
      setActiveTab("identity");
      return;
    }

    const lid = parseInt(licenseId.trim(), 10) || Math.floor(100 + Math.random() * 900);
    const slug = nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = licensor?.id || `lic-${lid}-${slug || "custom"}`;

    const effectiveNameFa = nameFa.trim() || nameEn.trim();
    const effectiveCountryEn = countryEn.trim() || "Global";
    const effectiveCountryFa = countryFa.trim() || (isRtl ? "بین‌المللی" : "Global");
    const effectiveCountryCode = (countryCode.trim() || "GL").toUpperCase();

    const descEn = historyEn.trim() || `${nameEn.trim()} is an international process licensor.`;
    const descFa = historyFa.trim() || `لایسنسور و صاحب فناوری فرآیندی ${effectiveNameFa}.`;

    const updatedLicensor: Licensor = {
      id,
      licenseId: lid,
      nameEn: nameEn.trim(),
      nameFa: effectiveNameFa,
      countryEn: effectiveCountryEn,
      countryFa: effectiveCountryFa,
      countryCode: effectiveCountryCode,
      headquartersEn: locationEn.trim() || effectiveCountryEn,
      headquartersFa: locationEn.trim() || effectiveCountryFa,
      establishedYear: licensor?.establishedYear || 0,
      website: website.trim(),
      logoUrl: logoUrl.trim() || undefined,
      processCategories: licensor?.processCategories || ["all"],
      keyTechnologies: licensor?.keyTechnologies || [],
      descriptionEn: descEn,
      descriptionFa: descFa,
      licensedPlants: licensor?.licensedPlants || [],
      espRelevanceFa:
        licensor?.espRelevanceFa ||
        `تأمین تجهیزات، قطعات یدکی و خدمات فنی مهندسی تحت لایسنس ${nameEn.trim()}.`,
      sources: licensor?.sources || [],

      // Extended Fields matching Excel
      addressEn: addressEn.trim(),
      addressFa: addressEn.trim(),
      locationEn: locationEn.trim(),
      locationFa: locationEn.trim(),
      postCode: postCode.trim(),
      telNo: telNo.trim(),
      email: email.trim(),
      linkedIn: linkedIn.trim(),
      currentSituationEn: currentSituation.trim(),
      currentSituationFa: currentSituation.trim(),
      historyEn: historyEn.trim(),
      historyFa: historyFa.trim() || historyEn.trim(),
      contactPerson: contactPerson.trim(),
      contactPersonEmail: contactPersonEmail.trim(),
      mobileContactPerson: mobileContactPerson.trim(),
    };

    onSave(updatedLicensor);
    toast.success(
      isRtl
        ? isEdit
          ? "اطلاعات لایسنسور با موفقیت به‌روزرسانی شد."
          : "لایسنسور جدید با موفقیت ثبت شد."
        : isEdit
        ? "Licensor updated successfully."
        : "Licensor created successfully."
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] h-[88vh] p-0 gap-0 overflow-hidden flex flex-col bg-card border-border rounded-2xl sm:rounded-3xl shadow-2xl z-[110]">
        <DialogHeader className="p-5 pb-3 border-b border-border/70 bg-muted/20 shrink-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="size-5 text-primary" />
            <span>
              {isRtl
                ? isEdit
                  ? `ویرایش لایسنسور: ${licensor?.nameFa || licensor?.nameEn}`
                  : "ساخت و ثبت لایسنسور جدید"
                : isEdit
                ? `Edit Licensor: ${licensor?.nameEn}`
                : "Create New Licensor"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isRtl
              ? "مشخصات شرکتی، اطلاعات تماس، موقعیت مکانی و تاریخچه لایسنسور را وارد نمایید."
              : "Enter licensor corporate details, contacts, geographic location, and history."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 gap-0">
            {/* Tabs List */}
            <div className="px-5 pt-2 border-b border-border/70 bg-background shrink-0 overflow-x-auto no-scrollbar">
              <TabsList variant="line" className="h-10 gap-2 sm:gap-4 p-0">
                <TabsTrigger value="identity" className="gap-2 text-xs sm:text-sm font-semibold pb-2 data-active:text-primary">
                  <Award className="size-4" />
                  <span>{isRtl ? "اطلاعات هویتی و ثبتی" : "Identity & Status"}</span>
                </TabsTrigger>

                <TabsTrigger value="location" className="gap-2 text-xs sm:text-sm font-semibold pb-2 data-active:text-primary">
                  <MapPin className="size-4" />
                  <span>{isRtl ? "موقعیت و نشانی" : "Location & Address"}</span>
                </TabsTrigger>

                <TabsTrigger value="contacts" className="gap-2 text-xs sm:text-sm font-semibold pb-2 data-active:text-primary">
                  <Phone className="size-4" />
                  <span>{isRtl ? "راه‌های ارتباطی و رابط" : "Contacts & Rep"}</span>
                </TabsTrigger>

                <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm font-semibold pb-2 data-active:text-primary">
                  <BookOpen className="size-4" />
                  <span>{isRtl ? "تاریخچه و معرفی" : "History & Overview"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
              {/* TAB 1: IDENTITY */}
              <TabsContent value="identity" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد / شناسه لایسنس (License ID)" : "License ID"}
                    </Label>
                    <Input
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      placeholder="مثال: 22"
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام لایسنسور (انگلیسی - رسمی) *" : "Licensor Name (English) *"}
                    </Label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. AXENS, Casale, LyondellBasell..."
                      className="h-9.5 rounded-xl text-xs font-semibold"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام لایسنسور (فارسی / عنوان نمایشی)" : "Persian / Display Name"}
                    </Label>
                    <Input
                      value={nameFa}
                      onChange={(e) => setNameFa(e.target.value)}
                      placeholder="مثال: اکسنس (Axens) یا کازاله"
                      className="h-9.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "وضعیت فعلی شرکت (Current Situation)" : "Current Situation / Status"}
                    </Label>
                    <Input
                      value={currentSituation}
                      onChange={(e) => setCurrentSituation(e.target.value)}
                      placeholder="e.g. Active, Part of Sanofi, Integrated into Arkema..."
                      className="h-9.5 rounded-xl text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Logo Section */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Camera className="size-4 text-primary" />
                    <span>{isRtl ? "لوگوی رسمی لایسنسور" : "Official Logo"}</span>
                  </Label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Preview Box */}
                    <div className="size-24 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 p-2 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain select-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/50 text-[10px]">
                          <Camera className="size-6 mb-1" />
                          <span>{isRtl ? "بدون لوگو" : "No Logo"}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoFileSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="h-9 rounded-xl text-xs gap-2 border-dashed border-primary/40 hover:border-primary w-full sm:w-auto cursor-pointer"
                      >
                        {isUploadingLogo ? (
                          <span className="inline-block size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="size-4 text-primary" />
                        )}
                        <span>{isRtl ? "آپلود فایل عکس لوگو از سیستم..." : "Upload Logo Image..."}</span>
                      </Button>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {isRtl ? "یا آدرس فایل در public یا اینترنت (URL):" : "Or Logo Path/URL:"}
                        </Label>
                        <Input
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="/licensors/example.svg"
                          className="h-8.5 rounded-xl text-xs font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: LOCATION & ADDRESS */}
              <TabsContent value="location" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کشور مبدا (Origin - لاتین)" : "Origin Country (En)"}
                    </Label>
                    <Input
                      value={countryEn}
                      onChange={(e) => setCountryEn(e.target.value)}
                      placeholder="e.g. Germany, France, USA..."
                      className="h-9.5 rounded-xl text-xs"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "نام کشور (فارسی)" : "Country (Fa)"}
                    </Label>
                    <Input
                      value={countryFa}
                      onChange={(e) => setCountryFa(e.target.value)}
                      placeholder="مثال: آلمان، فرانسه، سوئیس..."
                      className="h-9.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد کشور (ISO Code)" : "Country Code (2 letters)"}
                    </Label>
                    <Input
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DE, FR, US, CH, CN..."
                      className="h-9.5 rounded-xl text-xs font-mono uppercase"
                      maxLength={3}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "موقعیت مکانی / شهر (Location)" : "City & Location"}
                    </Label>
                    <Input
                      value={locationEn}
                      onChange={(e) => setLocationEn(e.target.value)}
                      placeholder="e.g. Rueil-Malmaison, France / Zurich, Switzerland"
                      className="h-9.5 rounded-xl text-xs"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "کد پستی (Post Code)" : "Postal Code"}
                    </Label>
                    <Input
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                      placeholder="e.g. 92500, 8050, 67056..."
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isRtl ? "آدرس کامل پستی و مقر اصلی (Address)" : "Full Corporate Address"}
                  </Label>
                  <Textarea
                    value={addressEn}
                    onChange={(e) => setAddressEn(e.target.value)}
                    placeholder="e.g. 89 Boulevard Franklin Roosevelt, 92500 Rueil-Malmaison, France"
                    className="min-h-20 rounded-xl text-xs resize-none"
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              {/* TAB 3: CONTACTS & REPRESENTATIVE */}
              <TabsContent value="contacts" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "وب‌سایت رسمی (Web Site)" : "Official Website URL"}
                    </Label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.example.com"
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "صفحه لینکدین (LinkedIn)" : "LinkedIn Company Page"}
                    </Label>
                    <Input
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                      placeholder="https://www.linkedin.com/company/example"
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "شماره تلفن تماس (Tel No)" : "Telephone Number"}
                    </Label>
                    <Input
                      value={telNo}
                      onChange={(e) => setTelNo(e.target.value)}
                      placeholder="+41433177111"
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isRtl ? "ایمیل رسمی / پشتیبانی (Email)" : "Corporate Email Address"}
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="h-9.5 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Contact Person Box */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <User className="size-4 text-primary" />
                    <span>{isRtl ? "مشخصات شخص رابط / مدیر پروژه" : "Contact Person / Project Manager"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        {isRtl ? "نام شخص رابط:" : "Contact Person Name:"}
                      </Label>
                      <Input
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder={isRtl ? "نام و نام خانوادگی رابط" : "Name"}
                        className="h-8.5 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        {isRtl ? "ایمیل شخص رابط:" : "Contact Person Email:"}
                      </Label>
                      <Input
                        value={contactPersonEmail}
                        onChange={(e) => setContactPersonEmail(e.target.value)}
                        placeholder="rep@example.com"
                        className="h-8.5 rounded-xl text-xs font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        {isRtl ? "شماره همراه شخص رابط:" : "Mobile Phone:"}
                      </Label>
                      <Input
                        value={mobileContactPerson}
                        onChange={(e) => setMobileContactPerson(e.target.value)}
                        placeholder="+98912..."
                        className="h-8.5 rounded-xl text-xs font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: HISTORY & OVERVIEW */}
              <TabsContent value="history" className="space-y-4 mt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isRtl ? "تاریخچه، سوابق و معرفی رسمی (انگلیسی - History) *" : "Corporate History & Background (English) *"}
                  </Label>
                  <Textarea
                    value={historyEn}
                    onChange={(e) => setHistoryEn(e.target.value)}
                    placeholder="Enter corporate history, mergers, origins, and key milestones..."
                    className="min-h-32 rounded-xl text-xs leading-relaxed resize-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isRtl ? "تاریخچه و معرفی به زبان فارسی (اختیاری)" : "Persian History / Description (Optional)"}
                  </Label>
                  <Textarea
                    value={historyFa}
                    onChange={(e) => setHistoryFa(e.target.value)}
                    placeholder="تاریخچه، پیشینه تأسیس و معرفی فناوری‌های این لایسنسور به زبان فارسی..."
                    className="min-h-24 rounded-xl text-xs leading-relaxed resize-none"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <DialogFooter className="p-4 border-t border-border/70 bg-muted/15 flex items-center justify-between sm:justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs cursor-pointer"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>

            <Button
              type="submit"
              size="sm"
              className="h-9 px-5 rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              <Check className="size-4" />
              <span>{isRtl ? (isEdit ? "ذخیره تغییرات" : "ثبت لایسنسور") : (isEdit ? "Save Changes" : "Create Licensor")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
