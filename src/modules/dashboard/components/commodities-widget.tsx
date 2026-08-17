'use client';

import { useTranslations } from 'next-intl';
import { useCommodities } from '../hooks/use-commodities';
import type { CommodityItem } from '../services/commodities.service';
import { Settings2, TrendingDown, TrendingUp, Minus, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const UNITS: Record<string, string> = {
  gold: 'unitOz',
  silver: 'unitOz',
  wti: 'unitBbl',
  brent: 'unitBbl',
  ng: 'unitMbtu',
};

const formatPrice = (price: number) => {
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatIrr = (price: number, rate: number) => {
  const irr = price * rate;
  if (irr > 1000000) return (irr / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M';
  return irr.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export function CommoditiesWidget() {
  const t = useTranslations('Dashboard.commodities');
  const { commodities, isLoading, irrRate, setIrrRate, refetch } = useCommodities();
  const [rateInput, setRateInput] = useState(irrRate.toString());
  const [open, setOpen] = useState(false);

  const handleSaveRate = () => {
    const num = Number(rateInput.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      setIrrRate(num);
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
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
            <PopoverContent className="w-60 p-4" align="end">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">{t('usdRate')}</p>
                <div className="flex gap-2">
                  <Input 
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="h-8 text-sm fa-num"
                    placeholder="600000"
                    dir="ltr"
                  />
                  <Button size="sm" className="h-8 px-3" onClick={handleSaveRate}>
                    {t('update')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {isLoading && !commodities?.length ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col gap-3 w-full">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted/40 rounded-xl w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {commodities?.map((item: CommodityItem) => {
              const isUp = item.trend === 'up';
              const isDown = item.trend === 'down';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40 hover:bg-muted/30 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
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
                        {formatIrr(item.price, irrRate)} ریال
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
