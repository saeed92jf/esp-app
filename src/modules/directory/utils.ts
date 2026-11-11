import type { CompanyRoleInfo, PersonnelItem } from "./types";

/**
 * Extracts the appropriate language segment from bilingual slash-separated strings,
 * e.g., "Engineering / مهندسی" or "دفتر تهران / Tehran Office" or "کارشناسی ارشد (فوق لیسانس) / Master's Degree".
 */
export function getLocalizedText(rawText: string | null | undefined, locale: string): string {
  if (!rawText) return "";
  const trimmed = rawText.trim();
  if (!trimmed.includes("/")) return trimmed;

  const parts = trimmed.split("/").map((s) => s.trim());
  if (parts.length < 2) return trimmed;

  // Detect Persian characters in parts
  const isFirstFa = /[\u0600-\u06FF]/.test(parts[0]);
  const isSecondFa = /[\u0600-\u06FF]/.test(parts[1]);

  if (locale === "fa") {
    if (isFirstFa) return parts[0];
    if (isSecondFa) return parts[1];
    return parts[0];
  } else {
    // English or LTR
    if (!isFirstFa && isSecondFa) return parts[0];
    if (isFirstFa && !isSecondFa) return parts[1];
    return parts[1] || parts[0];
  }
}

/**
 * Gets the localized job title for a company role info.
 */
export function getLocalizedJobTitle(roleInfo: CompanyRoleInfo | undefined | null, locale: string): string {
  if (!roleInfo) return "";
  const isFa = locale === "fa";
  if (isFa) {
    return roleInfo.jobTitleFa || roleInfo.jobTitleEn || "";
  } else {
    return roleInfo.jobTitleEn || roleInfo.jobTitleFa || "";
  }
}

/**
 * Returns strictly the name in the active language:
 * In Persian (fa): ONLY the Persian name.
 * In English (en): ONLY the English name.
 * Never displays or leaks the opposite language name.
 */
export function getSingleLocalizedName(person: PersonnelItem, locale: string): string {
  const isFa = locale === "fa";
  if (isFa) {
    return person.fullNameFa || person.fullNameEn || "";
  } else {
    return person.fullNameEn || person.fullNameFa || "";
  }
}
