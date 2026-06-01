// src/components/layout/header.tsx
'use client';

import { useTranslations } from 'next-intl';
// Locale-aware Link & pathname (auto-strips the /[locale] prefix).
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV } from '@/config/navigation';
import { SideMenu } from '@/components/layout/side-menu';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { UserMenu } from '@/components/layout/user-menu';

// ============================================================
// HEADER
// Sticky top bar shared by every page inside /[locale].
// Logical order: [SideMenu][Brand] ... [Desktop nav][Locale][User]
// Spacing uses logical props (ms-/me-) so it mirrors in RTL.
// ============================================================

export function Header() {
  const tHeader = useTranslations('Header');
  // PRIMARY_NAV labels are resolved against the Menu.items namespace,
  // the same source the SideMenu uses (single source of truth).
  const tItems = useTranslations('Menu.items');
  const pathname = usePathname();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-0">
        {/* ---- Start cluster: menu trigger + brand ---- */}
        <div className="flex items-center gap-2">
          {/* Side menu opens from the logical start edge on all devices. */}
          <SideMenu />

          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold transition-opacity hover:opacity-80"
          >
            {/* Brand has its own key; never reuse a page title here. */}
            <span>{tHeader('brand')}</span>
          </Link>
        </div>

        {/* ---- Center: desktop inline navigation ---- */}
        {/* Hidden on small screens; those users rely on the SideMenu. */}
        <nav className="ms-6 hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {tItems(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* ---- End cluster: pushed to the logical end via ms-auto ---- */}
        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher />
          {/* Swap isAuthenticated with your real session flag later. */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
