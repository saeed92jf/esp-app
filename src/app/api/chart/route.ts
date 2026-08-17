import { NextResponse } from 'next/server';

const SYMBOL_MAP: Record<string, string> = {
  wti: 'CL=F',
  brent: 'BZ=F',
  gold: 'GC=F',
  silver: 'SI=F',
  btc: 'BTC-USD',
  eth: 'ETH-USD',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'wti';
  const symbol = SYMBOL_MAP[source];

  if (!symbol) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Yahoo Finance API error');
    }

    const data = await res.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const chartPoints = timestamps.map((ts: number, i: number) => {
      const date = new Date(ts * 1000);
      return {
        // use short date string for label e.g., "Aug 15"
        labelKey: date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
        value: Number(closes[i]?.toFixed(2) || 0)
      };
    }).filter((p: any) => p.value > 0);

    return NextResponse.json(chartPoints);
  } catch (error) {
    console.error('Chart API error:', error);
    // Return a graceful fallback if Yahoo Finance is unreachable
    return NextResponse.json([]);
  }
}
