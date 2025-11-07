import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

/**
 * GET /api/admin/listings
 * Proxies to Laravel backend: GET /api/admin/listings
 * 
 * Query params: status, search, page, perPage
 */
export async function GET(req: Request) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE not configured' },
      { status: 500 }
    );
  }

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const { searchParams } = new URL(req.url);
    const laravelUrl = new URL('/api/admin/listings', API_BASE);
    searchParams.forEach((value, key) => {
      laravelUrl.searchParams.append(key, value);
    });

    const response = await fetch(laravelUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin listings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

