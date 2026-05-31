// src/components/layout/header.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { cn } from '@/lib/utils';

/**
 * Top navigation bar.
 * Uses logical spacing utilities (ms-/pe-) so layout mirrors correctly
 * between RTL (fa) and LTR (en) without extra conditionals.
 */
export function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Navigation items. `href` values are locale-agnostic; the navigation
  // helper injects the active locale prefix automatically.
  const nav = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ] as const;

  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Brand — use a dedicated brand key, not the "home" nav label */}
        <Link href="/" className="text-lg font-bold">
          <span dir="auto">{t('brand')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active && 'text-primary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav className="border-t md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
