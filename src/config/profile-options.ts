// src/config/profile-options.ts
// ─────────────────────────────────────────────────────────────────────────────
// کاتالوگ جامع و یکپارچه انتخاب‌ها (Comboboxes) برای تمام بخش‌های سامانه:
// - فرم پروفایل کاربری (PersonnelForm)
// - درخواست‌های ویرایش پروفایل و تایید مدارک در ادمین (AdminRequests)
// - ایجاد و ویرایش کاربر توسط ادمین (AdminUserConfig)
// - جدول و کارتهای نمایش کاربران (AdminUsersTable / UserInfo)
// ─────────────────────────────────────────────────────────────────────────────

import { ComboboxOption } from "@/components/ui/combobox";
export {
  DEGREE_DEFINITIONS,
  STUDY_FIELD_DEFINITIONS,
  UNIVERSITY_DEFINITIONS,
  getDegreeOptions,
  getStudyFieldOptions,
  getUniversityOptions,
  getGraduationYearOptions,
  resolveDegreeLabel,
  resolveStudyFieldLabel,
  resolveUniversityLabel,
} from "@/modules/profile/data/education-options";

export interface OptionDefinition {
  key: string;
  labelFa: string;
  labelEn: string;
}

// ─── ۱. بیمه تکمیلی (Supplementary Insurance Plans) ──────────────────────────
export const SUPPLEMENTARY_PLAN_DEFINITIONS: OptionDefinition[] = [
  { key: "golden", labelFa: "طرح طلایی (کامل)", labelEn: "Golden Plan" },
  { key: "silver", labelFa: "طرح نقره‌ای", labelEn: "Silver Plan" },
  { key: "special", labelFa: "طرح ویژه", labelEn: "Special Plan" },
  { key: "none", labelFa: "فاقد بیمه تکمیلی (تقاضا ندارم)", labelEn: "None" },
  { key: "other", labelFa: "سایر طرح‌ها", labelEn: "Other Plan" },
];

export function getSupplementaryPlanOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return SUPPLEMENTARY_PLAN_DEFINITIONS.map((p) => ({
    value: p.key,
    label: isFa ? p.labelFa : p.labelEn,
    triggerLabel: isFa ? p.labelFa : p.labelEn,
  }));
}

// ─── ۲. بیمه پایه (Basic Insurance Providers) ────────────────────────────────
export const INSURANCE_PROVIDER_DEFINITIONS: OptionDefinition[] = [
  { key: "social_security", labelFa: "تأمین اجتماعی", labelEn: "Social Security" },
  { key: "health_insurance", labelFa: "خدمات درمانی / سلامت", labelEn: "Health Services" },
  { key: "armed_forces", labelFa: "خدمات درمانی نیروهای مسلح", labelEn: "Armed Forces" },
  { key: "none", labelFa: "فاقد بیمه پایه", labelEn: "None" },
  { key: "other", labelFa: "سایر صندوق‌های بیمه", labelEn: "Other" },
];

export function getInsuranceProviderOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return INSURANCE_PROVIDER_DEFINITIONS.map((p) => ({
    value: isFa ? p.labelFa : p.key,
    label: isFa ? p.labelFa : p.labelEn,
    triggerLabel: isFa ? p.labelFa : p.labelEn,
  }));
}

// ─── ۳. محل خدمت (Work Locations) ───────────────────────────────────────────
export const WORK_LOCATION_DEFINITIONS: OptionDefinition[] = [
  { key: "office", labelFa: "دفتر مرکزی / ستاد تهران", labelEn: "Tehran HQ / Office" },
  { key: "factory", labelFa: "کارخانه صفادشت", labelEn: "Safadasht Factory" },
  { key: "nano_plant", labelFa: "کارخانه نانو پالایش", labelEn: "Nano Ceram Plant" },
  { key: "site", labelFa: "سایت و کارگاه پروژه‌ها", labelEn: "Project Site" },
  { key: "remote", labelFa: "دورکاری", labelEn: "Remote" },
  { key: "hybrid", labelFa: "هیبریدی / ترکیبی", labelEn: "Hybrid" },
  { key: "other", labelFa: "سایر محل‌ها", labelEn: "Other Location" },
];

export function getWorkLocationOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return WORK_LOCATION_DEFINITIONS.map((w) => ({
    value: w.key,
    label: isFa ? w.labelFa : w.labelEn,
    triggerLabel: isFa ? w.labelFa : w.labelEn,
  }));
}

// ─── ۴. نوع قرارداد (Contract Types) ────────────────────────────────────────
export const CONTRACT_TYPE_DEFINITIONS: OptionDefinition[] = [
  { key: "full_time", labelFa: "تمام وقت", labelEn: "Full-Time" },
  { key: "part_time", labelFa: "پاره وقت", labelEn: "Part-Time" },
  { key: "contractual", labelFa: "قراردادی / پروژه‌ای", labelEn: "Contractual / Project-based" },
  { key: "hourly", labelFa: "ساعتی", labelEn: "Hourly" },
  { key: "internship", labelFa: "کارآموزی", labelEn: "Internship" },
  { key: "consultant", labelFa: "مشاوره‌ای", labelEn: "Consultant" },
  { key: "other", labelFa: "سایر انواع قرارداد", labelEn: "Other Contract" },
];

export function getContractTypeOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return CONTRACT_TYPE_DEFINITIONS.map((c) => ({
    value: c.key,
    label: isFa ? c.labelFa : c.labelEn,
    triggerLabel: isFa ? c.labelFa : c.labelEn,
  }));
}

// ─── ۵. وضعیت تاهل (Marital Status) ─────────────────────────────────────────
export const MARITAL_STATUS_DEFINITIONS: OptionDefinition[] = [
  { key: "single", labelFa: "مجرد", labelEn: "Single" },
  { key: "married", labelFa: "متأهل", labelEn: "Married" },
  { key: "other", labelFa: "سایر", labelEn: "Other" },
];

export function getMaritalStatusOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return MARITAL_STATUS_DEFINITIONS.map((m) => ({
    value: m.key,
    label: isFa ? m.labelFa : m.labelEn,
    triggerLabel: isFa ? m.labelFa : m.labelEn,
  }));
}

// ─── ۶. وضعیت نظام وظیفه (Military Duty) ─────────────────────────────────────
export const MILITARY_STATUS_DEFINITIONS: OptionDefinition[] = [
  { key: "completed", labelFa: "کارت پایان خدمت", labelEn: "Completed" },
  { key: "exempt", labelFa: "معافیت دائم (پزشکی / کفالت)", labelEn: "Permanent Exemption" },
  { key: "educational_exempt", labelFa: "معافیت تحصیلی", labelEn: "Educational Exemption" },
  { key: "in_service", labelFa: "در حال خدمت", labelEn: "In Service" },
  { key: "not_applicable", labelFa: "مشمول نمی‌شود (بانوان)", labelEn: "Not Applicable" },
];

export function getMilitaryStatusOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return MILITARY_STATUS_DEFINITIONS.map((m) => ({
    value: m.key,
    label: isFa ? m.labelFa : m.labelEn,
    triggerLabel: isFa ? m.labelFa : m.labelEn,
  }));
}

// ─── ۷. نسبت تکفل (Relationships) ──────────────────────────────────────────
export const RELATIONSHIP_DEFINITIONS: OptionDefinition[] = [
  { key: "spouse", labelFa: "همسر", labelEn: "Spouse" },
  { key: "child", labelFa: "فرزند", labelEn: "Child" },
  { key: "father", labelFa: "پدر", labelEn: "Father" },
  { key: "mother", labelFa: "مادر", labelEn: "Mother" },
  { key: "other", labelFa: "سایر بستگان تحت تکفل", labelEn: "Other Dependent" },
];

export function getRelationshipOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return RELATIONSHIP_DEFINITIONS.map((r) => ({
    value: r.key,
    label: isFa ? r.labelFa : r.labelEn,
    triggerLabel: isFa ? r.labelFa : r.labelEn,
  }));
}
