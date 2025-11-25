/**
 * User Profile API Client
 * Handles all user profile-related operations
 */

import { get, patch } from './api';
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
   * Get current user's full profile (calls Laravel directly)
   */
  async getProfile(): Promise<User> {
    return get<User>('/api/auth/me');
  },

  /**
   * Update current user's profile (calls Laravel directly)
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await patch<ProfileResponse | User>('/api/auth/me', data);
    // Laravel returns { user: {...} }, extract the user object when present
    if (isProfileResponse(response)) {
      return response.user;
    }
    return response;
  },

  /**
   * Upload user avatar (calls Laravel directly)
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
    const response = await fetch(`${API_BASE}/api/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to upload avatar');
    }

    return response.json();
  },

  /**
   * Get public profile by user ID (calls Laravel directly)
   */
  async getPublicProfile(userId: string): Promise<User> {
    return get<User>(`/api/user/profile/${userId}`);
  },
};

function isProfileResponse(payload: unknown): payload is ProfileResponse {
  if (typeof payload !== 'object' || payload === null) return false;
  return 'user' in payload;
}

