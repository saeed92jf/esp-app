'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ExternalLink, Database, Activity, Coins, CalendarDays, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export function SourcesWidget({ locale }: { locale: string }) {
  const t = useTranslations('Dashboard.commodities');
  const isFa = locale === 'fa';

  const sources = [
    { label: 'Yahoo Finance',  href: 'https://finance.yahoo.com',   icon: LineChart,    desc: t('sources.yahooDesc') || 'بازار جهانی', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Finnhub',        href: 'https://finnhub.io',          icon: Coins,        desc: t('sources.finnhubDesc') || 'بازار کریپتو', color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Bahesab',        href: 'https://www.bahesab.ir',      icon: CalendarDays, desc: t('sources.bahesabDesc') || 'تقویم رسمی', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'TradingView',    href: 'https://www.tradingview.com', icon: Activity,     desc: t('sources.tradingviewDesc') || 'تحلیل تکنیکال', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <AccordionItem value="sources" className="bg-card rounded-xl border-none overflow-hidden px-4 mb-2">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Database className="size-4" />
          </div>
          <h3 className="font-semibold text-base text-foreground/80">
            {t('reliableStats')}
          </h3>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="segmented-list pb-2" dir={isFa ? 'rtl' : 'ltr'}>
          {sources.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="segmented-item flex items-center gap-3 p-3 border-none bg-background/50 hover:bg-muted/80 text-foreground transition-all duration-200 group w-full no-underline hover:no-underline"
              >
                <div className={cn("p-2 rounded-lg", s.bg, s.color)}>
                  <Icon className="size-4" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn("text-sm font-medium text-foreground/80 fa-num truncate", isFa ? "text-right" : "text-left")}>
                    {s.label}
                  </span>
                  <span className={cn("text-[10px] text-muted-foreground truncate", isFa ? "text-right" : "text-left")}>
                    {s.desc}
                  </span>
                </div>

                <ExternalLink className="size-4 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

