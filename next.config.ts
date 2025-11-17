import type { NextConfig } from "next";

/**
 * Get API base URL origin for CSP
 * Extracts the origin (protocol + host + port) from the API base URL
 */
function getApiOrigin(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
  if (!apiBase) return '';
  
  try {
    const url = new URL(apiBase);
    return `${url.protocol}//${url.host}`;
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 15

  // Security headers (additional to middleware)
  async headers() {
    const apiOrigin = getApiOrigin();
    
    // Build connect-src directive
    const connectSrc = apiOrigin 
      ? `'self' ${apiOrigin}`
      : "'self'";
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Content Security Policy
          // Note: Adjust based on your needs (external scripts, styles, etc.)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' needed for Next.js
              "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for Tailwind
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrc}`, // Allow connections to API base URL
              "frame-ancestors 'self'",
            ].join('; '),
          },
          // HSTS (only in production)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      // Add your image domains here
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Output configuration for Docker deployments
  // Uncomment if deploying with Docker
  // output: 'standalone',
};

export default nextConfig;
