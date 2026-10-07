import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { useEffect } from 'react';
import { useDashboardSettings } from '../store/use-dashboard-settings';

export type { IrrMode } from '../store/use-dashboard-settings';

export function useCommodities() {
  const {
    irrMode, setIrrMode,
    manualRate, setManualRate,
    isToman, setIsToman,
  } = useDashboardSettings();

  const {
    data: commodities,
    error,
    isLoading,
    isFetching: isFetchingCommodities,
    refetch: refetchCommodities,
    dataUpdatedAt: commoditiesUpdatedAt,
  } = useQuery({
    queryKey: ['commodities'],
    queryFn: () => api.commodities.getCommodities(),
    refetchInterval: 30_000,
    staleTime: 0,         // always refetch when requested
    gcTime: 120_000,
  });

  // Exchange rates always hit TGJU live (SERVICE_MODES.exchangeRates = 'real')
  const {
    data: exchangeRates,
    isFetching: isFetchingRates,
    refetch: refetchRates,
    dataUpdatedAt: ratesUpdatedAt,
  } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => api.exchangeRates.getRates(),
    refetchInterval: 30000, // 30 sec
    staleTime: 0,
  });

  // Once live rate arrives, seed manualRate if user hasn't set one yet
  useEffect(() => {
    if (exchangeRates?.free && manualRate === 2_300_000) {
      setManualRate(exchangeRates.free);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRates?.free]);

  const refetch = () => {
    refetchCommodities();
    refetchRates();
  };

  const getActiveRate = (): number => {
    if (irrMode === 'manual') return manualRate;
    if (exchangeRates) {
      const rateMap: Record<string, number | undefined> = {
        free: exchangeRates.free,
        sana: exchangeRates.sana,
        cbi: exchangeRates.cbi,
      };
      const rate = rateMap[irrMode];
      if (rate && rate > 0) return rate;
    }
    return manualRate;
  };

  return {
    commodities,
    exchangeRates,
    isLoading,
    isFetching: isFetchingCommodities || isFetchingRates,
    error,
    refetch,

    irrMode,
    setIrrMode,
    manualRate,
    setManualRate,
    isToman,
    setIsToman,

    activeRate: getActiveRate(),
    ratesUpdatedAt: Math.max(ratesUpdatedAt, commoditiesUpdatedAt),
  };
}
