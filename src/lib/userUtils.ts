import type { User } from '@/types/user';

/**
 * Normalize user data from API (snake_case) to frontend format (camelCase)
 */
export function normalizeUser(raw: any): User {
  return {
    id: String(raw.id ?? raw.user_id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    role: raw.role ?? 'user',
    status: raw.status ?? 'active',
    verifiedAt: raw.verified_at ?? raw.verifiedAt ?? null,
    trustLevel: raw.trust_level ?? raw.trustLevel ?? 'bronze',
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    lastLoginAt: raw.last_login_at ?? raw.lastLoginAt ?? null,
    phone: raw.phone ?? null,
    region: raw.region ?? null,
    city: raw.city ?? null,
    bio: raw.bio ?? null,
    privacy: raw.privacy ?? 'public',
    avatarUrl: raw.avatar_url ?? raw.avatarUrl ?? null,
    memberSince: raw.created_at ?? raw.createdAt ?? null,
    lastPasswordChange: raw.last_password_change ?? raw.lastPasswordChange ?? null,
    twoFactorEnabled: raw.two_factor_enabled ?? raw.twoFactorEnabled ?? false,
  };
}

