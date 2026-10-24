'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  detectClientIp,
  resolveLocationFromIp,
} from '@/modules/search/services/hardware-location.service';

export interface FooterLinkItem {
  href: string;
  label: string;
  external?: boolean;
  className?: string;
  hideOnMobile?: boolean;
}

export interface FooterProps {
  className?: string;
  /** Custom links to replace default navigation links (privacy, terms, sitemap) */
  links?: FooterLinkItem[];
  /** Optional custom React node for replacing the links container completely */
  linksSlot?: React.ReactNode;
  /** Optional extra content for the top status row */
  topRowExtra?: React.ReactNode;
  /** Optional content on the end/right of the top status row */
  topRowEnd?: React.ReactNode;
  /** Optional start offset class for alignment (used in search or aligned layouts) */
  startOffsetClass?: string;
  /** Force transparent or opaque footer */
  isTransparent?: boolean;
}

export function Footer({
  className,
  links,
  linksSlot,
  topRowExtra,
  topRowEnd,
  startOffsetClass,
  isTransparent,
}: FooterProps = {}) {
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const isTransparentFooter =
    isTransparent !== undefined
      ? isTransparent
      : pathname === '/' ||
        pathname === '' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/account-request' ||
        pathname === '/account-pending' ||
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

  const defaultLinks: FooterLinkItem[] = [
    {
      href: '/privacy',
      label: tCommon('footer.privacyPolicy'),
    },
    {
      href: '/terms',
      label: tCommon('footer.termsOfUse'),
    },
    {
      href: '/sitemap',
      label: tCommon('footer.sitemap'),
      hideOnMobile: true,
    },
  ];

  const linksToRender = links && links.length > 0 ? links : defaultLinks;

  return (
    <footer
      className={cn(
        'fa-num w-full mt-auto relative text-xs select-none flex flex-col h-[var(--footer-height)] shrink-0 justify-between overflow-hidden z-20',
        isTransparentFooter
          ? 'border-t-0 bg-transparent'
          : 'border-t border-border/40 bg-background/85 dark:bg-background/90 backdrop-blur-md',
        className
      )}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Location & Status                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-6 shrink-0 px-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center">
          {startOffsetClass && (
            <div className={cn('hidden sm:block', startOffsetClass)} aria-hidden="true" />
          )}
          <div className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs text-foreground/90">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>{resolved.locationName}</span>
            {topRowExtra && (
              <>
                <span className="opacity-30">•</span>
                <span className="font-normal text-[11px] text-muted-foreground">{topRowExtra}</span>
              </>
            )}
          </div>
        </div>

        {topRowEnd && (
          <div className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-2">
            {topRowEnd}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM ROW: Copyright & Navigation Links                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-8 flex-1 min-h-0 flex items-center justify-between px-3 sm:px-8">
        <div className="flex items-center">
          {startOffsetClass && (
            <div className={cn('hidden sm:block', startOffsetClass)} aria-hidden="true" />
          )}
          {/* Copyright */}
          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 tracking-wider truncate font-medium shrink-0">
            <span>© <bdi>2024-{year}</bdi> </span>
            <span className="font-semibold text-primary">EUROSLOT PARS</span>
            <span className="hidden sm:inline"> | {tCommon('footer.allRightsReserved')}</span>
          </p>
        </div>

        {/* Navigation Links */}
        {linksSlot ? (
          linksSlot
        ) : (
          <nav className="flex items-center gap-2.5 sm:gap-6 text-[10.5px] sm:text-[12px] font-medium shrink-0">
            {linksToRender.map((link, idx) => {
              const isExternal =
                link.external ||
                link.href.startsWith('http://') ||
                link.href.startsWith('https://') ||
                link.href.startsWith('mailto:');
              const linkClasses = cn(
                'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150',
                link.hideOnMobile && 'hidden xs:inline',
                link.className
              );

              if (isExternal) {
                return (
                  <a
                    key={`${link.href}-${idx}`}
                    href={link.href}
                    className={linkClasses}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={`${link.href}-${idx}`}
                  href={link.href}
                  className={linkClasses}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </footer>
  );
}
