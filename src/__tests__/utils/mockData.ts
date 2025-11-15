import type { User } from '@/types/user';
import type { Listing } from '@/lib/listings';
import type { Apiary } from '@/lib/apiaries';
import type { BeekeeperProfile } from '@/types/beekeeper';

// Mock Users
export const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  status: 'active',
  verifiedAt: new Date().toISOString(),
  trustLevel: 'bronze',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  phone: '+359 88 123 4567',
  region: 'София',
  city: 'София',
  bio: 'Test bio',
  privacy: 'public',
  memberSince: new Date().toISOString(),
  apiariesCount: 2,
  activeListingsCount: 3,
};

export const mockAdminUser: User = {
  ...mockUser,
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  trustLevel: 'gold',
};

export const mockModeratorUser: User = {
  ...mockUser,
  id: '3',
  name: 'Moderator User',
  email: 'moderator@example.com',
  role: 'moderator',
  trustLevel: 'silver',
};

// Mock Listings
export const mockListing: Listing = {
  id: '1',
  createdAt: new Date().toISOString(),
  type: 'sell',
  product: 'Акациев мед',
  title: 'Качествен акациев мед',
  quantityKg: 50,
  pricePerKg: 12.5,
  region: 'София',
  city: 'София',
  description: 'Свежо събран акациев мед от собствена продукция.',
  status: 'active',
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  contactEmail: 'test@example.com',
  contactPhone: '+359 88 123 4567',
};

export const mockListings: Listing[] = [
  mockListing,
  {
    ...mockListing,
    id: '2',
    type: 'buy',
    product: 'Липов мед',
    title: 'Търся липов мед',
    quantityKg: 30,
    pricePerKg: 15.0,
    region: 'Пловдив',
  },
  {
    ...mockListing,
    id: '3',
    product: 'Манов мед',
    title: 'Манов мед за продажба',
    quantityKg: 20,
    pricePerKg: 18.0,
    region: 'Варна',
    status: 'completed',
  },
];

// Mock Apiaries
export const mockApiary: Apiary = {
  id: '1',
  name: 'Test Apiary',
  lat: 42.6977,
  lng: 23.3219,
  region: 'София',
  city: 'София',
  hiveCount: 20,
  flora: ['Липа', 'Акация'],
  visibility: 'public',
  updatedAt: new Date().toISOString(),
};

export const mockApiaries: Apiary[] = [
  mockApiary,
  {
    ...mockApiary,
    id: '2',
    name: 'Second Apiary',
    lat: 42.6500,
    lng: 23.3500,
    hiveCount: 15,
    flora: ['Слънчоглед'],
  },
  {
    ...mockApiary,
    id: '3',
    name: 'Third Apiary',
    lat: 42.7000,
    lng: 23.3000,
    visibility: 'unlisted',
  },
];

// Mock Beekeepers
export const mockBeekeeper: BeekeeperProfile = {
  id: '1',
  name: 'Test Beekeeper',
  email: 'beekeeper@example.com',
  phone: '+359 88 123 4567',
  region: 'София',
  city: 'София',
  bio: 'Experienced beekeeper with 10 years of experience',
  trustLevel: 'gold',
  verifiedAt: new Date().toISOString(),
  totalHives: 50,
  apiariesCount: 3,
  activeListingsCount: 5,
  rating: 4.8,
  reviewCount: 25,
  completedDeals: 25,
  experience: 'expert',
  memberSince: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  specializations: ['Производство на мед', 'Майкопроизводство'],
  products: ['Акациев мед', 'Липов мед'],
  privacy: 'public',
};

export const mockBeekeepers: BeekeeperProfile[] = [
  mockBeekeeper,
  {
    ...mockBeekeeper,
    id: '2',
    name: 'Second Beekeeper',
    email: 'beekeeper2@example.com',
    trustLevel: 'silver',
    verifiedAt: null,
    totalHives: 30,
    rating: 4.5,
    reviewCount: 15,
    completedDeals: 15,
    experience: 'intermediate',
  },
  {
    ...mockBeekeeper,
    id: '3',
    name: 'Third Beekeeper',
    email: 'beekeeper3@example.com',
    trustLevel: 'bronze',
    totalHives: 15,
    rating: 4.2,
    reviewCount: 8,
    completedDeals: 8,
    experience: 'beginner',
  },
];

// Mock API Responses
export const mockListingsResponse = {
  items: mockListings,
  total: mockListings.length,
  page: 1,
  perPage: 20,
  totalPages: 1,
};

export const mockApiariesResponse = mockApiaries;

export const mockBeekeepersResponse = {
  items: mockBeekeepers,
  total: mockBeekeepers.length,
  page: 1,
  perPage: 20,
  totalPages: 1,
};

