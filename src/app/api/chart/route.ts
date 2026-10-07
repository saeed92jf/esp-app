import { NextResponse } from 'next/server';

const YH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json',
};

// Chart source → Yahoo Finance symbol
const SYMBOL_MAP: Record<string, string> = {
  wti:      'CL=F',
  brent:    'BZ=F',
  gold:     'GC=F',
  silver:   'SI=F',
  gasoline: 'RB=F',
  ng:       'NG=F',
  eur:      'EURUSD=X',
};

// Crypto sources go to Finnhub candle (free plan doesn't support candles, so we
// approximate using the spark endpoint and build a synthetic 30-day array).
// For now map crypto to Yahoo as well — they work fine server-side.
const CRYPTO_SYMBOL: Record<string, string> = {
  btc: 'BTC-USD',
  eth: 'ETH-USD',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'wti';

  const yhSymbol =
    SYMBOL_MAP[source] ?? CRYPTO_SYMBOL[source];

  if (!yhSymbol) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yhSymbol}?interval=1d&range=3mo`,
      { headers: YH_HEADERS, cache: 'no-store' },
    );

    if (!res.ok) throw new Error(`Yahoo ${res.status}`);

    const data      = await res.json();
    const result    = data.chart.result[0];
    const timestamps: number[] = result.timestamp;
    const closes: (number | null)[] = result.indicators.quote[0].close;

    const allPoints = timestamps
      .map((ts, i) => ({
        dateStr: new Date(ts * 1000).toISOString().split('T')[0],
        value:   Number(closes[i]?.toFixed(2) || 0),
      }))
      .filter((p) => p.value > 0);

    // Build a map then fill forward for any missing days in last 30 days
    const dataMap = new Map<string, number>();
    allPoints.forEach((p) => dataMap.set(p.dateStr, p.value));

    const chartPoints = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      let val = dataMap.get(dateStr);
      if (val === undefined) {
        // Forward-fill up to 10 days back
        for (let back = 1; back <= 10; back++) {
          const prev = new Date(d);
          prev.setDate(prev.getDate() - back);
          const prevStr = prev.toISOString().split('T')[0];
          if (dataMap.has(prevStr)) { val = dataMap.get(prevStr); break; }
        }
      }
      chartPoints.push({ labelKey: d.toISOString(), value: val || 0 });
    }

    return NextResponse.json(chartPoints);
  } catch (error) {
    console.warn('Chart API error:', error);
    return NextResponse.json([]);
  }
}
