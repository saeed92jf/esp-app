import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Attempt to fetch Free Market rate from pricedb GitHub repo (updated hourly by TGJU scraper)
    let freeMarketRate = 600000;
    try {
      const res = await fetch('https://raw.githubusercontent.com/margani/pricedb/main/tgju/current/price_dollar_rl/latest.json', { next: { revalidate: 3600 } });
      const data = await res.json();
      if (data && data.p) {
        freeMarketRate = parseInt(data.p.replace(/,/g, ''), 10);
      }
    } catch (e) {
      console.warn('Failed to fetch free market rate, using fallback');
    }

    return NextResponse.json({
      cbi: 420000, // Official Central Bank rate (fixed usually)
      sana: 455000, // Nima/Sana rate (approx)
      free: freeMarketRate, // Free market
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  }
}
