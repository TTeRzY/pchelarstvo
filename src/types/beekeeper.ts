import type { TrustLevel } from './user';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';

export type BeekeeperSpecialization = 
  | 'Производство на мед'
  | 'Майкопроизводство'
  | 'Опрашване'
  | 'Пчелен прашец'
  | 'Прополис'
  | 'Восък'
  | 'Биологично пчеларство';

export type BeekeeperProfile = {
  id: string;
  name: string;
  region: string;
  city?: string;
  avatarUrl?: string;
  
  // Trust & Verification
  trustLevel: TrustLevel;
  verifiedAt: string | null;
  rating: number; // 0-5
  reviewCount: number;
  
  // Beekeeping Info
  apiariesCount: number;
  totalHives: number;
  experience: ExperienceLevel;
  memberSince: string;
  
  // Specializations & Products
  specializations?: BeekeeperSpecialization[];
  products?: string[];
  
  // Bio & Contact (respects privacy)
  bio?: string;
  phone?: string;
  email?: string;
  privacy: 'public' | 'members' | 'private';
  
  // Stats
  activeListingsCount: number;
  completedDeals: number;
  
  // Special Badges
  badges?: string[]; // ['Ментор', 'Локален експерт', 'Био сертифициран']
};

// Calculate experience level from memberSince
export function calculateExperience(memberSince: string): ExperienceLevel {
  const years = (Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (years >= 5) return 'expert';
  if (years >= 2) return 'intermediate';
  return 'beginner';
}

// Calculate experience years
export function getExperienceYears(memberSince: string): number {
  return Math.floor((Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24 * 365));
}

