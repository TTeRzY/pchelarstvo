import type { BeekeeperProfile } from '@/types/beekeeper';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

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
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.set('search', params.search);
  if (params?.region) queryParams.set('region', params.region);
  if (params?.trustLevel) queryParams.set('trustLevel', params.trustLevel);
  if (params?.verified !== undefined) queryParams.set('verified', params.verified.toString());
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.perPage) queryParams.set('perPage', params.perPage.toString());

  const url = queryParams.toString() 
    ? `${API_BASE}/api/beekeepers?${queryParams.toString()}`
    : `${API_BASE}/api/beekeepers`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch beekeepers');
  }

  return response.json();
}

export async function fetchBeekeeperProfile(id: string): Promise<BeekeeperProfile> {
  const response = await fetch(`${API_BASE}/api/beekeepers/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch beekeeper profile');
  }

  return response.json();
}

export async function contactBeekeeper(id: string, message: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/beekeepers/${id}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }
}

