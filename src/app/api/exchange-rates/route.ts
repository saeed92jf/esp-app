import { NextResponse } from 'next/server';

// مهم: از کش‌شدن توسط Next.js جلوگیری می‌کند
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TETHERLAND_API = 'https://api.tetherland.com/currencies';

export async function GET() {
  try {
    const res = await fetch(TETHERLAND_API, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch from Tetherland');
    }
    
    const json = await res.json();
    const usdt = json?.data?.currencies?.USDT;
    
    if (!usdt || !usdt.price) {
      throw new Error('USDT data not found in Tetherland response');
    }
    
    // Tetherland returns price in Toman, but our app expects Rial for the global store!
    const priceRial = parseInt(usdt.price, 10) * 10;
    
    return NextResponse.json({
      cbi: 420000, // official rate in Rial
      sana: Math.round(priceRial * 0.87),
      free: priceRial, // live from Tetherland
      eur: null,
      gbp: null,
      aed: null,
      updatedAt: new Date().toISOString(),
      source: 'tetherland'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  }
}
