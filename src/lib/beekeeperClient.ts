import { api, publicApi } from './apiClient';
import type { BeekeeperProfile } from '@/types/beekeeper';

type FetchBeekeepersParams = {
  search?: string;
  region?: string;
  trustLevel?: string;
  verified?: boolean;
  sortBy?: string;
  page?: number;
  perPage?: number;
};

type BeekeepersResponse = {
  items: BeekeeperProfile[];
  total: number;
  page: number;
  perPage: number;
};

export async function fetchBeekeepers(params?: FetchBeekeepersParams): Promise<BeekeepersResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.search) queryParams.search = params.search;
  if (params?.region) queryParams.region = params.region;
  if (params?.trustLevel) queryParams.trustLevel = params.trustLevel;
  if (params?.verified !== undefined) queryParams.verified = params.verified;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.page) queryParams.page = params.page;
  if (params?.perPage) queryParams.perPage = params.perPage;

  return publicApi.get<BeekeepersResponse>('/api/beekeepers', queryParams);
}

export async function fetchBeekeeperProfile(id: string): Promise<BeekeeperProfile> {
  return publicApi.get<BeekeeperProfile>(`/api/beekeepers/${id}`);
}

export async function contactBeekeeper(id: string, message: string): Promise<void> {
  // Fixed: Now includes authentication token automatically
  await api.post(`/api/beekeepers/${id}/contact`, { message });
}

