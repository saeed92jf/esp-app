// src/components/layout/side-menu.tsx
'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu as MenuIcon } from 'lucide-react';

// Locale-aware navigation helpers (auto-handle the /[locale] prefix).
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { NAVIGATION } from '@/config/navigation';

import { Button } from '@/components/ui/button';
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

// ============================================================
// SIDE MENU
// A Sheet-based navigation drawer used on every device.
// - Opens from the logical START edge: right for RTL (fa),
//   left for LTR (en), driven by the active locale.
// - Renders NAVIGATION groups as a multi-expand Accordion.
// - The group containing the current route opens by default.
// - Selecting any link closes the drawer.
// ============================================================

export function SideMenu() {
  const locale = useLocale();
  const tMenu = useTranslations('Menu');
  const tSections = useTranslations('Menu.sections');
  const tItems = useTranslations('Menu.items');
  const pathname = usePathname();

  // Controlled open state so we can close on link click.
  const [open, setOpen] = useState(false);

  // RTL languages anchor the drawer to the right; LTR to the left.
  // Keep this list in sync with routing.localeDirection if it grows.
  const side = locale === 'fa' ? 'right' : 'left';

  // Pre-expand the group that owns the current pathname so the user
  // lands with their section already open. Recomputed on route change.
  const defaultOpenGroups = useMemo(
    () =>
      NAVIGATION.filter((group) =>
        group.items.some((item) => item.href === pathname),
      ).map((group) => group.id),
    [pathname],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // Announced to assistive tech; label flips with locale via i18n.
          aria-label={tMenu('open')}
        >
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={side}
        // Fixed, comfortable width; full-bleed on very small screens.
        className="flex w-75 flex-col gap-0 p-0 sm:w-85"
      >
        {/* ---- Header: title + subtitle ---- */}
        <SheetHeader className="border-b px-5 py-4 text-start">
          <SheetTitle>{tMenu('title')}</SheetTitle>
          <SheetDescription>{tMenu('subtitle')}</SheetDescription>
        </SheetHeader>

        {/* ---- Scrollable body: grouped accordion nav ---- */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <Accordion
            type="multiple"
            // `key` forces a fresh defaultValue when the route changes,
            // so the active group re-opens after client navigation.
            key={defaultOpenGroups.join('|')}
            defaultValue={defaultOpenGroups}
            className="space-y-1"
          >
            {NAVIGATION.map((group) => {
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
                              // Close the drawer right after navigating.
                              onClick={() => setOpen(false)}
                              aria-current={isActive ? 'page' : undefined}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                // Indent items under their group header.
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
        </nav>

        {/* ---- Footer: version stamp ---- */}
        <div className="text-muted-foreground border-t px-5 py-3 text-xs">
          {tMenu('version', { version: '1.0.0' })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
