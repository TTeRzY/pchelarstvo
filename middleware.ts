import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeToken } from './src/lib/jwt';

/**
 * Get user information from request token
 * Verifies JWT token and extracts user role
 */
async function getUserFromRequest(request: NextRequest): Promise<{ id: string; role: string } | null> {
  // Try to get token from cookie first (httpOnly cookies are more secure)
  let token = request.cookies.get('token')?.value;
  
  // Fallback to Authorization header (for client-side tokens)
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }
  
  if (!token) {
    return null;
  }

  try {
    // Decode and verify JWT token
    const decoded = decodeToken(token);
    
    if (!decoded) {
      return null;
    }

    // Extract user information
    const id = decoded.id as string | undefined;
    const role = decoded.role as string | undefined;

    if (!id || !role) {
      return null;
    }

    return { id, role };
  } catch {
    // Token is invalid or expired
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const user = await getUserFromRequest(request);
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to home page with error message
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Check if user has moderator, admin, or super_admin role
    const allowedRoles = ['moderator', 'admin', 'super_admin'];
    const canAccess = allowedRoles.includes(user.role);
    
    if (!canAccess) {
      // Return 404 to hide admin panel existence from regular users
      const url = request.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude static files and API routes from middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

