import { MarketController } from '@/modules/market-data/controllers/market.controller';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  return MarketController.getCommodities();
}
