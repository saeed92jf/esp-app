import commoditiesMock from "@/data/mock/commodities.json";
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

export const FAKE_COMMODITIES: CommodityItem[] = commoditiesMock as unknown as CommodityItem[];

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
