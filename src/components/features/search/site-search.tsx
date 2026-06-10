// src/components/features/search/site-search.tsx
"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

// IMPORTANT: use the next-intl localized router so the /[locale] prefix
// is added automatically (NAVIGATION hrefs are locale-unprefixed).
// Adjust this path to match your project's navigation helper.
import { useRouter } from "@/i18n/navigation";

import { SearchPopup } from "./search-popup";
import { NavSearchResult } from "./nav-search-result";
import { NAV_SEARCH_SOURCE, type NavSearchItem } from "@/lib/navigation-search";

/**
 * Site-wide search wired to the real NAVIGATION tree.
 * Label keys are resolved to localized text before searching, so matching
 * runs against what the user actually sees (plus the href as a fallback term).
 */
// site-search.tsx
export function SiteSearch({
  className,
  onOpenChange,
}: {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const tItems = useTranslations("Menu.items");
  const tSections = useTranslations("Menu.sections");

  // Resolve i18n labels once per locale change. Searching needs the
  // translated strings, not the raw "Menu.*" keys.
  const items = useMemo<NavSearchItem[]>(
    () =>
      NAV_SEARCH_SOURCE.map((entry) => ({
        href: entry.href,
        title: tItems(entry.labelKey),
        section: tSections(entry.sectionLabelKey),
        icon: entry.icon,
      })),
    [tItems, tSections],
  );

  // Match against title + section + href (href lets users find by path/EN slug).
  const getSearchableText = useCallback(
    (item: NavSearchItem) => [item.title, item.section, item.href],
    [],
  );

  return (
    <SearchPopup<NavSearchItem>
      className={className}
      items={items}
      getItemKey={(item) => item.href}
      getSearchableText={getSearchableText}
      renderItem={NavSearchResult}
      onSelect={(item) => router.push(item.href)}
      onOpenChange={onOpenChange}
    />
  );
}
