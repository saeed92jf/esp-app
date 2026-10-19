'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Wrench, ExternalLink, Calculator, Droplets, BookOpen, Scaling } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export function EngineeringToolsWidget({ locale }: { locale: string }) {
  const t = useTranslations('Dashboard.commodities');
  const isFa = locale === 'fa';

  const tools = [
    { 
      label: t('tools.unitConverter'), 
      href: 'https://www.unitconverters.net/', 
      desc: t('tools.unitConverterDesc'), 
      icon: Scaling,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: t('tools.flangeCalc'), 
      href: 'https://www.piping-designer.com/', 
      desc: t('tools.flangeCalcDesc'), 
      icon: Wrench,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      label: t('tools.volumeCalc'), 
      href: 'https://www.calculatorsoup.com/calculators/geometry-solids/', 
      desc: t('tools.volumeCalcDesc'), 
      icon: Calculator,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    { 
      label: t('tools.fabWeight'), 
      href: 'https://letsfab.in/online-calculators/fabrication-weight-and-cost-calculator/', 
      desc: t('tools.fabWeightDesc'), 
      icon: Calculator,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    { 
      label: t('tools.vesselDesign'), 
      href: 'https://processtools.app/vessel-design', 
      desc: t('tools.vesselDesignDesc'), 
      icon: Droplets,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10'
    },
  ];

  return (
    <div className="flex flex-col h-full bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative p-3 sm:p-4 @container min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-3 shrink-0 border-b border-border/40 pb-2.5 pe-18 sm:pe-20">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0 text-primary">
          <Wrench className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-foreground/80 truncate">
            {t('tools.title')}
          </h3>
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-1 pb-2">
        <div className="grid grid-cols-1 @[360px]:grid-cols-2 gap-2" dir={isFa ? 'rtl' : 'ltr'}>
          {tools.map((tItem, i) => {
            const Icon = tItem.icon;
            return (
              <motion.a
                key={tItem.label}
                href={tItem.href}
                target="_blank"
                rel="noopener noreferrer"
                title={tItem.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-white/70 dark:bg-card/60 hover:bg-white dark:hover:bg-card hover:border-primary/40 text-foreground transition-all duration-200 group no-underline hover:no-underline shadow-2xs select-none"
              >
                <div className={cn("p-2 rounded-lg shrink-0", tItem.bg, tItem.color)}>
                  <Icon className="size-4" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn("text-xs sm:text-sm font-semibold text-foreground/90 truncate", isFa ? "text-right" : "text-left")}>
                    {tItem.label}
                  </span>
                  <span className={cn("text-[11px] text-muted-foreground truncate", isFa ? "text-right" : "text-left")}>
                    {tItem.desc}
                  </span>
                </div>

                <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

