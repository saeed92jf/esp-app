'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Wrench, ExternalLink, Calculator, Droplets, BookOpen, Scaling } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

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
    <AccordionItem value="tools" className="bg-card rounded-xl border-none overflow-hidden px-4 mb-2">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Wrench className="size-4" />
          </div>
          <h3 className="font-semibold text-base text-foreground/80">
            {t('tools.title')}
          </h3>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="segmented-list pb-2" dir={isFa ? 'rtl' : 'ltr'}>
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
                transition={{ delay: i * 0.05 }}
                className="segmented-item flex items-center gap-3 p-3 border-none bg-background/50 hover:bg-muted/80 text-foreground transition-all duration-200 group w-full no-underline hover:no-underline"
              >
                <div className={cn("p-2 rounded-lg", tItem.bg, tItem.color)}>
                  <Icon className="size-4" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn("text-sm font-medium text-foreground/80 fa-num truncate", isFa ? "text-right" : "text-left")}>
                    {tItem.label}
                  </span>
                  <span className={cn("text-[11px] text-muted-foreground truncate", isFa ? "text-right" : "text-left")}>
                    {tItem.desc}
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

