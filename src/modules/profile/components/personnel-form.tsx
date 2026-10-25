"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  Fingerprint,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  BadgeCheck,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle2,
  Info,
  Send,
  Trash,
  ArrowRight,
  Palette,
  Clock,
  Heart,
  Users,
  PhoneCall,
  CreditCard,
  Plus,
  Minus,
  X,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const AVATAR_COLOR_PRESETS = [
  { hex: "#0284c7", labelFa: "آبی آسمانی", labelEn: "Sky Blue" },
  { hex: "#4f46e5", labelFa: "نیلی", labelEn: "Indigo" },
  { hex: "#7c3aed", labelFa: "بنفش", labelEn: "Purple" },
  { hex: "#059669", labelFa: "زمردی", labelEn: "Emerald" },
  { hex: "#0d9488", labelFa: "سبز کله‌غازی", labelEn: "Teal" },
  { hex: "#d97706", labelFa: "کهربایی", labelEn: "Amber" },
  { hex: "#e11d48", labelFa: "زرشکی", labelEn: "Rose" },
  { hex: "#ea580c", labelFa: "نارنجی", labelEn: "Orange" },
  { hex: "#475569", labelFa: "سربی", labelEn: "Slate" },
  { hex: "#1e293b", labelFa: "زغالی", labelEn: "Charcoal" },
];

import { UserProfile } from "../types/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DatePicker, jalaliToGregorianDate, getJalaliDate } from "@/components/ui/date-picker";
import { toPersianDigits } from "@/utils/textDirection";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";

const LocationPickerMap = dynamic(
  () => import("./location-picker-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-muted/40 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-2 animate-pulse">
        <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);

interface PersonnelFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => void;
  isSaving: boolean;
  isOnboarding?: boolean;
}

export function PersonnelForm({ initialData, onSave, isSaving, isOnboarding }: PersonnelFormProps) {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<UserProfile>(initialData);
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const isFa = locale === "fa";

  const DEPARTMENTS: ComboboxOption[] = [
    { value: "مهندسی و طراحی", label: isFa ? "مهندسی و طراحی" : "Engineering & Design" },
    { value: "تولید و فرآوری نسوز", label: isFa ? "تولید و فرآوری نسوز" : "Refractory Production" },
    { value: "کنترل کیفیت و آزمایشگاه", label: isFa ? "کنترل کیفیت و آزمایشگاه" : "QA & Laboratory" },
    { value: "فناوری اطلاعات و سیستم‌ها", label: isFa ? "فناوری اطلاعات و سیستم‌ها" : "IT & Systems" },
    { value: "منابع انسانی و اداری", label: isFa ? "منابع انسانی و اداری" : "Human Resources" },
    { value: "بازرگانی و فروش", label: isFa ? "بازرگانی و فروش" : "Commercial & Sales" },
    { value: "مالی و حسابداری", label: isFa ? "مالی و حسابداری" : "Finance & Accounting" },
  ];

  const ROLES: ComboboxOption[] = [
    { value: "مدیر دپارتمان", label: isFa ? "مدیر دپارتمان" : "Department Manager" },
    { value: "سرپرست کارگاه / شیفت", label: isFa ? "سرپرست کارگاه / شیفت" : "Supervisor" },
    { value: "مهندس فرآیند و متالورژی", label: isFa ? "مهندس فرآیند و متالورژی" : "Process Engineer" },
    { value: "کارشناس ارشد نسوز و سرامیک", label: isFa ? "کارشناس ارشد نسوز" : "Refractory Specialist" },
    { value: "کارشناس کنترل کیفیت", label: isFa ? "کارشناس کنترل کیفیت" : "QC Specialist" },
    { value: "کارشناس فناوری اطلاعات", label: isFa ? "کارشناس فناوری اطلاعات" : "IT Specialist" },
    { value: "کارشناس اداری و پرسنلی", label: isFa ? "کارشناس اداری و پرسنلی" : "HR Specialist" },
    { value: "کارشناس فروش و بازرگانی", label: isFa ? "کارشناس فروش و بازرگانی" : "Sales Specialist" },
  ];

  const DEGREES: ComboboxOption[] = [
    { value: "دیپلم", label: isFa ? "دیپلم" : "High School Diploma" },
    { value: "کاردانی", label: isFa ? "کاردانی" : "Associate Degree" },
    { value: "کارشناسی", label: isFa ? "کارشناسی" : "Bachelor's Degree" },
    { value: "کارشناسی ارشد", label: isFa ? "کارشناسی ارشد" : "Master's Degree" },
    { value: "دکتری تخصصی", label: isFa ? "دکتری تخصصی" : "Doctorate (Ph.D)" },
    { value: "پسادکتری", label: isFa ? "پسادکتری" : "Post-Doctorate" },
  ];

  const MARITAL_STATUS_OPTIONS: ComboboxOption[] = [
    { value: "single", label: t("fields.maritalSingle") },
    { value: "married", label: t("fields.maritalMarried") },
  ];

  const SUPPLEMENTARY_PLAN_OPTIONS: ComboboxOption[] = [
    { value: "golden", label: t("fields.planGolden") },
    { value: "silver", label: t("fields.planSilver") },
    { value: "special", label: t("fields.planSpecial") },
    { value: "none", label: t("fields.planNone") },
  ];

  const currentAvatarBg = formData.personal.avatarColor || "#0284c7";
  const initialLetter = (
    formData.personal.firstNameFa?.trim()?.charAt(0) ||
    formData.personal.firstName?.trim()?.charAt(0) ||
    user?.fullNameFa?.trim()?.charAt(0) ||
    user?.fullName?.trim()?.charAt(0) ||
    "U"
  ).toUpperCase();

  // Parse Jalali or ISO date string into Date object for DatePicker
  const parseDateString = (dateStr?: string): Date | undefined => {
    if (!dateStr || typeof dateStr !== "string") return undefined;
    const trimmed = dateStr.trim();
    if (!trimmed) return undefined;

    const delimiter = trimmed.includes("/") ? "/" : trimmed.includes("-") ? "-" : null;
    if (delimiter) {
      const parts = trimmed.split(delimiter).map((p) => parseInt(p, 10));
      if (parts.length === 3 && !parts.some(isNaN)) {
        const [year, month, day] = parts;
        if (year >= 1300 && year <= 1500) {
          return jalaliToGregorianDate(year, month, day);
        }
        if (year >= 1900 && year <= 2100) {
          return new Date(year, month - 1, day, 12, 0, 0);
        }
      }
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const formatDateToString = (date?: Date): string => {
    if (!date) return "";
    const j = getJalaliDate(date);
    return `${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`;
  };

  const handleFieldChange = (section: keyof UserProfile, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }));
    // Clear error on change
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${section}.${field}`];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.personal.firstNameFa?.trim()) {
      newErrors["personal.firstNameFa"] = t("validation.firstNameFaRequired");
    }
    if (!formData.personal.lastNameFa?.trim()) {
      newErrors["personal.lastNameFa"] = t("validation.lastNameFaRequired");
    }
    if (!formData.personal.firstName?.trim()) {
      newErrors["personal.firstName"] = t("validation.firstNameRequired");
    }
    if (!formData.personal.lastName?.trim()) {
      newErrors["personal.lastName"] = t("validation.lastNameRequired");
    }
    if (!formData.personal.nationalId.trim()) {
      newErrors["personal.nationalId"] = t("validation.nationalIdRequired");
    } else if (!/^\d{10}$/.test(formData.personal.nationalId.trim())) {
      newErrors["personal.nationalId"] = t("validation.nationalIdInvalid");
    }
    if (!formData.personal.phone.trim()) {
      newErrors["personal.phone"] = t("validation.phoneRequired");
    } else if (!/^09\d{9}$/.test(formData.personal.phone.trim())) {
      newErrors["personal.phone"] = t("validation.phoneInvalid");
    }
    if (formData.personal.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.personal.email.trim())) {
      newErrors["personal.email"] = t("validation.emailInvalid");
    }
    if (!formData.organizational.department) {
      newErrors["organizational.department"] = t("validation.departmentRequired");
    }
    if (!formData.organizational.role) {
      newErrors["organizational.role"] = t("validation.roleRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(t("validation.formHasErrors"));
      return;
    }
    onSave(formData);
    toast.success(t("validation.saveSuccess"));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto w-full pb-20">
      
      {/* Onboarding Guidance Header Banner */}
      {isOnboarding && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
          <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-foreground">
              {t("personnelForm.onboardingTitle")}
            </h4>
            <p className="text-muted-foreground leading-relaxed text-xs">
              {t("personnelForm.onboardingDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Personal & Identity Info */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <User className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{t("personnelForm.personalSection")}</h3>
            <p className="text-xs text-muted-foreground">{t("personnelForm.personalSectionDesc")}</p>
          </div>
        </div>

        {/* Avatar with Initial and Color Selection */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/50 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div 
              style={{ backgroundColor: currentAvatarBg }}
              className="size-18 sm:size-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-md ring-4 ring-background transition-colors duration-200 select-none"
            >
              {initialLetter}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">{t("personnelForm.avatarLabel")}</span>
          </div>

          {/* Color Picker Section */}
          <div className="flex-1 space-y-2.5 text-center sm:text-start w-full">
            <div>
              <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                <Palette className="size-4 text-primary" />
                <span>{t("personnelForm.avatarColor")}</span>
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("personnelForm.avatarColorDesc")}
              </p>
            </div>

            {/* Presets and Custom Color Picker */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {AVATAR_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleFieldChange("personal", "avatarColor", preset.hex)}
                  title={isFa ? preset.labelFa : preset.labelEn}
                  className={`size-7 rounded-full transition-all outline-none cursor-pointer flex items-center justify-center ${
                    currentAvatarBg.toLowerCase() === preset.hex.toLowerCase()
                      ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm"
                      : "opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {currentAvatarBg.toLowerCase() === preset.hex.toLowerCase() && (
                    <span className="size-2 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              ))}

              {/* Native / Custom Color Picker Button */}
              <label 
                className="relative size-7 rounded-full border-2 border-dashed border-primary/60 hover:border-primary flex items-center justify-center cursor-pointer transition-all hover:scale-105 overflow-hidden shadow-xs bg-card"
                title={t("personnelForm.customColor")}
              >
                <input 
                  type="color" 
                  value={currentAvatarBg}
                  onChange={(e) => handleFieldChange("personal", "avatarColor", e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Palette className="size-3.5 text-primary" />
              </label>

              {/* Hex Code Display */}
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider" dir="ltr">
                {currentAvatarBg}
              </span>
            </div>
          </div>
        </div>

        {/* Bilingual Name Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Persian First Name */}
          <div className="space-y-1.5">
            <Label htmlFor="firstNameFa" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.firstNameFa")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstNameFa"
              value={formData.personal.firstNameFa || ""}
              onChange={(e) => handleFieldChange("personal", "firstNameFa", e.target.value)}
              placeholder={t("personnelForm.firstNameFaPlaceholder")}
              className={`h-10 text-sm ${errors["personal.firstNameFa"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["personal.firstNameFa"] && (
              <span className="text-[11px] text-destructive">{errors["personal.firstNameFa"]}</span>
            )}
          </div>

          {/* Persian Last Name */}
          <div className="space-y-1.5">
            <Label htmlFor="lastNameFa" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.lastNameFa")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastNameFa"
              value={formData.personal.lastNameFa || ""}
              onChange={(e) => handleFieldChange("personal", "lastNameFa", e.target.value)}
              placeholder={t("personnelForm.lastNameFaPlaceholder")}
              className={`h-10 text-sm ${errors["personal.lastNameFa"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["personal.lastNameFa"] && (
              <span className="text-[11px] text-destructive">{errors["personal.lastNameFa"]}</span>
            )}
          </div>

          {/* English First Name */}
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.firstNameEn")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.personal.firstName}
              onChange={(e) => handleFieldChange("personal", "firstName", e.target.value)}
              placeholder={t("personnelForm.firstNameEnPlaceholder")}
              dir="ltr"
              className={`h-10 text-sm font-sans ${errors["personal.firstName"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["personal.firstName"] && (
              <span className="text-[11px] text-destructive">{errors["personal.firstName"]}</span>
            )}
          </div>

          {/* English Last Name */}
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.lastNameEn")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.personal.lastName}
              onChange={(e) => handleFieldChange("personal", "lastName", e.target.value)}
              placeholder={t("personnelForm.lastNameEnPlaceholder")}
              dir="ltr"
              className={`h-10 text-sm font-sans ${errors["personal.lastName"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["personal.lastName"] && (
              <span className="text-[11px] text-destructive">{errors["personal.lastName"]}</span>
            )}
          </div>

          {/* National ID */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="nationalId" className="text-xs sm:text-sm font-semibold">
                {t("personnelForm.nationalIdLabel")} <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">{t("personnelForm.noHyphen")}</span>
            </div>
            <div className="relative">
              <Input
                id="nationalId"
                value={formData.personal.nationalId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleFieldChange("personal", "nationalId", val);
                }}
                maxLength={10}
                placeholder="0012345678"
                dir="ltr"
                className={`h-10 font-mono text-sm ltr:pl-9 rtl:pr-9 ${errors["personal.nationalId"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
              />
              <Fingerprint className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 pointer-events-none" />
            </div>
            {errors["personal.nationalId"] ? (
              <span className="text-[11px] text-destructive">{errors["personal.nationalId"]}</span>
            ) : (
              <p className="text-[11px] text-muted-foreground">{t("personnelForm.nationalIdHelp")}</p>
            )}
          </div>

          {/* Mobile Phone & Bilingual Validation Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold">
                {t("personnelForm.phoneLabel")} <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1.5">
                {formData.personal.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="size-3" />
                    {t("fields.phoneVerified")}
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Clock className="size-3" />
                      {t("fields.phoneUnverified")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOtpCode("");
                        setOtpError("");
                        setShowOtpModal(true);
                      }}
                      className="h-6 text-[11px] px-2 text-primary border-primary/30 hover:bg-primary/10 gap-1 font-semibold"
                    >
                      <ShieldCheck className="size-3" />
                      <span>{t("fields.verifyPhone")}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <Input
                id="phone"
                value={isFa ? toPersianDigits(formData.personal.phone) : formData.personal.phone}
                onChange={(e) => {
                  const raw = e.target.value
                    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
                    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
                    .replace(/\D/g, "");
                  const val = raw.slice(0, 11);
                  handleFieldChange("personal", "phone", val);
                  if (val !== initialData.personal.phone) {
                    handleFieldChange("personal", "phoneVerified", false);
                  }
                }}
                maxLength={11}
                placeholder={isFa ? "۰۹۱۲۰۰۰۰۰۰۰" : "09120000000"}
                dir="ltr"
                className={`h-10 font-sans fa-num text-sm text-left pl-9 pr-3 ${errors["personal.phone"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
              />
              <Phone className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
            </div>
            {errors["personal.phone"] ? (
              <span className="text-[11px] text-destructive">{errors["personal.phone"]}</span>
            ) : (
              <p className="text-[11px] text-muted-foreground">{t("personnelForm.phoneHelp")}</p>
            )}
          </div>

          {/* Corporate Email (Locked with Verified Badge) */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold">
                {t("personnelForm.corporateEmail")}
              </Label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3" />
                {t("personnelForm.corporateEmailVerified")}
              </span>
            </div>
            <div className="relative">
              <Input
                id="email"
                value={formData.personal.email || user?.email || ""}
                disabled
                readOnly
                dir="ltr"
                className="h-10 font-sans text-sm text-left pl-9 pr-3 bg-muted/40 cursor-not-allowed text-foreground opacity-90"
              />
              <Mail className="size-4 text-emerald-500 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("personnelForm.corporateEmailHelp")}
            </p>
          </div>

          {/* Birth Date (DatePicker) */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.birthDateLabel")}
            </Label>
            <DatePicker
              value={parseDateString(formData.personal.birthDate)}
              onChange={(date) => handleFieldChange("personal", "birthDate", formatDateToString(date))}
              isJalali={isFa}
              placeholder={isFa ? t("personnelForm.birthDatePlaceholder") : t("personnelForm.birthDatePlaceholderEn")}
              startYear={1320}
              endYear={1420}
              className="w-full h-10"
              triggerClassName="w-full h-10 justify-between text-sm"
            />
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.birthDateHelp")}</p>
          </div>

          {/* Marital Status */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.maritalStatusLabel")}
            </Label>
            <Combobox
              options={MARITAL_STATUS_OPTIONS}
              value={formData.personal.maritalStatus || "single"}
              onChange={(val) => handleFieldChange("personal", "maritalStatus", val)}
              placeholder={t("personnelForm.maritalStatusPlaceholder")}
              className="w-full h-10 rtl:text-right"
            />
          </div>

          {/* Children Count - Fixed compact inline stepper */}
          <div className="space-y-1.5">
            <Label htmlFor="childrenCount" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.childrenCountLabel")}
            </Label>
            <div className="h-10 flex items-center">
              <div className="inline-flex items-center rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = formData.personal.childrenCount ?? 0;
                    handleFieldChange("personal", "childrenCount", Math.max(0, current - 1));
                  }}
                  disabled={(formData.personal.childrenCount ?? 0) <= 0}
                  className="size-8 rounded-lg text-foreground hover:bg-background hover:shadow-xs active:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Decrease children count"
                >
                  <Minus className="size-3.5 stroke-[2.5]" />
                </Button>
                <span className="min-w-12 px-3 text-center font-mono font-bold text-sm text-foreground fa-num select-none">
                  {formData.personal.childrenCount ?? 0}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = formData.personal.childrenCount ?? 0;
                    handleFieldChange("personal", "childrenCount", Math.min(20, current + 1));
                  }}
                  disabled={(formData.personal.childrenCount ?? 0) >= 20}
                  className="size-8 rounded-lg text-foreground hover:bg-background hover:shadow-xs active:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Increase children count"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Address & Map */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="address" className="text-xs sm:text-sm font-semibold">
                {t("personnelForm.addressLabel")}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="h-7 text-xs text-primary gap-1 px-2 font-medium"
              >
                <MapPin className="size-3.5" />
                <span>{showMap ? t("personnelForm.closeMap") : t("personnelForm.openMap")}</span>
              </Button>
            </div>
            <Input
              id="address"
              value={formData.personal.address}
              onChange={(e) => handleFieldChange("personal", "address", e.target.value)}
              placeholder={t("personnelForm.addressPlaceholder")}
              className="h-10 text-sm"
            />

            {showMap && (
              <div className="pt-2 animate-in fade-in duration-300">
                <LocationPickerMap
                  initialAddress={formData.personal.address}
                  onLocationSelect={(_lat, _lng, address) => {
                    handleFieldChange("personal", "address", address);
                  }}
                  onRemove={() => handleFieldChange("personal", "address", "")}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Section 2: Organizational Info */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{t("personnelForm.orgSection")}</h3>
            <p className="text-xs text-muted-foreground">{t("personnelForm.orgSectionDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.departmentLabel")} <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={DEPARTMENTS}
              value={formData.organizational.department}
              onChange={(val) => handleFieldChange("organizational", "department", val)}
              placeholder={t("personnelForm.departmentPlaceholder")}
              searchPlaceholder={t("personnelForm.departmentSearch")}
              className={`w-full h-10 rtl:text-right ${errors["organizational.department"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["organizational.department"] && (
              <span className="text-[11px] text-destructive">{errors["organizational.department"]}</span>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.roleLabel")} <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={ROLES}
              value={formData.organizational.role}
              onChange={(val) => handleFieldChange("organizational", "role", val)}
              placeholder={t("personnelForm.rolePlaceholder")}
              searchPlaceholder={t("personnelForm.roleSearch")}
              className={`w-full h-10 rtl:text-right ${errors["organizational.role"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
            />
            {errors["organizational.role"] && (
              <span className="text-[11px] text-destructive">{errors["organizational.role"]}</span>
            )}
          </div>

          {/* Employee ID */}
          <div className="space-y-1.5">
            <Label htmlFor="employeeId" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.employeeIdLabel")}
            </Label>
            <Input
              id="employeeId"
              value={formData.organizational.employeeId}
              onChange={(e) => handleFieldChange("organizational", "employeeId", e.target.value)}
              placeholder={t("personnelForm.employeeIdPlaceholder")}
              dir="ltr"
              className="h-10 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.employeeIdHelp")}</p>
          </div>

          {/* Company Extension Phone (Ext) */}
          <div className="space-y-1.5">
            <Label htmlFor="extensionNumber" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.extensionLabel")}
            </Label>
            <div className="relative">
              <Input
                id="extensionNumber"
                value={formData.organizational.extensionNumber || ""}
                onChange={(e) => handleFieldChange("organizational", "extensionNumber", e.target.value)}
                placeholder={t("personnelForm.extensionPlaceholder")}
                dir="ltr"
                className="h-10 font-mono text-sm ltr:pl-9 rtl:pr-9"
              />
              <PhoneCall className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.extensionHelp")}</p>
          </div>

          {/* Join Date (DatePicker) */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.joinDateLabel")}
            </Label>
            <DatePicker
              value={parseDateString(formData.organizational.joinDate)}
              onChange={(date) => handleFieldChange("organizational", "joinDate", formatDateToString(date))}
              isJalali={isFa}
              placeholder={isFa ? t("personnelForm.joinDatePlaceholder") : t("personnelForm.joinDatePlaceholderEn")}
              className="w-full h-10"
              triggerClassName="w-full h-10 justify-between text-sm"
            />
          </div>

          {/* Direct Manager */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manager" className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.managerLabel")}
            </Label>
            <Input
              id="manager"
              value={formData.organizational.manager}
              onChange={(e) => handleFieldChange("organizational", "manager", e.target.value)}
              placeholder={t("personnelForm.managerPlaceholder")}
              className="h-10 text-sm"
            />
          </div>

        </div>
      </div>

      {/* Section 3: Education & Insurance */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{t("personnelForm.educationInsuranceSection")}</h3>
            <p className="text-xs text-muted-foreground">{t("personnelForm.educationInsuranceSectionDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Degree */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("fields.degree")}
            </Label>
            <Combobox
              options={DEGREES}
              value={formData.education.degree}
              onChange={(val) => handleFieldChange("education", "degree", val)}
              placeholder={t("fields.selectDegree")}
              className="w-full h-10 rtl:text-right"
            />
          </div>

          {/* Field of study */}
          <div className="space-y-1.5">
            <Label htmlFor="fieldOfStudy" className="text-xs sm:text-sm font-semibold">
              {t("fields.fieldOfStudy")}
            </Label>
            <Input
              id="fieldOfStudy"
              value={formData.education.fieldOfStudy}
              onChange={(e) => handleFieldChange("education", "fieldOfStudy", e.target.value)}
              placeholder={isFa ? "مثال: مهندسی متالورژی / سرامیک" : "e.g. Metallurgy & Ceramic Engineering"}
              className="h-10 text-sm"
            />
          </div>

          {/* University */}
          <div className="space-y-1.5">
            <Label htmlFor="university" className="text-xs sm:text-sm font-semibold">
              {t("fields.university")}
            </Label>
            <Input
              id="university"
              value={formData.education.university}
              onChange={(e) => handleFieldChange("education", "university", e.target.value)}
              placeholder={isFa ? "مثال: دانشگاه صنعتی شریف" : "e.g. Sharif University of Technology"}
              className="h-10 text-sm"
            />
          </div>

          {/* Graduation Date (DatePicker) */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("fields.graduationDate")}
            </Label>
            <DatePicker
              value={parseDateString(formData.education.graduationYear)}
              onChange={(date) => handleFieldChange("education", "graduationYear", formatDateToString(date))}
              isJalali={isFa}
              placeholder={t("fields.selectGraduationDate")}
              className="w-full h-10"
              triggerClassName="w-full h-10 justify-between text-sm"
            />
          </div>

          {/* Insurance Code */}
          <div className="space-y-1.5">
            <Label htmlFor="insuranceCode" className="text-xs sm:text-sm font-semibold">
              {t("fields.insuranceCode")}
            </Label>
            <Input
              id="insuranceCode"
              value={formData.insurance.insuranceCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleFieldChange("insurance", "insuranceCode", val);
              }}
              placeholder={isFa ? "مثال: ۱۲۳۴۵۶۷۸" : "e.g. 12345678"}
              dir="ltr"
              className="h-10 font-mono text-sm"
            />
          </div>

          {/* Insurance Valid Until (DatePicker) */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("fields.validUntil")}
            </Label>
            <DatePicker
              value={parseDateString(formData.insurance.validUntil)}
              onChange={(date) => handleFieldChange("insurance", "validUntil", formatDateToString(date))}
              isJalali={isFa}
              placeholder={t("fields.selectValidUntil")}
              className="w-full h-10"
              triggerClassName="w-full h-10 justify-between text-sm"
            />
          </div>

          {/* Supplementary Plan */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("fields.supplementaryPlan")}
            </Label>
            <Combobox
              options={SUPPLEMENTARY_PLAN_OPTIONS}
              value={formData.insurance.supplementaryPlan || "none"}
              onChange={(val) => handleFieldChange("insurance", "supplementaryPlan", val)}
              placeholder={t("fields.selectSupplementaryPlan")}
              className="w-full h-10 rtl:text-right"
            />
          </div>

          {/* Dependents Count - Fixed compact inline stepper */}
          <div className="space-y-1.5">
            <Label htmlFor="dependentsCount" className="text-xs sm:text-sm font-semibold">
              {t("fields.dependentsCount")}
            </Label>
            <div className="h-10 flex items-center">
              <div className="inline-flex items-center rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = formData.insurance.dependentsCount ?? 0;
                    handleFieldChange("insurance", "dependentsCount", Math.max(0, current - 1));
                  }}
                  disabled={(formData.insurance.dependentsCount ?? 0) <= 0}
                  className="size-8 rounded-lg text-foreground hover:bg-background hover:shadow-xs active:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Decrease dependents count"
                >
                  <Minus className="size-3.5 stroke-[2.5]" />
                </Button>
                <span className="min-w-12 px-3 text-center font-mono font-bold text-sm text-foreground fa-num select-none">
                  {formData.insurance.dependentsCount ?? 0}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = formData.insurance.dependentsCount ?? 0;
                    handleFieldChange("insurance", "dependentsCount", Math.min(20, current + 1));
                  }}
                  disabled={(formData.insurance.dependentsCount ?? 0) >= 20}
                  className="size-8 rounded-lg text-foreground hover:bg-background hover:shadow-xs active:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Increase dependents count"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sheba Number */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shebaNumber" className="text-xs sm:text-sm font-semibold">
              {t("fields.shebaNumber")}
            </Label>
            <div className="relative">
              <Input
                id="shebaNumber"
                value={formData.insurance.shebaNumber || ""}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase();
                  if (!val.startsWith("IR") && val.length > 0) {
                    val = "IR" + val.replace(/[^0-9]/g, "");
                  }
                  handleFieldChange("insurance", "shebaNumber", val);
                }}
                maxLength={26}
                placeholder="IR000000000000000000000000"
                dir="ltr"
                className="h-10 font-mono text-sm ltr:pl-9 rtl:pr-9"
              />
              <CreditCard className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">{t("fields.shebaNumberDesc")}</p>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 bg-card/95 backdrop-blur-md border border-border/60 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="size-4 text-primary shrink-0" />
          <span>{t("personnelForm.pendingInfo")}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/account-pending")}
            className="flex-1 sm:flex-none h-10 text-xs sm:text-sm font-medium"
          >
            {t("personnelForm.viewStatus")}
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 sm:flex-none h-10 px-6 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span>{isSaving ? t("personnelForm.submitting") : t("personnelForm.submitAndSend")}</span>
          </Button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <ShieldCheck className="size-5 text-primary" />
                <span>{t("fields.phoneVerificationTitle")}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpError("");
                }}
                className="size-8 rounded-full"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("fields.otpPrompt")}
              </p>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center font-mono text-sm font-semibold tracking-wider text-foreground select-all" dir="ltr">
                {formData.personal.phone || "---"}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otpInput" className="text-xs font-semibold text-foreground">
                {t("fields.verificationCode")}
              </Label>
              <Input
                id="otpInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                  setOtpError("");
                }}
                placeholder="12345"
                dir="ltr"
                className={`h-12 text-center text-xl font-mono tracking-widest ${otpError ? "border-destructive ring-1 ring-destructive/20" : ""}`}
                autoFocus
              />
              {otpError ? (
                <span className="text-[11px] text-destructive">{otpError}</span>
              ) : (
                <p className="text-[11px] text-muted-foreground">{t("fields.otpDemoHint")}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.info(t("fields.otpSentToast"));
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                {t("fields.resendOtp")}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpError("");
                  }}
                  className="h-9 text-xs"
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (otpCode === "12345" || otpCode.length === 5) {
                      handleFieldChange("personal", "phoneVerified", true);
                      toast.success(t("fields.phoneVerifiedSuccess"));
                      setShowOtpModal(false);
                      setOtpCode("");
                      setOtpError("");
                    } else {
                      setOtpError(t("fields.otpInvalid"));
                    }
                  }}
                  className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-4"
                >
                  {t("fields.confirmOtp")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
