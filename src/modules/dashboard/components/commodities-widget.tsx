'use client';

import { useTranslations } from 'next-intl';
import { useCommodities, IrrMode } from '../hooks/use-commodities';
import type { CommodityItem } from '../services/commodities.service';
import { Settings2, TrendingDown, TrendingUp, Minus, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['metals', 'energy', 'forex', 'crypto'] as const;

const UNITS: Record<string, string> = {
  gold: 'unitOz',
  silver: 'unitOz',
  platinum: 'unitOz',
  palladium: 'unitOz',
  copper: 'unitOz',
  aluminum: 'unitTon',
  zinc: 'unitTon',
  steel: 'unitTon',
  wti: 'unitBbl',
  brent: 'unitBbl',
  ng: 'unitMbtu',
  eur: 'unitCurrency',
  gbp: 'unitCurrency',
  cny: 'unitCurrency',
  aed: 'unitCurrency',
  try: 'unitCurrency',
  btc: 'unitCurrency',
  eth: 'unitCurrency',
  usdt: 'unitCurrency',
};

const formatPrice = (price: number) => {
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (price < 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function CommoditiesWidget() {
  const t = useTranslations('Dashboard.commodities');
  const { commodities, isLoading, irrMode, setIrrMode, manualRate, setManualRate, activeRate, refetch } = useCommodities();
  const [rateInput, setRateInput] = useState(manualRate.toString());
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('metals');
  const [isToman, setIsTomanState] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currency-unit');
    if (saved === 'toman') setIsTomanState(true);
  }, []);

  // Derived: what we show in the input (rial or toman depending on toggle)
  const displayRate = isToman ? Math.round(manualRate / 10) : manualRate;

  useEffect(() => {
    setRateInput(displayRate.toLocaleString('en-US'));
  }, [manualRate, isToman]);

  const setIsToman = (val: boolean) => {
    setIsTomanState(val);
    localStorage.setItem('currency-unit', val ? 'toman' : 'rial');
    // update the input immediately to reflect unit change
    const current = Number(rateInput.replace(/,/g, ''));
    if (!isNaN(current) && current > 0) {
      const newVal = val ? Math.round(current / 10) : current * 10;
      setRateInput(newVal.toLocaleString('en-US'));
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setRateInput('');
      return;
    }
    setRateInput(Number(raw).toLocaleString('en-US'));
  };

  const handleSaveRate = () => {
    const num = Number(rateInput.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      // Always store internally as Rial
      setManualRate(isToman ? num * 10 : num);
    }
  };

  const formatIrr = (price: number, rate: number, asToman: boolean) => {
    const rawIrr = price * rate;
    const val = asToman ? rawIrr / 10 : rawIrr;
    if (val > 1000000) return (val / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M';
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const filteredData = commodities?.filter(c => c.category === activeCategory) || [];

  const rateModes = [
    { 
      value: 'free', 
      label: t('rateModes.free'), 
      hint: 'TGJU'
    },
    { 
      value: 'sana', 
      label: t('rateModes.sana'), 
      disabled: true,
      hint: t('rateModes.noData')
    },
    { 
      value: 'cbi', 
      label: t('rateModes.cbi'), 
      disabled: true,
      hint: t('rateModes.noData')
    },
    { 
      value: 'manual', 
      label: t('rateModes.manual')
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-xl rounded-br-none border border-border/50 overflow-hidden relative">
      <div className="px-4 pt-4 pb-3 border-b border-border/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <h3 className="font-semibold text-sm">{t('title')}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("size-7", isLoading && "animate-spin")} 
              onClick={() => refetch()}
            >
              <RefreshCw className="size-3.5 text-muted-foreground" />
            </Button>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <Settings2 className="size-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">{t('usdRate')}</p>
                    <Combobox
                      options={rateModes}
                      value={irrMode}
                      onChange={(v) => setIrrMode(v as IrrMode)}
                      placeholder={t('usdRate')}
                      className="rtl:text-right w-full"
                    />
                    
                    {irrMode !== 'manual' && (
                      <div className="mt-2 rounded-lg bg-muted/40 border border-border/40 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{t('activeRateText', { rate: '' }).replace(': ', '')}</p>
                          {irrMode === 'free' && (
                            <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              TGJU
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold fa-num" dir="ltr">
                          {(isToman ? activeRate / 10 : activeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })} {isToman ? t('toman') : t('rial')}
                        </p>
                      </div>
                    )}
                    
                    {irrMode === 'manual' && (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Input 
                            value={rateInput}
                            onChange={handleRateChange}
                            className="h-8 text-sm fa-num"
                            placeholder={isToman ? '60000' : '600000'}
                            dir="ltr"
                          />
                          <Button size="sm" className="h-8 px-3" onClick={handleSaveRate}>
                            {t('update')}
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right">
                          {isToman ? t('toman') : t('rial')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Label htmlFor="toman-mode" className="text-xs font-medium text-muted-foreground">
                      {t('toman')}
                    </Label>
                    <Switch
                      id="toman-mode"
                      checked={isToman}
                      onCheckedChange={setIsToman}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Sliding Tabs */}
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
              <span className={cn("relative z-10 transition-colors", activeCategory === cat ? "text-foreground" : "text-muted-foreground hover:text-foreground/80")}>
                {t(`categories.${cat}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

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
                const isUp = item.trend === 'up';
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
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                      hoveredId === item.id
                        ? "bg-muted/40 border-primary/30 shadow-sm scale-[1.01]"
                        : "bg-muted/10 border-border/40"
                    )}
                  >
                    <div>
                      <p className={cn(
                        "text-sm font-semibold transition-colors duration-200",
                        hoveredId === item.id ? "text-primary" : "text-foreground"
                      )}>
                        {t(item.id)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t(UNITS[item.id] || 'unitOz')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={cn(
                            "text-[10px] font-medium flex items-center fa-num",
                            isUp ? "text-emerald-500" : isDown ? "text-rose-500" : "text-muted-foreground"
                          )}>
                            {isUp ? <TrendingUp className="size-3 me-0.5" /> : isDown ? <TrendingDown className="size-3 me-0.5" /> : <Minus className="size-3 me-0.5" />}
                            <span dir="ltr">{item.percentChange.toFixed(2)}%</span>
                          </span>
                          <span className="text-sm font-bold fa-num" dir="ltr">
                            ${formatPrice(item.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 fa-num">
                          {formatIrr(item.price, activeRate, isToman)} {isToman ? t('toman') : t('rial')}
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
