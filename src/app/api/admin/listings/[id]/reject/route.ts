import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/listings/[id]/reject
 * Proxies to Laravel backend: POST /api/admin/listings/{id}/reject
 */
export async function POST(req: Request, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/listings/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin reject listing error:', error);
    return NextResponse.json({ error: 'Failed to reject listing' }, { status: 500 });
  }
}

