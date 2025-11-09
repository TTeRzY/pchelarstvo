import { NextRequest, NextResponse } from 'next/server';

const readApiRoot = () =>
  process.env.API_BASE ?? process.env.AUTH_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? '';

export async function GET(req: NextRequest) {
  try {
    const apiBase = readApiRoot();
    
    if (!apiBase) {
      console.error('[Beekeepers API] API base URL not configured');
      return NextResponse.json(
        { error: 'API base URL not configured', items: [], total: 0 },
        { status: 500 }
      );
    }

    // Build query string from request
    const url = new URL(req.url);
    const queryString = url.search;

    console.log('[Beekeepers API] Proxying to Laravel:', `${apiBase}/api/beekeepers${queryString}`);

    // Forward to Laravel backend
    const response = await fetch(`${apiBase}/api/beekeepers${queryString}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Beekeepers API] Laravel API error:', response.status, response.statusText);
      throw new Error(`Laravel API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[Beekeepers API] Success! Received', data.total || data.items?.length || 0, 'beekeepers');

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[Beekeepers API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch beekeepers from Laravel API',
        items: [],
        total: 0,
        page: 1,
        perPage: 20
      },
      { status: 500 }
    );
  }
}


