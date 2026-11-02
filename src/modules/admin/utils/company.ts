export type CompanyId = "euroslot" | "npceram" | "holding";
export type CompanyScope = "euroslot" | "npceram" | "holding" | "all";

export interface CompanyInfo {
  id: CompanyId;
  nameFa: string;
  nameEn: string;
  domain: string;
}

/**
 * لیست سفید ایمیل‌های سازمانی مجاز برای جایگاه مدیریت ارشد هلدینگ / رئیس هیئت مدیره گروه
 * این ایمیل‌ها به عنوان مدیر بالادستی شناخته شده و به هر دو شرکت یورواسلات و نانو پالایش دسترسی دارند.
 */
export const HOLDING_EXECUTIVE_EMAILS: string[] = [
  "chairman@euroslotpars.com",
  "ceo@euroslotpars.com",
  "director@euroslotpars.com",
  "holding@euroslotpars.com",
  "group.ceo@euroslotpars.com",
  "board@euroslotpars.com",
  "s.jalili@euroslotpars.com",
  "saeed@euroslotpars.com",
];

/**
 * بررسی می‌کند آیا ایمیل متعلق به مدیران ارشد بالادستی گروه/هلدینگ است یا خیر
 */
export function isHoldingExecutiveEmail(email?: string): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return (
    HOLDING_EXECUTIVE_EMAILS.includes(lower) ||
    lower.startsWith("chairman@") ||
    lower.startsWith("holding@") ||
    lower.startsWith("group.") ||
    lower.startsWith("board@")
  );
}

export const ALLOWED_COMPANY_DOMAINS = ["euroslotpars.com", "npceram.com"] as const;
export type AllowedCompanyDomain = (typeof ALLOWED_COMPANY_DOMAINS)[number];

export const CORPORATE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(euroslotpars\.com|npceram\.com)$/i;

/**
 * بررسی صحت ساختار ایمیل و تعلق آن به دامنه‌های رسمی یورواسلات پارس یا نانو پالایش
 */
export function isValidCorporateEmail(email?: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return CORPORATE_EMAIL_REGEX.test(trimmed) || isHoldingExecutiveEmail(trimmed);
}

/**
 * استخراج نام کاربری پیش از علامت @
 */
export function extractEmailUsername(email?: string): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  return atIndex >= 0 ? email.slice(0, atIndex).trim() : email.trim();
}

/**
 * استخراج دامنه پس از علامت @
 */
export function extractEmailDomain(email?: string): string | null {
  if (!email) return null;
  const atIndex = email.indexOf("@");
  return atIndex >= 0 ? email.slice(atIndex + 1).trim().toLowerCase() : null;
}

/**
 * اعمال دامنه سازمانی هدف به ایمیل فعلی
 * اگر قبلاً نام کاربری وارد شده باشد، دامنه آن جایگزین می‌شود.
 */
export function formatEmailWithDomain(
  currentEmail: string,
  targetDomain: AllowedCompanyDomain
): string {
  const username = extractEmailUsername(currentEmail);
  if (!username) {
    return `@${targetDomain}`;
  }
  return `${username}@${targetDomain}`;
}

export const COMPANIES: Record<CompanyId, CompanyInfo> = {
  euroslot: {
    id: "euroslot",
    nameFa: "یورواسلات پارس",
    nameEn: "Euroslot Pars",
    domain: "euroslotpars.com",
  },
  npceram: {
    id: "npceram",
    nameFa: "نانو پالایش",
    nameEn: "NPCeram",
    domain: "npceram.com",
  },
  holding: {
    id: "holding",
    nameFa: "هلدینگ",
    nameEn: "Holding",
    domain: "euroslotpars.com",
  },
};

/**
 * Automatically detects company from email:
 * 1. Holding executive whitelist -> هلدینگ و گروه (هر دو شرکت)
 * 2. Emails matching 'npceram' -> نانو پالایش (npceram.com)
 * 3. Emails matching 'euroslot' or any other corporate domain -> یورو اسلات (euroslotpars.com)
 */
export function getCompanyFromEmail(email?: string): CompanyInfo {
  const lower = (email || "").trim().toLowerCase();
  if (isHoldingExecutiveEmail(lower)) {
    return COMPANIES.holding;
  }
  if (lower.includes("npceram")) {
    return COMPANIES.npceram;
  }
  return COMPANIES.euroslot;
}
