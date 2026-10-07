'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const toPersianDigits = (str: string) =>
  str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const CountdownTimer = ({ lastUpdated, isFa }: { lastUpdated: number, isFa: boolean }) => {
  const [timeLeft, setTimeLeft] = React.useState(30);
  
  React.useEffect(() => {
    const updateTime = () => {
      const diff = Math.floor((Date.now() - lastUpdated) / 1000);
      setTimeLeft(Math.max(0, 30 - diff));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const displayTime = isFa ? toPersianDigits(`${timeLeft}`) : `${timeLeft}`;
  const unit = isFa ? ' ثانیه' : 's';

  return (
    <span className="text-primary flex items-center gap-1 min-w-[36px]">
      {timeLeft > 0 ? (
        <>
          <RefreshCw className="size-3 animate-spin text-primary/70" style={{ animationDuration: '3s' }} />
          <span>{displayTime}{unit}</span>
        </>
      ) : (
        <span className="text-muted-foreground text-[10px] animate-pulse">{isFa ? 'بروزرسانی...' : 'Updating...'}</span>
      )}
    </span>
  );
};
import { RefreshCw, ExternalLink, Settings2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardSettings, IrrMode } from '../store/use-dashboard-settings';
import { useCommodities } from '../hooks/use-commodities';
import { useTranslations, useLocale } from 'next-intl';

const getRateModes = (t: any): { value: IrrMode; label: string; disabled?: boolean }[] => [
  { value: 'free',   label: t('marketSettings.rateModes.free') },
  { value: 'sana',   label: t('marketSettings.rateModes.sana'), disabled: true },
  { value: 'cbi',    label: t('marketSettings.rateModes.cbi'), disabled: true },
  { value: 'manual', label: t('marketSettings.rateModes.manual') },
];

function SettingsDropdown({
  irrMode,
  setIrrMode,
  isToman,
  setIsToman,
  manualRate,
  setManualRate,
  t,
  onRefreshAll,
  isRefreshing
}: any) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isFa = locale === 'fa';

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref} dir={isFa ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal border transition-all duration-150",
          open ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
        )}
      >
        <Settings2 className="size-3" />
        {t('marketSettings.settingsBtn')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 w-64 bg-popover border border-border/50 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4",
              isFa ? "left-0" : "right-0"
            )}
          >
            {/* Toman / Rial toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{t('marketSettings.currencyDisplay')}</span>
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setIsToman(true)}
                  className={cn("px-3 py-1 text-xs rounded-md transition-colors", isToman ? "bg-background shadow-sm font-medium text-primary" : "text-muted-foreground")}
                >
                  {t('marketSettings.toman')}
                </button>
                <button
                  onClick={() => setIsToman(false)}
                  className={cn("px-3 py-1 text-xs rounded-md transition-colors", !isToman ? "bg-background shadow-sm font-medium text-primary" : "text-muted-foreground")}
                >
                  {t('marketSettings.rial')}
                </button>
              </div>
            </div>

            {/* Rate Mode */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground">{t('marketSettings.rateMode')}</span>
              <div className="flex flex-col gap-1 bg-muted/30 p-1.5 rounded-lg border border-border/40">
                {getRateModes(t).map(m => (
                  <button
                    key={m.value}
                    disabled={m.disabled}
                    onClick={() => setIrrMode(m.value)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors",
                      irrMode === m.value ? "bg-background shadow-sm font-medium text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      m.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span>{m.label}</span>
                    {irrMode === m.value && <Check className="size-3 shrink-0" />}
                    {m.disabled && <span className="text-[9px] bg-muted px-1 rounded">{t('marketSettings.notAvailable')}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Rate Input */}
            {irrMode === 'manual' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-foreground">{t('marketSettings.manualRate')}</span>
                <input
                  type="number"
                  value={manualRate}
                  onChange={(e) => setManualRate(Number(e.target.value))}
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs fa-num outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  dir="ltr"
                />
              </div>
            )}

            {/* Refresh Button */}
            <div className="pt-2 border-t border-border/40">
              <button
                onClick={() => {
                  onRefreshAll();
                  setOpen(false);
                }}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={cn('size-3', isRefreshing && 'animate-spin')} />
                {t('marketSettings.refreshBtn')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MarketControlBarProps {
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export function MarketControlBar({ onRefreshAll, isRefreshing }: MarketControlBarProps) {
  const t = useTranslations('Dashboard.commodities');
  const locale = useLocale();
  const isFa = locale === 'fa';

  const {
    irrMode, setIrrMode,
    isToman, setIsToman,
    manualRate, setManualRate,
  } = useDashboardSettings();

  const { activeRate, ratesUpdatedAt } = useCommodities();

  const rateDisplay = React.useMemo(() => {
    const val = isToman ? activeRate / 10 : activeRate;
    if (val >= 1_000_000) return `${(val / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
    if (val >= 1_000)     return `${(val / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }, [activeRate, isToman]);

  const unit = isToman ? t('marketSettings.toman') : t('marketSettings.rial');
  const modeLabel = getRateModes(t).find(m => m.value === irrMode)?.label;
  const sourceLabel = irrMode === 'free' ? t('marketSettings.sourceFreeMarket') : irrMode === 'manual' ? t('marketSettings.sourceManual') : t('marketSettings.sourceCbi');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 flex items-center justify-between flex-wrap gap-3 px-3 py-2 bg-card border border-border/50 rounded-xl w-full"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Active Rate Display */}
      <div className="flex items-center gap-1.5 text-sm bg-muted/20 border border-border/40 px-3 py-1.5 rounded-lg shrink-0">
        <span className="text-muted-foreground text-xs">{isFa ? "نرخ تبدیل دلار به ریال" : "USD to IRR Rate"}:</span>
        <span className="font-bold text-primary fa-num">{rateDisplay} {unit}</span>
        <span className="text-xs text-muted-foreground font-medium ms-1 flex items-center gap-1">
          ({modeLabel} - {t('source')}: 
          {irrMode === 'free' ? (
            <a href="https://tetherland.com" target="_blank" className="text-primary hover:underline hover:bg-primary/10 px-1 rounded transition-colors">Tetherland</a>
          ) : (
            <span>{sourceLabel}</span>
          )})
        </span>
        {ratesUpdatedAt && (
          <span className="text-xs text-muted-foreground ms-2 border-s border-border/50 ps-2 flex items-center gap-1.5">
            <span className="text-muted-foreground/70 hidden sm:inline">
              {isFa ? 'آخرین آپدیت:' : 'Last update:'}
            </span>
            <span className="text-xs text-primary/80">
              {new Date(ratesUpdatedAt).toLocaleTimeString(isFa ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <CountdownTimer lastUpdated={ratesUpdatedAt} isFa={isFa} />
          </span>
        )}
      </div>

      {/* Settings Dropdown */}
      <SettingsDropdown
        irrMode={irrMode}
        setIrrMode={setIrrMode}
        isToman={isToman}
        setIsToman={setIsToman}
        manualRate={manualRate}
        setManualRate={setManualRate}
        t={t}
        onRefreshAll={onRefreshAll}
        isRefreshing={isRefreshing}
      />
    </motion.div>
  );
}

