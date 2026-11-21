import { NextResponse } from 'next/server';
import { getDefaultDashboardData } from '@/modules/dashboard/services/dashboard.service';
import type { UserRole } from '@/types/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') || 'customer') as UserRole;
  const statCardsParam = searchParams.get('statCards');
  const cards = statCardsParam ? statCardsParam.split(',') : ['gold', 'gasoline', 'wti', 'btc', 'eur'];

  const baseData = getDefaultDashboardData(role, cards);
  return NextResponse.json(baseData);
}
