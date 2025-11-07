
export type Listing = {
  id: string;
  createdAt?: string;
  type: ListingType;
  product: string;
  title: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  city?: string;
  description?: string;
  status?: "active" | "completed";
  user?: { id: string; name: string; email?: string | null };
  contactEmail?: string | null;
  contactPhone?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""; // e.g. http://127.0.0.1:8000

async function get<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function auth<T>(method: string, url: string, body: any, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

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

export async function fetchListings(params?: FetchListingsParams): Promise<FetchListingsResponse> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.region) qs.set("region", params.region);
  if (params?.q) qs.set("q", params.q);
  if (params?.product) qs.set("product", params.product);
  if (typeof params?.minPrice === "number") qs.set("minPrice", String(params.minPrice));
  if (typeof params?.maxPrice === "number") qs.set("maxPrice", String(params.maxPrice));
  if (params?.sort) qs.set("sort", params.sort);
  if (typeof params?.page === "number") qs.set("page", String(params.page));
  if (typeof params?.perPage === "number") qs.set("perPage", String(params.perPage));
  
  const resp = await get<any>(`/api/listings${qs.toString() ? `?${qs}` : ""}`);
  
  // Handle paginated response
  if (resp?.items && typeof resp?.total === "number") {
    return {
      items: resp.items as Listing[],
      total: resp.total,
      page: resp.page || 1,
      perPage: resp.perPage || 20,
    };
  }
  
  // Backward compatibility: if response is just an array or old format
  if (Array.isArray(resp?.items)) {
    return {
      items: resp.items as Listing[],
      total: resp.items.length,
      page: 1,
      perPage: resp.items.length,
    };
  }
  if (Array.isArray(resp?.data)) {
    return {
      items: resp.data as Listing[],
      total: resp.data.length,
      page: 1,
      perPage: resp.data.length,
    };
  }
  
  return { items: [], total: 0, page: 1, perPage: 20 };
}

export async function fetchListing(id: string): Promise<Listing | null> {
  try {
    return await get<Listing>(`/api/listings/${id}`);
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
  description?: string;
};

export async function createListing(input: CreateListingInput, token: string): Promise<Listing> {
  return auth<Listing>("POST", "/api/listings", input, token);
}




export type ContactListingInput = {
  message: string;
  email?: string | null;
  phone?: string | null;
};

export async function contactListing(id: string, input: ContactListingInput, token: string): Promise<void> {
  await auth<Record<string, unknown>>("POST", `/api/listings/${id}/messages`, input, token);
}
