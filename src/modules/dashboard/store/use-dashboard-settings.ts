import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardSettingsState {
  statCards: [string, string, string, string, string, string]; // Exactly 6 items
  chartSource: string;
  chartType: 'area' | 'line' | 'bar';
  setStatCards: (cards: [string, string, string, string, string, string]) => void;
  setChartSource: (source: string) => void;
  setChartType: (type: 'area' | 'line' | 'bar') => void;
}

export const useDashboardSettings = create<DashboardSettingsState>()(
  persist(
    (set) => ({
      statCards: ['gold', 'gasoline', 'wti', 'sekee', 'eur', 'btc'],
      chartSource: 'wti', // WTI Crude Oil
      chartType: 'area',
      setStatCards: (cards) => set({ statCards: cards }),
      setChartSource: (source) => set({ chartSource: source }),
      setChartType: (type) => set({ chartType: type }),
    }),
    {
      name: 'dashboard-settings',
    }
  )
);
