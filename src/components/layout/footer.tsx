'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  detectClientIp,
  resolveLocationFromIp,
} from '@/modules/search/services/hardware-location.service';

export function Footer() {
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const isTransparentFooter =
    pathname === '/' ||
    pathname === '' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email');

  const [ipAddress, setIpAddress] = useState<string>('192.168.10.45');

  useEffect(() => {
    let isMounted = true;
    detectClientIp().then((ip) => {
      if (isMounted && ip) {
        setIpAddress(ip);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const resolved = resolveLocationFromIp(ipAddress, locale);

  return (
    <footer
      className={cn(
        'fa-num w-full mt-auto relative text-xs select-none flex flex-col h-[var(--footer-height)] shrink-0 justify-between overflow-hidden',
        isTransparentFooter
          ? 'border-t-0 bg-transparent'
          : 'border-t border-border/40 bg-background/85 dark:bg-background/90 backdrop-blur-md'
      )}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Location (First bold part only, no top border, no divider border) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-6 shrink-0 px-3 sm:px-8 flex items-center">
        <span className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs text-foreground/90">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span>{resolved.locationName}</span>
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM ROW: Copyright & Navigation Links                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-8 flex-1 min-h-0 flex items-center justify-between px-3 sm:px-8">
        {/* Copyright */}
        <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 tracking-wider truncate font-medium shrink-0">
          <span>© <bdi>2024-{year}</bdi> </span>
          <span className="font-semibold text-primary">EUROSLOT PARS</span>
          <span className="hidden sm:inline"> | {tCommon('footer.allRightsReserved')}</span>
        </p>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2.5 sm:gap-6 text-[10.5px] sm:text-[12px] font-medium shrink-0">
          <Link
            href="/privacy"
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150"
          >
            {tCommon('footer.privacyPolicy')}
          </Link>
          <Link
            href="/terms"
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150"
          >
            {tCommon('footer.termsOfUse')}
          </Link>
          <Link
            href="/sitemap"
            className="hidden xs:inline text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150"
          >
            {tCommon('footer.sitemap')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
