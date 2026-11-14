// src/modules/customers/types/contacts.types.ts

export type ContactDepartment =
  | "management"
  | "commercial"
  | "procurement"
  | "technical"
  | "maintenance"
  | "operations"
  | "engineering"
  | "other";

export type ContactIndustry =
  | "petrochemical"
  | "steel"
  | "refinery"
  | "gas"
  | "other";

export interface CompanyContact {
  id: string;
  fullNameFa: string;
  fullNameEn?: string;
  companyId?: string;
  companyNameFa: string;
  companyNameEn?: string;
  industry?: ContactIndustry;
  department: ContactDepartment;
  departmentTitleFa: string; // e.g. "مدیریت بازرگانی و قراردادها"
  jobTitleFa: string; // e.g. "مدیر بازرگانی و فروش", "رئیس تعمیرات و نگهداری"
  jobTitleEn?: string;
  phoneDirect?: string;
  phoneExtension?: string;
  mobilePhone?: string;
  email?: string;
  locationFa?: string; // e.g. "دفتر مرکزی تهران", "مجتمع عسلویه - فاز ۱"
  notesFa?: string;
  isKeyContact?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface ContactCreateInput {
  fullNameFa: string;
  fullNameEn?: string;
  companyNameFa: string;
  companyNameEn?: string;
  industry?: ContactIndustry;
  department: ContactDepartment;
  departmentTitleFa: string;
  jobTitleFa: string;
  jobTitleEn?: string;
  phoneDirect?: string;
  phoneExtension?: string;
  mobilePhone?: string;
  email?: string;
  locationFa?: string;
  notesFa?: string;
  isKeyContact?: boolean;
}

