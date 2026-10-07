'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Edit3, BarChart2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from './stat-card';
import type { StatCard as StatCardType } from '../services/dashboard.service';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommodities } from '../hooks/use-commodities';

export function StatsOverviewWidget({ 
  stats, 
  allStats,
  onToggleExpand
}: { 
  stats: StatCardType[];
  allStats: StatCardType[];
  onToggleExpand?: (expanded: boolean) => void;
}) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isFa = locale === 'fa';
  
  const { statCards, setStatCards } = useDashboardSettings();
  const [isEditing, setIsEditing] = React.useState(false);

  const handleToggle = (id: string) => {
    if (!isEditing) return;

    if (statCards.includes(id)) {
      if (statCards.length > 1) {
        setStatCards(statCards.filter(x => x !== id));
      }
    } else {
      if (statCards.length < 5) {
        setStatCards([...statCards, id]);
      } else {
        // Remove the oldest (first) and add the new one
        setStatCards([...statCards.slice(1), id]);
      }
    }
  };

  const handleToggleEditing = () => {
    const nextEditing = !isEditing;
    setIsEditing(nextEditing);
    if (onToggleExpand) {
      onToggleExpand(nextEditing);
    }
  };

  const { commodities } = useCommodities();

  const displayStats = (isEditing ? allStats : stats).map(stat => {
    // Override with live market data if available
    const liveItem = commodities?.find(c => c.id === stat.id);
    if (liveItem) {
      let formattedValue: string;
      if (liveItem.priceIn === 'irr') {
        const tomanValue = liveItem.price / 10;
        if (tomanValue >= 1_000_000_000) {
          formattedValue = (tomanValue / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'B';
        } else if (tomanValue >= 1_000_000) {
          formattedValue = (tomanValue / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
        } else if (tomanValue >= 1_000) {
          formattedValue = (tomanValue / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K';
        } else {
          formattedValue = tomanValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
      } else {
        const usdPrice = liveItem.price;
        if (usdPrice >= 1_000_000) {
          formattedValue = (usdPrice / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
        } else if (usdPrice > 1000) {
          formattedValue = usdPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        } else if (usdPrice >= 1) {
          formattedValue = usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
          formattedValue = usdPrice.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        }
      }
      return {
        ...stat,
        value: formattedValue,
        delta: `${liveItem.percentChange >= 0 ? '+' : ''}${Number(liveItem.percentChange).toFixed(2)}%`,
        trend: liveItem.trend || 'neutral',
      };
    }
    return stat;
  });

  const STAT_NAMES: Record<string, { fa: string, en: string }> = {
    users: { fa: 'کاربران کل', en: 'Total Users' },
    revenue: { fa: 'درآمد', en: 'Revenue' },
    orders: { fa: 'سفارشات', en: 'Orders' },
    active: { fa: 'نشست‌های فعال', en: 'Active Sessions' },
    growth: { fa: 'رشد', en: 'Growth' },
    bounce: { fa: 'نرخ پرش', en: 'Bounce Rate' },
    gold: { fa: 'انس طلا', en: 'Gold (oz)' },
    silver: { fa: 'انس نقره', en: 'Silver (oz)' },
    copper: { fa: 'مس', en: 'Copper' },
    aluminum: { fa: 'آلومینیوم', en: 'Aluminum' },
    wti: { fa: 'نفت WTI', en: 'WTI Crude' },
    brent: { fa: 'نفت برنت', en: 'Brent Crude' },
    gasoline: { fa: 'بنزین', en: 'Gasoline' },
    eur: { fa: 'یورو', en: 'Euro' },
    btc: { fa: 'بیت‌کوین', en: 'Bitcoin' },
    eth: { fa: 'اتریوم', en: 'Ethereum' },
    sekee: { fa: 'سکه امامی', en: 'Emami Coin' },
    geram18: { fa: 'طلای ۱۸ عیار', en: '18k Gold' },
    invoices: { fa: 'فاکتورها', en: 'Invoices' },
    support: { fa: 'پشتیبانی', en: 'Support' },
    wallet: { fa: 'کیف پول', en: 'Wallet' },
    rewards: { fa: 'امتیازها', en: 'Rewards' },
    views: { fa: 'بازدیدها', en: 'Views' }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl rounded-br-none border border-border/50 overflow-hidden relative transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-wrap pe-12">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <BarChart2 className="size-4" />
          </div>
          <h3 className="font-semibold text-base text-foreground/80">
            {t('statsOverview')}
          </h3>
          <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2 py-1 text-[11px] ms-2">
            <span className="text-muted-foreground">{isFa ? 'منبع' : 'Source'}:</span>
            <span className="font-bold flex items-center gap-1">
              <a href="https://finance.yahoo.com" target="_blank" className="text-primary hover:underline">Yahoo Finance</a>
            </span>
          </div>

          <button 
            onClick={handleToggleEditing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ms-2",
              isEditing 
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-md shadow-primary/20" 
                : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-border/50 hover:text-foreground"
            )}
          >
            {isEditing ? <Check className="size-3" /> : <Edit3 className="size-3" />}
            <span>{isEditing ? (isFa ? "پایان ویرایش" : "Done") : (isFa ? "ویرایش کارت‌ها" : "Edit Cards")}</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className={cn("flex-1 p-3 @container overflow-y-auto", isEditing ? "bg-muted/10" : "bg-transparent")} dir={isFa ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 @xs:grid-cols-2 @md:grid-cols-3 @2xl:grid-cols-5 gap-3 relative h-full">
          <AnimatePresence mode="popLayout">
            {displayStats.map((stat) => {
              const isSelected = statCards.includes(stat.id);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isEditing ? (isSelected ? 1 : 0.7) : 1,
                    scale: 1,
                    rotate: (isEditing && !isSelected) ? [-1, 1, -1] : 0 
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={
                    isEditing && !isSelected 
                      ? { 
                          rotate: { repeat: Infinity, duration: 0.2 + Math.random() * 0.1, ease: "linear" },
                          opacity: { duration: 0.3 },
                          layout: { duration: 0.3 }
                        }
                      : { duration: 0.3, layout: { duration: 0.3 } }
                  }
                  key={stat.id}
                  onClick={() => handleToggle(stat.id)}
                  className={cn(
                    "fa-num relative transition-shadow h-full",
                    isEditing && "cursor-pointer select-none min-h-[110px] @sm:min-h-[120px]",
                    isEditing && !isSelected && "hover:opacity-90"
                  )}
                >
                  <div className={cn("pointer-events-none h-full transition-all")}>
                    <StatCard stat={stat} />
                  </div>

                  {isEditing && isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-md z-20">
                      <Check className="size-3" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Fill empty spots if less than 5 and NOT editing */}
          {!isEditing && Array.from({ length: Math.max(0, 5 - displayStats.length) }).map((_, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={`empty-${i}`} 
              className="rounded-xl border border-dashed border-border/50 bg-background/50 h-full min-h-[90px] flex items-center justify-center"
            >
              <span className="text-muted-foreground/30 text-xs font-medium">کارت {displayStats.length + i + 1}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

