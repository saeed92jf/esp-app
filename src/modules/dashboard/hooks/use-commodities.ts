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

  const { data: exchangeRates, refetch: refetchRates } = useQuery({
    queryKey: ['exchange-rates'],
    // Exchange rates always come from real TGJU API (third-party source),
    // regardless of the app's fake/real API mode — same as AparatService.
    queryFn: async () => {
      const res = await fetch('/api/exchange-rates');
      if (!res.ok) throw new Error('Failed to fetch exchange rates');
      return res.json();
    },
    refetchInterval: 300000, // 5 minutes (matches the API cache)
    staleTime: 60000,
  });

  const [irrMode, setIrrModeState] = useState<IrrMode>('free');
  const [manualRate, setManualRateState] = useState<number>(600000);

  useEffect(() => {
    const savedMode = localStorage.getItem('irr-mode') as IrrMode;
    const savedManual = localStorage.getItem('usd-to-irr-rate');
    
    if (savedMode && ['manual', 'cbi', 'sana', 'free'].includes(savedMode)) {
      setIrrModeState(savedMode);
    } else {
      setIrrModeState('free'); // Default to free market
      localStorage.setItem('irr-mode', 'free');
    }

    if (savedManual) {
      setManualRateState(Number(savedManual));
    }
  }, []);

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

  const getActiveRate = () => {
    if (irrMode === 'manual') return manualRate;
    if (exchangeRates && exchangeRates[irrMode]) return exchangeRates[irrMode];
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

    activeRate: getActiveRate()
  };
}
