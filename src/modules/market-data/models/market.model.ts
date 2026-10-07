export interface MarketQuote {
  id: string;
  category: string;
  price: number;
  priceUsd: number;
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'neutral';
  priceIn: 'usd' | 'irr';
  source: string;
  error?: boolean;
}

export interface MarketHistory {
  labelKey: string;
  value: number;
}

export interface MarketSymbol {
  id: string;
  symbol: string;
  category: string;
  priceIn?: 'usd' | 'irr';
  invert?: boolean;
  multiplier?: number;
}
