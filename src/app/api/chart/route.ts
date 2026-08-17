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
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Yahoo Finance API error');
    }

    const data = await res.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const allDataPoints = timestamps.map((ts: number, i: number) => ({
      dateStr: new Date(ts * 1000).toISOString().split('T')[0],
      value: Number(closes[i]?.toFixed(2) || 0)
    })).filter((p: any) => p.value > 0);

    const dataMap = new Map<string, number>();
    allDataPoints.forEach((p: any) => dataMap.set(p.dateStr, p.value));

    const chartPoints = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let val = dataMap.get(dateStr);
      if (val === undefined) {
         // Find the most recent value before this date (up to 10 days back)
         let prevDays = 1;
         while (prevDays < 10) {
            const prevD = new Date(d);
            prevD.setDate(prevD.getDate() - prevDays);
            const prevStr = prevD.toISOString().split('T')[0];
            if (dataMap.has(prevStr)) {
               val = dataMap.get(prevStr);
               break;
            }
            prevDays++;
         }
      }
      
      chartPoints.push({
        labelKey: d.toISOString(),
        value: val || 0
      });
    }

    return NextResponse.json(chartPoints);
  } catch (error) {
    console.error('Chart API error:', error);
    // Return a graceful fallback if Yahoo Finance is unreachable
    return NextResponse.json([]);
  }
}
