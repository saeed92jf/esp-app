import { HttpClient } from '@/services/core/http';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CommodityItem {
  id: string;
  category: 'global_metals' | 'energy' | 'agriculture' | 'forex' | 'crypto';
  /**
   * For 'irr' assets (forex): price is in Iranian Rial — directly from TGJU.
   * For 'usd' assets (metals, energy, crypto, agriculture): price is in USD.
   */
  price: number;
  /**
   * For 'irr' assets: same as price (already IRR).
   * For 'usd' assets: IRR equivalent = price × usdRate.
   */
  originalPrice?: number;
  /** USD equivalent price (for reference/cross-currency display) */
  priceUsd?: number;
  /** Indicates the native currency of `price` field */
  priceIn?: 'irr' | 'usd';
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'neutral';
  error?: boolean;
}

export interface ICommoditiesService {
  getCommodities(): Promise<CommodityItem[]>;
}

const FAKE_COMMODITIES: CommodityItem[] = [
  { id: 'gold', category: 'global_metals', price: 2450.50, change: 12.5, percentChange: 0.51, trend: 'up', priceIn: 'usd' },
  { id: 'silver', category: 'global_metals', price: 29.80, change: -0.2, percentChange: -0.67, trend: 'down', priceIn: 'usd' },
  { id: 'copper', category: 'global_metals', price: 4.5, change: 0.1, percentChange: 2.2, trend: 'up', priceIn: 'usd' },
  { id: 'platinum', category: 'global_metals', price: 1050.00, change: -5.0, percentChange: -0.47, trend: 'down', priceIn: 'usd' },
  { id: 'palladium', category: 'global_metals', price: 1020.00, change: 10.0, percentChange: 0.99, trend: 'up', priceIn: 'usd' },
  { id: 'aluminum', category: 'global_metals', price: 2500.00, change: 20.0, percentChange: 0.8, trend: 'up', priceIn: 'usd' },
  { id: 'wti', category: 'energy', price: 82.40, change: 1.1, percentChange: 1.35, trend: 'up', priceIn: 'usd' },
  { id: 'brent', category: 'energy', price: 86.90, change: 0.9, percentChange: 1.04, trend: 'up', priceIn: 'usd' },
  { id: 'ng', category: 'energy', price: 2.15, change: -0.05, percentChange: -2.27, trend: 'down', priceIn: 'usd' },
  { id: 'heating_oil', category: 'energy', price: 2.5, change: 0.02, percentChange: 0.8, trend: 'up', priceIn: 'usd' },
  { id: 'gasoline', category: 'energy', price: 2.4, change: 0.01, percentChange: 0.4, trend: 'up', priceIn: 'usd' },
  { id: 'eur', category: 'forex', price: 1.08, change: 0.002, percentChange: 0.18, trend: 'up' },
  { id: 'gbp', category: 'forex', price: 1.25, change: -0.001, percentChange: -0.08, trend: 'down' },
  { id: 'cny', category: 'forex', price: 0.14, change: 0.0005, percentChange: 0.35, trend: 'up' },
  { id: 'aed', category: 'forex', price: 0.27, change: 0, percentChange: 0, trend: 'neutral' },
  { id: 'try', category: 'forex', price: 0.03, change: -0.0001, percentChange: -0.3, trend: 'down' },
  { id: 'btc', category: 'crypto', price: 65000, change: 1200, percentChange: 1.8, trend: 'up' },
  { id: 'eth', category: 'crypto', price: 3500, change: -50, percentChange: -1.4, trend: 'down', priceIn: 'usd' },
  { id: 'usdt', category: 'crypto', price: 1.0, change: 0, percentChange: 0, trend: 'neutral', priceIn: 'usd' },
  { id: 'usd_azad', category: 'forex', price: 615000, change: -1000, percentChange: 0.16, trend: 'down', priceIn: 'irr' },
  { id: 'usd_sana', category: 'forex', price: 432500, change: 500, percentChange: 0.11, trend: 'up', priceIn: 'irr' },
  { id: 'gold_18k', category: 'global_metals', price: 34500000, change: -20000, percentChange: 0.05, trend: 'down', priceIn: 'irr' },
  { id: 'sekee',    category: 'global_metals', price: 420000000, change: 1000000, percentChange: 0.23, trend: 'up', priceIn: 'irr' },
  { id: 'sekeb',    category: 'global_metals', price: 395000000, change: 0, percentChange: 0, trend: 'neutral', priceIn: 'irr' },
];

export class FakeCommoditiesService implements ICommoditiesService {
  async getCommodities(): Promise<CommodityItem[]> {
    await wait(600);
    return FAKE_COMMODITIES;
  }
}

export class RealCommoditiesService implements ICommoditiesService {
  constructor(private http: HttpClient) {}

  async getCommodities(): Promise<CommodityItem[]> {
    // Always fetch live — cache-busting timestamp prevents stale responses
    const res = await fetch(`/api/commodities?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch commodities');
    return res.json();
  }
}
