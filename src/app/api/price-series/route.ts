import { NextResponse } from 'next/server';
import { series7d, series30d, series1y } from '@/data/priceSeries';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get('range'); // 7d | 30d | 1y

  if (range === '7d') return NextResponse.json({ range, series: series7d });
  if (range === '30d') return NextResponse.json({ range, series: series30d });
  if (range === '1y') return NextResponse.json({ range, series: series1y });

  return NextResponse.json({
    range: 'all',
    series: { '7d': series7d, '30d': series30d, '1y': series1y },
  });
}

