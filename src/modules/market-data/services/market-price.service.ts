import { MarketSymbol, MarketQuote } from '../models/market.model';
import { FinnhubProvider } from '../providers/finnhub.provider';
import { YahooProvider } from '../providers/yahoo.provider';
import { MarketCacheService } from './market-cache.service';

export class MarketPriceService {
  static async getQuotes(symbols: MarketSymbol[]): Promise<MarketQuote[]> {
    const missingSymbols: MarketSymbol[] = [];
    const cachedQuotes: MarketQuote[] = [];

    symbols.forEach(sym => {
      const cached = MarketCacheService.getQuote(sym.id);
      if (cached) {
        cachedQuotes.push(cached);
      } else {
        missingSymbols.push(sym);
      }
    });

    if (missingSymbols.length === 0) {
      return cachedQuotes;
    }

    const finnhubSymbols = missingSymbols.filter(s => s.category === 'crypto');
    const yahooSymbols = missingSymbols.filter(s => s.category !== 'crypto');

    const [finnhubData, yahooData] = await Promise.all([
      FinnhubProvider.getQuotes(finnhubSymbols),
      YahooProvider.getQuotes(yahooSymbols)
    ]);

    const newResults = [...finnhubData, ...yahooData];
    MarketCacheService.setQuotes(newResults);

    return [...cachedQuotes, ...newResults];
  }
}
