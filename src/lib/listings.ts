
import { api, publicApi } from './apiClient';

export type Listing = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  type: ListingType;
  product: string;
  title: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  city?: string;
  description?: string;
  status?: "pending" | "approved" | "active" | "completed" | "rejected" | "flagged";
  user?: { id: string; name: string; email?: string | null };
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactName?: string;
  phone?: string;
  email?: string;
  // Moderation fields
  moderated_by?: number | null;
  moderated_at?: string | null;
  rejection_reason?: string | null;
  flag_count?: number;
  moderator?: {
    id: number;
    name: string;
  };
};

export type FetchListingsParams = {
  type?: ListingType;
  region?: string;
  q?: string;
  product?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  perPage?: number;
};

export type FetchListingsResponse = {
  items: Listing[];
  total: number;
  page: number;
  perPage: number;
};

type PaginatedListingsPayload = {
  items: Listing[];
  total: number;
  page?: number;
  perPage?: number;
};

type ItemsArrayPayload = {
  items: Listing[];
};

type DataArrayPayload = {
  data: Listing[];
};

function isPaginatedListingsPayload(payload: unknown): payload is PaginatedListingsPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as { items?: unknown; total?: unknown };
  return Array.isArray(candidate.items) && typeof candidate.total === "number";
}

function hasItemsArray(payload: unknown): payload is ItemsArrayPayload {
  if (typeof payload !== "object" || payload === null) return false;
  return Array.isArray((payload as { items?: unknown }).items);
}

function hasDataArray(payload: unknown): payload is DataArrayPayload {
  if (typeof payload !== "object" || payload === null) return false;
  return Array.isArray((payload as { data?: unknown }).data);
}

export async function fetchListings(params?: FetchListingsParams): Promise<FetchListingsResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.region) queryParams.region = params.region;
  if (params?.q) queryParams.q = params.q;
  if (params?.product) queryParams.product = params.product;
  if (typeof params?.minPrice === "number") queryParams.minPrice = params.minPrice;
  if (typeof params?.maxPrice === "number") queryParams.maxPrice = params.maxPrice;
  if (params?.sort) queryParams.sort = params.sort;
  if (typeof params?.page === "number") queryParams.page = params.page;
  if (typeof params?.perPage === "number") queryParams.perPage = params.perPage;
  
  const resp = await publicApi.get<unknown>('/api/listings', queryParams);
  
  // Handle Laravel paginated response format: { data: [...], current_page, per_page, total, last_page }
  if (resp && typeof resp === 'object' && 'data' in resp && Array.isArray((resp as any).data)) {
    const laravelResp = resp as {
      data: Listing[];
      current_page?: number;
      per_page?: number;
      total?: number;
      last_page?: number;
    };
    return {
      items: laravelResp.data,
      total: laravelResp.total || laravelResp.data.length,
      page: laravelResp.current_page || 1,
      perPage: laravelResp.per_page || 20,
    };
  }
  
  // Handle paginated response with items
  if (isPaginatedListingsPayload(resp)) {
    return {
      items: resp.items,
      total: resp.total,
      page: resp.page || 1,
      perPage: resp.perPage || 20,
    };
  }
  
  // Backward compatibility: if response is just an array or old format
  if (hasItemsArray(resp)) {
    return {
      items: resp.items,
      total: resp.items.length,
      page: 1,
      perPage: resp.items.length,
    };
  }
  if (hasDataArray(resp)) {
    return {
      items: resp.data,
      total: resp.data.length,
      page: 1,
      perPage: resp.data.length,
    };
  }
  
  return { items: [], total: 0, page: 1, perPage: 20 };
}

export async function fetchListing(id: string): Promise<Listing | null> {
  try {
    return await publicApi.get<Listing>(`/api/listings/${id}`);
  } catch {
    return null;
  }
}

export type CreateListingInput = {
  type: ListingType;
  product: string;
  title: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  city?: string;
  contactName: string;
  phone: string;
  email: string;
  description: string;
};

export async function createListing(input: CreateListingInput): Promise<Listing> {
  // Token is automatically included via unified API client
  return api.post<Listing>("/api/listings", input);
}

export type ContactListingInput = {
  message: string;
  email?: string | null;
  phone?: string | null;
};

export async function contactListing(id: string, input: ContactListingInput): Promise<void> {
  // Token is automatically included via unified API client
  await api.post(`/api/listings/${id}/messages`, input);
}

/**
 * Get user's own listings with optional filters
 */
export type GetMyListingsParams = {
  status?: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'flagged';
  type?: ListingType;
  product?: string;
  region?: string;
  page?: number;
  perPage?: number;
};

export type MyListingsResponse = {
  data: Listing[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export async function getMyListings(params?: GetMyListingsParams): Promise<MyListingsResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.type) queryParams.type = params.type;
  if (params?.product) queryParams.product = params.product;
  if (params?.region) queryParams.region = params.region;
  if (params?.page) queryParams.page = params.page;
  if (params?.perPage) queryParams.perPage = params.perPage;

  // Token is automatically included via unified API client
  return api.get<MyListingsResponse>('/api/listings/my', queryParams);
}

/**
 * Update listing status (e.g., mark as completed)
 */
export async function updateListingStatus(
  listingId: string,
  status: 'completed'
): Promise<Listing> {
  // Token is automatically included via unified API client
  return api.patch<Listing>(`/api/listings/${listingId}`, { status });
}
