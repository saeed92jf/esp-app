// src/components/features/search/nav-search-result.tsx
import type { NavSearchItem } from '@/lib/navigation-search';
import { highlightText } from './highlight-text';

/**
 * Domain row renderer for navigation entries.
 * Pass to <SearchPopup renderItem={...} />; `query` drives title highlight.
 * Icon lives on the item, so SearchPopup itself stays icon-agnostic.
 */
export function NavSearchResult(item: NavSearchItem, query: string) {
  const Icon = item.icon;

  return (
    <>
      {/* Themed icon chip — follows the primary token, so it's theme-aware. */}
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
        {Icon ? <Icon className="size-5" /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <div dir="auto" className="truncate text-sm font-medium">
          {highlightText(item.title, query)}
        </div>
        {/* Parent section name acts as the short contextual description. */}
        <p dir="auto" className="text-muted-foreground mt-0.5 truncate text-xs">
          {item.section}
        </p>
      </div>
    </>
  );
}
