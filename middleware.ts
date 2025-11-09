import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock function to decode and verify token
// In production, this would verify JWT or check session
function getUserFromRequest(request: NextRequest): { role: string } | null {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // Check localStorage token from header (for client-side auth)
    return null;
  }

  // TODO: Replace with actual JWT verification
  // For now, we'll use a simple mock that checks if token exists
  // In production, decode JWT and extract user role
  
  try {
    // Mock: assume token format contains role info
    // Real implementation would use jwt.verify()
    return { role: 'user' }; // Default to user role
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const user = getUserFromRequest(request);
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to home page with error message
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Check if user has moderator, admin, or super_admin role
    // In production, get actual role from decoded JWT
    const canAccess = user.role === 'moderator' || user.role === 'admin' || user.role === 'super_admin';
    
    if (!canAccess) {
      // Return 404 to hide admin panel existence from regular users
      const url = request.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude static files and API routes from middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

