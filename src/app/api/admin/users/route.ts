import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

/**
 * GET /api/admin/users
 * Proxies to Laravel backend: GET /api/admin/users
 * 
 * Query parameters:
 * - role: Filter by role (user, moderator, admin, super_admin)
 * - status: Filter by status (active, suspended, banned)
 * - search: Search by name or email
 * - page: Page number (default: 1)
 * - perPage: Items per page (default: 20)
 * 
 * Returns paginated user list with filters applied
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

    // Get query parameters from the request URL
    const { searchParams } = new URL(req.url);
    
    // Build Laravel API URL with all query parameters
    const laravelUrl = new URL('/api/admin/users', API_BASE);
    searchParams.forEach((value, key) => {
      laravelUrl.searchParams.append(key, value);
    });

    // Forward request to Laravel backend
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

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

