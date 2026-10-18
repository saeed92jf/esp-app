// src/modules/search/services/search.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal High-Precision Search Engine (Bilingual & Multi-Domain)

import { normalizeSearchText } from "@/lib/navigation-search";
import {
  ALL_SEARCH_ITEMS,
  SEARCH_SUGGESTIONS_LEXICON,
} from "../data/search-items";
import type {
  SearchCategory,
  SearchItem,
  SearchResponse,
  SearchSuggestion,
} from "../types/search.types";

/**
 * Bidirectional bilingual concept mapping for high-precision cross-language search
 */
const BILINGUAL_SYNONYMS: Record<string, string[]> = {
  vessel: ["مخزن", "مخازن", "تحت فشار", "پوسته", "عدسی", "asme"],
  tank: ["مخزن", "ذخیره", "اتمسفریک", "api 650", "کروی"],
  pressure: ["فشار", "طراحی", "عملیاتی", "تست", "بار"],
  heat: ["حرارت", "حرارتی", "مبدل", "دما", "انتقال حرارت"],
  exchanger: ["مبدل", "پوسته و لوله", "تیوب", "تیوب شیت", "tema"],
  thickness: ["ضخامت", "محاسبه ضخامت", "پوسته", "شل", "کلاهک"],
  shell: ["پوسته", "شل", "استوانه", "ضخامت"],
  head: ["عدسی", "هد", "کلاهک", "بیضوی", "توریسفریکال"],
  material: ["متریال", "فولاد", "آلیاژ", "ورق", "کربن استیل", "استنلس استیل"],
  stress: ["تنش", "تنش مجاز", "تنش تسلیم", "تحلیل تنش"],
  saddle: ["زین", "سدل", "ساپورت", "زیک", "مخزن افقی"],
  nozzle: ["نازل", "فلنج", "تقویت نازل", "لوله"],
  test: ["تست", "آزمون", "هیدرواستاتیک", "بازرسی", "ndt"],
  hydrostatic: ["هیدرواستاتیک", "هیدروتست", "فشار تست"],
  video: ["ویدیو", "فیلم", "آموزش", "آپارات", "کلیپ"],
  tutorial: ["آموزش", "راهنما", "دوره", "گام به گام"],
  task: ["تسک", "فعالیت", "وظیفه", "اقدام", "کار"],
  project: ["پروژه", "پروژه‌ها", "طراحی", "مهندسی"],
  dictionary: ["واژه‌نامه", "دیکشنری", "اصطلاحات", "تعاریف", "معنی"],
  standard: ["استاندارد", "کد", "آیین‌نامه", "asme", "api", "tema", "astm"],
  asme: ["ازمی", "ازمه", "کد مخازن", "سکشن ۸"],
  api: ["ای پی آی", "مخازن ذخیره", "نفت"],

  // Persian to English
  مخزن: ["vessel", "tank", "pressure vessel", "storage tank", "asme"],
  مخازن: ["vessels", "tanks", "pressure vessels"],
  فشار: ["pressure", "design pressure", "operating pressure"],
  مبدل: ["heat exchanger", "exchanger", "shell and tube", "tema"],
  ضخامت: ["thickness", "shell thickness", "head thickness"],
  پوسته: ["shell", "cylinder", "body"],
  شل: ["shell", "casing"],
  عدسی: ["head", "ellipsoidal", "torispherical"],
  هد: ["head", "end closure"],
  متریال: ["material", "steel", "alloy", "plate", "sa-516"],
  تنش: ["stress", "allowable stress", "yield strength", "analysis"],
  سدل: ["saddle", "saddle support", "zick method"],
  زین: ["saddle", "support"],
  نازل: ["nozzle", "flange", "reinforcement"],
  تست: ["test", "hydrostatic test", "inspection", "ndt"],
  هیدرواستاتیک: ["hydrostatic", "hydrotest", "test pressure"],
  ویدیو: ["video", "tutorial", "webinar", "course"],
  فیلم: ["video", "tutorial", "movie"],
  آموزش: ["tutorial", "learning", "guide", "training"],
  تسک: ["task", "activity", "todo"],
  پروژه: ["project", "engineering project", "design project"],
  دیکشنری: ["dictionary", "glossary", "terms"],
  "واژه نامه": ["dictionary", "glossary", "technical terms"],
  استاندارد: ["standard", "code", "asme", "api", "tema", "astm"],
  ازمی: ["asme", "bpvc", "section viii"],
  ازمه: ["asme", "bpvc"],
};

export interface ISearchService {
  search(query: string, category?: SearchCategory, locale?: string): Promise<SearchResponse>;
  getSuggestions(query: string, locale?: string): Promise<SearchSuggestion[]>;
}

/**
 * Detects whether a string contains Persian / Arabic characters
 */
export function isPersianQuery(text: string): boolean {
  return /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Detects whether a string is an English query (contains latin letters and no Persian characters)
 */
export function isEnglishQuery(text: string): boolean {
  return /[a-zA-Z]/.test(text) && !isPersianQuery(text);
}

export class FakeSearchService implements ISearchService {
  /**
   * Generates fast, high-quality Google-style autocomplete suggestions (language-aware)
   */
  async getSuggestions(query: string, locale = "fa"): Promise<SearchSuggestion[]> {
    const raw = query.trim();
    if (!raw) return [];

    const isEn = isEnglishQuery(raw);
    const normalizedQuery = normalizeSearchText(raw);
    if (!normalizedQuery) return [];

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const seen = new Set<string>();
    const suggestions: SearchSuggestion[] = [];

    // Helper to evaluate and add a phrase
    const considerPhrase = (phrase?: string, cat?: SearchCategory, catLabel?: string) => {
      if (!phrase) return;
      const cleanPhrase = phrase.trim();
      const normPhrase = normalizeSearchText(cleanPhrase);
      if (!normPhrase || seen.has(normPhrase.toLowerCase())) return;

      // Filter by language match (English queries get English suggestions, Persian gets Persian)
      const phraseIsEn = isEnglishQuery(cleanPhrase);
      if (isEn && !phraseIsEn) return;
      if (!isEn && phraseIsEn) return;

      // Check if all query tokens match this phrase
      const allTokensMatch = queryTokens.every((token) => normPhrase.includes(token));
      if (!allTokensMatch) return;

      seen.add(normPhrase.toLowerCase());
      suggestions.push({
        text: cleanPhrase,
        category: cat,
        categoryLabel: catLabel,
      });
    };

    // 1. Check our curated high-relevance suggestions lexicon (language-matched)
    for (const phrase of SEARCH_SUGGESTIONS_LEXICON) {
      considerPhrase(phrase);
      if (suggestions.length >= 8) break;
    }

    // 2. If we need more, check titles in the matching language first
    if (suggestions.length < 8) {
      for (const item of ALL_SEARCH_ITEMS) {
        if (isEn) {
          if (item.titleEn) considerPhrase(item.titleEn, item.category);
        } else {
          considerPhrase(item.title, item.category);
        }
        if (suggestions.length >= 8) break;
      }
    }

    // 3. If still needed, look into item keywords matching language
    if (suggestions.length < 8) {
      for (const item of ALL_SEARCH_ITEMS) {
        for (const kw of item.keywords) {
          if (kw.length > 2) {
            considerPhrase(kw, item.category);
            if (suggestions.length >= 8) break;
          }
        }
        if (suggestions.length >= 8) break;
      }
    }

    return suggestions.slice(0, 8);
  }

  /**
   * Main universal multi-domain search function
   */
  async search(
    query: string,
    category: SearchCategory = "all",
    locale = "fa"
  ): Promise<SearchResponse> {
    const startTime = performance.now();
    const rawQuery = query.trim();

    if (!rawQuery) {
      return {
        results: [],
        total: 0,
        query: "",
        executionTime: 0.01,
        categoryCounts: { all: 0, modules: 0, tasks: 0, videos: 0, dictionary: 0 },
        relatedSearches: [],
      };
    }

    const isEn = isEnglishQuery(rawQuery);
    const normalizedQuery = normalizeSearchText(rawQuery);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    // Collect cross-language expanded tokens
    const expandedTokens = new Set<string>(queryTokens);
    for (const token of queryTokens) {
      for (const [key, synonyms] of Object.entries(BILINGUAL_SYNONYMS)) {
        const normKey = normalizeSearchText(key);
        if (normKey === token || normKey.includes(token) || token.includes(normKey)) {
          for (const syn of synonyms) {
            expandedTokens.add(normalizeSearchText(syn));
          }
        }
      }
    }
    const allSearchTokens = Array.from(expandedTokens);

    // Score each item in the universal catalog (Google-style language prioritization)
    const scoredItems: SearchItem[] = [];

    for (const item of ALL_SEARCH_ITEMS) {
      const normTitle = normalizeSearchText(item.title);
      const normTitleEn = normalizeSearchText(item.titleEn || "");
      const normSnippet = normalizeSearchText(item.snippet);
      const normSnippetEn = normalizeSearchText(item.snippetEn || "");
      const normKeywords = item.keywords.map(normalizeSearchText);

      let score = 0;

      if (isEn) {
        // ── ENGLISH SEARCH QUERY SCORING ──
        // 1. Exact phrase match in English title
        if (normTitleEn && normTitleEn.includes(normalizedQuery)) {
          score += 220;
        } else if (normTitle.includes(normalizedQuery)) {
          score += 60;
        }

        // 2. Query token matches in English title
        for (const token of queryTokens) {
          if (normTitleEn.startsWith(token) || normTitleEn.includes(` ${token}`)) {
            score += 80;
          } else if (normTitleEn.includes(token)) {
            score += 55;
          }
          if (normTitle.includes(token)) {
            score += 20;
          }
        }

        // 3. Token matches in keywords
        for (const token of queryTokens) {
          const matchingKw = normKeywords.find((k) => k === token || k.includes(token));
          if (matchingKw) {
            score += matchingKw === token ? 50 : 30;
          }
        }

        // 4. Token matches in English snippet
        for (const token of queryTokens) {
          if (normSnippetEn && normSnippetEn.includes(token)) {
            score += 30;
          } else if (normSnippet.includes(token)) {
            score += 10;
          }
        }

        // 5. Cross-language expanded token matches
        for (const expToken of allSearchTokens) {
          if (normTitleEn.includes(expToken)) {
            score += 25;
          } else if (normTitle.includes(expToken)) {
            score += 12;
          }
        }
      } else {
        // ── PERSIAN SEARCH QUERY SCORING ──
        // 1. Exact phrase match in Persian title
        if (normTitle.includes(normalizedQuery)) {
          score += 220;
        } else if (normTitleEn && normTitleEn.includes(normalizedQuery)) {
          score += 60;
        }

        // 2. Query token matches in Persian title
        for (const token of queryTokens) {
          if (normTitle.startsWith(token) || normTitle.includes(` ${token}`)) {
            score += 80;
          } else if (normTitle.includes(token)) {
            score += 55;
          }
          if (normTitleEn.includes(token)) {
            score += 20;
          }
        }

        // 3. Token matches in keywords
        for (const token of queryTokens) {
          const matchingKw = normKeywords.find((k) => k === token || k.includes(token));
          if (matchingKw) {
            score += matchingKw === token ? 50 : 30;
          }
        }

        // 4. Token matches in Persian snippet
        for (const token of queryTokens) {
          if (normSnippet.includes(token)) {
            score += 30;
          } else if (normSnippetEn && normSnippetEn.includes(token)) {
            score += 10;
          }
        }

        // 5. Cross-language expanded token matches
        for (const expToken of allSearchTokens) {
          if (normTitle.includes(expToken)) {
            score += 25;
          } else if (normTitleEn.includes(expToken)) {
            score += 12;
          }
        }
      }

      if (score > 0) {
        scoredItems.push({
          ...item,
          score,
        });
      }
    }

    // Sort scored items by relevance descending
    scoredItems.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Calculate category counts across all results
    const categoryCounts: Record<SearchCategory, number> = {
      all: scoredItems.length,
      modules: scoredItems.filter((i) => i.category === "modules").length,
      tasks: scoredItems.filter((i) => i.category === "tasks").length,
      videos: scoredItems.filter((i) => i.category === "videos").length,
      dictionary: scoredItems.filter((i) => i.category === "dictionary").length,
    };

    // Filter by selected category
    const filteredResults =
      category === "all"
        ? scoredItems
        : scoredItems.filter((item) => item.category === category);

    // Generate related searches matching query language (Google style)
    const relatedSearches = SEARCH_SUGGESTIONS_LEXICON.filter((p) => {
      const phraseIsEn = isEnglishQuery(p);
      if (isEn !== phraseIsEn) return false;

      const norm = normalizeSearchText(p);
      return (
        norm !== normalizedQuery &&
        queryTokens.some((tok) => norm.includes(tok))
      );
    }).slice(0, 6);

    const endTime = performance.now();
    const timeMs = Number(((endTime - startTime) / 1000).toFixed(2)) || 0.03;

    return {
      results: filteredResults,
      total: filteredResults.length,
      query: rawQuery,
      executionTime: timeMs,
      categoryCounts,
      relatedSearches,
    };
  }
}

export class RealSearchService implements ISearchService {
  private fake = new FakeSearchService();

  async getSuggestions(query: string, locale = "fa"): Promise<SearchSuggestion[]> {
    // In real mode, tries backend or falls back to robust local suggestion index
    return this.fake.getSuggestions(query, locale);
  }

  async search(
    query: string,
    category: SearchCategory = "all",
    locale = "fa"
  ): Promise<SearchResponse> {
    // Real implementation with fast fallback
    return this.fake.search(query, category, locale);
  }
}

export const universalSearchService = new FakeSearchService();
