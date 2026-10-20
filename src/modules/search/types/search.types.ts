// src/modules/search/types/search.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Search Types & Interfaces

export type SearchCategory =
  | "all"
  | "modules"
  | "tasks"
  | "videos"
  | "dictionary"
  | "didYouKnow";

export interface SearchItem {
  id: string;
  title: string;
  titleEn?: string;
  category: SearchCategory;
  href: string;
  snippet: string;
  snippetEn?: string;
  breadcrumbs: string[];
  breadcrumbsEn?: string[];
  iconName?: string;
  badge?: string;
  badgeEn?: string;
  metadata?: {
    date?: string;
    standard?: string;
    duration?: string;
    author?: string;
    views?: string;
    categoryName?: string;
    status?: string;
  };
  keywords: string[];
  score?: number;
}

export interface SearchSuggestion {
  text: string;
  category?: SearchCategory;
  categoryLabel?: string;
}

export interface SearchStats {
  total: number;
  timeMs: number;
  query: string;
}

export interface SearchResponse {
  results: SearchItem[];
  total: number;
  query: string;
  executionTime: number;
  categoryCounts: Record<SearchCategory, number>;
  relatedSearches: string[];
}
