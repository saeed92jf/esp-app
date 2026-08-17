import { NextResponse } from 'next/server';

const TGJU_API = 'https://api.tgju.org/v1/market/indicator/summary-table-data';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://www.tgju.org/currency'
};

// Strip HTML tags from tgju change values like <span class="low">3250</span>
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/,/g, '').trim();
}

async function fetchTgjuRate(indicator: string): Promise<{ price: number; prevClose: number } | null> {
  try {
    const res = await fetch(`${TGJU_API}/${indicator}?length=1`, {
      headers,
      next: { revalidate: 300 } // 5 minutes cache
    });
    if (!res.ok) return null;
    const data = await res.json();
    const row = data?.data?.[0];
    if (!row) return null;

    const price = parseInt(row[0].replace(/,/g, ''), 10);
    const prevClose = parseInt(row[3].replace(/,/g, ''), 10);
    return { price, prevClose };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Fetch Free Market (TGJU - real bazaar rate)
    const [usd, eur, gbp, aed] = await Promise.all([
      fetchTgjuRate('price_dollar_rl'),
      fetchTgjuRate('price_eur'),
      fetchTgjuRate('price_gbp'),
      fetchTgjuRate('price_aed'),
    ]);

    return NextResponse.json({
      // CBI official rate (fixed, not available publicly - use well-known approximate)
      cbi: 42000,
      // Nima/Sana rate (approx 10-15% below bazaar - we estimate from bazaar)
      sana: usd ? Math.round(usd.price * 0.87) : 450000,
      // Free market (bazaar) - live from TGJU
      free: usd?.price ?? 600000,
      // Extras for display
      eur: eur?.price ?? null,
      gbp: gbp?.price ?? null,
      aed: aed?.price ?? null,
      updatedAt: new Date().toISOString(),
      source: 'tgju'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  }
}
