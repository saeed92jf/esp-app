import { NextResponse } from 'next/server';
import { MarketSymbol } from '../models/market.model';
import { MarketPriceService } from '../services/market-price.service';

const MARKET_SYMBOLS: MarketSymbol[] = [
  // Crypto (Finnhub)
  { id: 'btc',       symbol: 'BINANCE:BTCUSDT',    category: 'crypto' },
  { id: 'eth',       symbol: 'BINANCE:ETHUSDT',    category: 'crypto' },
  { id: 'usdt',      symbol: 'BINANCE:USDCUSDT',   category: 'crypto' },
  { id: 'sol',       symbol: 'BINANCE:SOLUSDT',    category: 'crypto' },
  { id: 'xrp',       symbol: 'BINANCE:XRPUSDT',    category: 'crypto' },
  
  // Metals (Yahoo)
  { id: 'gold',      symbol: 'GC=F',   category: 'global_metals', priceIn: 'usd' },
  { id: 'silver',    symbol: 'SI=F',   category: 'global_metals', priceIn: 'usd' },
  { id: 'copper',    symbol: 'HG=F',   category: 'global_metals', priceIn: 'usd', multiplier: 2204.62 }, // lbs to metric ton
  { id: 'platinum',  symbol: 'PL=F',   category: 'global_metals', priceIn: 'usd' },
  { id: 'palladium', symbol: 'PA=F',   category: 'global_metals', priceIn: 'usd' },
  { id: 'aluminum',  symbol: 'ALI=F',  category: 'global_metals', priceIn: 'usd' },
  
  // Energy (Yahoo)
  { id: 'wti',       symbol: 'CL=F',   category: 'energy',        priceIn: 'usd' },
  { id: 'brent',     symbol: 'BZ=F',   category: 'energy',        priceIn: 'usd' },
  { id: 'ng',        symbol: 'NG=F',   category: 'energy',        priceIn: 'usd' },
  { id: 'heating_oil',symbol:'HO=F',   category: 'energy',        priceIn: 'usd' },
  { id: 'gasoline',  symbol: 'RB=F',   category: 'energy',        priceIn: 'usd' },


  // Forex (Yahoo)
  { id: 'eur',       symbol: 'EURUSD=X', category: 'forex',       priceIn: 'usd' },
  { id: 'gbp',       symbol: 'GBPUSD=X', category: 'forex',       priceIn: 'usd' },
  { id: 'chf',       symbol: 'CHF=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'cad',       symbol: 'CAD=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'aud',       symbol: 'AUDUSD=X', category: 'forex',       priceIn: 'usd' },
  { id: 'jpy',       symbol: 'JPY=X',    category: 'forex',       priceIn: 'usd', invert: true, multiplier: 100 },
  { id: 'cny',       symbol: 'CNY=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'rub',       symbol: 'RUB=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'aed',       symbol: 'AED=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'try',       symbol: 'TRY=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'iqd',       symbol: 'IQD=X',    category: 'forex',       priceIn: 'usd', invert: true, multiplier: 100 },
  { id: 'sar',       symbol: 'SAR=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'inr',       symbol: 'INR=X',    category: 'forex',       priceIn: 'usd', invert: true },
  { id: 'kwd',       symbol: 'KWD=X',    category: 'forex',       priceIn: 'usd', invert: true },
];

export class MarketController {
  static async getCommodities() {
    try {
      const results = await MarketPriceService.getQuotes(MARKET_SYMBOLS);
      return NextResponse.json(results, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
}
