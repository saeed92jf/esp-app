'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu as MenuIcon, Search as SearchIcon } from 'lucide-react';

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

import { SettingsSection } from '@/components/layout/settings-section';
import { LocaleSwitcher } from '@/components/locale-switcher';

export function SideMenu() {
  const locale = useLocale();
  const pathname = usePathname();

  const tMenu = useTranslations('Menu');
  const tSections = useTranslations('Menu.sections');
  const tItems = useTranslations('Menu.items');

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const side = locale === 'fa' ? 'right' : 'left';

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAVIGATION;

    return NAVIGATION.map((group) => {
      if (group.custom) return group;

      const sectionMatches = tSections(group.labelKey)
        .toLowerCase()
        .includes(q);

      const items = sectionMatches
        ? group.items
        : group.items.filter((item) =>
            tItems(item.labelKey).toLowerCase().includes(q),
          );

      return { ...group, items };
    }).filter((group) => group.custom || group.items.length > 0);
  }, [query, tItems, tSections]);

  const activeRouteGroups = useMemo(
    () =>
      NAVIGATION.filter(
        (group) =>
          !group.custom && group.items.some((item) => item.href === pathname),
      ).map((group) => group.id),
    [pathname],
  );

  const openGroups = query.trim()
    ? filteredNav.map((g) => g.id)
    : activeRouteGroups;

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
        <SheetHeader className="px-5 pt-4 pb-2 text-start">
          <SheetTitle>{tMenu('title')}</SheetTitle>
          <SheetDescription>{tMenu('subtitle')}</SheetDescription>
        </SheetHeader>

        {/* SEARCH */}
        <div className="px-4 pb-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tMenu('search')}
              className="ps-9"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <Accordion
            type="multiple"
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
                      {GroupIcon && <GroupIcon className="size-4 shrink-0" />}
                      {tSections(group.labelKey)}
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="pt-0 pb-2">
                    {/* NORMAL NAV ITEMS */}
                    {!group.custom && (
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => handleOpenChange(false)}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                                  'ms-4',
                                  isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                              >
                                {ItemIcon && (
                                  <ItemIcon className="size-4 shrink-0" />
                                )}
                                {tItems(item.labelKey)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* SETTINGS CUSTOM CONTENT */}
                    {group.custom === 'settings' && (
                      <div className="ms-4 space-y-4 px-3 py-2">
                        <SettingsSection />
                        <LocaleSwitcher
                          onLocaleChange={() => handleOpenChange(false)}
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </nav>

        <div className="text-muted-foreground px-5 pb-3 text-xs">
          {tMenu('version', { version: '1.0.0' })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
