import { NextResponse } from 'next/server';

const TICKERS = [
  // Global Metals
  { id: 'gold', tgju: 'ons', category: 'global_metals' },
  { id: 'silver', tgju: 'silver', category: 'global_metals' },
  // Iran Gold & Coins
  { id: 'geram18', tgju: 'geram18', category: 'iran_gold', type: 'fiat' },
  { id: 'geram24', tgju: 'geram24', category: 'iran_gold', type: 'fiat' },
  { id: 'mesghal', tgju: 'mesghal', category: 'iran_gold', type: 'fiat' },
  { id: 'sekee', tgju: 'sekee', category: 'iran_gold', type: 'fiat' },
  { id: 'sekeb', tgju: 'sekeb', category: 'iran_gold', type: 'fiat' },
  { id: 'nim', tgju: 'nim', category: 'iran_gold', type: 'fiat' },
  { id: 'rob', tgju: 'rob', category: 'iran_gold', type: 'fiat' },
  // Energy
  { id: 'wti', tgju: 'oil', category: 'energy' },
  { id: 'brent', tgju: 'oil_brent', category: 'energy' },
  { id: 'ng', tgju: 'energy-natural-gas', category: 'energy' },
  { id: 'gasoline', tgju: 'gasoline', category: 'energy' },
  // Agriculture
  { id: 'cocoa', tgju: 'cocoa', category: 'agriculture' },
  { id: 'coffee', tgju: 'coffee', category: 'agriculture' },
  { id: 'cotton', tgju: 'commodity-cotton', category: 'agriculture' },
  // Forex (fiat means TGJU returns it in RIAL, needs division by USD)
  { id: 'eur', tgju: 'price_eur', category: 'forex', type: 'fiat' },
  { id: 'gbp', tgju: 'price_gbp', category: 'forex', type: 'fiat' },
  { id: 'cny', tgju: 'price_cny', category: 'forex', type: 'fiat' },
  { id: 'aed', tgju: 'price_aed', category: 'forex', type: 'fiat' },
  { id: 'try', tgju: 'price_try', category: 'forex', type: 'fiat' },
  // Crypto (TGJU returns in USD)
  { id: 'btc', tgju: 'crypto-bitcoin', category: 'crypto' },
  { id: 'eth', tgju: 'crypto-ethereum', category: 'crypto' },
  { id: 'usdt', tgju: 'crypto-tether', category: 'crypto' },
];

const TGJU_API = 'https://api.tgju.org/v1/market/indicator/summary-table-data';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://www.tgju.org/'
};

async function fetchIndicator(indicator: string) {
  try {
    const res = await fetch(`${TGJU_API}/${indicator}?length=1`, {
      headers: HEADERS,
      next: { revalidate: 60 } // cache for 60s
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0];
  } catch {
    return null;
  }
}

function parseTgjuRow(row: string[]) {
  if (!row) return null;

  const priceStr = row[0].replace(/,/g, '');
  let price = parseFloat(priceStr);

  const changeHtml = row[4] || '';
  const percentHtml = row[5] || '';

  let change = 0;
  let percentChange = 0;
  let trend: 'up' | 'down' | 'neutral' = 'neutral';

  if (changeHtml.includes('class="high"')) trend = 'up';
  else if (changeHtml.includes('class="low"')) trend = 'down';

  if (trend !== 'neutral') {
    const rawChange = changeHtml.replace(/<[^>]*>/g, '').replace(/,/g, '').trim();
    change = parseFloat(rawChange);
    if (isNaN(change)) change = 0;
    if (trend === 'down') change = -change;

    const rawPercent = percentHtml.replace(/<[^>]*>/g, '').replace(/,/g, '').replace('%', '').trim();
    percentChange = parseFloat(rawPercent);
    if (isNaN(percentChange)) percentChange = 0;
    if (trend === 'down') percentChange = -percentChange;
  }

  if (isNaN(price)) price = 0;

  return { price, change, percentChange, trend };
}

export async function GET() {
  try {
    // We need the USD rate first to convert fiat currencies back to USD base
    const usdRow = await fetchIndicator('price_dollar_rl');
    const usdData = parseTgjuRow(usdRow);
    const usdRate = usdData?.price || 1; // Fallback to 1 if fails to avoid division by zero

    const results = await Promise.all(
      TICKERS.map(async (t) => {
        try {
          const row = await fetchIndicator(t.tgju);
          const data = parseTgjuRow(row);
          if (!data) throw new Error('No data');

          let { price, change, percentChange, trend } = data;

          // Fiat is returned in Rial by TGJU. We want everything relative to USD.
          // e.g. EUR price in TGJU = 2,159,900. USD = 1,869,000. => Base EUR/USD = 1.155
          if (t.type === 'fiat') {
            const basePrice = price / usdRate;
            
            // To approximate the change of EUR/USD, we can just use the percentChange from TGJU
            // and assume it applies to the USD ratio (which is mathematically an approximation)
            // But it's good enough for a dashboard trend indicator.
            const baseChange = (basePrice * percentChange) / 100;
            
            price = basePrice;
            change = baseChange;
          }

          return {
            id: t.id,
            category: t.category,
            price,
            change,
            percentChange,
            trend
          };
        } catch (e) {
          console.error(`Failed to fetch ${t.id} from TGJU`);
          return { id: t.id, category: t.category, price: 0, change: 0, percentChange: 0, trend: 'neutral', error: true };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commodities' }, { status: 500 });
  }
}
