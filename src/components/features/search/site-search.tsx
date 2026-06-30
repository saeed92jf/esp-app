// src/components/features/search/site-search.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { API_MODE } from '@/services';
import { useSiteSearchItems, useRemoteSearch } from '@/hooks/use-site-search';

import { SearchPopup } from './search-popup';
import { NavSearchResult } from './nav-search-result';
import type { NavSearchItem } from '@/lib/navigation-search';

/**
 * Site-wide search.
 *
 * در fake mode (پیش‌فرض فعلی): فیلتر کاملاً client-side و آنی روی
 * NAVIGATION انجام می‌شود — همان رفتار قبلی، بدون لطمه به UX.
 *
 * در real mode: نتایج از api.search می‌آید (debounce شده در use-site-search)،
 * که می‌تواند شامل صفحات، کاربران یا اسناد هم باشد — نه فقط منو.
 *
 * SearchPopup در هر دو حالت همان است؛ فقط منبع `items` فرق می‌کند.
 */
export function SiteSearch({
  className,
  onOpenChange,
}: {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const { staticItems, isStatic } = useSiteSearchItems();

  // فقط در real mode به‌کار می‌رود — در fake mode هزینه‌ای ندارد چون query خالی می‌ماند
  const [liveQuery, setLiveQuery] = useState('');
  const { results: remoteResults } = useRemoteSearch(isStatic ? '' : liveQuery);

  const remoteItems = useMemo<NavSearchItem[]>(
    () =>
      remoteResults.map((r) => ({
        href: r.href,
        title: r.title,
        section: r.section,
        icon: r.icon,
      })),
    [remoteResults],
  );

  const items = isStatic ? staticItems : remoteItems;

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
      onQueryChange={isStatic ? undefined : setLiveQuery}
    />
  );
}
