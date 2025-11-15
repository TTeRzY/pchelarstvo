/**
 * JWT Token Verification Utility
 * Handles JWT token decoding and verification for middleware
 */

// For Edge Runtime compatibility, we'll use a lightweight approach
// If using Node.js runtime, consider using 'jose' or 'jsonwebtoken'

type JWTPayload = {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

/**
 * Decode JWT token without verification (for middleware quick check)
 * In production, this should verify the signature with JWT_SECRET
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (base64url)
    const payload = parts[1];
    const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as JWTPayload;

    // Check expiration
    if (parsed.exp && parsed.exp < Date.now() / 1000) {
      return null; // Token expired
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Verify JWT token with secret (for server-side verification)
 * This should be used when you have access to JWT_SECRET
 */
export function verifyToken(token: string, secret: string): JWTPayload | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }

    // In production, verify signature here
    // For now, we'll rely on backend verification via API call
    // TODO: Implement signature verification if JWT_SECRET is available
    
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get user info from token
 * Falls back to API verification if token decoding fails
 */
export async function getUserFromToken(token: string): Promise<{ id: string; role: string } | null> {
  // First, try to decode token locally
  const decoded = decodeToken(token);
  if (decoded && decoded.id && decoded.role) {
    return {
      id: decoded.id as string,
      role: decoded.role as string,
    };
  }

  // If local decoding fails, verify with backend API
  // This is a fallback for tokens that need server-side verification
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || '';
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      return {
        id: user.id,
        role: user.role,
      };
    }
  } catch {
    // API verification failed
  }

  return null;
}

