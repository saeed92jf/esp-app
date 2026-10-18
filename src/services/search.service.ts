// src/services/search.service.ts
import type { HttpClient } from "./core/http";
import type { LucideIcon } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { NAV_SEARCH_SOURCE } from "@/lib/navigation-search";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  href: string;
  title: string;
  section: string;
  type: "navigation" | "page" | "user" | "project" | "document";
  icon?: LucideIcon;
  /** متن خلاصه برای نتایج محتوا */
  excerpt?: string;
}

export interface SearchPayload {
  query: string;
  locale?: string;
  /** انواع محدود کردن جستجو */
  types?: SearchResult["type"][];
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

import { universalSearchService } from "@/modules/search/services/search.service";

export class FakeSearchService implements ISearchService {
  async search({
    query,
    locale = "fa",
    types,
    limit = 20,
  }: SearchPayload): Promise<SearchResponse> {
    const q = query.toLowerCase().trim();
    if (q.length < 1) return { results: [], total: 0, query };

    const uniRes = await universalSearchService.search(q, "all", locale);
    const results: SearchResult[] = uniRes.results.map((item) => ({
      href: item.href,
      title: item.title,
      section: item.breadcrumbs[item.breadcrumbs.length - 1] || item.category,
      type: (item.category === "modules" ? "navigation" : item.category === "tasks" ? "project" : "document") as SearchResult["type"],
      excerpt: item.snippet,
    }));

    const filtered = types ? results.filter((r) => types.includes(r.type)) : results;

    return {
      results: filtered.slice(0, limit),
      total: filtered.length,
      query,
    };
  }

  async searchNavigation(query: string): Promise<SearchResult[]> {
    const { results } = await this.search({ query, types: ["navigation"] });
    return results;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealSearchService implements ISearchService {
  constructor(private http: HttpClient) {}

  async search(payload: SearchPayload): Promise<SearchResponse> {
    const params = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean | undefined>;

    return this.http.get<SearchResponse>("/search", { params });
  }

  async searchNavigation(
    query: string,
    locale = "fa",
  ): Promise<SearchResult[]> {
    const res = await this.search({
      query,
      locale,
      types: ["navigation"],
      limit: 10,
    });
    return res.results;
  }
}
