// src/modules/projects/types/simplified-projects.types.ts
// Simplified Euroslot Pars project domain models

import type { ProjectLetter } from "./project-letters.types";

export type ProjectCategory =
  | "COLUMN INT."
  | "SEPARATOR INT."
  | "FILTRATION"
  | "REACTOR INT."
  | "SPECIAL ITEMS"
  | "MISCELLANEOUS"
  | "PROCESSING PKG.";

export interface ProjectCategoryMeta {
  key: ProjectCategory;
  labelEn: string;
  labelFa: string;
  descriptionFa: string;
}

export const PROJECT_CATEGORIES: ProjectCategoryMeta[] = [
  {
    key: "COLUMN INT.",
    labelEn: "COLUMN INT.",
    labelFa: "اینترنال‌های برج (Column Internals)",
    descriptionFa: "سینی‌های تقطیر، غربالی، پکینگ‌های ساختاریافته و توزیع‌کننده‌ها",
  },
  {
    key: "SEPARATOR INT.",
    labelEn: "SEPARATOR INT.",
    labelFa: "اینترنال‌های تفکیک‌گر (Separator Internals)",
    descriptionFa: "سیستم‌های کوالسر، وین‌پک و تجهیزات جداسازی دوفازی و سه‌فازی",
  },
  {
    key: "FILTRATION",
    labelEn: "FILTRATION",
    labelFa: "فیلتراسیون (Filtration)",
    descriptionFa: "المنت‌های اسلات‌دار وج‌وایر، سبدهای صافی، بسترهای شنی و فیلترهای میکرونی",
  },
  {
    key: "REACTOR INT.",
    labelEn: "REACTOR INT.",
    labelFa: "اینترنال‌های راکتور (Reactor Internals)",
    descriptionFa: "توزیع‌کننده‌های ورودی راکتور، شبکه‌های نگهدارنده کاتالیست و اسکلوب",
  },
  {
    key: "SPECIAL ITEMS",
    labelEn: "SPECIAL ITEMS",
    labelFa: "اقلام و تجهیزات خاص (Special Items)",
    descriptionFa: "تجهیزات و قطعات مهندسی خاص، استرینرهای سفارشی و آلیاژهای پیشرفته",
  },
  {
    key: "MISCELLANEOUS",
    labelEn: "MISCELLANEOUS",
    labelFa: "متفرقه (Miscellaneous)",
    descriptionFa: "اسپول‌های پایپینگ، قطعات ابزاردقیق، و تجهیزات جانبی",
  },
  {
    key: "PROCESSING PKG.",
    labelEn: "PROCESSING PKG.",
    labelFa: "پکیج‌های فرآیندی (Processing Packages)",
    descriptionFa: "اسکیدها و پکیج‌های یکپارچه تصفیه، فیلتراسیون و تزریق مواد شیمیایی",
  },
];

export const PROJECT_TYPE_OPTIONS = [
  { id: "مهندسی", labelFa: "مهندسی (Engineering)", labelEn: "Engineering" },
  { id: "ساخت", labelFa: "ساخت (Fabrication)", labelEn: "Fabrication" },
  { id: "تامین", labelFa: "تامین (Procurement)", labelEn: "Procurement" },
  { id: "قطعات یدکی", labelFa: "قطعات یدکی (Spare Parts)", labelEn: "Spare Parts" },
  { id: "تحقیق و توسعه", labelFa: "تحقیق و توسعه (R&D)", labelEn: "R&D" },
  { id: "نصب و راه‌اندازی", labelFa: "نصب و راه‌اندازی (Installation)", labelEn: "Installation" },
];

export interface ProjectDocument {
  id: string;
  title: string;       // عنوان مستند، مثلا "نقشه چیدمان عمومی", "دیتاشیت فرآیندی"
  fileName: string;
  fileSize?: string;
  fileType?: string;
  url?: string;        // Base64 data URL
  uploadedAt: string;
  uploadedBy?: string;
}

export interface ProjectSchedulePhase {
  id: string;
  title: string;       // e.g. "مهندسی", "نقشه‌های ارسالی جهت تایید (DFA)", "تاییدیه کارفرما", "تامین و ساخت", "بسته‌بندی و بارگیری"
  titleEn: string;
  durationDays: number;
  progress: number;    // 0 - 100
  startDate?: string;
  endDate?: string;
  status: "pending" | "in_progress" | "completed";
}

export interface ProjectSchedule {
  totalDays: number;
  startDate?: string;
  endDate?: string;
  phases: ProjectSchedulePhase[];
}

export type ProjectStatus = "todo" | "in_progress" | "review" | "done" | "on_hold";

export interface SimplifiedProject {
  id: string;
  name: string;             // نام پروژه
  category: ProjectCategory;// دسته بندی کومبو طبق عکس
  client: string;           // کارفرما کومبو
  espNumber: string;        // ESP number
  service: string;          // سرویس
  managerId?: string;       // مدیر پروژه
  managerName: string;      // مدیر پروژه
  projectTypes: string[];   // نوع پروژه چند انتخابی
  documents: ProjectDocument[]; // بخش مستندات
  letters?: ProjectLetter[];    // بخش نامه‌ها و مکاتبات اداری
  schedule: ProjectSchedule;// بخش اسکجول
  status: ProjectStatus;
  progressPercentage: number;
  company?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SimplifiedProjectCreate {
  name: string;
  category: ProjectCategory;
  client: string;
  espNumber: string;
  service: string;
  managerId?: string;
  managerName: string;
  projectTypes: string[];
  documents?: ProjectDocument[];
  letters?: ProjectLetter[];
  schedule: ProjectSchedule;
  company?: string;
  description?: string;
  status?: ProjectStatus;
}

