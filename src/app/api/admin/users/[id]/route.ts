import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/users/[id] - Get single user
export async function GET(req: Request, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE not configured' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
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
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(req: Request, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE not configured' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'PATCH',
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
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user (super admin only)
export async function DELETE(req: Request, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE not configured' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
