import { NextResponse } from 'next/server';
import dashboardDataMock from '@/data/mock/dashboard-data.json';
import dashboardSamplesMock from '@/data/mock/dashboard-samples.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') || 'customer') as keyof typeof dashboardDataMock;
  const statCardsParam = searchParams.get('statCards');
  const cards = statCardsParam ? statCardsParam.split(',') : ['gold', 'gasoline', 'wti', 'btc', 'eur'];

  const baseData = { ...((dashboardDataMock as any)[role] ?? (dashboardDataMock as any).customer) };

  const ALL_STATS_DEFS = [
    { id: 'gold',     labelKey: 'gold'     },
    { id: 'silver',   labelKey: 'silver'   },
    { id: 'copper',   labelKey: 'copper'   },
    { id: 'aluminum', labelKey: 'aluminum' },
    { id: 'wti',      labelKey: 'wti'      },
    { id: 'brent',    labelKey: 'brent'    },
    { id: 'gasoline', labelKey: 'gasoline' },
    { id: 'eur',      labelKey: 'eur'      },
    { id: 'btc',      labelKey: 'btc'      },
    { id: 'eth',      labelKey: 'eth'      },
  ];

  const allStatsMapped = ALL_STATS_DEFS.map((def) => ({
    id: def.id,
    labelKey: def.labelKey,
    value: '—',
    delta: '—',
    trend: 'neutral',
    icon: def.id === 'btc' || def.id === 'eth' || def.id === 'eur' ? 'wallet' : 'activity',
  }));

  baseData.allStats = allStatsMapped;
  baseData.stats = cards
    .map((id) => allStatsMapped.find((s) => s.id === id) || null)
    .filter(Boolean);

  while (baseData.stats.length < 5 && baseData.stats.length < allStatsMapped.length) {
    const unused = allStatsMapped.find((s) => !baseData.stats.some((b: any) => b.id === s.id));
    if (unused) baseData.stats.push(unused);
    else break;
  }

  baseData.tasks = dashboardSamplesMock.tasks;
  baseData.detailedChecklist = dashboardSamplesMock.detailedChecklist;
  baseData.routines = dashboardSamplesMock.routines;
  baseData.notes = dashboardSamplesMock.notes;
  baseData.customLinks = dashboardSamplesMock.customLinks;
  baseData.notifications = [];

  return NextResponse.json(baseData);
}
