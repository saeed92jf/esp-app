import {
  DICTIONARY_CATEGORIES_FA,
  ENGINEERING_TERMS_FA,
  type PersianDictionaryTerm,
} from "./engineering-dictionary.fa";
import {
  DICTIONARY_CATEGORIES_EN,
  ENGINEERING_TERMS_EN,
  type EnglishDictionaryTerm,
} from "./engineering-dictionary.en";

export interface DictionaryCategoryItem {
  id: string;
  label: string;
  count: number;
}

export interface DictionaryItem {
  id: string;
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience";
  categoryName: string;
  term: string;
  secondaryTerm?: string;
  abbreviation?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

export function getDictionaryCategories(locale: string): readonly DictionaryCategoryItem[] {
  return locale === "fa" ? DICTIONARY_CATEGORIES_FA : DICTIONARY_CATEGORIES_EN;
}

export function getDictionaryTerms(locale: string): DictionaryItem[] {
  if (locale === "fa") {
    return ENGINEERING_TERMS_FA;
  }
  return ENGINEERING_TERMS_EN;
}

// Re-export original arrays and types for backward compatibility
export {
  DICTIONARY_CATEGORIES_FA,
  ENGINEERING_TERMS_FA,
  DICTIONARY_CATEGORIES_EN,
  ENGINEERING_TERMS_EN,
};
export type { PersianDictionaryTerm, EnglishDictionaryTerm };
