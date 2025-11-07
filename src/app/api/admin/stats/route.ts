import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

/**
 * GET /api/admin/stats
 * Proxies to Laravel backend: GET /api/admin/stats
 * 
 * Returns dashboard statistics including:
 * - User stats (total, by role, by status, today's registrations)
 * - Listing stats (total, by status, today's listings)
 * - Recent activity (last moderation actions)
 */
export async function GET(req: Request) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE environment variable is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    // Forward request to Laravel backend
    const laravelUrl = `${API_BASE}/api/admin/stats`;

    const response = await fetch(laravelUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

