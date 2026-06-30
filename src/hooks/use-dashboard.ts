// src/hooks/use-dashboard.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/services';
import type { DashboardData } from '@/services';
import type { UserRole } from '@/types/auth';

interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useDashboard(role: UserRole | undefined): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    api.dashboard
      .getByRole(role)
      .then((result) => {
        if (!ac.signal.aborted) setData(result);
      })
      .catch((err: unknown) => {
        if (!ac.signal.aborted) {
          setError(err instanceof ApiError ? err : new ApiError('UNKNOWN', 'خطا در بارگذاری داشبورد'));
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [role, refetchTick]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefetchTick((t) => t + 1),
  };
}
