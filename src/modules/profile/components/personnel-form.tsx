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
  KeyRound,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { validateSheba, normalizeSheba, formatSheba } from "@/utils/shebaValidator";

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
import {
  getDegreeOptions,
  getStudyFieldOptions,
  getUniversityOptions,
  STUDY_FIELD_DEFINITIONS,
  UNIVERSITY_DEFINITIONS,
} from "../data/education-options";

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

  const WORK_LOCATION_OPTIONS: ComboboxOption[] = [
    { value: "office", label: isFa ? "دفتر مرکزی / ستاد" : "Headquarters / Office" },
    { value: "factory", label: isFa ? "کارخانه / سایت تولیدی" : "Factory / Plant" },
    { value: "remote", label: isFa ? "دورکاری" : "Remote" },
    { value: "hybrid", label: isFa ? "هیبریدی / ترکیبی" : "Hybrid" },
  ];

  const CONTRACT_TYPE_OPTIONS: ComboboxOption[] = [
    { value: "full_time", label: isFa ? "تمام وقت" : "Full-Time" },
    { value: "part_time", label: isFa ? "پاره وقت" : "Part-Time" },
    { value: "hourly", label: isFa ? "ساعتی" : "Hourly" },
    { value: "contractual", label: isFa ? "قراردادی / پروژه‌ای" : "Contractual / Project-based" },
    { value: "internship", label: isFa ? "کارآموزی" : "Internship" },
  ];

  const [newSubordinate, setNewSubordinate] = useState("");
  const [isManualFieldOfStudy, setIsManualFieldOfStudy] = useState(false);
  const [isManualUniversity, setIsManualUniversity] = useState(false);

  // Dependents state
  const [newDepFullName, setNewDepFullName] = useState("");
  const [newDepRelationship, setNewDepRelationship] = useState("spouse");
  const [newDepNationalId, setNewDepNationalId] = useState("");
  const [newDepBirthDate, setNewDepBirthDate] = useState("");

  const RELATIONSHIP_OPTIONS: ComboboxOption[] = [
    { value: "spouse", label: t("fields.spouse") },
    { value: "child", label: t("fields.child") },
    { value: "father", label: t("fields.father") },
    { value: "mother", label: t("fields.mother") },
    { value: "parent", label: t("fields.parent") },
    { value: "other", label: t("fields.other") },
  ];

  const normalizeRelationship = (rel?: string): string => {
    if (!rel) return "other";
    const lower = rel.toLowerCase();
    if (lower.includes("spouse") || lower.includes("همسر")) return "spouse";
    if (lower.includes("child") || lower.includes("فرزند") || lower.includes("پسر") || lower.includes("دختر")) return "child";
    if (lower.includes("father") || lower.includes("پدر")) return "father";
    if (lower.includes("mother") || lower.includes("مادر")) return "mother";
    if (lower.includes("parent") || lower.includes("والد")) return "parent";
    return "other";
  };

  const shebaStatus = React.useMemo(() => {
    return validateSheba(formData.insurance.shebaNumber || "");
  }, [formData.insurance.shebaNumber]);

  const handleAddDependent = () => {
    if (!newDepFullName.trim()) {
      toast.error(t("fields.dependentValidationName"));
      return;
    }
    const cleanNationalId = newDepNationalId.replace(/\D/g, "");
    if (cleanNationalId.length !== 10) {
      toast.error(t("fields.dependentValidationNationalId"));
      return;
    }
    const currentList = formData.insurance?.dependents || [];
    if (currentList.some((d) => d.nationalId === cleanNationalId)) {
      toast.error(t("fields.dependentAlreadyExists"));
      return;
    }

    const newDep = {
      id: "dep-" + Date.now(),
      fullName: newDepFullName.trim(),
      relationship: newDepRelationship,
      nationalId: cleanNationalId,
      birthDate: newDepBirthDate || undefined,
    };

    const updated = [...currentList, newDep];
    setFormData((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        dependents: updated,
        dependentsCount: updated.length,
      },
    }));

    setNewDepFullName("");
    setNewDepNationalId("");
    setNewDepBirthDate("");
    setNewDepRelationship("spouse");
    toast.success(t("fields.dependentAddedSuccess"));
  };

  const handleRemoveDependent = (id: string) => {
    const updated = (formData.insurance?.dependents || []).filter((d) => d.id !== id);
    setFormData((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        dependents: updated,
        dependentsCount: updated.length,
      },
    }));
    toast.success(t("fields.dependentDeletedSuccess"));
  };

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
    if (formData.insurance.shebaNumber?.trim()) {
      const shebaRes = validateSheba(formData.insurance.shebaNumber);
      if (!shebaRes.isValid) {
        newErrors["insurance.shebaNumber"] = shebaRes.errorKey
          ? t(`fields.${shebaRes.errorKey}`)
          : t("fields.shebaInvalidChecksum");
      }
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
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
                  .replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\s]/g, "");
                handleFieldChange("personal", "firstNameFa", val);
              }}
              dir="rtl"
              placeholder={t("personnelForm.firstNameFaPlaceholder")}
              className={`h-10 text-sm rtl:text-right ${errors["personal.firstNameFa"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
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
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
                  .replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\s]/g, "");
                handleFieldChange("personal", "lastNameFa", val);
              }}
              dir="rtl"
              placeholder={t("personnelForm.lastNameFaPlaceholder")}
              className={`h-10 text-sm rtl:text-right ${errors["personal.lastNameFa"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
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
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
                handleFieldChange("personal", "firstName", val);
              }}
              placeholder={t("personnelForm.firstNameEnPlaceholder")}
              dir="ltr"
              className={`h-10 text-sm font-sans text-left ${errors["personal.firstName"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
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
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
                handleFieldChange("personal", "lastName", val);
              }}
              placeholder={t("personnelForm.lastNameEnPlaceholder")}
              dir="ltr"
              className={`h-10 text-sm font-sans text-left ${errors["personal.lastName"] ? "border-destructive ring-1 ring-destructive/20" : ""}`}
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

          {/* Work Location */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.workLocationLabel")}
            </Label>
            <Combobox
              options={WORK_LOCATION_OPTIONS}
              value={formData.organizational.workLocation || "office"}
              onChange={(val) => handleFieldChange("organizational", "workLocation", val)}
              placeholder={t("personnelForm.workLocationPlaceholder")}
              searchPlaceholder={t("personnelForm.workLocationSearch")}
              className="w-full h-10 rtl:text-right"
            />
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.workLocationHelp")}</p>
          </div>

          {/* Contract Type */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">
              {t("personnelForm.contractTypeLabel")}
            </Label>
            <Combobox
              options={CONTRACT_TYPE_OPTIONS}
              value={formData.organizational.contractType || "full_time"}
              onChange={(val) => handleFieldChange("organizational", "contractType", val)}
              placeholder={t("personnelForm.contractTypePlaceholder")}
              searchPlaceholder={t("personnelForm.contractTypeSearch")}
              className="w-full h-10 rtl:text-right"
            />
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.contractTypeHelp")}</p>
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
          <div className="space-y-1.5">
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

          {/* Subordinates / Direct Reports */}
          <div className="space-y-2.5 sm:col-span-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span>{t("personnelForm.subordinatesLabel")}</span>
              </Label>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 fa-num font-sans font-medium">
                {formData.organizational.subordinates?.length || 0} {t("fields.subordinatesCountUnit")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newSubordinate}
                onChange={(e) => setNewSubordinate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = newSubordinate.trim();
                    if (trimmed) {
                      const list = formData.organizational.subordinates || [];
                      if (!list.includes(trimmed)) {
                        const updated = [...list, trimmed];
                        setFormData((prev) => ({
                          ...prev,
                          organizational: {
                            ...prev.organizational,
                            subordinates: updated,
                            subordinatesCount: updated.length,
                          },
                        }));
                        setNewSubordinate("");
                      }
                    }
                  }
                }}
                placeholder={t("personnelForm.subordinatesPlaceholder")}
                className="h-10 text-sm"
              />
              <Button
                type="button"
                onClick={() => {
                  const trimmed = newSubordinate.trim();
                  if (trimmed) {
                    const list = formData.organizational.subordinates || [];
                    if (!list.includes(trimmed)) {
                      const updated = [...list, trimmed];
                      setFormData((prev) => ({
                        ...prev,
                        organizational: {
                          ...prev.organizational,
                          subordinates: updated,
                          subordinatesCount: updated.length,
                        },
                      }));
                      setNewSubordinate("");
                    }
                  }
                }}
                disabled={!newSubordinate.trim()}
                className="h-10 px-4 shrink-0 font-medium text-xs sm:text-sm"
              >
                <Plus className="size-4 me-1" />
                {t("personnelForm.addSubordinateBtn")}
              </Button>
            </div>

            {/* Badges list */}
            {formData.organizational.subordinates && formData.organizational.subordinates.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.organizational.subordinates.map((sub, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs border border-border/60 transition-colors"
                  >
                    <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      {sub.charAt(0) || "U"}
                    </span>
                    <span className="font-medium">{sub}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.organizational.subordinates || []).filter((_, i) => i !== idx);
                        setFormData((prev) => ({
                          ...prev,
                          organizational: {
                            ...prev.organizational,
                            subordinates: updated,
                            subordinatesCount: updated.length,
                          },
                        }));
                      }}
                      className="text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-destructive/10 transition-colors ms-1 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">{t("personnelForm.subordinatesHelp")}</p>
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
              options={getDegreeOptions(locale)}
              value={formData.education.degree}
              onChange={(val) => handleFieldChange("education", "degree", val)}
              placeholder={t("fields.selectDegree")}
              className="w-full h-10 rtl:text-right"
            />
          </div>

          {/* Field of study (Combobox + Manual Option) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="fieldOfStudy" className="text-xs sm:text-sm font-semibold">
                {t("fields.fieldOfStudy")}
              </Label>
              <button
                type="button"
                onClick={() => setIsManualFieldOfStudy(!isManualFieldOfStudy)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                {isManualFieldOfStudy ? t("fields.switchToList") : t("fields.switchToManual")}
              </button>
            </div>
            {isManualFieldOfStudy ? (
              <Input
                id="fieldOfStudy"
                value={formData.education.fieldOfStudy}
                onChange={(e) => handleFieldChange("education", "fieldOfStudy", e.target.value)}
                placeholder={t("fields.fieldOfStudyPlaceholder")}
                className="h-10 text-sm"
                autoFocus
              />
            ) : (
              <Combobox
                options={getStudyFieldOptions(locale, t("fields.manualOption"))}
                value={formData.education.fieldOfStudy}
                onChange={(val) => {
                  if (val === "__manual__") {
                    setIsManualFieldOfStudy(true);
                  } else {
                    handleFieldChange("education", "fieldOfStudy", val);
                  }
                }}
                placeholder={t("fields.selectFieldOfStudy")}
                showSearch={true}
                className="w-full h-10 rtl:text-right"
              />
            )}
          </div>

          {/* University (Combobox + Manual Option) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="university" className="text-xs sm:text-sm font-semibold">
                {t("fields.university")}
              </Label>
              <button
                type="button"
                onClick={() => setIsManualUniversity(!isManualUniversity)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                {isManualUniversity ? t("fields.switchToList") : t("fields.switchToManual")}
              </button>
            </div>
            {isManualUniversity ? (
              <Input
                id="university"
                value={formData.education.university}
                onChange={(e) => handleFieldChange("education", "university", e.target.value)}
                placeholder={t("fields.universityPlaceholder")}
                className="h-10 text-sm"
                autoFocus
              />
            ) : (
              <Combobox
                options={getUniversityOptions(locale, t("fields.manualOption"))}
                value={formData.education.university}
                onChange={(val) => {
                  if (val === "__manual__") {
                    setIsManualUniversity(true);
                  } else {
                    handleFieldChange("education", "university", val);
                  }
                }}
                placeholder={t("fields.selectUniversity")}
                showSearch={true}
                className="w-full h-10 rtl:text-right"
              />
            )}
          </div>

          {/* Graduation Date (DatePicker only) */}
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

          {/* Corporate Insurance (Tamin Ejtemaei) */}
          <div className="sm:col-span-2 p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">
                    {t("personnelForm.corporateInsuranceTitle")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {t("personnelForm.corporateInsuranceSub")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs font-semibold border-primary/30 text-primary bg-primary/5">
                {t("fields.taminEjtemaei")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                  className="h-10 font-mono text-sm ltr"
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
            </div>
          </div>

          {/* Supplementary Medical Insurance (SOS) */}
          <div className="sm:col-span-2 p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">
                    {t("personnelForm.supplementaryInsuranceTitle")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {t("personnelForm.supplementaryInsuranceSub")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs font-semibold border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10">
                {t("fields.sosInsurance")}
              </Badge>
            </div>

            <div className="space-y-1.5 pt-1">
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
          </div>

          {/* Sheba Number with Digit Counter & Verification */}
          <div className="space-y-2 sm:col-span-2 p-4 rounded-xl border border-border/60 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label htmlFor="shebaNumber" className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>{t("fields.shebaNumber")}</span>
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Real-time digit counter */}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50 fa-num font-sans font-mono">
                  {t("fields.shebaDigitsCount", { count: shebaStatus.digitCount })}
                </span>
                {/* Validation status pill */}
                {formData.insurance.shebaNumber?.trim() ? (
                  shebaStatus.isValid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="size-3" />
                      <span>{t("fields.shebaValid")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <AlertCircle className="size-3" />
                      <span>
                        {shebaStatus.digitCount < 24
                          ? t("fields.shebaIncomplete", { remaining: 24 - shebaStatus.digitCount })
                          : t("fields.shebaInvalidChecksum")}
                      </span>
                    </span>
                  )
                ) : null}
              </div>
            </div>

            <div className="relative">
              <Input
                id="shebaNumber"
                value={formData.insurance.shebaNumber || ""}
                onChange={(e) => {
                  const normalized = normalizeSheba(e.target.value);
                  handleFieldChange("insurance", "shebaNumber", normalized);
                }}
                maxLength={26}
                placeholder="IR000000000000000000000000"
                dir="ltr"
                className={cn(
                  "h-10 font-mono text-sm pr-9 text-left ltr",
                  errors["insurance.shebaNumber"] && "border-destructive focus-visible:ring-destructive",
                  formData.insurance.shebaNumber && shebaStatus.isValid && "border-emerald-500/50 focus-visible:ring-emerald-500",
                  formData.insurance.shebaNumber && !shebaStatus.isValid && "border-amber-500/50 focus-visible:ring-amber-500"
                )}
              />
              {/* Rule 12: Fixed trailing icon right-3, strictly identical in RTL and LTR */}
              <CreditCard className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            </div>

            {errors["insurance.shebaNumber"] ? (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{errors["insurance.shebaNumber"]}</span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t("fields.shebaNumberDesc")} — {t("fields.shebaHelp")}
              </p>
            )}
          </div>

          {/* Dependents Section - Add via Inputs, Display Row-by-Row Table */}
          <div className="sm:col-span-2 space-y-4 pt-2">
            <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    {t("personnelForm.dependentsSectionTitle")}
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold fa-num">
                    {(formData.insurance.dependents || []).length} {t("fields.persons")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("personnelForm.dependentsSectionDesc")}
                </p>
              </div>
            </div>

            {/* Input Form to Add Dependent */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Plus className="size-3.5 text-primary" />
                <span>{t("fields.newDependentTitle")}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    {t("fields.dependentFullName")}
                  </Label>
                  <Input
                    value={newDepFullName}
                    onChange={(e) => setNewDepFullName(e.target.value)}
                    placeholder={t("fields.fullNamePlaceholder")}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    {t("fields.relationship")}
                  </Label>
                  <Combobox
                    options={RELATIONSHIP_OPTIONS}
                    value={newDepRelationship}
                    onChange={(val) => setNewDepRelationship(val)}
                    placeholder={t("fields.selectRelationship")}
                    className="w-full h-9 text-xs rtl:text-right"
                  />
                </div>

                {/* National ID */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    {t("fields.nationalIdPlaceholder")}
                  </Label>
                  <Input
                    value={newDepNationalId}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setNewDepNationalId(digits);
                    }}
                    maxLength={10}
                    placeholder="1234567890"
                    dir="ltr"
                    className="h-9 text-xs font-mono text-left ltr"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    {t("fields.selectBirthDate")}
                  </Label>
                  <DatePicker
                    value={parseDateString(newDepBirthDate)}
                    onChange={(date) => setNewDepBirthDate(formatDateToString(date))}
                    isJalali={isFa}
                    placeholder={t("fields.selectBirthDate")}
                    className="w-full h-9"
                    triggerClassName="w-full h-9 justify-between text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDependent}
                  className="h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>{t("fields.addDependentSubmit")}</span>
                </Button>
              </div>
            </div>

            {/* Row-by-Row Table Layout (سطری) */}
            {(formData.insurance.dependents || []).length > 0 ? (
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3 text-center w-12">{t("fields.rowNumber")}</th>
                        <th className="py-2.5 px-4 text-start">{t("fields.dependentFullName")}</th>
                        <th className="py-2.5 px-3 text-center">{t("fields.relationship")}</th>
                        <th className="py-2.5 px-4 text-center">{t("fields.nationalIdPlaceholder")}</th>
                        <th className="py-2.5 px-4 text-center">{t("fields.selectBirthDate")}</th>
                        <th className="py-2.5 px-3 text-center w-16">{t("fields.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {formData.insurance.dependents!.map((dep, idx) => (
                        <tr key={dep.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 text-center fa-num font-mono text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                                {dep.fullName.charAt(0) || "U"}
                              </div>
                              <span>{dep.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0.5 rounded-md">
                              {t(`fields.${normalizeRelationship(dep.relationship)}`)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center font-mono fa-num text-muted-foreground ltr">
                            {dep.nationalId || "-"}
                          </td>
                          <td className="py-3 px-4 text-center fa-num text-muted-foreground">
                            {dep.birthDate || "-"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDependent(dep.id)}
                              className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title={t("fields.deleteDependent")}
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border/70 text-center space-y-1.5 bg-muted/10">
                <Users className="size-6 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">
                  {t("personnelForm.emptyDependentsTable")}
                </p>
              </div>
            )}
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
