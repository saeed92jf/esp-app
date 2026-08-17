import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { useState, useEffect } from 'react';

export function useCommodities() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['commodities'],
    queryFn: () => api.commodities.getCommodities(),
    refetchInterval: 60000,
  });

  const [irrRate, setIrrRateState] = useState<number>(600000);

  useEffect(() => {
    const saved = localStorage.getItem('usd-to-irr-rate');
    if (saved) {
      setIrrRateState(Number(saved));
    }
  }, []);

  const setIrrRate = (rate: number) => {
    setIrrRateState(rate);
    localStorage.setItem('usd-to-irr-rate', rate.toString());
  };

  return {
    commodities: data,
    isLoading,
    error,
    refetch,
    irrRate,
    setIrrRate,
  };
}
