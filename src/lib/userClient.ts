/**
 * User Profile API Client
 * Handles all user profile-related operations
 */

import { api, publicApi } from './apiClient';
import type { User } from '@/types/user';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  region?: string;
  city?: string;
  bio?: string;
  privacy?: 'public' | 'members' | 'private';
}

export interface ProfileResponse {
  user: User;
}

export const userClient = {
  /**
   * Get current user's full profile
   */
  async getProfile(): Promise<User> {
    return api.get<User>('/api/auth/me');
  },

  /**
   * Update current user's profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.patch<ProfileResponse | User>('/api/auth/me', data);
    // Laravel returns { user: {...} }, extract the user object when present
    if (isProfileResponse(response)) {
      return response.user;
    }
    return response;
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Use unified API client for file upload
    return api.upload<{ avatarUrl: string }>('/api/auth/avatar', formData);
  },

  /**
   * Get public profile by user ID
   */
  async getPublicProfile(userId: string): Promise<User> {
    return publicApi.get<User>(`/api/user/profile/${userId}`);
  },
};

function isProfileResponse(payload: unknown): payload is ProfileResponse {
  if (typeof payload !== 'object' || payload === null) return false;
  return 'user' in payload;
}

