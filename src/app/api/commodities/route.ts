import { NextResponse } from 'next/server';

const TICKERS = [
  { id: 'gold', symbol: 'GC=F' },
  { id: 'silver', symbol: 'SI=F' },
  { id: 'wti', symbol: 'CL=F' },
  { id: 'brent', symbol: 'BZ=F' },
  { id: 'ng', symbol: 'NG=F' }
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
          
          const currentPrice = meta.regularMarketPrice;
          const prevPrice = meta.previousClose;
          const diff = currentPrice - prevPrice;
          const percentChange = (diff / prevPrice) * 100;

          return {
            id: t.id,
            price: currentPrice,
            change: diff,
            percentChange: percentChange,
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
          };
        } catch (e) {
          console.error(`Failed to fetch ${t.symbol}`, e);
          return { id: t.id, price: 0, change: 0, percentChange: 0, trend: 'neutral', error: true };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commodities' }, { status: 500 });
  }
}
