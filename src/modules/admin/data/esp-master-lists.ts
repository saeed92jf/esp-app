// src/modules/admin/data/esp-master-lists.ts
// ─────────────────────────────────────────────────────────────────────────────
// Master Lists & Options derived from ESP_Personnel_Complete_Bilingual.xlsx
// Single-company mode: Euroslot Pars (ESP CORE)
// ─────────────────────────────────────────────────────────────────────────────

import { ComboboxOption } from "@/components/ui/combobox";
import {
  ORGANIZATION_DEPARTMENTS,
  ORGANIZATION_ROLES,
  getOrganizationDepartmentOptions,
  getOrganizationRoleOptions,
} from "@/config/organization";

export interface MasterOption {
  value: string;
  labelFa: string;
  labelEn: string;
  badgeClass?: string;
}

export const ESP_DEPARTMENTS: MasterOption[] = ORGANIZATION_DEPARTMENTS.map((d) => ({
  value: d.nameFa,
  labelFa: d.nameFa,
  labelEn: d.nameEn,
  badgeClass: d.badgeClass,
}));

export const ESP_JOB_TITLES: MasterOption[] = ORGANIZATION_ROLES.map((r) => ({
  value: r.titleFa,
  labelFa: r.titleFa,
  labelEn: r.titleEn,
}));

export const ESP_LOCATIONS: MasterOption[] = [
  { value: "کارخانه پرند یورواسلات", labelFa: "کارخانه پرند یورواسلات", labelEn: "Parand Factory - Euroslot" },
  { value: "دفتر مرکزی تهران یورواسلات", labelFa: "دفتر مرکزی تهران یورواسلات", labelEn: "Tehran Head Office - Euroslot" },
  { value: "هیبرید", labelFa: "هیبرید (ترکیبی)", labelEn: "Hybrid" },
  { value: "دورکار", labelFa: "دورکار", labelEn: "Remote" },
  { value: "پروژه‌ای", labelFa: "پروژه‌ای / مقیم سایت", labelEn: "On-site / Project" },
];

export const ESP_EMPLOYMENT_STATUSES: MasterOption[] = [
  { value: "فعال", labelFa: "فعال (شاغل)", labelEn: "Active", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { value: "قطع همکاری", labelFa: "غیرفعال (قطع همکاری)", labelEn: "Inactive / Terminated", badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
];

export const ESP_ROLES: MasterOption[] = [
  { value: "superadmin", labelFa: "مدیر ارشد سیستم (سوپرادمین)", labelEn: "Super Admin", badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35" },
  { value: "admin", labelFa: "مدیر سیستم (ادمین)", labelEn: "System Admin", badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35" },
  { value: "dept_admin", labelFa: "مدیر دپارتمان / واحد", labelEn: "Department Admin", badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25" },
  { value: "manager", labelFa: "مدیر اجرایی", labelEn: "Manager", badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25" },
  { value: "supervisor", labelFa: "سرپرست", labelEn: "Supervisor", badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25" },
  { value: "engineer", labelFa: "مهندس / کارشناس تخصصی", labelEn: "Engineer / Specialist", badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25" },
  { value: "staff", labelFa: "پرسنل اداری / ستادی", labelEn: "Staff", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25" },
  { value: "user", labelFa: "کاربر عادی سامانه", labelEn: "Standard User", badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25" },
];

export const ESP_CONTRACT_TYPES: MasterOption[] = [
  { value: "تمام وقت", labelFa: "قرارداد تمام وقت", labelEn: "Full-Time Contract" },
  { value: "آزمایشی", labelFa: "دوره آزمایشی", labelEn: "Probationary Period" },
  { value: "پاره وقت", labelFa: "قرارداد پاره وقت", labelEn: "Part-Time Contract" },
  { value: "فصلی / پروژه‌ای", labelFa: "فصلی / پروژه‌ای", labelEn: "Seasonal / Project-based" },
];

export const ESP_DEGREES: MasterOption[] = [
  { value: "دکتری", labelFa: "دکتری تخصصی (Ph.D.)", labelEn: "Doctorate (Ph.D.)" },
  { value: "کارشناسی ارشد", labelFa: "کارشناسی ارشد (فوق لیسانس)", labelEn: "Master's Degree" },
  { value: "کارشناسی", labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree" },
  { value: "کاردانی", labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree" },
  { value: "دیپلم", labelFa: "دیپلم متوسطه", labelEn: "High School Diploma" },
  { value: "زیر دیپلم", labelFa: "زیر دیپلم / مهارتی", labelEn: "Below Diploma" },
];

export const ESP_BASIC_INSURANCES: MasterOption[] = [
  { value: "تأمین اجتماعی", labelFa: "بیمه تأمین اجتماعی", labelEn: "Social Security Insurance" },
  { value: "خدمات درمانی", labelFa: "بیمه خدمات درمانی / سلامت", labelEn: "Health Services" },
  { value: "فاقد بیمه", labelFa: "فاقد بیمه پایه", labelEn: "None / Not Covered" },
];

export const ESP_SUPPLEMENTARY_PLANS: MasterOption[] = [
  { value: "طلایی (Golden)", labelFa: "بیمه تکمیلی طلایی (Golden)", labelEn: "Golden Plan" },
  { value: "نقره‌ای (Silver)", labelFa: "بیمه تکمیلی نقره‌ای (Silver)", labelEn: "Silver Plan" },
  { value: "ویژه (Special)", labelFa: "بیمه تکمیلی ویژه (Special)", labelEn: "Special Plan" },
  { value: "ندارد", labelFa: "فاقد بیمه تکمیلی / عدم تقاضا", labelEn: "None / Declined" },
];

export const ESP_SUPPLEMENTARY_PROVIDERS: MasterOption[] = [
  { value: "SOS (کمک رسان ایران)", labelFa: "SOS (کمک‌رسان ایران)", labelEn: "SOS Iran Assistance" },
  { value: "دانا", labelFa: "بیمه دانا", labelEn: "Dana Insurance" },
  { value: "ایران", labelFa: "بیمه ایران", labelEn: "Iran Insurance" },
  { value: "البرز", labelFa: "بیمه البرز", labelEn: "Alborz Insurance" },
  { value: "آسیا", labelFa: "بیمه آسیا", labelEn: "Asia Insurance" },
];

export const ESP_MARITAL_STATUSES: MasterOption[] = [
  { value: "مجرد", labelFa: "مجرد", labelEn: "Single" },
  { value: "متاهل", labelFa: "متأهل", labelEn: "Married" },
];

export const ESP_MILITARY_STATUSES: MasterOption[] = [
  { value: "پایان خدمت", labelFa: "کارت پایان خدمت", labelEn: "Completed Military Service" },
  { value: "معافیت دائم", labelFa: "معافیت دائم (پزشکی / کفالت)", labelEn: "Permanent Exemption" },
  { value: "معافیت تحصیلی", labelFa: "معافیت تحصیلی", labelEn: "Educational Exemption" },
  { value: "مشمول", labelFa: "مشمول خدمت نظام وظیفه", labelEn: "Eligible for Service" },
  { value: "عدم شمول (بانوان)", labelFa: "عدم شمول (بانوان)", labelEn: "Not Applicable (Female)" },
];

export function toComboboxOptions(items: MasterOption[], isRtl: boolean): ComboboxOption[] {
  return items.map((item) => ({
    value: item.value,
    label: isRtl ? item.labelFa : item.labelEn,
  }));
}
