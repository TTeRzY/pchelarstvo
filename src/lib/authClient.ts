// Auth client for Laravel Sanctum (token mode)
import type { User } from '@/types/user';

export type AuthResponse = { user: User; token?: string };
export type { User };

const USE_DIRECT_API = process.env.NEXT_PUBLIC_AUTH_DIRECT === 'true' || process.env.NEXT_PUBLIC_AUTH_DIRECT === '1';
const API_BASE = USE_DIRECT_API ? process.env.NEXT_PUBLIC_API_BASE ?? '' : ''; // direct mode uses full URL, default proxies through Next

async function request<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }

  return res.json() as Promise<T>;
}

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
    const data = await request<AuthResponse>("POST", "/api/auth/login", { email, password });
    authStorage.setToken(data.token ?? null);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const payload = { name, email, password, password_confirmation: password };
    const data = await request<AuthResponse>("POST", "/api/auth/register", payload);
    authStorage.setToken(data.token ?? null);
    return data;
  },

  async logout(): Promise<void> {
    const token = authStorage.getToken();
    if (token) {
      await request("POST", "/api/auth/logout", {}, token);
    }
    authStorage.setToken(null);
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error("РќРµ СЃС‚Рµ РІР»РµР·Р»Рё РІ РїСЂРѕС„РёР»Р° СЃРё.");
    }

    await request(
      "PUT",
      "/api/auth/password",
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      token
    );
  },

  async requestPasswordReset(email: string): Promise<void> {
    await request("POST", "/api/auth/forgot-password", { email });
  },

  async resetPassword(params: { email: string; token: string; password: string; confirmPassword: string }): Promise<void> {
    await request("POST", "/api/auth/reset-password", {
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
      return await request<User>("GET", "/api/auth/me", undefined, token);
    } catch {
      return null;
    }
  },
};

