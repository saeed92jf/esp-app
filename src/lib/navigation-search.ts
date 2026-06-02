// src/lib/navigation-search.ts
import type { LucideIcon } from 'lucide-react';
import { NAVIGATION } from '@/config/navigation';

// Flattened nav entry BEFORE i18n resolution (carries raw label keys).
export interface NavSearchSource {
  // href is unique across NAVIGATION → used as the de-dup / React key.
  href: string;
  // i18n key under the "Menu.items" namespace.
  labelKey: string;
  // Parent section i18n key under "Menu.sections" (rendered as subtitle).
  sectionLabelKey: string;
  // Per-item icon, falling back to the section icon when missing.
  icon?: LucideIcon;
}

// A nav entry AFTER i18n resolution — this is what SearchPopup searches over.
export interface NavSearchItem {
  href: string;
  title: string; // resolved "Menu.items" label
  section: string; // resolved "Menu.sections" label (shown as description)
  icon?: LucideIcon;
}

// Flatten the grouped NAVIGATION tree into one searchable list.
// Render order mirrors the menu order. Computed once at module load,
// independent of locale (translation happens later in the component).
export const NAV_SEARCH_SOURCE: NavSearchSource[] = NAVIGATION.flatMap(
  (group) =>
    group.items.map((item) => ({
      href: item.href,
      labelKey: item.labelKey,
      sectionLabelKey: group.labelKey,
      icon: item.icon ?? group.icon,
    })),
);
