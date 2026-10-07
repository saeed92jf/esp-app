import { MarketQuote, MarketSymbol } from '../models/market.model';

const YH_SPARK = 'https://query1.finance.yahoo.com/v8/finance/spark';
const YH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  Accept: 'application/json',
};

export class YahooProvider {
  static async getQuotes(symbols: MarketSymbol[]): Promise<MarketQuote[]> {
    if (symbols.length === 0) return [];
    
    const results: MarketQuote[] = [];
    
    // Chunk symbols to bypass Yahoo's 20-symbol limit
    const chunkSize = 15;
    const chunks: MarketSymbol[][] = [];
    for (let i = 0; i < symbols.length; i += chunkSize) {
      chunks.push(symbols.slice(i, i + chunkSize));
    }

    try {
      for (const chunk of chunks) {
        const symbolString = chunk.map((t) => t.symbol).join(',');
        const res = await fetch(`${YH_SPARK}?symbols=${symbolString}`, {
          headers: YH_HEADERS,
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error(`Yahoo ${res.status}`);
        }
        
        const data = await res.json();

        for (const t of chunk) {
          const td = data[t.symbol];
          if (!td || !td.close || !td.previousClose) {
            results.push({ 
              id: t.id, 
              category: t.category, 
              price: 0, 
              priceUsd: 0, 
              change: 0, 
              percentChange: 0, 
              trend: 'neutral', 
              priceIn: t.priceIn || 'usd', 
              source: 'yahoo', 
              error: true 
            });
            continue;
          }

          const prices = td.close.filter((p: number | null) => p !== null);
          if (prices.length === 0) {
            continue;
          }

          let price = prices[prices.length - 1] as number;
          let prev = td.previousClose as number;

          if (t.invert) {
            price = 1 / price;
            prev = 1 / prev;
          }
          
          if (t.multiplier) {
            price *= t.multiplier;
            prev *= t.multiplier;
          }

          const change = price - prev;
          const pct = (change / prev) * 100;
          const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

          results.push({
            id: t.id,
            category: t.category,
            price,
            priceUsd: price,
            change: Math.abs(change),
            percentChange: Math.abs(pct),
            trend,
            priceIn: t.priceIn || 'usd',
            source: 'yahoo'
          });
        }
      }
    } catch (e) {
      console.warn('Yahoo fetch failed', e);
    }
    
    return results;
  }
}
// Force Next.js rebuild

