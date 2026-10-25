export type CompanyId = "euroslot" | "npceram";

export interface CompanyInfo {
  id: CompanyId;
  nameFa: string;
  nameEn: string;
  domain: string;
}

export const COMPANIES: Record<CompanyId, CompanyInfo> = {
  euroslot: {
    id: "euroslot",
    nameFa: "یورو اسلات",
    nameEn: "Euroslot",
    domain: "euroslotpars.com",
  },
  npceram: {
    id: "npceram",
    nameFa: "نانو پالایش",
    nameEn: "Nano Palaesh",
    domain: "npceram.com",
  },
};

/**
 * Automatically detects company from email domain:
 * - Emails matching 'npceram' -> نانو پالایش (npceram.com)
 * - Emails matching 'euroslot' or any other corporate domain -> یورو اسلات (euroslotpars.com)
 */
export function getCompanyFromEmail(email?: string): CompanyInfo {
  const lower = (email || "").trim().toLowerCase();
  if (lower.includes("npceram")) {
    return COMPANIES.npceram;
  }
  return COMPANIES.euroslot;
}
