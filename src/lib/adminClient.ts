/**
 * Admin API Client
 * Provides type-safe methods for all admin operations
 */

import { adminApi } from './apiClient';
import type { User, UserRole, UserStatus } from '@/types/user';
import type { Listing, ListingStatus } from '@/types/listing';

export interface AdminUsersResponse {
  users: User[];
  total: number;
  page: number;
  perPage: number;
}

export interface AdminListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  perPage: number;
}

export interface AdminListingsQueueResponse {
  listings: Listing[];
  count: number;
}

export interface AdminStatsResponse {
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    todayRegistrations: number;
    verifiedCount: number;
  };
  listings: {
    total: number;
    byStatus: Record<string, number>;
    todayListings: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    action: string;
    targetTitle: string;
    moderatedBy: string;
    moderatedAt: string;
  }>;
  generatedAt: string;
}

export const adminClient = {
  // ==================== Users ====================
  
  /**
   * Get all users with optional filters
   */
  async getUsers(params?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<AdminUsersResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.role) queryParams.role = params.role;
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;

    return adminApi.get<AdminUsersResponse>('/users', queryParams);
  },

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<User> {
    return adminApi.get<User>(`/users/${id}`);
  },

  /**
   * Update user details
   */
  async updateUser(
    id: string,
    data: { name?: string; role?: UserRole; status?: UserStatus }
  ): Promise<{ success: boolean; user: User }> {
    return adminApi.patch<{ success: boolean; user: User }>(`/users/${id}`, data);
  },

  /**
   * Verify user manually
   */
  async verifyUser(id: string): Promise<{ success: boolean; message: string; user: User }> {
    return adminApi.post<{ success: boolean; message: string; user: User }>(`/users/${id}/verify`, {});
  },

  /**
   * Suspend user account
   */
  async suspendUser(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; user: User }> {
    return adminApi.post<{ success: boolean; message: string; user: User }>(
      `/users/${id}/suspend`,
      { reason }
    );
  },

  /**
   * Reactivate suspended user
   */
  async activateUser(id: string): Promise<{ success: boolean; message: string; user: User }> {
    return adminApi.post<{ success: boolean; message: string; user: User }>(
      `/users/${id}/activate`,
      {}
    );
  },

  /**
   * Delete user account (super admin only)
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/users/${id}`);
  },

  // ==================== Listings ====================

  /**
   * Get all listings (admin view - includes non-public)
   */
  async getListings(params?: {
    status?: ListingStatus;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<AdminListingsResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;

    return adminApi.get<AdminListingsResponse>('/listings', queryParams);
  },

  /**
   * Get pending listings queue
   */
  async getPendingListings(): Promise<AdminListingsQueueResponse> {
    return adminApi.get<AdminListingsQueueResponse>('/listings/pending');
  },

  /**
   * Get flagged listings
   */
  async getFlaggedListings(): Promise<AdminListingsQueueResponse> {
    return adminApi.get<AdminListingsQueueResponse>('/listings/flagged');
  },

  /**
   * Approve a pending listing
   */
  async approveListing(id: string): Promise<{ success: boolean; listing: Listing }> {
    return adminApi.post<{ success: boolean; listing: Listing }>(`/listings/${id}/approve`, {});
  },

  /**
   * Reject a listing with reason
   */
  async rejectListing(
    id: string,
    reason: string
  ): Promise<{ success: boolean; listing: Listing }> {
    return adminApi.post<{ success: boolean; listing: Listing }>(`/listings/${id}/reject`, {
      reason,
    });
  },

  /**
   * Delete a listing (admin only)
   */
  async deleteListing(id: string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/listings/${id}`);
  },

  // ==================== Statistics ====================

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<AdminStatsResponse> {
    return adminApi.get<AdminStatsResponse>('/stats');
  },
};

