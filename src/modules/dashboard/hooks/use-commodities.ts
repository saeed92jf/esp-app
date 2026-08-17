import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { useState, useEffect } from 'react';

export type IrrMode = 'manual' | 'cbi' | 'sana' | 'free';

export function useCommodities() {
  const { data: commodities, error, isLoading, refetch: refetchCommodities } = useQuery({
    queryKey: ['commodities'],
    queryFn: () => api.commodities.getCommodities(),
    refetchInterval: 60000,
  });

  // Exchange rates always use api.exchangeRates which is set to 'real' in SERVICE_MODES
  // regardless of the global API_MODE — so it always hits TGJU live data
  const { data: exchangeRates, refetch: refetchRates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => api.exchangeRates.getRates(),
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  });

  const [irrMode, setIrrModeState] = useState<IrrMode>('free');
  const [manualRate, setManualRateState] = useState<number>(1869000);

  useEffect(() => {
    const savedMode = localStorage.getItem('irr-mode') as IrrMode;
    const savedManual = localStorage.getItem('usd-to-irr-rate');

    if (savedMode && ['manual', 'cbi', 'sana', 'free'].includes(savedMode)) {
      setIrrModeState(savedMode);
    } else {
      setIrrModeState('free');
      localStorage.setItem('irr-mode', 'free');
    }

    if (savedManual) {
      setManualRateState(Number(savedManual));
    }
  }, []);

  // Sync default manual rate with real free market rate once loaded
  // if the user hasn't set a custom manual rate yet.
  useEffect(() => {
    if (exchangeRates?.free && !localStorage.getItem('usd-to-irr-rate')) {
      setManualRateState(exchangeRates.free);
    }
  }, [exchangeRates?.free]);

  const setIrrMode = (mode: IrrMode) => {
    setIrrModeState(mode);
    localStorage.setItem('irr-mode', mode);
  };

  const setManualRate = (rate: number) => {
    setManualRateState(rate);
    localStorage.setItem('usd-to-irr-rate', rate.toString());
    setIrrMode('manual');
  };

  const refetch = () => {
    refetchCommodities();
    refetchRates();
  };

  const getActiveRate = (): number => {
    if (irrMode === 'manual') return manualRate;
    if (exchangeRates) {
      const rateMap: Record<IrrMode, number | undefined> = {
        free: exchangeRates.free,
        sana: exchangeRates.sana,
        cbi: exchangeRates.cbi,
        manual: undefined,
      };
      const rate = rateMap[irrMode];
      if (rate && rate > 0) return rate;
    }
    return manualRate; // fallback
  };

  return {
    commodities,
    exchangeRates,
    isLoading,
    error,
    refetch,

    irrMode,
    setIrrMode,

    manualRate,
    setManualRate,

    activeRate: getActiveRate(),
  };
}
