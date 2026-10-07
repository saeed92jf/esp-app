'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import { useCommodities } from '../hooks/use-commodities';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DashboardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardSettingsModal({ open, onOpenChange }: DashboardSettingsModalProps) {
  const t  = useTranslations('Dashboard.commodities');
  const tD = useTranslations('Dashboard');

  const { statCards, chartSource, setStatCards, setChartSource } = useDashboardSettings();
  const { commodities } = useCommodities();

  const handleCardChange = (index: number, value: string) => {
    const next = [...statCards] as [string, string, string, string, string, string];
    next[index] = value;
    setStatCards(next);
  };

  const chartOptions = [
    { value: 'wti',    label: t('wti')    },
    { value: 'brent',  label: t('brent')  },
    { value: 'gold',   label: t('gold')   },
    { value: 'silver', label: t('silver') },
    { value: 'btc',    label: t('btc')    },
    { value: 'eth',    label: t('eth')    },
  ];

  const commodityOptions = (commodities || []).map(item => ({
    value: item.id,
    label: t(item.id),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0 overflow-hidden" dir="rtl">
        <DialogHeader className="p-4 md:p-5 border-b border-border/50 bg-muted/20">
          <DialogTitle className="text-base font-semibold">تنظیمات آمار داشبورد</DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-5 min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          {/* Empty per user request */}
          در حال حاضر تنظیمی وجود ندارد.
        </div>
      </DialogContent>
    </Dialog>
  );
}

