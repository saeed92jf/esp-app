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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, Building, Factory, MapPin, Phone } from 'lucide-react';

interface OfficeLocationInfo {
  title: string;
  address: string;
  phone?: string;
  fax?: string;
}

const LOCATION_DETAILS: Record<'fa' | 'en', { hq: OfficeLocationInfo; factory: OfficeLocationInfo }> = {
  fa: {
    hq: {
      title: 'دفتر مرکزی (تهران)',
      address: 'تهران، سعادت‌آباد، خیابان علامه جنوبی، خیابان ۳۲ شرقی (شهید قیصری)، پلاک ۲، واحد ۲ (کد پستی: ۱۹۹۷۸۱۶۱۵۴)',
      phone: '۰۲۱-۸۸۶۸۶۹۴۲ الی ۳',
      fax: '۰۲۱-۸۸۶۸۶۱۶۸',
    },
    factory: {
      title: 'کارخانه و سایت تولید (شهرک صنعتی پرند)',
      address: 'تهران، شهرک صنعتی پرند، میدان صنعت، بلوار صنعت، خیابان فرخنده، کوچه ارغوان، پلاک ۲',
      phone: '۰۲۱-۵۶۴۱۷۱۵۷ / ۰۲۱-۵۶۴۱۷۱۶۱',
      fax: '۰۲۱-۵۶۴۱۷۰۵۲',
    },
  },
  en: {
    hq: {
      title: 'Headquarters (Tehran)',
      address: 'No. 2, Unit 2, 32nd St. (Gheisari), South Allameh Ave., Sa\'adat Abad, Tehran | Postal Code: 1997816154',
      phone: '+98 21 88686942-3',
      fax: '+98 21 88686168',
    },
    factory: {
      title: 'Factory & Manufacturing Plant (Parand Ind. City)',
      address: 'No. 2, Arghavan Alley, Farkhondeh St., San\'at Blvd., Parand Industrial City, Tehran, Iran',
      phone: '+98 21 56417157 / +98 21 56417161',
      fax: '+98 21 56417052',
    },
  },
};

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

  const effectiveStartOffset = startOffsetClass;

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
  const companyLocations = isRtl ? LOCATION_DETAILS.fa : LOCATION_DETAILS.en;
  const displayLocation = isRtl ? 'دفتر مرکزی - کارخانه' : 'Headquarters - Factory';

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
        'w-full mt-auto relative text-xs select-none flex flex-col h-[var(--footer-height)] min-h-[var(--footer-height)] max-h-[var(--footer-height)] shrink-0 justify-center border-none z-20 px-3 sm:px-8 box-border overflow-hidden transition-colors -mt-px',
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
      <div className="w-full shrink-0 flex items-center justify-between gap-2 overflow-visible leading-tight py-0.5">
        <div className="flex items-center min-w-0">
          {effectiveStartOffset && (
            <div className={cn('hidden sm:block', effectiveStartOffset)} aria-hidden="true" />
          )}
          <div className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs text-foreground/85 truncate">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={isRtl ? 'اطلاعات نشانی و تماس دفتر مرکزی و کارخانه' : 'Headquarters & Factory contact info'}
                    className="group/loc inline-flex items-center gap-1.5 cursor-pointer rounded px-1 py-0.5 -mx-1 transition-colors select-none hover:bg-muted/40 outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
                  >
                    <span className="relative flex items-center justify-center size-5 shrink-0 p-1 overflow-visible" aria-hidden="true">
                      <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-400/80" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 transition-transform duration-150 group-hover/loc:scale-110" />
                    </span>
                    <span className="truncate group-hover/loc:text-primary transition-colors underline-offset-4 group-hover/loc:underline">
                      {displayLocation}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="z-[200] w-[320px] sm:w-[380px] p-3.5 rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-md select-text text-start text-xs leading-relaxed fa-num"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="size-4 text-primary shrink-0" />
                        <span className="font-bold text-xs text-foreground truncate">
                          {isRtl ? 'اطلاعات نشانی و تماس سازمانی' : 'Corporate Locations & Contacts'}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {isRtl ? 'فعال و برخط' : 'Active'}
                      </span>
                    </div>

                    {/* Section 1: Headquarters */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-foreground">
                        <Building className="size-3.5 text-primary shrink-0" />
                        <span>{companyLocations.hq.title}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pr-5 rtl:pr-5 ltr:pl-5">
                        <MapPin className="size-3 text-muted-foreground/70 shrink-0 mt-0.5" />
                        <span className="leading-snug">{companyLocations.hq.address}</span>
                      </div>
                      {companyLocations.hq.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pr-5 rtl:pr-5 ltr:pl-5">
                          <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                          <span className="font-mono text-[10.5px] dir-ltr text-foreground/80">{companyLocations.hq.phone}</span>
                          {companyLocations.hq.fax && (
                            <span className="text-[10px] text-muted-foreground/80">
                              ({isRtl ? 'فکس: ' : 'Fax: '}<span className="font-mono dir-ltr">{companyLocations.hq.fax}</span>)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/50" />

                    {/* Section 2: Factory */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-foreground">
                        <Factory className="size-3.5 text-amber-500 shrink-0" />
                        <span>{companyLocations.factory.title}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pr-5 rtl:pr-5 ltr:pl-5">
                        <MapPin className="size-3 text-muted-foreground/70 shrink-0 mt-0.5" />
                        <span className="leading-snug">{companyLocations.factory.address}</span>
                      </div>
                      {companyLocations.factory.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pr-5 rtl:pr-5 ltr:pl-5">
                          <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                          <span className="font-mono text-[10.5px] dir-ltr text-foreground/80">{companyLocations.factory.phone}</span>
                          {companyLocations.factory.fax && (
                            <span className="text-[10px] text-muted-foreground/80">
                              ({isRtl ? 'فکس: ' : 'Fax: '}<span className="font-mono dir-ltr">{companyLocations.factory.fax}</span>)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      <div className="w-full shrink-0 flex items-center justify-between gap-3 leading-tight py-0.5">
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
