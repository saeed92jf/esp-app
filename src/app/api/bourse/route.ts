import { NextResponse } from 'next/server';

const REFINERY_SYMBOLS = new Set(['شتران', 'شبندر', 'شپنا', 'شبریز', 'شراز', 'شاوان', 'شنفت', 'شبهرن', 'شرانل', 'شسپاس']);

function getCategory(item: any): 'petrochemical' | 'refinery' {
  if (item.category === 'petrochemical' || item.category === 'refinery') {
    return item.category;
  }
  if (
    REFINERY_SYMBOLS.has(item.l18) ||
    item.l30?.includes('پالایش') ||
    item.l30?.includes('پالايش') ||
    item.l30?.includes('روانکار') ||
    item.l30?.includes('نفت')
  ) {
    return 'refinery';
  }
  return 'petrochemical';
}

export async function GET() {
  try {
    const res = await fetch('https://brsapi.ir/FreeTsetmcBourseApi/Api_Free_Bourse_Market.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const enriched = data.map((item: any) => ({
          ...item,
          category: getCategory(item),
        }));
        return NextResponse.json(enriched);
      }
    }
  } catch (err) {
    console.error('Bourse fetch error', err);
  }

  // Fallback mock data for Petrochemical and Refinery companies
  const mockData = [
    // ─── پتروشیمی (Petrochemical) ───
    { id: 'petro-1', l18: 'فارس', l30: 'صنایع پتروشیمی خلیج فارس', price: 13850, change: 420, percentChange: 3.13, trend: 'up', category: 'petrochemical' },
    { id: 'petro-2', l18: 'نوری', l30: 'پتروشیمی نوری', price: 87000, change: -1200, percentChange: -1.36, trend: 'down', category: 'petrochemical' },
    { id: 'petro-3', l18: 'پارس', l30: 'پتروشیمی پارس', price: 24100, change: 550, percentChange: 2.34, trend: 'up', category: 'petrochemical' },
    { id: 'petro-4', l18: 'پارسان', l30: 'گسترش نفت و گاز پارسیان', price: 15400, change: 0, percentChange: 0, trend: 'neutral', category: 'petrochemical' },
    { id: 'petro-5', l18: 'شگویا', l30: 'پتروشیمی شهید تندگویان', price: 12300, change: 450, percentChange: 3.80, trend: 'up', category: 'petrochemical' },
    { id: 'petro-6', l18: 'زاگرس', l30: 'پتروشیمی زاگرس', price: 54200, change: 1100, percentChange: 2.07, trend: 'up', category: 'petrochemical' },
    { id: 'petro-7', l18: 'جم', l30: 'پتروشیمی جم', price: 48900, change: -350, percentChange: -0.71, trend: 'down', category: 'petrochemical' },
    { id: 'petro-8', l18: 'آریا', l30: 'پلیمر آریا ساسول', price: 92500, change: 1800, percentChange: 1.98, trend: 'up', category: 'petrochemical' },
    { id: 'petro-9', l18: 'تاپیکو', l30: 'سرمایه‌گذاری نفت و گاز تأمین', price: 19600, change: 250, percentChange: 1.29, trend: 'up', category: 'petrochemical' },

    // ─── پالایشگاه (Refinery) ───
    { id: 'ref-1', l18: 'شتران', l30: 'پالایش نفت تهران', price: 3450, change: 120, percentChange: 3.60, trend: 'up', category: 'refinery' },
    { id: 'ref-2', l18: 'شبندر', l30: 'پالایش نفت بندرعباس', price: 9200, change: -50, percentChange: -0.54, trend: 'down', category: 'refinery' },
    { id: 'ref-3', l18: 'شپنا', l30: 'پالایش نفت اصفهان', price: 6100, change: 200, percentChange: 3.39, trend: 'up', category: 'refinery' },
    { id: 'ref-4', l18: 'شبریز', l30: 'پالایش نفت تبریز', price: 18300, change: 410, percentChange: 2.29, trend: 'up', category: 'refinery' },
    { id: 'ref-5', l18: 'شراز', l30: 'پالایش نفت شیراز', price: 14750, change: -180, percentChange: -1.21, trend: 'down', category: 'refinery' },
    { id: 'ref-6', l18: 'شاوان', l30: 'پالایش نفت لاوان', price: 21400, change: 300, percentChange: 1.42, trend: 'up', category: 'refinery' },
    { id: 'ref-7', l18: 'شنفت', l30: 'نفت پارس', price: 8650, change: 0, percentChange: 0, trend: 'neutral', category: 'refinery' },
    { id: 'ref-8', l18: 'شبهرن', l30: 'نفت بهران', price: 16900, change: 280, percentChange: 1.68, trend: 'up', category: 'refinery' },
  ];

  return NextResponse.json(mockData);
}
