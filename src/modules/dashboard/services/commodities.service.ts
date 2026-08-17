import { HttpClient } from '@/services/core/http';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CommodityItem {
  id: string;
  price: number;
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'neutral';
  error?: boolean;
}

export interface ICommoditiesService {
  getCommodities(): Promise<CommodityItem[]>;
}

const FAKE_COMMODITIES: CommodityItem[] = [
  { id: 'gold', price: 2450.50, change: 12.5, percentChange: 0.51, trend: 'up' },
  { id: 'silver', price: 29.80, change: -0.2, percentChange: -0.67, trend: 'down' },
  { id: 'wti', price: 82.40, change: 1.1, percentChange: 1.35, trend: 'up' },
  { id: 'brent', price: 86.90, change: 0.9, percentChange: 1.04, trend: 'up' },
  { id: 'ng', price: 2.15, change: -0.05, percentChange: -2.27, trend: 'down' },
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
    // We are calling our internal Next.js API route to proxy Yahoo Finance
    const res = await fetch('/api/commodities', { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch commodities');
    return res.json();
  }
}
