// src/components/layout/side-menu.tsx
'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu as MenuIcon, Search as SearchIcon } from 'lucide-react';

// Locale-aware navigation helpers (auto-handle the /[locale] prefix).
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { NAVIGATION } from '@/config/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Appearance controls (theme + primary color) for the menu footer.
import { SettingsSection } from '@/components/layout/settings-section';

// ============================================================
// SIDE MENU
// A Sheet-based navigation drawer used on every device.
// - Opens from the logical START edge: right for RTL (fa),
//   left for LTR (en), driven by the active locale.
// - Renders NAVIGATION groups as a multi-expand Accordion.
// - A lightweight search box filters items/sections live.
// - The group containing the current route opens by default.
// - Selecting any link closes the drawer.
// - Bottom section exposes theme + primary-color settings.
// ============================================================

export function SideMenu() {
  const locale = useLocale();
  const tMenu = useTranslations('Menu');
  const tSections = useTranslations('Menu.sections');
  const tItems = useTranslations('Menu.items');
  const pathname = usePathname();

  // Controlled open state so we can close on link click.
  const [open, setOpen] = useState(false);

  // Live search query used to filter the navigation tree.
  const [query, setQuery] = useState('');

  // RTL languages anchor the drawer to the right; LTR to the left.
  const side = locale === 'fa' ? 'right' : 'left';

  // Filter NAVIGATION by the current query (case-insensitive).
  // - A section-name match keeps ALL its items.
  // - Otherwise only items whose label matches are kept.
  // - Empty groups are dropped from the result.
  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAVIGATION;

    return NAVIGATION.map((group) => {
      const sectionMatches = tSections(group.labelKey)
        .toLowerCase()
        .includes(q);

      const items = sectionMatches
        ? group.items
        : group.items.filter((item) =>
            tItems(item.labelKey).toLowerCase().includes(q),
          );

      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [query, tItems, tSections]);

  // Groups that own the current route — pre-expanded on open.
  const activeRouteGroups = useMemo(
    () =>
      NAVIGATION.filter((group) =>
        group.items.some((item) => item.href === pathname),
      ).map((group) => group.id),
    [pathname],
  );

  // While searching, expand every matching group so results are
  // immediately visible; otherwise fall back to the active route.
  const openGroups = query.trim()
    ? filteredNav.map((group) => group.id)
    : activeRouteGroups;

  // Reset the search field whenever the drawer is closed.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={tMenu('open')}>
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={side}
        className="flex w-75 flex-col gap-0 p-0 sm:w-85"
      >
        {/* ---- Header: title + subtitle (no divider) ---- */}
        <SheetHeader className="px-5 pt-4 pb-2 text-start">
          <SheetTitle>{tMenu('title')}</SheetTitle>
          <SheetDescription>{tMenu('subtitle')}</SheetDescription>
        </SheetHeader>

        {/* ---- Search box: filters sections + items ---- */}
        <div className="px-4 pb-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tMenu('search')}
              // Logical padding so the icon sits on the START edge in RTL/LTR.
              className="ps-9"
              aria-label={tMenu('search')}
            />
          </div>
        </div>

        {/* ---- Scrollable body: grouped accordion nav ---- */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {filteredNav.length === 0 ? (
            // Empty state when no item matches the query.
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              {tMenu('noResults')}
            </p>
          ) : (
            <Accordion
              type="multiple"
              // `key` forces a fresh defaultValue when route/query change,
              // so the right groups re-open after navigation or filtering.
              key={`${query}|${openGroups.join('|')}`}
              defaultValue={openGroups}
              className="space-y-1"
            >
              {filteredNav.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    className="border-none"
                  >
                    <AccordionTrigger className="hover:bg-muted rounded-lg px-3 py-2 text-sm font-semibold hover:no-underline">
                      <span className="flex items-center gap-2">
                        {GroupIcon ? (
                          <GroupIcon className="size-4 shrink-0" />
                        ) : null}
                        {tSections(group.labelKey)}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-0 pb-1">
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => handleOpenChange(false)}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                  'ms-4',
                                  isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                              >
                                {ItemIcon ? (
                                  <ItemIcon className="size-4 shrink-0" />
                                ) : null}
                                <span>{tItems(item.labelKey)}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </nav>

        {/* ---- Appearance settings (theme + primary color) ---- */}
        <SettingsSection />

        {/* ---- Footer: version stamp (no divider) ---- */}
        <div className="text-muted-foreground px-5 pb-3 text-xs">
          {tMenu('version', { version: '1.0.0' })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
