import { NextRequest, NextResponse } from 'next/server';

const readApiRoot = () =>
  process.env.API_BASE ?? process.env.AUTH_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? '';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const apiBase = readApiRoot();
    
    if (!apiBase) {
      console.error('[Beekeeper Profile API] API base URL not configured');
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      );
    }

    console.log('[Beekeeper Profile API] Proxying to Laravel:', `${apiBase}/api/beekeepers/${id}`);

    // Forward to Laravel backend
    const response = await fetch(`${apiBase}/api/beekeepers/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Beekeeper not found' },
          { status: 404 }
        );
      }
      throw new Error(`Laravel API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[Beekeeper Profile API] Success! Fetched beekeeper:', data.name);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[Beekeeper Profile API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beekeeper profile from Laravel API' },
      { status: 500 }
    );
  }
}


