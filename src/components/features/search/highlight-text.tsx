// src/components/features/search/highlight-text.tsx
import { Fragment, type ReactNode } from 'react';

/**
 * Wraps every case-insensitive occurrence of `query` inside `text` with a
 * theme-aware <mark>. Returns the raw text when the query is too short
 * (< 2 chars) or the regex build fails. Special regex characters in `query`
 * are escaped so user input can never break the pattern.
 *
 * Note: we compare each split chunk against `query` directly instead of reusing
 * a global regex's `.test()` — that avoids the stateful `lastIndex` bug the
 * original implementation had.
 */
export function highlightText(text: string, query: string): ReactNode {
  if (!query || query.length < 2 || !text) return text;

  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    const needle = query.toLowerCase();

    return parts.map((part, index) =>
      part.toLowerCase() === needle ? (
        <mark
          key={index}
          className="bg-primary/20 text-foreground rounded px-0"
        >
          {part}
        </mark>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
  } catch {
    return text;
  }
}
