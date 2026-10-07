// src/modules/dashboard/components/stat-card.tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Activity, CheckCircle2, Clock, FileText, MessageSquare,
  Package, Users, Wallet, Wrench, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import type { StatCard as StatCardType } from '../services/dashboard.service';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

// ── Short unit labels for compact display ──────────────────────────────────────
const UNIT_LABELS: Record<string, { fa: string; en: string }> = {
  gold:      { fa: 'دلار/انس',    en: '$/oz'   },
  silver:    { fa: 'دلار/انس',    en: '$/oz'   },
  platinum:  { fa: 'دلار/انس',    en: '$/oz'   },
  palladium: { fa: 'دلار/انس',    en: '$/oz'   },
  copper:    { fa: 'دلار/پوند',   en: '$/lb'   },
  aluminum:  { fa: 'دلار/تن',     en: '$/ton'  },
  geram18: { fa: 'تومان',       en: 'T'      },
  geram24: { fa: 'تومان',       en: 'T'      },
  mesghal: { fa: 'تومان',       en: 'T'      },
  sekee:   { fa: 'تومان',       en: 'T'      },
  sekeb:   { fa: 'تومان',       en: 'T'      },
  nim:     { fa: 'تومان',       en: 'T'      },
  rob:     { fa: 'تومان',       en: 'T'      },
  wti:     { fa: 'دلار/بشکه',   en: '$/bbl'  },
  brent:   { fa: 'دلار/بشکه',   en: '$/bbl'  },
  ng:          { fa: 'دلار/MMBtu',  en: '$/MMBtu'},
  gasoline:    { fa: 'دلار/گالن',   en: '$/gal'  },
  heating_oil: { fa: 'دلار/گالن',   en: '$/gal'  },
  cocoa:   { fa: 'دلار/تن',     en: '$/ton'  },
  coffee:  { fa: 'سنت/پوند',    en: '¢/lb'   },
  cotton:  { fa: 'سنت/پوند',    en: '¢/lb'   },
  eur:     { fa: '$',           en: '$'      },
  gbp:     { fa: 'تومان',       en: 'T'      },
  cny:     { fa: 'تومان',       en: 'T'      },
  aed:     { fa: 'تومان',       en: 'T'      },
  try:     { fa: 'تومان',       en: 'T'      },
  chf:     { fa: 'تومان',       en: 'T'      },
  cad:     { fa: 'تومان',       en: 'T'      },
  aud:     { fa: 'تومان',       en: 'T'      },
  jpy:     { fa: 'تومان',       en: 'T'      },
  rub:     { fa: 'تومان',       en: 'T'      },
  iqd:     { fa: 'تومان',       en: 'T'      },
  sar:     { fa: 'تومان',       en: 'T'      },
  inr:     { fa: 'تومان',       en: 'T'      },
  kwd:     { fa: 'تومان',       en: 'T'      },
  btc:     { fa: 'دلار',        en: 'USD'    },
  eth:     { fa: 'دلار',        en: 'USD'    },
  usdt:    { fa: 'دلار',        en: 'USD'    },
};

const ICONS = {
  users: Users, wallet: Wallet, package: Package, activity: Activity,
  wrench: Wrench, check: CheckCircle2, clock: Clock, file: FileText, message: MessageSquare,
} as const;

const TREND_ICON  = { up: TrendingUp, down: TrendingDown, neutral: Minus } as const;
const TREND_COLOR = {
  up:      'text-emerald-500',
  down:    'text-rose-500',
  neutral: 'text-muted-foreground',
} as const;

export function StatCard({ stat }: { stat: StatCardType }) {
  const tCommodities = useTranslations('Dashboard.commodities');
  const tStats = useTranslations('Dashboard.stats');
  const locale = useLocale();
  const isFa   = locale === 'fa';

  const Icon      = ICONS[stat.icon];
  const TrendIcon = TREND_ICON[stat.trend];

  const unitLabel = UNIT_LABELS[stat.id]?.[isFa ? 'fa' : 'en'] ?? null;

  // In FA, display is RTL: unit — value — suffix (reads right to left as: suffix value unit)
  // value already contains the formatted number with suffix (e.g. "239.98M" or "$4,267.0")
  const isCommodity = Boolean(UNIT_LABELS[stat.id]);

  const prevValueRef = useRef<number | null>(null);
  const cardControls = useAnimation();
  
  useEffect(() => {
    const currentVal = parseFloat(stat.value.replace(/[^0-9.-]+/g, ""));
    
    if (prevValueRef.current !== null && !isNaN(currentVal) && currentVal !== prevValueRef.current) {
      const isUp = currentVal > prevValueRef.current;
      // Pulse emerald for up, rose for down
      const pulseColor = isUp ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)";
      
      cardControls.start({
        backgroundColor: [
          "var(--card)", 
          pulseColor, 
          "var(--card)"
        ],
        transition: { duration: 1, ease: "easeOut" }
      }).then(() => {
        cardControls.set({ backgroundColor: "" }); // reset to class definition
      });
    }
    
    if (!isNaN(currentVal)) {
      prevValueRef.current = currentVal;
    }
  }, [stat.value, cardControls]);

  return (
    <motion.div 
      animate={cardControls}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-1.5 @[140px]:p-3 @sm:p-4 transition-all duration-300 h-full flex flex-col justify-between group"
    >
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -end-4 -top-4 h-10 w-10 @[140px]:-end-6 @[140px]:-top-6 @[140px]:h-16 @[140px]:w-16 @sm:h-20 @sm:w-20 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-110" />

      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between gap-1 z-10">
        <span className="flex h-5 w-5 @[140px]:h-7 @[140px]:w-7 @sm:h-9 @sm:w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Icon className="h-2.5 w-2.5 @[140px]:h-3.5 @[140px]:w-3.5 @sm:h-4.5 @sm:w-4.5" />
        </span>
        <span className={cn(
          'flex items-center gap-0.5 text-[8px] @[140px]:text-[10px] @sm:text-xs font-semibold',
          TREND_COLOR[stat.trend],
        )}>
          <TrendIcon className="h-2 w-2 @[140px]:h-2.5 @[140px]:w-2.5 @sm:h-3 @sm:w-3" />
          <span className="leading-none">{stat.delta}</span>
        </span>
      </div>

      {/* Bottom: value + label */}
      <div className="mt-2 @[140px]:mt-3 @sm:mt-4 z-10 flex flex-col gap-0.5">
        {isCommodity ? (
          // ── Commodity card: RTL layout ──
          <div
            className={cn(
              'flex items-baseline gap-1 flex-wrap w-full',
              isFa ? 'flex-row justify-start' : 'flex-row justify-start',
            )}
            dir={isFa ? 'rtl' : 'ltr'}
          >
            {/* Value */}
            <span className="text-xs @[140px]:text-base @sm:text-xl font-bold tracking-tight text-foreground leading-none">
              {stat.value}
            </span>
            {/* Unit badge */}
            {unitLabel && (
              <span className="text-[7px] @[140px]:text-[9px] @sm:text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0 leading-none">
                {unitLabel}
              </span>
            )}
          </div>
        ) : (
          // ── Generic card (dir=ltr for numbers) ──
          <div className={cn("flex items-baseline gap-1", isFa ? "justify-end w-full" : "justify-start")} dir="ltr">
            <span className="text-xs @[140px]:text-base @sm:text-xl font-bold tracking-tight text-foreground leading-none">
              {stat.value}
            </span>
          </div>
        )}

        {/* Label — bottom-left (start) */}
        <p className="text-start text-[8px] @[140px]:text-[10px] @sm:text-xs font-medium text-muted-foreground leading-tight mt-0.5">
          {isCommodity ? (tCommodities(stat.labelKey) as string) : (tStats(stat.labelKey) as string)}
        </p>
      </div>
    </motion.div>
  );
}

