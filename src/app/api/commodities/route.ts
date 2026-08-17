import { NextResponse } from 'next/server';

const TICKERS = [
  // Metals
  { id: 'gold', symbol: 'GC=F', category: 'metals' },
  { id: 'silver', symbol: 'SI=F', category: 'metals' },
  { id: 'platinum', symbol: 'PL=F', category: 'metals' },
  { id: 'palladium', symbol: 'PA=F', category: 'metals' },
  { id: 'copper', symbol: 'HG=F', category: 'metals' },
  { id: 'aluminum', symbol: 'ALI=F', category: 'metals' },
  { id: 'zinc', symbol: 'ZNC=F', category: 'metals' },
  { id: 'steel', symbol: 'HRC=F', category: 'metals' },
  // Energy
  { id: 'wti', symbol: 'CL=F', category: 'energy' },
  { id: 'brent', symbol: 'BZ=F', category: 'energy' },
  { id: 'ng', symbol: 'NG=F', category: 'energy' },
  // Forex
  { id: 'eur', symbol: 'EURUSD=X', category: 'forex', type: 'direct' }, // 1 EUR = X USD
  { id: 'gbp', symbol: 'GBPUSD=X', category: 'forex', type: 'direct' }, // 1 GBP = X USD
  { id: 'cny', symbol: 'CNY=X', category: 'forex', type: 'inverse' }, // 1 USD = X CNY
  { id: 'aed', symbol: 'AED=X', category: 'forex', type: 'inverse' }, // 1 USD = X AED
  { id: 'try', symbol: 'TRY=X', category: 'forex', type: 'inverse' }, // 1 USD = X TRY
  // Crypto
  { id: 'btc', symbol: 'BTC-USD', category: 'crypto' },
  { id: 'eth', symbol: 'ETH-USD', category: 'crypto' },
  { id: 'usdt', symbol: 'USDT-USD', category: 'crypto' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      TICKERS.map(async (t) => {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${t.symbol}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              'Accept': 'application/json'
            },
            next: { revalidate: 60 } // cache for 60 seconds
          });
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) throw new Error('Invalid data');
          
          let currentPrice = meta.regularMarketPrice;
          let prevPrice = meta.previousClose;

          if (t.type === 'inverse') {
            currentPrice = 1 / meta.regularMarketPrice;
            prevPrice = 1 / meta.previousClose;
          }

          const diff = currentPrice - prevPrice;
          const percentChange = (diff / prevPrice) * 100;

          return {
            id: t.id,
            category: t.category,
            price: currentPrice,
            change: diff,
            percentChange: percentChange,
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
          };
        } catch (e) {
          console.error(`Failed to fetch ${t.symbol}`, e);
          return { id: t.id, category: t.category, price: 0, change: 0, percentChange: 0, trend: 'neutral', error: true };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commodities' }, { status: 500 });
  }
}
