import { NextResponse } from 'next/server';

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
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Bourse fetch error', err);
  }

  // Fallback mock data for Petrochemical and Refinery companies
  const mockData = [
    { id: '1', l18: 'شتران', l30: 'پالايش نفت تهران', price: 3450, change: 120, percentChange: 3.6, trend: 'up' },
    { id: '2', l18: 'شبندر', l30: 'پالايش نفت بندرعباس', price: 9200, change: -50, percentChange: -0.5, trend: 'down' },
    { id: '3', l18: 'شپنا', l30: 'پالايش نفت اصفهان', price: 6100, change: 200, percentChange: 3.3, trend: 'up' },
    { id: '4', l18: 'پارسان', l30: 'گسترش نفت و گاز پارسيان', price: 15400, change: 0, percentChange: 0, trend: 'neutral' },
    { id: '5', l18: 'شگويا', l30: 'پتروشيمی شهيد تندگويان', price: 12300, change: 450, percentChange: 3.8, trend: 'up' },
    { id: '6', l18: 'نوری', l30: 'پتروشيمی نوری', price: 87000, change: -1200, percentChange: -1.3, trend: 'down' },
  ];

  return NextResponse.json(mockData);
}
