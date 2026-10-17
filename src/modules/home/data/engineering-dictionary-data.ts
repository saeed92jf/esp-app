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
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience" | "corporate";
  categoryName: string;
  term: string;
  secondaryTerm?: string;
  abbreviation?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

/**
 * Interleave and shuffle terms across categories deterministically.
 * This guarantees diverse, colorful cards next to each other on load
 * while keeping 100% deterministic output between SSR and Client.
 */
export function interleaveDictionaryTerms(terms: readonly DictionaryItem[], baseSeed?: number): DictionaryItem[] {
  const groups: Record<string, DictionaryItem[]> = {};
  for (const item of terms) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push({ ...item });
  }

  // Seeded shuffle function
  const seededShuffle = (arr: DictionaryItem[], seed: number): DictionaryItem[] => {
    const copy = [...arr];
    let s = Math.abs(seed) || 999;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Base categories for round-robin interleaving
  const baseCategories = [
    "corporate",
    "materials",
    "equipment",
    "jargon",
    "inspection",
    "experience",
  ];

  // Shuffle the round-robin category order using seed so a different category leads on each load
  let catSeed = (baseSeed ?? 999) + 31;
  const categoryOrder = [...baseCategories];
  for (let i = categoryOrder.length - 1; i > 0; i--) {
    catSeed = (catSeed * 9301 + 49297) % 233280;
    const j = Math.floor((catSeed / 233280) * (i + 1));
    [categoryOrder[i], categoryOrder[j]] = [categoryOrder[j], categoryOrder[i]];
  }

  const shuffledGroups: Record<string, DictionaryItem[]> = {};
  let seed = baseSeed ?? 999;
  for (const cat in groups) {
    shuffledGroups[cat] = seededShuffle(groups[cat], seed++);
  }

  const result: DictionaryItem[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const cat of categoryOrder) {
      const g = shuffledGroups[cat];
      if (g && g.length > 0) {
        result.push(g.shift()!);
        added = true;
      }
    }
    for (const cat in shuffledGroups) {
      if (shuffledGroups[cat].length > 0) {
        result.push(shuffledGroups[cat].shift()!);
        added = true;
      }
    }
  }

  return result;
}

export function getDictionaryCategories(locale: string): readonly DictionaryCategoryItem[] {
  return locale === "fa" ? DICTIONARY_CATEGORIES_FA : DICTIONARY_CATEGORIES_EN;
}

export function getDictionaryTerms(locale: string, baseSeed?: number): DictionaryItem[] {
  const raw = locale === "fa" ? ENGINEERING_TERMS_FA : ENGINEERING_TERMS_EN;
  return interleaveDictionaryTerms(raw, baseSeed);
}

// Re-export original arrays and types for backward compatibility
export {
  DICTIONARY_CATEGORIES_FA,
  ENGINEERING_TERMS_FA,
  DICTIONARY_CATEGORIES_EN,
  ENGINEERING_TERMS_EN,
};
export type { PersianDictionaryTerm, EnglishDictionaryTerm };
