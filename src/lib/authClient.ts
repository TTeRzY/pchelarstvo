// Auth client for Laravel Sanctum (token mode)
import { api, publicApi } from './apiClient';
import type { User } from '@/types/user';

export type AuthResponse = { user: User; token?: string };
export type { User };

export const authStorage = {
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
  setToken: (token: string | null) => {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  },
};

export const authClient = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Login is public (no auth required)
    const data = await publicApi.post<AuthResponse>("/api/auth/login", { email, password });
    authStorage.setToken(data.token ?? null);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const payload = { name, email, password, password_confirmation: password };
    // Registration is public (no auth required)
    const data = await publicApi.post<AuthResponse>("/api/auth/register", payload);
    authStorage.setToken(data.token ?? null);
    return data;
  },

  async logout(): Promise<void> {
    try {
      // Token is automatically included by unified API client
      await api.post("/api/auth/logout", {});
    } catch {
      // Continue even if logout request fails
    } finally {
      authStorage.setToken(null);
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.put("/api/auth/password", {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await publicApi.post("/api/auth/forgot-password", { email });
  },

  async resetPassword(params: { email: string; token: string; password: string; confirmPassword: string }): Promise<void> {
    await publicApi.post("/api/auth/reset-password", {
      email: params.email,
      token: params.token,
      password: params.password,
      password_confirmation: params.confirmPassword,
    });
  },

  async me(): Promise<User | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      // Token is automatically included by unified API client
      return await api.get<User>("/api/auth/me");
    } catch {
      return null;
    }
  },
};

