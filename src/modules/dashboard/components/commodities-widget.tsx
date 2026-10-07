'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCommodities } from '../hooks/use-commodities';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import type { CommodityItem } from '../services/commodities.service';
import { TrendingDown, TrendingUp, Minus, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['forex', 'global_metals', 'energy', 'crypto'] as const;

const UNITS: Record<string, string> = {
  gold: 'unitOz', silver: 'unitOz', platinum: 'unitOz', palladium: 'unitOz',
  copper: 'unitLb', aluminum: 'unitTon',
  geram18: 'unitG', geram24: 'unitG',
  mesghal: 'unitMesghal',
  sekee: 'unitPiece', sekeb: 'unitPiece', nim: 'unitPiece', rob: 'unitPiece',
  wti: 'unitBbl', brent: 'unitBbl',
  ng: 'unitMbtu', gasoline: 'unitGal', heating_oil: 'unitGal',
  cocoa: 'unitTon', coffee: 'unitLb', cotton: 'unitLb',
  eur: 'unitCurrency', gbp: 'unitCurrency', cny: 'unitCurrency',
  usd_azad: 'unitCurrency', usd_sana: 'unitCurrency', gold_18k: 'unitG',
  aed: 'unitCurrency', try: 'unitCurrency', chf: 'unitCurrency',
  cad: 'unitCurrency', aud: 'unitCurrency', jpy: 'unitCurrency',
  rub: 'unitCurrency', iqd: 'unitCurrency', sar: 'unitCurrency',
  inr: 'unitCurrency', kwd: 'unitCurrency',
  btc: 'unitCurrency', eth: 'unitCurrency', usdt: 'unitCurrency',
  sol: 'unitCurrency', xrp: 'unitCurrency',
};

const formatPrice = (price: number) => {
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (price < 1)    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLargeIrr = (val: number) => {
  if (val >= 1_000_000_000) return { value: (val / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 3 }), suffixKey: 'billion' };
  if (val >= 1_000_000)     return { value: (val / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 3 }), suffixKey: 'million' };
  if (val >= 1000)          return { value: (val / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 }), suffixKey: 'thousand' };
  return { value: val.toLocaleString('en-US', { maximumFractionDigits: 0 }), suffixKey: null };
};

export function CommoditiesWidget() {
  const t      = useTranslations('Dashboard.commodities');
  const locale = useLocale();
  const isFa   = locale === 'fa';

  // Settings come from the shared store (controlled via top-header settings modal)
  const { isToman, irrMode } = useDashboardSettings();
  const { commodities, isLoading, isFetching, activeRate, refetch } = useCommodities();

  const [activeCategory, setActiveCategory] = useState<string>('forex');
  const [hoveredId, setHoveredId]           = useState<string | null>(null);

  // ── Helper: format as IRR/Toman ────────────────────────────────
  const formatIrr = (price: number, rate: number, asToman: boolean) => {
    const rawIrr = price * rate;
    const val    = asToman ? rawIrr / 10 : rawIrr;
    return formatLargeIrr(val);
  };



  const filteredData = commodities?.filter(c => c.category === activeCategory) || [];

  const formattedDate = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  // ── Active USD rate badge ─────────────────────────────────────
  const activeRateFormatted = (() => {
    const val = isToman ? activeRate / 10 : activeRate;
    const fmt = formatLargeIrr(val);
    return `${fmt.value} ${fmt.suffixKey ? t(fmt.suffixKey) : ''} ${isToman ? t('toman') : t('rial')}`;
  })();

  return (
    <div className="flex flex-col h-full bg-card rounded-xl rounded-br-none border border-border/50 overflow-hidden relative">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Activity className="size-4" />
              </div>
              <h3 className="font-semibold text-base text-foreground/80">
                {t('title')}
                <span className="text-xs font-normal text-muted-foreground ms-1 hidden lg:inline-block">
                  ({formattedDate})
                </span>
              </h3>
            </div>

            {/* Source label */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2 py-1 text-[11px]">
              <span className="text-muted-foreground">{t('source')}:</span>
              <span className="font-bold flex items-center gap-1">
                {activeCategory === 'crypto' ? (
                  <a href="https://finnhub.io" target="_blank" className="text-primary hover:underline">Finnhub</a>
                ) : (
                  <a href="https://finance.yahoo.com" target="_blank" className="text-primary hover:underline">Yahoo Finance</a>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative flex-1 py-1.5 text-xs font-medium"
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="commodities-tab"
                  className="absolute inset-0 bg-background shadow-sm rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={cn(
                'relative z-10 transition-colors',
                activeCategory === cat ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80',
              )}>
                {t(`categories.${cat}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────── */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
        {isLoading && !commodities?.length ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col gap-3 w-full">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-muted/40 rounded-xl w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 relative">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item: CommodityItem, index) => {
                const isUp   = item.trend === 'up';
                const isDown = item.trend === 'down';

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-all duration-200',
                      hoveredId === item.id
                        ? 'bg-muted/40 border-primary/30 shadow-sm scale-[1.01]'
                        : 'bg-muted/10 border-border/40',
                    )}
                  >
                    {/* Left: name & unit */}
                    <div className="flex items-center gap-2.5">
                      {activeCategory === 'forex' && (
                        <div className="shrink-0 flex items-center">
                          <img
                            src={`https://flagcdn.com/w40/${{
                              eur: 'eu', gbp: 'gb', cny: 'cn', aed: 'ae', try: 'tr',
                              chf: 'ch', cad: 'ca', aud: 'au', jpy: 'jp', rub: 'ru',
                              iqd: 'iq', sar: 'sa', inr: 'in', kwd: 'kw',
                              usd_azad: 'ir', usd_sana: 'ir',
                            }[item.id] || 'ir'}.png`}
                            alt={item.id}
                            className="w-8 h-6 rounded border border-border/50 shadow-md object-cover opacity-95"
                          />
                        </div>
                      )}
                      <div>
                        <p className={cn(
                          'text-sm font-semibold transition-colors duration-200',
                          hoveredId === item.id ? 'text-primary' : 'text-foreground',
                        )}>
                          {t(item.id as any)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t((UNITS as any)[item.id] || 'unitOz')}</p>
                      </div>
                    </div>

                    {/* Right: price */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* % badge */}
                          <span className={cn(
                            'text-[10px] font-medium flex items-center fa-num',
                            isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-muted-foreground',
                          )}>
                            {isUp ? <TrendingUp className="size-3 me-0.5" /> : isDown ? <TrendingDown className="size-3 me-0.5" /> : <Minus className="size-3 me-0.5" />}
                            <span dir="ltr">{(item.percentChange || 0).toFixed(2)}%</span>
                          </span>

                          {/* Primary price */}
                          <span className="text-sm font-bold fa-num" dir={isFa ? 'rtl' : 'ltr'}>
                            {(() => {
                              const isCents = item.id === 'coffee' || item.id === 'cotton';
                              const globalSymbol = isCents ? t('cent') : t('dollar');
                              const globalVal = item.priceIn === 'irr' ? (item.priceUsd ?? item.price / activeRate) : item.price;
                              const globalFormatted = formatPrice(globalVal);
                              const globalElement = isFa ? `${globalFormatted} ${globalSymbol}` : `${globalSymbol}${globalFormatted}`;

                              let localFormatted;
                              if (item.priceIn === 'irr') {
                                const irrVal = isToman ? item.price / 10 : item.price;
                                localFormatted = formatLargeIrr(irrVal);
                              } else {
                                // همیشه از activeRate لحظه‌ای استفاده کن
                                localFormatted = formatIrr(item.price, activeRate, isToman);
                              }
                              const localElement = `${localFormatted.value} ${localFormatted.suffixKey ? t(localFormatted.suffixKey) + ' ' : ''}${isToman ? t('toman') : t('rial')}`;

                              return isFa ? localElement : globalElement;
                            })()}
                          </span>
                        </div>

                        {/* Secondary price */}
                        <p className="text-[10px] text-muted-foreground mt-0.5 fa-num" dir={!isFa ? 'rtl' : 'ltr'}>
                          {(() => {
                            const isCents = item.id === 'coffee' || item.id === 'cotton';
                            const globalSymbol = isCents ? t('cent') : t('dollar');
                            const globalVal = item.priceIn === 'irr' ? (item.priceUsd ?? item.price / activeRate) : item.price;
                            const globalFormatted = formatPrice(globalVal);
                            const globalElement = isFa ? `${globalFormatted} ${globalSymbol}` : `${globalSymbol}${globalFormatted}`;

                            let localFormatted;
                            if (item.priceIn === 'irr') {
                              const irrVal = isToman ? item.price / 10 : item.price;
                              localFormatted = formatLargeIrr(irrVal);
                            } else {
                              // همیشه از activeRate لحظه‌ای استفاده کن
                              localFormatted = formatIrr(item.price, activeRate, isToman);
                            }
                            const localElement = `${localFormatted.value} ${localFormatted.suffixKey ? t(localFormatted.suffixKey) + ' ' : ''}${isToman ? t('toman') : t('rial')}`;

                            return !isFa ? localElement : globalElement;
                          })()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

