import { NextRequest, NextResponse } from 'next/server';
import { fetchRSSItemById } from '@/lib/rssFetcher';

export const dynamic = 'force-dynamic';
export const revalidate = 1800;

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const item = await fetchRSSItemById(resolvedParams.id);

    if (!item) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[API] RSS item fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news item' },
      { status: 500 }
    );
  }
}

