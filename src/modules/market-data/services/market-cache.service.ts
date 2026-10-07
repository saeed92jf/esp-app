import { MarketQuote } from '../models/market.model';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MarketCacheService {
  private static quoteCache: Map<string, CacheEntry<MarketQuote>> = new Map();
  private static CACHE_TTL_MS = 25 * 1000; // 25 seconds

  static getQuote(id: string): MarketQuote | null {
    const entry = this.quoteCache.get(id);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.quoteCache.delete(id);
      return null;
    }

    return entry.data;
  }

  static setQuote(id: string, quote: MarketQuote) {
    this.quoteCache.set(id, {
      data: quote,
      timestamp: Date.now(),
    });
  }

  static setQuotes(quotes: MarketQuote[]) {
    quotes.forEach((q) => this.setQuote(q.id, q));
  }
}
