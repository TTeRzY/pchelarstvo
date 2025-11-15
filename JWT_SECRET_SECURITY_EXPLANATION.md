# JWT_SECRET Security Explanation

## 🔒 Key Security Principle

**JWT_SECRET is NEVER exposed to the client/browser. It's a server-side secret only.**

## How Next.js Environment Variables Work

### Server-Side Only (Secure)
```bash
# Variables WITHOUT NEXT_PUBLIC_ prefix
JWT_SECRET=your-secret-key-here
API_BASE=http://localhost:8000
AUTH_API_BASE=http://localhost:8000
```

- ✅ **Only accessible on the server** (Node.js runtime)
- ✅ **Never sent to the browser**
- ✅ **Safe for secrets** like JWT_SECRET, database passwords, API keys
- ✅ **Available in**: API routes, Server Components, Middleware, Server Actions

### Client-Side Exposed (Public)
```bash
# Variables WITH NEXT_PUBLIC_ prefix
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_DEFAULT_LAT=42.6977
```

- ⚠️ **Exposed to the browser** (embedded in JavaScript bundle)
- ⚠️ **Anyone can see these** in browser DevTools
- ⚠️ **Never use for secrets!**
- ✅ **Safe for**: Public API URLs, configuration values, feature flags

## Current Implementation Analysis

### ✅ What We're Doing Right

1. **JWT_SECRET is server-side only**
   - Defined as `JWT_SECRET` (no `NEXT_PUBLIC_` prefix)
   - Only accessible in middleware, API routes, server components
   - Never exposed to client

2. **Token Decoding vs Verification**
   - Currently: We decode the token (read the payload)
   - This is safe because we're not verifying the signature yet
   - The payload is already visible (base64 encoded, not encrypted)

### ⚠️ Current Limitation

**We're NOT verifying the JWT signature yet!**

The current `decodeToken()` function:
- ✅ Decodes the JWT payload (reads user info)
- ✅ Checks expiration
- ❌ **Does NOT verify the signature**

This means:
- Anyone can create a fake token with any role
- We're trusting the token content without verifying it was signed by our backend

## How JWT Works

### JWT Structure
```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJyb2xlIjoiYWRtaW4ifQ.signature-here
```

1. **Header**: Algorithm info (e.g., HS256)
2. **Payload**: User data (id, role, exp, etc.) - **Base64 encoded, NOT encrypted**
3. **Signature**: HMAC hash of `header.payload` using JWT_SECRET

### Signature Verification Process

```
signature = HMAC_SHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

**Why this matters:**
- If someone changes the payload (e.g., change role to "admin"), the signature won't match
- Only the server with JWT_SECRET can create valid signatures
- Verifying the signature proves the token came from our backend

## Proper Implementation Flow

### Option 1: Verify Signature in Middleware (Recommended)

```typescript
// middleware.ts
import { verify } from 'jose'; // or 'jsonwebtoken'

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    // Verify signature using JWT_SECRET (server-side only!)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await verify(token, secret);
    
    return {
      id: payload.id as string,
      role: payload.role as string,
    };
  } catch {
    return null; // Invalid signature or expired
  }
}
```

**Security:**
- ✅ JWT_SECRET stays on server
- ✅ Signature is verified
- ✅ Can't forge tokens

### Option 2: Verify via Backend API (Current Fallback)

```typescript
// If we can't verify locally, ask backend
const response = await fetch(`${API_BASE}/api/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Security:**
- ✅ Backend verifies signature
- ⚠️ Extra network call
- ✅ Still secure, just slower

## Why Current Implementation is "Okay" (But Not Ideal)

### Current Approach: Decode Only
```typescript
// We decode the token and trust the payload
const decoded = decodeToken(token); // Just reads payload, no signature check
```

**Why it works for now:**
1. Tokens come from your backend (Laravel)
2. Backend already verified the token when it was created
3. If someone forges a token, they'd need to know your JWT_SECRET
4. For middleware quick checks, this is acceptable

**Why it's not ideal:**
1. Can't detect if someone modified the token
2. Can't verify the token was actually signed by your backend
3. If JWT_SECRET leaks, all tokens become forgeable

## Recommended Next Steps

### 1. Install JWT Library for Edge Runtime
```bash
npm install jose  # Works in Edge Runtime (middleware)
# OR
npm install jsonwebtoken @types/jsonwebtoken  # Node.js only
```

### 2. Implement Proper Signature Verification

```typescript
// src/lib/jwt.ts
import { jwtVerify } from 'jose';

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn('JWT_SECRET not set, falling back to decode only');
      return decodeToken(token); // Fallback
    }

    // Verify signature
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    
    return payload as JWTPayload;
  } catch {
    return null; // Invalid token
  }
}
```

### 3. Update Middleware

```typescript
// middleware.ts
import { verifyToken } from './src/lib/jwt';

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  // Now we verify the signature!
  const decoded = await verifyToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id as string,
    role: decoded.role as string,
  };
}
```

## Security Best Practices

### ✅ DO:
- Keep JWT_SECRET server-side only (no `NEXT_PUBLIC_` prefix)
- Use strong, random secrets (32+ characters)
- Rotate secrets periodically
- Verify signatures in production
- Use httpOnly cookies for tokens when possible

### ❌ DON'T:
- Never add `NEXT_PUBLIC_` to JWT_SECRET
- Never log JWT_SECRET
- Never commit secrets to git
- Never trust token payload without signature verification in production
- Never use weak secrets

## Summary

**Current State:**
- ✅ JWT_SECRET is secure (server-side only)
- ⚠️ We decode tokens but don't verify signatures yet
- ✅ This works because tokens come from trusted backend
- ⚠️ Should add signature verification for production

**The Logic:**
1. JWT_SECRET stays on server (never exposed)
2. Backend signs tokens with JWT_SECRET
3. Middleware can verify signatures using same JWT_SECRET
4. Client never sees JWT_SECRET
5. Forged tokens fail signature verification

**Next Step:** Implement signature verification using `jose` library for Edge Runtime compatibility.

