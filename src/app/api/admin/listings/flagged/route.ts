import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

/**
 * GET /api/admin/listings/flagged
 * Proxies to Laravel backend: GET /api/admin/listings/flagged
 */
export async function GET(req: Request) {
  if (!API_BASE) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE not configured' }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/listings/flagged`, {
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
    console.error('Admin flagged listings error:', error);
    return NextResponse.json({ error: 'Failed to fetch flagged listings' }, { status: 500 });
  }
}

