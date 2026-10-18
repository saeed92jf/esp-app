// src/components/ui/highlight-match.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Robust Bilingual Text Highlighter for Search Queries

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Escapes regex special characters safely
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a Persian/Arabic resilient regex pattern for a single token
 */
function buildBilingualPattern(token: string): string {
  const escaped = escapeRegExp(token);
  return escaped
    .replace(/[یي]/g, "[یي]")
    .replace(/[کك]/g, "[کك]")
    .replace(/[آأإا]/g, "[آأإا]")
    .replace(/[هة]/g, "[هة]");
}

export function HighlightMatch({
  text,
  query,
  className,
  highlightClassName,
}: HighlightMatchProps) {
  const parts = useMemo(() => {
    if (!text) return [];
    const trimmed = query.trim();
    if (!trimmed) return [text];

    // Split query into discrete words/tokens (minimum 1 char)
    const tokens = trimmed
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) return [text];

    try {
      const patternString = `(${tokens.map(buildBilingualPattern).join("|")})`;
      const regex = new RegExp(patternString, "gi");
      return text.split(regex);
    } catch {
      return [text];
    }
  }, [text, query]);

  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const trimmedTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim());

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = trimmedTokens.some((tok) => {
          if (!tok) return false;
          const p = part.toLowerCase();
          return (
            p === tok ||
            p.replace(/[ي]/g, "ی").replace(/[ك]/g, "ک") ===
              tok.replace(/[ي]/g, "ی").replace(/[ك]/g, "ک")
          );
        });

        if (isMatch) {
          return (
            <mark
              key={index}
              className={cn(
                "rounded-xs bg-primary/15 dark:bg-primary/25 font-bold text-primary dark:text-primary px-0.5 not-italic transition-colors",
                highlightClassName
              )}
            >
              {part}
            </mark>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
