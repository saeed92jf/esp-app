// src/modules/admin/utils/personnel-excel.ts
import * as XLSX from "xlsx";
import type { User, UserRole, AccountStatus } from "../types/admin.types";
import { resolveOrganizationDepartment, resolveOrganizationRole } from "@/config/organization";

/**
 * Clean and normalize phone numbers (e.g. 09123456789 or 989123456789)
 */
export function normalizePhoneNumber(raw: any): string {
  if (!raw) return "";
  let digits = String(raw).replace(/[^\d+]/g, "").trim();
  if (digits.startsWith("+98")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("0098")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("98") && digits.length >= 12) digits = "0" + digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("9")) digits = "0" + digits;
  return digits;
}

/**
 * Normalize National ID to standard 10 digits
 */
export function normalizeNationalId(raw: any): string {
  if (!raw) return "";
  const digits = String(raw).replace(/[^\d]/g, "").trim();
  if (!digits) return "";
  if (digits.length < 10) return digits.padStart(10, "0");
  return digits;
}

/**
 * Format Persian role title for Excel export
 */
export function formatRoleTitle(role?: string): string {
  switch (role) {
    case "superadmin": return "مدیر ارشد (Super Admin)";
    case "admin": return "مدیر سیستم (Admin)";
    case "dept_admin": return "مدیر دپارتمان (Department Admin)";
    case "office_admin": return "مدیر اداری (Office Admin)";
    case "manager": return "مدیر (Manager)";
    case "engineer": return "کارشناس فنی (Engineer)";
    case "staff": return "پرسنل (Staff)";
    case "customer": return "مشتری (Customer)";
    default: return "کاربر (User)";
  }
}

/**
 * Maps raw row keys from uploaded Excel to standard User fields
 */
const FIELD_ALIASES: Record<string, keyof User | string> = {
  // Personnel code & ID
  "کد پرسنلی": "personnelCode",
  "کدپرسنلی": "personnelCode",
  "شماره پرسنلی": "personnelCode",
  "کد پرسنلی esp": "personnelCodeEsp",
  "کد پرسنلی npc": "personnelCodeNpc",
  "personnelcode": "personnelCode",
  "employeeid": "employeeId",
  "personnel_code": "personnelCode",
  "employee_id": "employeeId",
  "شناسه": "id",
  "شناسه کاربر": "id",
  "id": "id",
  "user_id": "id",

  // Full name FA
  "نام و نام خانوادگی": "fullNameFa",
  "نام و نام خانوادگی (فارسی)": "fullNameFa",
  "نام کامل": "fullNameFa",
  "نام کامل فارسی": "fullNameFa",
  "fullnamefa": "fullNameFa",
  "full_name_fa": "fullNameFa",

  // Full name EN
  "نام و نام خانوادگی (انگلیسی)": "fullName",
  "نام کامل انگلیسی": "fullName",
  "fullname": "fullName",
  "full_name": "fullName",

  // First & Last FA
  "نام": "firstNameFa",
  "نام فارسی": "firstNameFa",
  "firstnamefa": "firstNameFa",
  "first_name_fa": "firstNameFa",
  "نام خانوادگی": "lastNameFa",
  "نام خانوادگی فارسی": "lastNameFa",
  "lastnamefa": "lastNameFa",
  "last_name_fa": "lastNameFa",

  // First & Last EN
  "نام انگلیسی": "firstName",
  "firstname": "firstName",
  "first_name": "firstName",
  "نام خانوادگی انگلیسی": "lastName",
  "lastname": "lastName",
  "last_name": "lastName",

  // National ID & Personal Info
  "کد ملی": "nationalId",
  "کدملی": "nationalId",
  "شماره ملی": "nationalId",
  "nationalid": "nationalId",
  "national_id": "nationalId",
  "نام پدر": "fatherName",
  "fathername": "fatherName",
  "father_name": "fatherName",
  "تاریخ تولد": "birthDate",
  "birthdate": "birthDate",
  "birth_date": "birthDate",
  "محل تولد": "birthPlace",
  "birthplace": "birthPlace",
  "birth_place": "birthPlace",
  "وضعیت نظام وظیفه": "militaryDuty",
  "نظام وظیفه": "militaryDuty",
  "militaryduty": "militaryDuty",
  "وضعیت تأهل": "maritalStatus",
  "وضعیت تاهل": "maritalStatus",
  "تاهل": "maritalStatus",
  "maritalstatus": "maritalStatus",
  "تعداد فرزندان": "childrenCount",
  "فرزندان": "childrenCount",
  "childrencount": "childrenCount",
  "children_count": "childrenCount",

  // Contacts
  "ایمیل": "email",
  "ایمیل سازمانی": "email",
  "پست الکترونیک": "email",
  "email": "email",
  "e-mail": "email",
  "شماره موبایل": "mobile",
  "شماره همراه": "mobile",
  "موبایل": "mobile",
  "همراه": "mobile",
  "mobile": "mobile",
  "تلفن": "phone",
  "تلفن ثابت": "phone",
  "شماره تلفن": "phone",
  "phone": "phone",
  "داخلی": "extensionNumber",
  "شماره داخلی": "extensionNumber",
  "extension": "extensionNumber",
  "extensionnumber": "extensionNumber",
  "ext": "extensionNumber",
  "آدرس": "address",
  "آدرس محل سکونت": "address",
  "نشانی": "address",
  "address": "address",

  // Organization
  "شرکت": "company",
  "نام شرکت": "company",
  "company": "company",
  "شناسه شرکت": "companyId",
  "companyid": "companyId",
  "دپارتمان": "department",
  "دپارتمان / واحد": "department",
  "واحد سازمانی": "department",
  "department": "department",
  "dept": "department",
  "سمت": "jobTitle",
  "سمت سازمانی": "jobTitle",
  "سمت سازمانی (فارسی)": "jobTitle",
  "عنوان شغلی": "jobTitle",
  "jobtitle": "jobTitle",
  "job_title": "jobTitle",
  "سمت سازمانی (انگلیسی)": "jobTitleEn",
  "سمت انگلیسی": "jobTitleEn",
  "jobtitleen": "jobTitleEn",
  "عنوان پست سازمانی": "jobPosition",
  "jobposition": "jobPosition",
  "محل خدمت": "workLocation",
  "محل کار": "workLocation",
  "worklocation": "workLocation",
  "طبقه": "floor",
  "floor": "floor",
  "واحد": "unit",
  "unit": "unit",
  "زیر واحد": "subUnit",
  "subunit": "subUnit",
  "نوع قرارداد": "contractType",
  "قرارداد": "contractType",
  "contracttype": "contractType",
  "مدیر مافوق": "directManager",
  "مدیر مستقیم": "directManager",
  "مدیر": "directManager",
  "manager": "directManager",
  "directmanager": "directManager",
  "تاریخ شروع همکاری": "joinedAt",
  "تاریخ استخدام": "joinedAt",
  "تاریخ شروع": "joinedAt",
  "joinedat": "joinedAt",
  "employmentdate": "joinedAt",
  "روزهای حضور": "daysInCompany",
  "روزهای حضور در شرکت": "daysInCompany",
  "daysincompany": "daysInCompany",

  // Education
  "مقطع تحصیلی": "education",
  "مدرک": "education",
  "مدرک تحصیلی": "education",
  "education": "education",
  "educationdegree": "education",
  "رشته تحصیلی": "fieldOfStudy",
  "رشته": "fieldOfStudy",
  "fieldofstudy": "fieldOfStudy",
  "field_of_study": "fieldOfStudy",
  "دانشگاه": "university",
  "دانشگاه محل تحصیل": "university",
  "university": "university",
  "تاریخ فارغ‌التحصیلی": "graduationDate",
  "تاریخ فارغ التحصیلی": "graduationDate",
  "سال فارغ التحصیلی": "graduationDate",
  "graduationdate": "graduationDate",

  // Financial & Insurance
  "حقوق پایه": "salary",
  "حقوق": "salary",
  "حقوق ماهانه": "salary",
  "حقوق پایه (ریال)": "salary",
  "salary": "salary",
  "اضافه‌کاری مجاز": "hasOvertime",
  "اضافه کاری": "hasOvertime",
  "hasovertime": "hasOvertime",
  "سقف اضافه‌کاری": "maxOvertimeHours",
  "سقف اضافه کاری": "maxOvertimeHours",
  "سقف اضافه‌کاری (ساعت)": "maxOvertimeHours",
  "maxovertimehours": "maxOvertimeHours",
  "نوع پاداش": "monthlyBonusType",
  "نوع پاداش ماهانه": "monthlyBonusType",
  "مبلغ پاداش": "monthlyBonusAmount",
  "مبلغ پاداش ماهانه (ریال)": "monthlyBonusAmount",
  "عنوان پاداش": "monthlyBonusTitle",
  "عنوان پاداش ماهانه": "monthlyBonusTitle",
  "شماره بیمه تامین اجتماعی": "insuranceNumber",
  "شماره بیمه": "insuranceNumber",
  "کد بیمه": "insuranceNumber",
  "insurancenumber": "insuranceNumber",
  "نوع بیمه پایه": "insuranceType",
  "نوع بیمه": "insuranceType",
  "insurancetype": "insuranceType",
  "طرح بیمه تکمیلی": "supplementaryPlan",
  "بیمه تکمیلی": "supplementaryPlan",
  "supplementaryplan": "supplementaryPlan",
  "شرکت بیمه تکمیلی": "supplementaryProvider",
  "supplementaryprovider": "supplementaryProvider",
  "تاریخ اعتبار بیمه": "insuranceValidUntil",
  "شماره حساب بانکی": "bankAccount",
  "شماره حساب": "bankAccount",
  "حساب بانکی": "bankAccount",
  "bankaccount": "bankAccount",
  "شماره شبا": "shebaNumber",
  "شبا": "shebaNumber",
  "shebanumber": "shebaNumber",
  "sheba": "shebaNumber",

  // Role & Status
  "نقش کاربری در سامانه": "role",
  "نقش": "role",
  "نقش کاربری": "role",
  "role": "role",
  "وضعیت حساب کاربری": "accountStatus",
  "وضعیت حساب": "accountStatus",
  "accountstatus": "accountStatus",
  "وضعیت آنلاین": "status",
  "status": "status",

  // Extra duties / skills
  "شرح وظایف و مسئولیت‌ها": "duties",
  "شرح وظایف": "duties",
  "duties": "duties",
  "مهارت‌ها": "skills",
  "مهارت": "skills",
  "skills": "skills",
};

/**
 * Standard Personnel Column Definitions for Full Excel Export
 */
export interface PersonnelExportColumn {
  key: keyof User | string;
  header: string;
  width?: number;
  getter?: (u: User) => string | number | boolean;
}

export const PERSONNEL_EXPORT_COLUMNS: PersonnelExportColumn[] = [
  { key: "personnelCode", header: "کد پرسنلی", width: 14, getter: (u) => u.personnelCode || u.employeeId || "" },
  { key: "fullNameFa", header: "نام و نام خانوادگی (فارسی)", width: 25, getter: (u) => u.fullNameFa || u.name || "" },
  { key: "fullName", header: "نام کامل (انگلیسی)", width: 25, getter: (u) => u.fullName || "" },
  { key: "firstNameFa", header: "نام (فارسی)", width: 15, getter: (u) => u.firstNameFa || "" },
  { key: "lastNameFa", header: "نام خانوادگی (فارسی)", width: 18, getter: (u) => u.lastNameFa || "" },
  { key: "firstName", header: "نام (انگلیسی)", width: 15, getter: (u) => u.firstName || "" },
  { key: "lastName", header: "نام خانوادگی (انگلیسی)", width: 18, getter: (u) => u.lastName || "" },
  { key: "nationalId", header: "کد ملی", width: 15, getter: (u) => u.nationalId || "" },
  { key: "fatherName", header: "نام پدر", width: 14, getter: (u) => u.fatherName || "" },
  { key: "birthDate", header: "تاریخ تولد", width: 14, getter: (u) => u.birthDate || "" },
  { key: "birthPlace", header: "محل تولد", width: 16, getter: (u) => u.birthPlace || "" },
  {
    key: "maritalStatus",
    header: "وضعیت تأهل",
    width: 14,
    getter: (u) => (u.maritalStatus === "married" ? "متأهل" : u.maritalStatus === "single" ? "مجرد" : "")
  },
  { key: "childrenCount", header: "تعداد فرزندان", width: 14, getter: (u) => u.childrenCount ?? 0 },
  { key: "militaryDuty", header: "وضعیت نظام وظیفه", width: 18, getter: (u) => u.militaryDuty || "" },
  { key: "email", header: "ایمیل سازمانی", width: 30, getter: (u) => u.email || "" },
  { key: "mobile", header: "شماره موبایل", width: 16, getter: (u) => u.mobile || u.phone || "" },
  { key: "phone", header: "تلفن ثابت", width: 16, getter: (u) => u.phone || "" },
  { key: "extensionNumber", header: "شماره داخلی", width: 12, getter: (u) => u.extensionNumber || "" },
  { key: "address", header: "آدرس محل سکونت", width: 35, getter: (u) => u.address || "" },
  { key: "company", header: "شرکت", width: 20, getter: (u) => u.company || "" },
  { key: "companyId", header: "شناسه شرکت", width: 15, getter: (u) => u.companyId || "" },
  { key: "department", header: "دپارتمان / واحد", width: 22, getter: (u) => u.department || "" },
  { key: "jobTitle", header: "سمت سازمانی (فارسی)", width: 26, getter: (u) => u.jobTitle || "" },
  { key: "jobTitleEn", header: "سمت سازمانی (انگلیسی)", width: 26, getter: (u) => u.jobTitleEn || "" },
  { key: "jobPosition", header: "عنوان پست سازمانی", width: 22, getter: (u) => u.jobPosition || "" },
  { key: "workLocation", header: "محل خدمت", width: 16, getter: (u) => u.workLocation || "دفتر تهران" },
  { key: "floor", header: "طبقه", width: 10, getter: (u) => u.floor || "" },
  { key: "unit", header: "واحد", width: 14, getter: (u) => u.unit || "" },
  { key: "subUnit", header: "زیر واحد", width: 16, getter: (u) => u.subUnit || "" },
  { key: "contractType", header: "نوع قرارداد", width: 16, getter: (u) => u.contractType || "تمام وقت" },
  { key: "directManager", header: "مدیر مستقیم / مافوق", width: 20, getter: (u) => u.directManager || u.manager || "" },
  { key: "joinedAt", header: "تاریخ شروع همکاری", width: 16, getter: (u) => u.employmentDate || u.joinedAt || "" },
  { key: "daysInCompany", header: "روزهای حضور در شرکت", width: 18, getter: (u) => u.daysInCompany ?? 0 },
  { key: "education", header: "مقطع تحصیلی", width: 16, getter: (u) => u.education || u.educationDegree || "" },
  { key: "fieldOfStudy", header: "رشته تحصیلی", width: 22, getter: (u) => u.fieldOfStudy || u.educationField || "" },
  { key: "university", header: "دانشگاه محل تحصیل", width: 22, getter: (u) => u.university || "" },
  { key: "graduationDate", header: "تاریخ فارغ‌التحصیلی", width: 18, getter: (u) => u.graduationDate || u.graduationYear || "" },
  { key: "salary", header: "حقوق پایه (ریال)", width: 18, getter: (u) => u.salary ?? 0 },
  { key: "hasOvertime", header: "اضافه‌کاری مجاز", width: 16, getter: (u) => (u.hasOvertime ? "دارد" : "ندارد") },
  { key: "maxOvertimeHours", header: "سقف اضافه‌کاری (ساعت)", width: 20, getter: (u) => u.maxOvertimeHours ?? 0 },
  { key: "monthlyBonusType", header: "نوع پاداش ماهانه", width: 16, getter: (u) => u.monthlyBonusType || "نقدی" },
  { key: "monthlyBonusAmount", header: "مبلغ پاداش ماهانه (ریال)", width: 22, getter: (u) => u.monthlyBonusAmount ?? 0 },
  { key: "monthlyBonusTitle", header: "عنوان پاداش ماهانه", width: 30, getter: (u) => u.monthlyBonusTitle || "" },
  { key: "insuranceNumber", header: "شماره بیمه تامین اجتماعی", width: 24, getter: (u) => u.insuranceNumber || u.insuranceCode || "" },
  { key: "insuranceType", header: "نوع بیمه پایه", width: 16, getter: (u) => u.insuranceType || "تأمین اجتماعی" },
  { key: "supplementaryPlan", header: "طرح بیمه تکمیلی", width: 18, getter: (u) => u.supplementaryPlan || "طرح ویژه" },
  { key: "supplementaryProvider", header: "شرکت بیمه تکمیلی", width: 20, getter: (u) => u.supplementaryProvider || "" },
  { key: "insuranceValidUntil", header: "تاریخ اعتبار بیمه", width: 18, getter: (u) => u.insuranceValidUntil || "" },
  { key: "bankAccount", header: "شماره حساب بانکی", width: 22, getter: (u) => u.bankAccount || "" },
  { key: "shebaNumber", header: "شماره شبا", width: 26, getter: (u) => u.shebaNumber || "" },
  { key: "role", header: "نقش کاربری در سامانه", width: 24, getter: (u) => formatRoleTitle(u.role) },
  { key: "status", header: "وضعیت آنلاین", width: 14, getter: (u) => (u.status === "online" ? "آنلاین" : "آفلاین") },
  { key: "accountStatus", header: "وضعیت حساب کاربری", width: 18, getter: (u) => (u.accountStatus === "active" ? "فعال" : u.accountStatus || "فعال") },
  {
    key: "duties",
    header: "شرح وظایف و مسئولیت‌ها",
    width: 35,
    getter: (u) => (Array.isArray(u.duties) ? u.duties.join(" | ") : "")
  },
  {
    key: "skills",
    header: "مهارت‌ها",
    width: 30,
    getter: (u) => (Array.isArray(u.skills) ? u.skills.map((s) => s.name).join(", ") : "")
  },
  { key: "id", header: "شناسه یکتا در سامانه", width: 18, getter: (u) => u.id || "" },
];

/**
 * Generate formatted Excel (.xlsx) from Users array and trigger browser download
 */
export function exportPersonnelToExcel(users: User[], filename?: string): void {
  const exportRows = users.map((u) => {
    const rowObj: Record<string, string | number | boolean> = {};
    for (const col of PERSONNEL_EXPORT_COLUMNS) {
      rowObj[col.header] = col.getter ? col.getter(u) : ((u as any)[col.key] ?? "");
    }
    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);

  // Set RTL and column widths
  ws["!cols"] = PERSONNEL_EXPORT_COLUMNS.map((c) => ({ wch: c.width || 18 }));
  (ws as any)["!views"] = [{ rightToLeft: true }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Personnel_Data");

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const outName = filename || `ESP_Personnel_Report_${todayStr}.xlsx`;

  XLSX.writeFile(wb, outName);
}

/**
 * Generate formatted JSON from Users array and trigger browser download
 */
export function exportPersonnelToJson(users: User[], filename?: string): void {
  const jsonStr = JSON.stringify(users, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  link.href = url;
  link.download = filename || `ESP_Personnel_Backup_${todayStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download an empty or sample personnel template Excel
 */
export function downloadPersonnelTemplate(): void {
  const sampleUser: User = {
    id: "u-sample",
    name: "نمونه نام خانوادگی",
    personnelCode: "ESP-100",
    fullNameFa: "نمونه نام خانوادگی",
    fullName: "Sample Full Name",
    firstNameFa: "نمونه",
    lastNameFa: "نام خانوادگی",
    firstName: "Sample",
    lastName: "Full Name",
    nationalId: "0012345678",
    fatherName: "نام پدر نمونه",
    birthDate: "1370/01/01",
    birthPlace: "تهران",
    maritalStatus: "single",
    childrenCount: 0,
    militaryDuty: "پایان خدمت",
    email: "sample.user@euroslotpars.com",
    mobile: "09120000000",
    phone: "02188000000",
    extensionNumber: "199",
    address: "تهران، خیابان ولیعصر",
    company: "یورواسلات پارس",
    companyId: "euroslot",
    department: "Engineering",
    jobTitle: "کارشناس مهندسی",
    jobTitleEn: "Engineering Specialist",
    jobPosition: "کارشناس",
    workLocation: "دفتر تهران",
    floor: "3",
    unit: "مهندسی",
    subUnit: "طراحی",
    contractType: "تمام وقت",
    directManager: "مدیر فنی",
    joinedAt: "1402/01/15",
    daysInCompany: 500,
    education: "کارشناسی",
    fieldOfStudy: "مهندسی مکانیک",
    university: "دانشگاه صنعتی شریف",
    graduationDate: "1395",
    salary: 350000000,
    hasOvertime: true,
    maxOvertimeHours: 40,
    monthlyBonusType: "cash",
    monthlyBonusAmount: 20000000,
    monthlyBonusTitle: "پاداش بهره‌وری",
    insuranceNumber: "12345678",
    insuranceType: "socialSecurity",
    supplementaryPlan: "golden",
    supplementaryProvider: "بیمه ایران",
    bankAccount: "123-456-7890-1",
    shebaNumber: "IR000000000000000000000000",
    role: "engineer",
    status: "offline",
    accountStatus: "active",
    duties: ["طراحی قطعات مهندسی", "بررسی مستندات فنی"],
    skills: [{ name: "SolidWorks", rate: 85 }],
    isProfileCompleted: true,
    adminApproved: true,
    managerApproved: true,
    hrApproved: true,
  };

  exportPersonnelToExcel([sampleUser], "ESP_Personnel_Template.xlsx");
}

/**
 * Parses uploaded Excel (.xlsx, .xls) or JSON (.json) file into sanitized Partial<User>[]
 */
export async function parsePersonnelFile(file: File): Promise<{
  users: Partial<User>[];
  errors: string[];
}> {
  const filename = file.name.toLowerCase();
  const errors: string[] = [];
  const parsedUsers: Partial<User>[] = [];

  try {
    if (filename.endsWith(".json")) {
      const text = await file.text();
      let rawData: any;
      try {
        rawData = JSON.parse(text);
      } catch (err: any) {
        throw new Error("فرمت فایل JSON نامعتبر است: " + (err?.message || "Syntax Error"));
      }

      const list: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.users)
        ? rawData.users
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [rawData];

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (!item || typeof item !== "object") continue;
        const email = String(item.email || "").trim().toLowerCase();
        if (!email && !item.nationalId && !item.id && !item.name && !item.fullNameFa) {
          continue; // Skip useless records
        }
        parsedUsers.push({
          ...item,
          email: email || item.email,
          nationalId: normalizeNationalId(item.nationalId),
          mobile: normalizePhoneNumber(item.mobile || item.phone),
          phone: normalizePhoneNumber(item.phone),
        });
      }
    } else {
      // Excel workbook parsing
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("فایل اکسل فاقد شیت معتبر است.");
      }

      const sheet = wb.Sheets[firstSheetName];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      if (!rawRows || rawRows.length === 0) {
        throw new Error("هیچ رکوردی در فایل اکسل یافت نشد.");
      }

      for (let idx = 0; idx < rawRows.length; idx++) {
        const row = rawRows[idx];
        const userObj: Record<string, any> = {};

        // Iterate over keys and match against FIELD_ALIASES
        for (const [colKey, colVal] of Object.entries(row)) {
          const valStr = String(colVal ?? "").trim();
          if (!valStr) continue;

          const normKey = colKey
            .toLowerCase()
            .replace(/[\s\-_()/\\:.]/g, "")
            .trim();

          // Find matching alias
          let matchedTarget: keyof User | string | null = null;
          for (const [aliasKey, targetKey] of Object.entries(FIELD_ALIASES)) {
            const normAlias = aliasKey
              .toLowerCase()
              .replace(/[\s\-_()/\\:.]/g, "")
              .trim();
            if (normKey === normAlias) {
              matchedTarget = targetKey;
              break;
            }
          }

          if (matchedTarget) {
            userObj[matchedTarget] = valStr;
          }
        }

        // Handle auto-detection of email or national ID if unmapped
        if (!userObj.email) {
          for (const val of Object.values(row)) {
            const s = String(val).trim().toLowerCase();
            if (s.includes("@") && (s.includes(".com") || s.includes(".ir"))) {
              userObj.email = s;
              break;
            }
          }
        }

        if (!userObj.nationalId) {
          for (const val of Object.values(row)) {
            const s = String(val).replace(/[^\d]/g, "").trim();
            if (s.length === 10 && !s.startsWith("09")) {
              userObj.nationalId = s;
              break;
            }
          }
        }

        const email = String(userObj.email || "").trim().toLowerCase();
        const nationalId = normalizeNationalId(userObj.nationalId);
        const nameFa = userObj.fullNameFa || userObj.name || "";
        const nameEn = userObj.fullName || "";

        // If completely blank record, skip
        if (!email && !nationalId && !nameFa && !nameEn && !userObj.personnelCode) {
          continue;
        }

        // Normalize specific fields
        const salaryNum = userObj.salary ? Number(String(userObj.salary).replace(/[^\d]/g, "")) : undefined;
        const overtimeHoursNum = userObj.maxOvertimeHours ? Number(String(userObj.maxOvertimeHours).replace(/[^\d]/g, "")) : undefined;
        const bonusNum = userObj.monthlyBonusAmount ? Number(String(userObj.monthlyBonusAmount).replace(/[^\d]/g, "")) : undefined;
        const childrenNum = userObj.childrenCount ? Number(String(userObj.childrenCount).replace(/[^\d]/g, "")) : undefined;

        // Parse marital status
        let marital: "single" | "married" | undefined = undefined;
        if (userObj.maritalStatus) {
          const mStr = String(userObj.maritalStatus).toLowerCase();
          if (mStr.includes("متأهل") || mStr.includes("متاهل") || mStr.includes("married")) marital = "married";
          else if (mStr.includes("مجرد") || mStr.includes("single")) marital = "single";
        }

        // Parse has overtime
        let hasOvertimeBool: boolean | undefined = undefined;
        if (userObj.hasOvertime !== undefined) {
          const oStr = String(userObj.hasOvertime).toLowerCase();
          hasOvertimeBool = oStr === "true" || oStr === "بله" || oStr === "دارد" || oStr === "1";
        }

        // Auto-normalize department and role to standard organization chart
        const orgDept = userObj.department ? resolveOrganizationDepartment(userObj.department) : null;
        const orgRole = userObj.jobTitle ? resolveOrganizationRole(userObj.jobTitle) : null;

        // Clean user
        const cleanUser: Partial<User> = {
          ...userObj,
          email: email || undefined,
          nationalId: nationalId || undefined,
          mobile: normalizePhoneNumber(userObj.mobile || userObj.phone),
          phone: normalizePhoneNumber(userObj.phone),
          department: orgDept ? orgDept.nameFa : userObj.department,
          jobTitle: orgRole ? orgRole.titleFa : userObj.jobTitle,
          jobTitleEn: orgRole ? orgRole.titleEn : (userObj.jobTitleEn || undefined),
          salary: salaryNum !== undefined && !isNaN(salaryNum) ? salaryNum : undefined,
          maxOvertimeHours: overtimeHoursNum !== undefined && !isNaN(overtimeHoursNum) ? overtimeHoursNum : undefined,
          monthlyBonusAmount: bonusNum !== undefined && !isNaN(bonusNum) ? bonusNum : undefined,
          childrenCount: childrenNum !== undefined && !isNaN(childrenNum) ? childrenNum : undefined,
          maritalStatus: marital,
          hasOvertime: hasOvertimeBool,
          name: nameFa || nameEn || email.split("@")[0] || "کاربر",
          fullNameFa: nameFa || undefined,
          fullName: nameEn || undefined,
          accountStatus: (userObj.accountStatus as AccountStatus) || "active",
          role: (userObj.role as UserRole) || "staff",
        };

        parsedUsers.push(cleanUser);
      }
    }
  } catch (err: any) {
    errors.push(err?.message || "خطا در پردازش فایل");
  }

  return { users: parsedUsers, errors };
}
