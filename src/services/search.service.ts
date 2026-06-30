// src/services/search.service.ts
import type { HttpClient } from './core/http';
import type { LucideIcon } from 'lucide-react';
import { NAVIGATION } from '@/config/navigation';
import { NAV_SEARCH_SOURCE } from '@/lib/navigation-search';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  href: string;
  title: string;
  section: string;
  type: 'navigation' | 'page' | 'user' | 'project' | 'document';
  icon?: LucideIcon;
  /** متن خلاصه برای نتایج محتوا */
  excerpt?: string;
}

export interface SearchPayload {
  query: string;
  locale?: string;
  /** انواع محدود کردن جستجو */
  types?: SearchResult['type'][];
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ISearchService {
  search(payload: SearchPayload): Promise<SearchResponse>;
  /** جستجوی سریع فقط در منو (برای header search) */
  searchNavigation(query: string, locale?: string): Promise<SearchResult[]>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

export class FakeSearchService implements ISearchService {
  async search({ query, locale = 'fa', types, limit = 20 }: SearchPayload): Promise<SearchResponse> {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return { results: [], total: 0, query };

    // جستجو در navigation
    const navResults: SearchResult[] = NAV_SEARCH_SOURCE
      .filter((item) =>
        item.labelKey.toLowerCase().includes(q) ||
        item.sectionLabelKey.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
      )
      .map((item) => ({
        href: item.href,
        title: item.labelKey,    // در real server ترجمه‌شده می‌آید
        section: item.sectionLabelKey,
        type: 'navigation' as const,
        icon: item.icon,
      }));

    const results = types
      ? navResults.filter((r) => types.includes(r.type))
      : navResults;

    return {
      results: results.slice(0, limit),
      total: results.length,
      query,
    };
  }

  async searchNavigation(query: string): Promise<SearchResult[]> {
    const { results } = await this.search({ query, types: ['navigation'] });
    return results;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealSearchService implements ISearchService {
  constructor(private http: HttpClient) {}

  async search(payload: SearchPayload): Promise<SearchResponse> {
    return this.http.get<SearchResponse>('/search', { params: payload as Record<string, string> });
  }

  async searchNavigation(query: string, locale = 'fa'): Promise<SearchResult[]> {
    const res = await this.search({ query, locale, types: ['navigation'], limit: 10 });
    return res.results;
  }
}
