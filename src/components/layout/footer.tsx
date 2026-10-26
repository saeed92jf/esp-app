'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { isPanelBackgroundRoute } from '@/lib/constants';
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
  /** Visual variant: 'default' (transparent) | 'panel' (bg-panel). If omitted, auto-detected from route. */
  variant?: 'default' | 'panel';
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
  /** Force transparent or custom background styling (defaults to true / background-less) */
  isTransparent?: boolean;
}

export function Footer({
  className,
  variant,
  links,
  linksSlot,
  topRowExtra,
  topRowEnd,
  startOffsetClass,
  isTransparent,
}: FooterProps = {}) {
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const isPanelBg =
    variant !== undefined
      ? variant === 'panel'
      : isPanelBackgroundRoute(pathname);

  const isSearchPage = pathname === '/search' || pathname.startsWith('/search/');
  const effectiveStartOffset =
    startOffsetClass || (isSearchPage ? 'w-[124px] md:w-[136px] lg:w-[152px] xl:w-[170px] shrink-0' : undefined);

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
        'w-full mt-auto relative text-xs select-none flex flex-col h-[var(--footer-height)] min-h-[var(--footer-height)] max-h-[var(--footer-height)] shrink-0 justify-center border-none z-20 px-3 sm:px-8 box-border overflow-hidden transition-colors',
        isTransparent
          ? 'bg-transparent'
          : isPanelBg
          ? 'bg-panel dark:bg-background'
          : 'bg-transparent',
        isRtl && 'fa-num',
        className
      )}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Location & Status                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-5 sm:h-5.5 shrink-0 flex items-center justify-between gap-2 overflow-hidden leading-none">
        <div className="flex items-center min-w-0">
          {effectiveStartOffset && (
            <div className={cn('hidden sm:block', effectiveStartOffset)} aria-hidden="true" />
          )}
          <div className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs text-foreground/85 truncate">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate">{resolved.locationName}</span>
            {topRowExtra && (
              <>
                <span className="opacity-30 shrink-0">•</span>
                <span className="font-normal text-[11px] text-muted-foreground truncate">{topRowExtra}</span>
              </>
            )}
          </div>
        </div>

        {topRowEnd && (
          <div className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-2 shrink-0">
            {topRowEnd}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM ROW: Copyright & Navigation Links                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-6 sm:h-6.5 shrink-0 flex items-center justify-between gap-3 overflow-hidden leading-none">
        <div className="flex items-center min-w-0">
          {effectiveStartOffset && (
            <div className={cn('hidden sm:block', effectiveStartOffset)} aria-hidden="true" />
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
          <nav className="flex items-center gap-3 sm:gap-6 text-[10.5px] sm:text-[12px] font-medium shrink-0 whitespace-nowrap">
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
