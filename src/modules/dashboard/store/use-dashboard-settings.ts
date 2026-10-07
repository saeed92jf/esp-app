import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IrrMode = 'manual' | 'cbi' | 'sana' | 'free';export interface DashboardSettingsState {
  // ── Dashboard tab ──────────────────────────────────────────────
  statCards: string[];
  chartSource: string;
  chartType: 'area' | 'line' | 'bar';
  setStatCards: (cards: string[]) => void;
  setChartSource: (source: string) => void;
  setChartType: (type: 'area' | 'line' | 'bar') => void;

  // ── Market (بازار) tab ─────────────────────────────────────────
  /** نرخ دلار به ریال — منبع انتخابی */
  irrMode: IrrMode;
  /** نرخ دستی دلار (ریال) */
  manualRate: number;
  /** نمایش به تومان یا ریال */
  isToman: boolean;

  setIrrMode: (mode: IrrMode) => void;
  setManualRate: (rate: number) => void;
  setIsToman: (val: boolean) => void;
}

export const useDashboardSettings = create<DashboardSettingsState>()(
  persist(
    (set) => ({
      // Dashboard
      statCards: ['gold', 'gasoline', 'wti', 'btc', 'eur'],
      chartSource: 'gold',
      chartType: 'area',
      setStatCards: (cards) => set({ statCards: cards }),
      setChartSource: (source) => set({ chartSource: source }),
      setChartType: (type) => set({ chartType: type }),

      // Market
      irrMode: 'free',
      manualRate: 2_300_000,
      isToman: true,
      setIrrMode: (irrMode) => set({ irrMode }),
      setManualRate: (manualRate) => set({ manualRate }),
      setIsToman: (isToman) => set({ isToman }),
    }),
    {
      name: 'dashboard-settings-v3',
    }
  )
);
