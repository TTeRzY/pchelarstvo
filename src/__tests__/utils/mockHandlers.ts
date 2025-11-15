import { mockListings, mockListing, mockListingsResponse } from './mockData';
import { mockApiaries, mockApiary } from './mockData';
import { mockBeekeepers, mockBeekeeper, mockBeekeepersResponse } from './mockData';
import { mockUser, mockAdminUser } from './mockData';

// Mock fetch responses
export function mockFetchListings(response = mockListingsResponse) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  });
}

export function mockFetchListing(listing = mockListing) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => listing,
  });
}

export function mockFetchListingError() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    text: async () => 'Listing not found',
  });
}

export function mockFetchApiaries(apiaries = mockApiaries) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => apiaries,
  });
}

export function mockFetchApiariesError() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    text: async () => 'Failed to fetch apiaries',
  });
}

export function mockFetchBeekeepers(response = mockBeekeepersResponse) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  });
}

export function mockFetchBeekeepersError() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    text: async () => 'Failed to fetch beekeepers',
  });
}

export function mockAuthMe(user = mockUser) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => user,
  });
}

export function mockAuthLogin(user = mockUser, token = 'mock-token') {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user,
      token,
    }),
  });
}

export function mockAuthRegister(user = mockUser, token = 'mock-token') {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user,
      token,
    }),
  });
}

export function mockAuthError(message = 'Authentication failed') {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    text: async () => message,
  });
}

export function mockRequestPasswordReset() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: 'Password reset email sent' }),
  });
}

export function mockResetPassword() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: 'Password reset successful' }),
  });
}

export function mockAdminStats() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      users: {
        total: 100,
        todayRegistrations: 5,
        byRole: {
          user: 80,
          moderator: 10,
          admin: 8,
          super_admin: 2,
        },
        byStatus: {
          active: 95,
          suspended: 3,
          banned: 2,
        },
      },
      listings: {
        total: 250,
        todayListings: 10,
        byStatus: {
          active: 200,
          pending: 20,
          approved: 180,
          rejected: 10,
          completed: 30,
          flagged: 5,
        },
      },
      recentActivity: [
        {
          id: '1',
          action: 'approved',
          targetTitle: 'Test Listing',
          moderatedBy: 'Admin User',
          moderatedAt: new Date().toISOString(),
        },
      ],
    }),
  });
}

// Helper to clear all mocks
export function clearAllMocks() {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
}

