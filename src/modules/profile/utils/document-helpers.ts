import { DocumentCategory, UserUploadedDocument } from "../types/profile";

export interface DocumentTypeDefinition {
  category: DocumentCategory;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
}

export const DOCUMENT_TYPE_DEFINITIONS: Record<DocumentCategory, DocumentTypeDefinition> = {
  national_card_front: {
    category: "national_card_front",
    titleFa: "تصویر روی کارت ملی",
    titleEn: "National ID Card (Front)",
    descriptionFa: "تصویر واضح، خوانا و باکیفیت از روی کارت هوشمند ملی یا رسید ثبت‌نام",
    descriptionEn: "Clear and legible photo of the front side of national ID card",
  },
  national_card_back: {
    category: "national_card_back",
    titleFa: "تصویر پشت کارت ملی",
    titleEn: "National ID Card (Back)",
    descriptionFa: "تصویر واضح از پشت کارت هوشمند ملی شامل بارکد و کد رهگیری",
    descriptionEn: "Clear photo of the back side of national ID card",
  },
  birth_certificate: {
    category: "birth_certificate",
    titleFa: "تصویر صفحات شناسنامه",
    titleEn: "Birth Certificate Pages",
    descriptionFa: "تصویر خوانا از صفحه اول (و صفحه توضیحات/همسر در صورت تاهل)",
    descriptionEn: "Clear photo of identity pages of the birth certificate",
  },
  university_degree: {
    category: "university_degree",
    titleFa: "تصویر آخرین مدرک دانشگاهی",
    titleEn: "Latest University Degree",
    descriptionFa: "تصویر باکیفیت از اصل آخرین دانشنامه، گواهی موقت پایان تحصیلات یا استعلام دانشگاهی",
    descriptionEn: "Official photo of your highest/latest university diploma or graduation certificate",
  },
  other: {
    category: "other",
    titleFa: "سایر مدارک و دوره‌های تخصصی",
    titleEn: "Other / Professional Certifications",
    descriptionFa: "عکس گواهی‌نامه‌های آموزشی، دوره‌های بین‌المللی یا سوابق تخصصی",
    descriptionEn: "Specialized training certificates or work credentials photo",
  },
};

/**
 * Resolves the localized display title for any uploaded document.
 * 1. Checks category against known definitions.
 * 2. If title matches known legacy Persian/English titles, translates to current locale.
 * 3. Falls back to original title or fileName.
 */
export function getLocalizedDocumentTitle(
  doc: { category?: string; title?: string; fileName?: string } | undefined | null,
  locale: string
): string {
  if (!doc) return "";
  const isFa = locale === "fa";

  // Check by category first
  if (doc.category && doc.category in DOCUMENT_TYPE_DEFINITIONS) {
    const def = DOCUMENT_TYPE_DEFINITIONS[doc.category as DocumentCategory];
    // If the category is 'other' and a custom title is provided, prefer custom title
    if (doc.category === "other" && doc.title && !doc.title.includes("سایر") && !doc.title.toLowerCase().includes("other")) {
      return doc.title;
    }
    return isFa ? def.titleFa : def.titleEn;
  }

  // If no recognized category, try to match by title
  const rawTitle = (doc.title || "").trim();
  if (rawTitle) {
    // National ID Front
    if (
      rawTitle.includes("روی کارت ملی") ||
      (rawTitle.toLowerCase().includes("national id") && rawTitle.toLowerCase().includes("front")) ||
      rawTitle.toLowerCase().includes("national_id_front")
    ) {
      return isFa ? "تصویر روی کارت ملی" : "National ID Card (Front)";
    }
    // National ID Back
    if (
      rawTitle.includes("پشت کارت ملی") ||
      (rawTitle.toLowerCase().includes("national id") && rawTitle.toLowerCase().includes("back")) ||
      rawTitle.toLowerCase().includes("national_id_back")
    ) {
      return isFa ? "تصویر پشت کارت ملی" : "National ID Card (Back)";
    }
    // Birth Certificate
    if (
      rawTitle.includes("شناسنامه") ||
      rawTitle.toLowerCase().includes("birth certificate") ||
      rawTitle.toLowerCase().includes("birth_certificate")
    ) {
      return isFa ? "تصویر صفحات شناسنامه" : "Birth Certificate Pages";
    }
    // University Degree / Highest Degree
    if (
      rawTitle.includes("مدرک") ||
      rawTitle.includes("دانشنامه") ||
      rawTitle.toLowerCase().includes("degree") ||
      rawTitle.toLowerCase().includes("diploma")
    ) {
      return isFa ? "تصویر آخرین مدرک دانشگاهی" : "Latest University Degree";
    }
    return rawTitle;
  }

  return doc.fileName || (isFa ? "مدرک بارگذاری شده" : "Uploaded Document");
}

