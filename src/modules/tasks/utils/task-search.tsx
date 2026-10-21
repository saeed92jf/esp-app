// src/modules/tasks/utils/task-search.tsx
"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes text for Persian & English search
 * Handles:
 * - Lowercasing
 * - Arabic Yeh (ي) -> Persian Yeh (ی)
 * - Arabic Kaf (ك) -> Persian Keheh (ک)
 * - Alef with Madd/Hamza (آ, أ, إ) -> Alef (ا)
 * - Teh Marbuta (ة) -> Heh (ه)
 * - Removes Arabic Tashkeel / Diacritics
 * - Normalizes Zero-Width Non-Joiner (ZWNJ \u200C / \u200D) into spaces
 */
export function normalizeSearchTerm(text?: string | null): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u200C\u200D]/g, " ")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a regex pattern that matches the search query in raw text,
 * accounting for Persian/Arabic character variants and optional ZWNJ.
 */
export function buildTokenRegexPattern(token: string): string {
  const chars = Array.from(token);
  const patternParts = chars.map((char) => {
    switch (char) {
      case "ی":
      case "ي":
        return "[یي]";
      case "ک":
      case "ك":
        return "[کك]";
      case "ا":
      case "آ":
      case "أ":
      case "إ":
        return "[اآأإ]";
      case "ه":
      case "ة":
        return "[هة]";
      case " ":
        return "[\\s\\u200C\\u200D]+";
      default:
        return escapeRegExp(char);
    }
  });

  return patternParts.join("[\\u200C\\u200D\\u064B-\\u065F]?");
}

/**
 * Builds a single unified RegExp for all query tokens for highlighting
 */
export function buildMultiQueryRegex(queries: (string | undefined | null)[]): RegExp | null {
  const allTokens = new Set<string>();

  queries.forEach((q) => {
    if (!q || !q.trim()) return;
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((t) => {
      if (t.length > 0) allTokens.add(t);
    });
  });

  if (allTokens.size === 0) return null;

  const patterns = Array.from(allTokens).map((t) => buildTokenRegexPattern(t));
  return new RegExp(`(${patterns.join("|")})`, "gi");
}

/**
 * Checks if a set of candidate text fields matches a search query
 * Supports multi-token search: all tokens must be found across the fields
 */
export function matchesSmartSearch(
  fields: (string | undefined | null)[],
  query?: string | null
): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return true;

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return true;

  const normalizedFields = fields
    .filter((f): f is string => Boolean(f && typeof f === "string"))
    .map(normalizeSearchTerm);

  // Every token must match in at least one of the fields
  return queryTokens.every((token) =>
    normalizedFields.some((field) => field.includes(token))
  );
}

interface HighlightMatchProps {
  text?: string | null;
  query?: string | null;
  queries?: (string | undefined | null)[];
  className?: string;
  highlightClassName?: string;
}

/**
 * Renders text with smart highlighting for matching tokens
 */
export function HighlightMatch({
  text,
  query,
  queries,
  className,
  highlightClassName,
}: HighlightMatchProps) {
  if (!text) return null;

  const allQueries = useMemo(() => {
    const list: (string | undefined | null)[] = [];
    if (query) list.push(query);
    if (queries) list.push(...queries);
    return list;
  }, [query, queries]);

  const regex = useMemo(() => {
    return buildMultiQueryRegex(allQueries);
  }, [allQueries]);

  if (!regex) {
    return <span className={className}>{text}</span>;
  }

  // Split by regex while preserving matched groups
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;
        regex.lastIndex = 0;
        const isMatch = regex.test(part);

        if (isMatch) {
          return (
            <mark
              key={index}
              className={cn(
                "bg-amber-400/35 text-amber-950 dark:bg-amber-400/30 dark:text-amber-100 rounded-[3px] px-0.5 font-bold transition-colors select-text",
                highlightClassName
              )}
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
