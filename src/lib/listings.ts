export type ListingType = "sell" | "buy";

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

export async function fetchListings(params?: { type?: ListingType; region?: string; page?: number; perPage?: number }): Promise<Listing[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.region) qs.set("region", params.region);
  if (typeof params?.page === "number") qs.set("page", String(params.page));
  if (typeof params?.perPage === "number") qs.set("perPage", String(params.perPage));
  const resp = await get<any>(`/api/listings${qs.toString() ? `?${qs}` : ""}`);
  if (Array.isArray(resp?.items)) return resp.items as Listing[];
  if (Array.isArray(resp?.data)) return resp.data as Listing[]; // Laravel paginator
  return [];
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
