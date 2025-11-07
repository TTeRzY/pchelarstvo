import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/admin/users/[id]/activate - Reactivate suspended user
export async function POST(req: Request, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/users/${id}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin activate user error:', error);
    return NextResponse.json({ error: 'Failed to activate user' }, { status: 500 });
  }
}

