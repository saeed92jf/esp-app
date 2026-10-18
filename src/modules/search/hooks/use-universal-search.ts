// src/modules/search/hooks/use-universal-search.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Search Custom Hook

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useLocale } from "next-intl";
import { universalSearchService } from "../services/search.service";
import type {
  SearchCategory,
  SearchResponse,
  SearchSuggestion,
} from "../types/search.types";

interface UseUniversalSearchOptions {
  initialQuery?: string;
  initialCategory?: SearchCategory;
}

export function useUniversalSearch(options: UseUniversalSearchOptions = {}) {
  const locale = useLocale();
  const [query, setQuery] = useState(options.initialQuery || "");
  const [category, setCategory] = useState<SearchCategory>(
    options.initialCategory || "all"
  );
  const [response, setResponse] = useState<SearchResponse>({
    results: [],
    total: 0,
    query: options.initialQuery || "",
    executionTime: 0.03,
    categoryCounts: { all: 0, modules: 0, tasks: 0, videos: 0, dictionary: 0 },
    relatedSearches: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResponse({
        results: [],
        total: 0,
        query: "",
        executionTime: 0.01,
        categoryCounts: { all: 0, modules: 0, tasks: 0, videos: 0, dictionary: 0 },
        relatedSearches: [],
      });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      universalSearchService
        .search(trimmed, category, locale)
        .then((res) => {
          startTransition(() => {
            setResponse(res);
            setIsSearching(false);
          });
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 150);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, category, locale]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    response,
    isSearching,
  };
}

export function useSearchSuggestions(query: string) {
  const locale = useLocale();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      return;
    }

    let active = true;
    universalSearchService.getSuggestions(trimmed, locale).then((list) => {
      if (active) setSuggestions(list);
    });

    return () => {
      active = false;
    };
  }, [query, locale]);

  return suggestions;
}
