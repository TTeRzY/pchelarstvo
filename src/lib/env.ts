/**
 * Environment Variable Validation
 * Validates required environment variables on startup
 */

type EnvConfig = {
  // API Configuration
  NEXT_PUBLIC_API_BASE: string;
  API_BASE?: string;
  AUTH_API_BASE?: string;
  
  // Security
  JWT_SECRET?: string;
  
  // Application Defaults
  NEXT_PUBLIC_DEFAULT_LAT: string;
  NEXT_PUBLIC_DEFAULT_LNG: string;
  NEXT_PUBLIC_DEFAULT_REGION: string;
  
  // Optional
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_GA_ID?: string;
};

/**
 * Required environment variables for production
 */
const REQUIRED_PROD_VARS = [
  'NEXT_PUBLIC_API_BASE',
] as const;

/**
 * Required environment variables for all environments
 * Note: Default values are provided, so these are only warnings in development
 */
const REQUIRED_VARS = [
  // These have defaults, so only warn in production
] as const;

/**
 * Validate environment variables
 */
export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Check production-specific variables
  // During build time, only warn (don't fail) since env vars may be set at runtime
  if (isProduction) {
    for (const varName of REQUIRED_PROD_VARS) {
      if (!process.env[varName]) {
        const message = `Missing required production variable: ${varName}`;
        if (isBuildTime) {
          warnings.push(message);
        } else {
          errors.push(message);
        }
      }
    }

    // Warn about missing JWT_SECRET in production
    if (!process.env.JWT_SECRET) {
      warnings.push(
        'WARNING: JWT_SECRET is not set. This is required for secure token verification in production.'
      );
    }
  }

  // Validate numeric values (only if provided)
  const latStr = process.env.NEXT_PUBLIC_DEFAULT_LAT;
  const lngStr = process.env.NEXT_PUBLIC_DEFAULT_LNG;
  
  if (latStr) {
    const lat = Number(latStr);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('NEXT_PUBLIC_DEFAULT_LAT must be a valid latitude (-90 to 90)');
    }
  }
  
  if (lngStr) {
    const lng = Number(lngStr);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('NEXT_PUBLIC_DEFAULT_LNG must be a valid longitude (-180 to 180)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get environment configuration with defaults
 */
export function getEnvConfig(): EnvConfig {
  return {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || '',
    API_BASE: process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || '',
    AUTH_API_BASE: process.env.AUTH_API_BASE || process.env.NEXT_PUBLIC_API_BASE || '',
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_DEFAULT_LAT: process.env.NEXT_PUBLIC_DEFAULT_LAT || '42.6977',
    NEXT_PUBLIC_DEFAULT_LNG: process.env.NEXT_PUBLIC_DEFAULT_LNG || '23.3219',
    NEXT_PUBLIC_DEFAULT_REGION: process.env.NEXT_PUBLIC_DEFAULT_REGION || 'София и околностите',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  };
}

/**
 * Log environment validation results (server-side only)
 */
export function logEnvValidation(): void {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    return;
  }

  const isBuildTime = typeof process !== 'undefined' && (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE)
  );

  const validation = validateEnv();
  
  // During build time, only log warnings (never errors)
  if (isBuildTime) {
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => {
        console.warn(`  - ${warning}`);
      });
    }
    // Don't log success during build to reduce noise
    return;
  }
  
  // Log warnings (non-blocking)
  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => {
      console.warn(`  - ${warning}`);
    });
  }
  
  // Log errors (blocking) - only during runtime, not build
  if (!validation.valid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach((error) => {
      console.error(`  - ${error}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n⚠️  Application may not function correctly in production!');
    }
  } else if (validation.warnings.length === 0) {
    console.log('✅ Environment variables validated successfully');
  } else {
    // Has warnings but no errors
    console.log('✅ Environment variables validated (with warnings)');
  }
}

// Validate on module load (server-side only)
// During build, validation will only log warnings (not errors)
// Environment variables should be set at runtime in Vercel
if (typeof window === 'undefined') {
  logEnvValidation();
}

