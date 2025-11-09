import { NextRequest, NextResponse } from 'next/server';
import { fetchRSSWithFilters } from '@/lib/rssFetcher';
import type { NewsTopic } from '@/types/news';

export const dynamic = 'force-dynamic'; // Disable static generation
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = {
      q: url.searchParams.get('q') || undefined,
      topic: (url.searchParams.get('topic') as NewsTopic) || undefined,
      type: url.searchParams.get('type') || undefined,
      limit: url.searchParams.get('limit')
        ? Number(url.searchParams.get('limit'))
        : undefined,
    };

    const items = await fetchRSSWithFilters(params);

    return NextResponse.json(
      { items, count: items.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('[API] RSS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', items: [], count: 0 },
      { status: 500 }
    );
  }
}

