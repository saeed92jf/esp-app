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
    nameFa: "هلدینگ و گروه (هر دو شرکت)",
    nameEn: "Group / Holding",
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
