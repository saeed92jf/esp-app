import { HttpClient } from '@/services/core/http';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CommodityItem {
  id: string;
  category: 'metals' | 'energy' | 'forex' | 'crypto';
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
  { id: 'gold', category: 'metals', price: 2450.50, change: 12.5, percentChange: 0.51, trend: 'up' },
  { id: 'silver', category: 'metals', price: 29.80, change: -0.2, percentChange: -0.67, trend: 'down' },
  { id: 'platinum', category: 'metals', price: 950.00, change: 5.0, percentChange: 0.53, trend: 'up' },
  { id: 'palladium', category: 'metals', price: 1333.00, change: 8.0, percentChange: 0.6, trend: 'up' },
  { id: 'copper', category: 'metals', price: 4.10, change: -0.05, percentChange: -1.2, trend: 'down' },
  { id: 'aluminum', category: 'metals', price: 3455.00, change: 22.0, percentChange: 0.64, trend: 'up' },
  { id: 'zinc', category: 'metals', price: 2530.00, change: -15.0, percentChange: -0.59, trend: 'down' },
  { id: 'steel', category: 'metals', price: 1175.00, change: 5.0, percentChange: 0.43, trend: 'up' },
  { id: 'wti', category: 'energy', price: 82.40, change: 1.1, percentChange: 1.35, trend: 'up' },
  { id: 'brent', category: 'energy', price: 86.90, change: 0.9, percentChange: 1.04, trend: 'up' },
  { id: 'ng', category: 'energy', price: 2.15, change: -0.05, percentChange: -2.27, trend: 'down' },
  { id: 'eur', category: 'forex', price: 1.08, change: 0.002, percentChange: 0.18, trend: 'up' },
  { id: 'gbp', category: 'forex', price: 1.25, change: -0.001, percentChange: -0.08, trend: 'down' },
  { id: 'cny', category: 'forex', price: 0.14, change: 0.0005, percentChange: 0.35, trend: 'up' },
  { id: 'aed', category: 'forex', price: 0.27, change: 0, percentChange: 0, trend: 'neutral' },
  { id: 'try', category: 'forex', price: 0.03, change: -0.0001, percentChange: -0.3, trend: 'down' },
  { id: 'btc', category: 'crypto', price: 65000, change: 1200, percentChange: 1.8, trend: 'up' },
  { id: 'eth', category: 'crypto', price: 3500, change: -50, percentChange: -1.4, trend: 'down' },
  { id: 'usdt', category: 'crypto', price: 1.0, change: 0, percentChange: 0, trend: 'neutral' },
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
