import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useDashboardSettings } from '../store/use-dashboard-settings';
import { useCommodities } from '../hooks/use-commodities';
import { Combobox } from '@/components/ui/combobox';

interface DashboardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardSettingsModal({ open, onOpenChange }: DashboardSettingsModalProps) {
  const t = useTranslations('Dashboard.commodities');
  const tCommon = useTranslations('Dashboard');
  const { statCards, chartSource, setStatCards, setChartSource } = useDashboardSettings();
  const { commodities } = useCommodities();

  const handleCardChange = (index: number, value: string) => {
    const newCards = [...statCards] as [string, string, string, string, string, string];
    newCards[index] = value;
    setStatCards(newCards);
  };

  const chartOptions = [
    { value: 'wti', label: t('wti') },
    { value: 'brent', label: t('brent') },
    { value: 'gold', label: t('gold') },
    { value: 'silver', label: t('silver') },
    { value: 'btc', label: t('btc') },
    { value: 'eth', label: t('eth') }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تنظیمات داشبورد</DialogTitle>
          <DialogDescription className="text-right">
            در این بخش می‌توانید مشخص کنید کدام شاخص‌ها در کارت‌های آمار و نمودار اصلی نمایش داده شوند.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">کارت‌های آمار (۶ عدد)</h4>
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((cardId, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Label htmlFor={`card-${index}`} className="text-xs text-muted-foreground">کارت {index + 1}</Label>
                  <Combobox
                    options={(commodities || []).map(item => ({ value: item.id, label: t(item.id) }))}
                    value={cardId}
                    onChange={(val: string) => handleCardChange(index, val)}
                    placeholder="انتخاب شاخص"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">نمودار اصلی (Chart)</h4>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chart-source" className="text-xs text-muted-foreground">منبع داده نمودار (تاریخی)</Label>
              <Combobox
                options={chartOptions}
                value={chartSource}
                onChange={setChartSource}
                placeholder="انتخاب شاخص نمودار"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
