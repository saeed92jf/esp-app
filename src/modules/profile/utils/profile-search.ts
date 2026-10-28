import React from "react";
import {
  User,
  Camera,
  Fingerprint,
  Calendar,
  Heart,
  Users,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  CreditCard,
  Factory,
  FileText,
  PhoneCall,
  Network,
  Star,
  Shield,
  ShieldAlert,
  GraduationCap,
  Palette,
  Sun,
  Languages,
  Clock,
  KeyRound,
} from "lucide-react";
import { UserProfile } from "../types/profile";

export interface ProfileSearchItem {
  id: string;
  tab: "personal" | "organizational" | "skills" | "insurance" | "education" | "settings";
  fieldId?: string;
  icon: React.ComponentType<{ className?: string }>;
  titleFa: string;
  titleEn: string;
  categoryFa: string;
  categoryEn: string;
  descriptionFa: string;
  descriptionEn: string;
  keywordsFa: string[];
  keywordsEn: string[];
  getValue?: (formData: UserProfile | null, user?: any) => string | undefined;
}

export interface ProfileSearchResult extends ProfileSearchItem {
  score: number;
  currentValue?: string;
}

/**
 * Normalizes text for dual Persian/English search:
 * - Unifies Persian/Arabic Yeh/Kaf/Heh/Alef
 * - Replaces ZWNJ (half-space) and punctuation with single spaces
 * - Converts Persian & Arabic numerals to ASCII digits
 * - Lowercases Latin characters
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, " ")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ی")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[-_.,/:;\\()«»"'[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const PROFILE_SEARCH_INDEX: ProfileSearchItem[] = [
  // ───────────────────────────────────────────────
  // 1. PERSONAL INFORMATION (اطلاعات شخصی)
  // ───────────────────────────────────────────────
  {
    id: "personal_name",
    tab: "personal",
    fieldId: "name",
    icon: User,
    titleFa: "نام و نام خانوادگی",
    titleEn: "First & Last Name",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "نام و نام خانوادگی به هر دو زبان فارسی و انگلیسی",
    descriptionEn: "Full first and last name in Persian and English",
    keywordsFa: ["نام", "نام خانوادگی", "اسم", "فامیل", "نام فارسی", "نام انگلیسی", "تغییر نام", "هویت"],
    keywordsEn: ["name", "full name", "first name", "last name", "persian name", "english name", "change name"],
    getValue: (data) => {
      const parts = [
        data?.personal?.firstNameFa,
        data?.personal?.lastNameFa,
        data?.personal?.firstName,
        data?.personal?.lastName,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" ") : undefined;
    },
  },
  {
    id: "personal_picture",
    tab: "personal",
    fieldId: "picture",
    icon: Camera,
    titleFa: "عکس نمایه و رنگ آواتار",
    titleEn: "Profile Picture & Avatar",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "تغییر تصویر نمایه و رنگ پس‌زمینه نشان کاربری",
    descriptionEn: "Change profile avatar image and user background color",
    keywordsFa: ["عکس", "تصویر", "پروفایل", "آواتار", "رنگ آواتار", "نمایه", "عکس کاربری", "عکس نمایه"],
    keywordsEn: ["picture", "photo", "image", "avatar", "profile picture", "avatar color", "pfp", "icon"],
    getValue: (data, user) => data?.personal?.avatarColor || user?.avatarColor,
  },
  {
    id: "personal_national_id",
    tab: "personal",
    fieldId: "nationalId",
    icon: Fingerprint,
    titleFa: "کد ملی",
    titleEn: "National ID",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "کد ملی ۱۰ رقمی ثبت‌شده در اسناد هویتی و ثبت احوال",
    descriptionEn: "10-digit national identification code registered with civil registry",
    keywordsFa: ["کد ملی", "شماره ملی", "شناسه ملی", "کارت ملی", "ثبت احوال", "شناسنامه"],
    keywordsEn: ["national id", "national code", "ssn", "identity", "melli code", "id number"],
    getValue: (data) => data?.personal?.nationalId,
  },
  {
    id: "personal_birth_date",
    tab: "personal",
    fieldId: "birthDate",
    icon: Calendar,
    titleFa: "تاریخ تولد",
    titleEn: "Birth Date",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "تاریخ تولد ثبت‌شده در شناسنامه و سن",
    descriptionEn: "Date of birth according to official identity records",
    keywordsFa: ["تاریخ تولد", "تولد", "سن", "زادروز", "سال تولد", "شناسنامه"],
    keywordsEn: ["birth date", "birthday", "dob", "date of birth", "age", "born"],
    getValue: (data) => data?.personal?.birthDate,
  },
  {
    id: "personal_marital_status",
    tab: "personal",
    fieldId: "maritalStatus",
    icon: Heart,
    titleFa: "وضعیت تأهل",
    titleEn: "Marital Status",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "وضعیت تأهل پرسنل (مجرد یا متأهل)",
    descriptionEn: "Personal marital status (single or married)",
    keywordsFa: ["وضعیت تأهل", "تأهل", "ازدواج", "همسر", "مجرد", "متأهل", "عقد"],
    keywordsEn: ["marital status", "married", "single", "marriage", "spouse", "relationship"],
    getValue: (data) => (data?.personal?.maritalStatus === "married" ? "متأهل (Married)" : "مجرد (Single)"),
  },
  {
    id: "personal_children_count",
    tab: "personal",
    fieldId: "childrenCount",
    icon: Users,
    titleFa: "تعداد فرزندان",
    titleEn: "Children Count",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "تعداد اولاد و فرزندان تحت تکفل پرسنل",
    descriptionEn: "Number of children and direct dependents",
    keywordsFa: ["فرزندان", "تعداد فرزندان", "فرزند", "بچه", "اولاد", "عائله"],
    keywordsEn: ["children", "children count", "kids", "child", "family", "dependents"],
    getValue: (data) => (data?.personal?.childrenCount !== undefined ? String(data.personal.childrenCount) : "0"),
  },
  {
    id: "personal_phone",
    tab: "personal",
    fieldId: "phone",
    icon: Phone,
    titleFa: "شماره موبایل",
    titleEn: "Mobile Phone",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "شماره تلفن همراه و وضعیت اعتبارسنجی پیامکی",
    descriptionEn: "Mobile phone number and SMS verification status",
    keywordsFa: ["موبایل", "تلفن", "شماره همراه", "شماره موبایل", "پیامک", "کد تأیید", "تماس", "ارتباط"],
    keywordsEn: ["phone", "mobile", "cellphone", "phone number", "sms", "verification", "call", "contact"],
    getValue: (data) => data?.personal?.phone,
  },
  {
    id: "personal_email",
    tab: "personal",
    icon: Mail,
    titleFa: "پست الکترونیک",
    titleEn: "Email Address",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "آدرس ایمیل سازمانی یا شخصی جهت بازیابی و اعلانات",
    descriptionEn: "Corporate or personal email address for notifications and recovery",
    keywordsFa: ["ایمیل", "پست الکترونیک", "رایانامه", "جیمیل", "ایمیل سازمانی", "تأیید ایمیل"],
    keywordsEn: ["email", "mail", "email address", "gmail", "inbox", "verified email"],
    getValue: (data) => data?.personal?.email,
  },
  {
    id: "personal_address",
    tab: "personal",
    fieldId: "address",
    icon: MapPin,
    titleFa: "آدرس و محل سکونت",
    titleEn: "Address & Residence",
    categoryFa: "اطلاعات شخصی",
    categoryEn: "Personal Information",
    descriptionFa: "نشانی کامل محل سکونت و موقعیت روی نقشه",
    descriptionEn: "Full residential home address and map coordinates",
    keywordsFa: ["آدرس", "نشانی", "منزل", "سکونت", "لوکیشن", "نقشه", "محل زندگی", "شهر", "خیابان", "کد پستی"],
    keywordsEn: ["address", "home", "residence", "residential", "location", "map", "city", "street", "postal code"],
    getValue: (data) => data?.personal?.address,
  },

  // ───────────────────────────────────────────────
  // 2. ORGANIZATIONAL INFORMATION (اطلاعات سازمانی)
  // ───────────────────────────────────────────────
  {
    id: "org_department",
    tab: "organizational",
    fieldId: "department",
    icon: Building2,
    titleFa: "دپارتمان و واحد سازمانی",
    titleEn: "Department & Unit",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "واحد و اداره کاری پرسنل در چارت سازمانی شرکت",
    descriptionEn: "Organizational department and division in corporate structure",
    keywordsFa: ["دپارتمان", "واحد", "بخش", "اداره", "تیم", "واحد سازمانی", "چارت"],
    keywordsEn: ["department", "unit", "division", "team", "dept", "branch", "org chart"],
    getValue: (data) => data?.organizational?.department,
  },
  {
    id: "org_role",
    tab: "organizational",
    fieldId: "role",
    icon: Briefcase,
    titleFa: "سمت و عنوان شغلی",
    titleEn: "Job Role & Title",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "عنوان رسمی سمت شغلی و مسئولیت کاری در شرکت",
    descriptionEn: "Official job title, position, and corporate responsibilities",
    keywordsFa: ["سمت", "شغل", "عنوان شغلی", "پست", "موقعیت", "نقش سازمانی", "سمت کاری"],
    keywordsEn: ["role", "job title", "position", "job", "designation", "title", "occupation"],
    getValue: (data) => data?.organizational?.role,
  },
  {
    id: "org_employee_id",
    tab: "organizational",
    fieldId: "employeeId",
    icon: CreditCard,
    titleFa: "شماره پرسنلی",
    titleEn: "Employee ID",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "کد شناسایی کارمندی و شماره پرسنلی سازمانی",
    descriptionEn: "Corporate staff ID and employee identification code",
    keywordsFa: ["شماره پرسنلی", "کد پرسنلی", "شناسه کارمندی", "کد پرسنل", "شماره کارمندی"],
    keywordsEn: ["employee id", "personnel number", "staff id", "employee code", "personnel id", "staff code"],
    getValue: (data) => data?.organizational?.employeeId,
  },
  {
    id: "org_work_location",
    tab: "organizational",
    fieldId: "workLocation",
    icon: Factory,
    titleFa: "محل خدمت و استقرار",
    titleEn: "Work Location",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "محل استقرار فیزیکی، دفتر مرکزی، کارخانه یا سایت کاری",
    descriptionEn: "Physical work site, head office, plant, or project location",
    keywordsFa: ["محل خدمت", "محل کار", "دفتر", "کارخانه", "سایت", "موقعیت کار", "استقرار"],
    keywordsEn: ["work location", "workplace", "office", "site", "plant", "location", "factory", "headquarters"],
    getValue: (data) => data?.organizational?.workLocation,
  },
  {
    id: "org_contract_type",
    tab: "organizational",
    fieldId: "contractType",
    icon: FileText,
    titleFa: "نوع قرارداد کاری",
    titleEn: "Contract Type",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "وضعیت همکاری، قرارداد رسمی، پیمانی، تمام‌وقت یا پروژه‌ای",
    descriptionEn: "Employment status, official contract, full-time, part-time, project",
    keywordsFa: ["نوع قرارداد", "قرارداد", "استخدام", "رسمی", "پیمانی", "تمام وقت", "همکاری", "پروژه‌ای"],
    keywordsEn: ["contract type", "employment", "contract", "full-time", "part-time", "permanent", "terms"],
    getValue: (data) => data?.organizational?.contractType,
  },
  {
    id: "org_extension",
    tab: "organizational",
    fieldId: "extensionNumber",
    icon: PhoneCall,
    titleFa: "شماره داخلی شرکت",
    titleEn: "Extension Number",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "شماره تلفن داخلی پرسنل جهت تماس درون‌سازمانی",
    descriptionEn: "Internal corporate telephone extension number",
    keywordsFa: ["داخلی", "شماره داخلی", "اکستنشن", "تلفن داخلی", "تماس اداری", "اکستنشن شرکت"],
    keywordsEn: ["extension", "ext", "extension number", "internal phone", "intercom", "office phone"],
    getValue: (data) => data?.organizational?.extensionNumber,
  },
  {
    id: "org_join_date",
    tab: "organizational",
    fieldId: "joinDate",
    icon: Calendar,
    titleFa: "تاریخ استخدام و شروع به کار",
    titleEn: "Join Date",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "تاریخ شروع به کار رسمی و سابقه همکاری با مجموعه",
    descriptionEn: "Official employment start date and tenure",
    keywordsFa: ["تاریخ استخدام", "تاریخ شروع به کار", "سابقه", "ورود به شرکت", "استخدام"],
    keywordsEn: ["join date", "start date", "hire date", "employment date", "joined", "tenure"],
    getValue: (data) => data?.organizational?.joinDate,
  },
  {
    id: "org_manager",
    tab: "organizational",
    fieldId: "manager",
    icon: User,
    titleFa: "مدیر مستقیم",
    titleEn: "Direct Manager",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "مدیر مستقیم و سرپرست بالادستی در چارت سازمانی",
    descriptionEn: "Direct line manager and supervisor in the organizational hierarchy",
    keywordsFa: ["مدیر", "مدیر مستقیم", "سرپرست", "مدیر واحد", "چارت", "گزارش‌دهی"],
    keywordsEn: ["manager", "direct manager", "supervisor", "lead", "reports to", "boss"],
    getValue: (data) => data?.organizational?.manager,
  },
  {
    id: "org_subordinates",
    tab: "organizational",
    fieldId: "subordinates",
    icon: Network,
    titleFa: "اعضای تیم و پرسنل تحت نظارت",
    titleEn: "Team Members & Subordinates",
    categoryFa: "اطلاعات سازمانی",
    categoryEn: "Organizational Information",
    descriptionFa: "اعضای تیم مستقیم و همکارانی که به شما گزارش می‌دهند",
    descriptionEn: "Direct reports and team members under your supervision",
    keywordsFa: ["اعضای تیم", "زیرمجموعه", "همکاران", "پرسنل", "تیم کاری", "نظارت"],
    keywordsEn: ["subordinates", "team members", "direct reports", "team", "supervisees"],
    getValue: (data) => {
      const subs = data?.organizational?.subordinates;
      return Array.isArray(subs) ? subs.join(", ") : undefined;
    },
  },

  // ───────────────────────────────────────────────
  // 3. SKILLS & EXPERTISE (مهارت‌ها)
  // ───────────────────────────────────────────────
  {
    id: "skills_management",
    tab: "skills",
    icon: Star,
    titleFa: "مهارت‌ها و توانمندی‌های تخصصی",
    titleEn: "Skills & Technical Expertise",
    categoryFa: "مهارت‌ها",
    categoryEn: "Skills",
    descriptionFa: "فهرست مهارت‌های فنی، نرم‌افزاری و سطوح تسلط ۱ تا ۵",
    descriptionEn: "Technical, software, and soft competencies with proficiency levels 1-5",
    keywordsFa: ["مهارت", "مهارت‌ها", "تخصص", "توانمندی", "فنی", "سطح تسلط", "افزودن مهارت", "نرم‌افزار"],
    keywordsEn: ["skills", "expertise", "competencies", "technical skills", "proficiency", "add skill", "software"],
    getValue: (data) => {
      const names = data?.skills?.map((s) => s.name);
      return names && names.length > 0 ? names.join("، ") : undefined;
    },
  },

  // ───────────────────────────────────────────────
  // 4. INSURANCE & FINANCIAL (اطلاعات بیمه و امور مالی)
  // ───────────────────────────────────────────────
  {
    id: "insurance_code",
    tab: "insurance",
    fieldId: "insuranceCode",
    icon: Shield,
    titleFa: "شماره بیمه تامین اجتماعی",
    titleEn: "Social Security Insurance Code",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "شماره پرونده و کد بیمه تامین اجتماعی پرسنل",
    descriptionEn: "Social security insurance policy and account code",
    keywordsFa: ["شماره بیمه", "بیمه تامین اجتماعی", "کد بیمه", "تامین اجتماعی", "سوابق بیمه"],
    keywordsEn: ["insurance code", "social security", "insurance number", "tamin", "social insurance"],
    getValue: (data) => data?.insurance?.insuranceCode,
  },
  {
    id: "insurance_provider",
    tab: "insurance",
    fieldId: "provider",
    icon: Shield,
    titleFa: "شرکت بیمه‌گر پایه",
    titleEn: "Insurance Provider",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "نام سازمان یا کارگزاری بیمه‌گر اصلی پرسنل",
    descriptionEn: "Primary corporate insurance carrier or provider name",
    keywordsFa: ["بیمه‌گر", "شرکت بیمه", "سازمان بیمه‌گر", "کارگزاری بیمه"],
    keywordsEn: ["insurance provider", "insurer", "insurance company", "provider"],
    getValue: (data) => data?.insurance?.provider,
  },
  {
    id: "insurance_valid_until",
    tab: "insurance",
    fieldId: "validUntil",
    icon: Calendar,
    titleFa: "تاریخ اعتبار بیمه",
    titleEn: "Insurance Validity Date",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "مهلت و تاریخ انقضای پوشش بیمه‌ای",
    descriptionEn: "Insurance coverage expiration and renewal date",
    keywordsFa: ["تاریخ اعتبار بیمه", "مهلت بیمه", "اعتبار بیمه", "انقضا بیمه", "تمدید بیمه"],
    keywordsEn: ["valid until", "insurance validity", "expiry date", "renewal", "expiration"],
    getValue: (data) => data?.insurance?.validUntil,
  },
  {
    id: "insurance_supplementary",
    tab: "insurance",
    fieldId: "supplementaryPlan",
    icon: ShieldAlert,
    titleFa: "طرح بیمه درمان تکمیلی",
    titleEn: "Supplementary Health Insurance Plan",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "طرح بیمه تکمیلی طلایی، نقره‌ای، ویژه یا فاقد بیمه",
    descriptionEn: "Golden, Silver, Special, or None supplementary insurance plan",
    keywordsFa: ["بیمه تکمیلی", "طرح تکمیلی", "طلایی", "نقره‌ای", "ویژه", "درمان تکمیلی", "پوشش درمان", "دندانپزشکی", "بستری"],
    keywordsEn: ["supplementary plan", "supplementary insurance", "health insurance", "golden", "silver", "special", "medical coverage"],
    getValue: (data) => {
      const plan = data?.insurance?.supplementaryPlan;
      if (plan === "golden") return "طلایی (Golden)";
      if (plan === "silver") return "نقره‌ای (Silver)";
      if (plan === "special") return "ویژه (Special)";
      if (plan === "none") return "فاقد بیمه تکمیلی (None)";
      return plan;
    },
  },
  {
    id: "insurance_sheba",
    tab: "insurance",
    fieldId: "shebaNumber",
    icon: CreditCard,
    titleFa: "شماره شبا بانکی (واریز حقوق)",
    titleEn: "Bank Sheba / IBAN",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "شماره ۲۴ رقمی شبا بانکی پرسنل جهت پرداخت حقوق و مزایا",
    descriptionEn: "24-digit IBAN / Sheba number for salary and benefits deposit",
    keywordsFa: ["شبا", "شماره شبا", "حساب بانکی", "بانک", "واریز حقوق", "حقوق", "دستمزد", "شماره حساب"],
    keywordsEn: ["sheba", "iban", "bank account", "sheba number", "salary", "bank", "deposit", "payroll"],
    getValue: (data) => data?.insurance?.shebaNumber,
  },
  {
    id: "insurance_dependents",
    tab: "insurance",
    fieldId: "dependents",
    icon: Users,
    titleFa: "افراد تحت تکفل بیمه‌ای",
    titleEn: "Dependents & Family Coverage",
    categoryFa: "بیمه و امور مالی",
    categoryEn: "Insurance & Finance",
    descriptionFa: "همسر، فرزندان و والدین تحت پوشش بیمه تکمیلی و درمانی",
    descriptionEn: "Spouse, children, and parents covered under insurance benefits",
    keywordsFa: ["تحت تکفل", "افراد تحت تکفل", "همسر", "فرزند", "والدین", "بیمه خانواده", "عائله"],
    keywordsEn: ["dependents", "family members", "spouse", "child", "parents", "family insurance"],
    getValue: (data) => {
      const deps = data?.insurance?.dependents;
      if (deps && deps.length > 0) {
        return `${deps.length} فرد تحت تکفل ثبت‌شده (${deps.map((d) => d.fullName).join("، ")})`;
      }
      return undefined;
    },
  },

  // ───────────────────────────────────────────────
  // 5. EDUCATION & ACADEMIC RECORDS (سوابق تحصیلی)
  // ───────────────────────────────────────────────
  {
    id: "education_records",
    tab: "education",
    icon: GraduationCap,
    titleFa: "سوابق تحصیلی، دانشگاه و مدارک",
    titleEn: "Academic Records & Degrees",
    categoryFa: "سوابق تحصیلی",
    categoryEn: "Education",
    descriptionFa: "مقاطع تحصیلی، دانشگاه‌های فارغ‌التحصیلی، رشته‌ها و سال اتمام",
    descriptionEn: "Degrees, universities, fields of study, and graduation dates",
    keywordsFa: [
      "تحصیل", "سوابق تحصیلی", "مدرک", "دانشگاه", "رشته تحصیلی", "کارشناسی",
      "ارشد", "دکترا", "دیپلم", "فوق لیسانس", "لیسانس", "گرایش", "فارغ‌التحصیلی"
    ],
    keywordsEn: [
      "education", "degree", "academic", "university", "major", "bachelor",
      "master", "phd", "diploma", "graduation", "college", "field of study"
    ],
    getValue: (data) => {
      const records = data?.education;
      if (Array.isArray(records) && records.length > 0) {
        return records
          .map((r) => [r.degree, r.fieldOfStudy, r.university].filter(Boolean).join(" - "))
          .join(" | ");
      }
      return undefined;
    },
  },

  // ───────────────────────────────────────────────
  // 6. SETTINGS & PREFERENCES (تنظیمات و ظاهر)
  // ───────────────────────────────────────────────
  {
    id: "settings_color",
    tab: "settings",
    fieldId: "primaryColor",
    icon: Palette,
    titleFa: "رنگ اصلی و پوسته سامانه",
    titleEn: "Primary Theme Color",
    categoryFa: "تنظیمات",
    categoryEn: "Settings",
    descriptionFa: "تغییر رنگ تأکیدی و تم برندینگ سامانه (آبی، نیلی، کهربایی و...)",
    descriptionEn: "Customize primary system accent color and theme palette",
    keywordsFa: ["رنگ", "رنگ اصلی", "رنگ پوسته", "پالت رنگ", "رنگ تم", "شخصی‌سازی", "تم رنگی", "رنگ سامانه"],
    keywordsEn: ["color", "primary color", "accent color", "palette", "theme color", "branding color", "custom color"],
    getValue: (data, user) => data?.personal?.primaryColor || user?.primaryColor,
  },
  {
    id: "settings_theme",
    tab: "settings",
    icon: Sun,
    titleFa: "حالت شب و روز (ظاهر)",
    titleEn: "Theme & Dark Mode",
    categoryFa: "تنظیمات",
    categoryEn: "Settings",
    descriptionFa: "تغییر حالت ظاهری بین دارک مود (تاریک)، لایت مود (روشن) یا هماهنگ با سیستم",
    descriptionEn: "Toggle between dark mode, light mode, or system theme appearance",
    keywordsFa: ["تم", "حالت شب", "حالت روز", "دارک مود", "لایت مود", "پوسته", "تاریک", "روشن", "ظاهر"],
    keywordsEn: ["theme", "dark mode", "light mode", "appearance", "night mode", "day mode", "system theme"],
  },
  {
    id: "settings_language",
    tab: "settings",
    icon: Languages,
    titleFa: "زبان سامانه",
    titleEn: "System Language & Locale",
    categoryFa: "تنظیمات",
    categoryEn: "Settings",
    descriptionFa: "تغییر زبان رابط کاربری بین فارسی و انگلیسی",
    descriptionEn: "Switch interface language between Persian and English",
    keywordsFa: ["زبان", "زبان سامانه", "فارسی", "انگلیسی", "تغییر زبان", "جهت نوشتار", "لوکال"],
    keywordsEn: ["language", "locale", "persian", "english", "farsi", "switch language", "direction"],
  },
  {
    id: "settings_security",
    tab: "settings",
    icon: KeyRound,
    titleFa: "امنیت حساب و کلمه عبور",
    titleEn: "Account Security & Password",
    categoryFa: "تنظیمات",
    categoryEn: "Settings",
    descriptionFa: "کلمه عبور، امنیت حساب کاربری و احراز هویت دومرحله‌ای",
    descriptionEn: "Password management, account protection, and verification",
    keywordsFa: ["امنیت", "رمز", "کلمه عبور", "رمز عبور", "گذرواژه", "تغییر رمز", "احراز هویت"],
    keywordsEn: ["security", "password", "change password", "passcode", "account security", "auth"],
  },
  {
    id: "settings_account_status",
    tab: "settings",
    icon: Clock,
    titleFa: "وضعیت پرونده و تأیید منابع انسانی",
    titleEn: "Account Onboarding Status",
    categoryFa: "تنظیمات",
    categoryEn: "Settings",
    descriptionFa: "وضعیت تکمیل پرونده پرسنلی و روند بررسی توسط منابع انسانی",
    descriptionEn: "Onboarding progress, verification timeline, and HR approval status",
    keywordsFa: ["وضعیت حساب", "پرونده", "منابع انسانی", "تأیید کاربری", "کارتابل", "تایم لاین", "تکمیل پروفایل"],
    keywordsEn: ["account status", "hr approval", "onboarding", "verification", "timeline", "pending profile"],
  },
];

/**
 * Searches profile items based on normalized query in Persian and English
 */
export function searchProfileItems(
  rawQuery: string,
  locale: string,
  formData: UserProfile | null,
  user?: any
): ProfileSearchResult[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];

  const queryWords = query.split(" ").filter(Boolean);
  const results: ProfileSearchResult[] = [];

  for (const item of PROFILE_SEARCH_INDEX) {
    const currentValue = item.getValue ? item.getValue(formData, user) : undefined;
    const normalizedVal = normalizeSearchText(currentValue);

    // Build searchable texts
    const titleFa = normalizeSearchText(item.titleFa);
    const titleEn = normalizeSearchText(item.titleEn);
    const catFa = normalizeSearchText(item.categoryFa);
    const catEn = normalizeSearchText(item.categoryEn);
    const descFa = normalizeSearchText(item.descriptionFa);
    const descEn = normalizeSearchText(item.descriptionEn);

    const normKeywordsFa = item.keywordsFa.map(normalizeSearchText);
    const normKeywordsEn = item.keywordsEn.map(normalizeSearchText);

    let score = 0;

    // 1. Exact match on title
    if (titleFa === query || titleEn === query) {
      score = Math.max(score, 120);
    }
    // 2. Starts with on title
    else if (titleFa.startsWith(query) || titleEn.startsWith(query)) {
      score = Math.max(score, 100);
    }
    // 3. Substring in title
    else if (titleFa.includes(query) || titleEn.includes(query)) {
      score = Math.max(score, 85);
    }

    // 4. Exact or startsWith keyword match
    for (const kw of [...normKeywordsFa, ...normKeywordsEn]) {
      if (kw === query) {
        score = Math.max(score, 90);
        break;
      }
      if (kw.startsWith(query)) {
        score = Math.max(score, 75);
      } else if (kw.includes(query)) {
        score = Math.max(score, 60);
      }
    }

    // 5. Value match (e.g. user types their actual phone, national id, role, or department)
    if (normalizedVal) {
      if (normalizedVal === query) {
        score = Math.max(score, 110);
      } else if (normalizedVal.startsWith(query)) {
        score = Math.max(score, 85);
      } else if (normalizedVal.includes(query)) {
        score = Math.max(score, 70);
      }
    }

    // 6. Category match
    if (catFa.includes(query) || catEn.includes(query)) {
      score = Math.max(score, 50);
    }

    // 7. Description match
    if (descFa.includes(query) || descEn.includes(query)) {
      score = Math.max(score, 40);
    }

    // 8. Multi-word full inclusion
    if (queryWords.length > 1) {
      const fullText = `${titleFa} ${titleEn} ${catFa} ${catEn} ${descFa} ${descEn} ${normKeywordsFa.join(" ")} ${normKeywordsEn.join(" ")} ${normalizedVal}`;
      const allWordsMatch = queryWords.every((word) => fullText.includes(word));
      if (allWordsMatch) {
        score = Math.max(score, 65);
      }
    }

    if (score > 0) {
      results.push({
        ...item,
        score,
        currentValue,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
