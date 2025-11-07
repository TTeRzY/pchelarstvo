// User roles in the system
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

// User account status
export type UserStatus = 'active' | 'suspended' | 'banned';

// Trust level for beekeepers
export type TrustLevel = 'bronze' | 'silver' | 'gold';

// Extended user type with all fields
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verifiedAt: string | null;
  trustLevel: TrustLevel;
  createdAt: string;
  lastLoginAt: string | null;
  // Profile-specific fields
  phone?: string;
  region?: string;
  city?: string;
  bio?: string;
  privacy?: 'public' | 'members' | 'private';
  avatarUrl?: string;
  memberSince?: string;
  apiariesCount?: number;
  activeListingsCount?: number;
  lastPasswordChange?: string;
  twoFactorEnabled?: boolean;
};

// Helper function to check if user is admin
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'super_admin';
}

// Helper function to check if user is moderator or above
export function isModerator(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'moderator' || user.role === 'admin' || user.role === 'super_admin';
}

// Helper function to check specific role
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

// Helper to check if user can moderate
export function canModerate(user: User | null): boolean {
  return isModerator(user);
}

// Helper to check if user can access admin panel
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user);
}

