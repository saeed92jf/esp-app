import { MarketQuote, MarketSymbol } from '../models/market.model';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export class FinnhubProvider {
  static async getQuotes(symbols: MarketSymbol[]): Promise<MarketQuote[]> {
    if (!FINNHUB_KEY) return [];

    const results: MarketQuote[] = [];

    await Promise.all(
      symbols.map(async (t) => {
        try {
          const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${t.symbol}&token=${FINNHUB_KEY}`, {
            cache: 'no-store',
          });
          if (!res.ok) return;
          const d = await res.json();
          if (!d.c) return;
          
          results.push({
            id: t.id,
            category: t.category,
            price: d.c,
            priceUsd: d.c,
            change: Math.abs(d.d ?? 0),
            percentChange: Math.abs(d.dp ?? 0),
            trend: (d.d ?? 0) > 0 ? 'up' : (d.d ?? 0) < 0 ? 'down' : 'neutral',
            priceIn: t.priceIn || 'usd',
            source: 'finnhub',
          });
        } catch {
          // Skip on error
        }
      })
    );

    return results;
  }
}
