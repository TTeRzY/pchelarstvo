import { api, publicApi } from "./apiClient";
import { authStorage } from "./authClient";

// Apiary shape used across the app, aligned with backend (Laravel) fields
export type Apiary = {
  id: string;
  name: string;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  owner?: string | null;
  apiaryNumber?: string | null;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: string | null;
  flora?: string[];
  hiveCount?: number;
  contact?: { name?: string; phone?: string; email?: string };
};

export type CreateApiaryPayload = {
  name: string; // Auto-generated from region and city
  lat: number;
  lng: number;
  region?: string;
  city?: string;
  address?: string;
  owner?: string;
  apiaryNumber?: string;
  flora?: string[];
  hiveCount?: number;
};

const APIARY_LIST_PATH = "/api/apiaries";
const APIARY_CREATE_PATH = "/api/add-apiary";
const DEFAULT_FALLBACK_NAME = "Apiary";

const toNum = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const coerceString = (value: unknown): string => {
  if (value == null) return "";
  return String(value).trim();
};

const coerceFlora = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const items = value.map((item) => coerceString(item)).filter(Boolean);
    return items.length ? items : undefined;
  }
  if (typeof value === "string") {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : undefined;
  }
  return undefined;
};

const fallbackId = (): string => {
  if (typeof globalThis !== "undefined" && typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const applyNameFix = (apiary: Apiary): Apiary => {
  // Name is already set from backend or auto-generated
  return apiary;
};

const normalizeApiary = (raw: any): Apiary => {
  if (!raw) {
    throw new Error("Empty apiary payload");
  }

  const idCandidate = raw.id ?? raw.external_id ?? raw.uuid ?? raw.apiary_id;
  const baseId = idCandidate != null ? String(idCandidate) : fallbackId();

  const owner = coerceString(raw.owner);
  const apiaryNumber = coerceString(raw.apiaryNumber ?? raw.apiary_number ?? raw.registration_number);
  const explicitName = coerceString(raw.name);
  const derivedName = explicitName || (owner ? `${owner}` : DEFAULT_FALLBACK_NAME);

  const lat = toNum(raw.lat ?? raw.latitude);
  const lng = toNum(raw.lng ?? raw.longitude);
  const flora = coerceFlora(raw.flora);
  const updatedAt =
    typeof raw.updatedAt === "string"
      ? raw.updatedAt
      : typeof raw.updated_at === "string"
      ? raw.updated_at
      : raw.updatedAt instanceof Date
      ? raw.updatedAt.toISOString()
      : raw.updated_at instanceof Date
      ? raw.updated_at.toISOString()
      : null;

  const hiveRaw = raw.hiveCount ?? raw.hive_count;
  const hiveCount =
    typeof hiveRaw === "number" && Number.isFinite(hiveRaw)
      ? hiveRaw
      : typeof hiveRaw === "string" && hiveRaw.trim()
      ? Number(hiveRaw)
      : undefined;

  return {
    id: baseId,
    name: derivedName || DEFAULT_FALLBACK_NAME,
    region: coerceString(raw.region) || null,
    city: coerceString(raw.city) || null,
    address: coerceString(raw.address) || null,
    owner: owner || null,
    apiaryNumber: apiaryNumber || null,
    lat,
    lng,
    updatedAt,
    flora,
    hiveCount: typeof hiveCount === "number" && Number.isFinite(hiveCount) ? hiveCount : undefined,
    contact: raw.contact,
  };
};

const extractApiaryCollection = (data: any): any[] => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeApiaryList = (data: any): Apiary[] =>
  extractApiaryCollection(data)
    .map((item) => {
      try {
        return applyNameFix(normalizeApiary(item));
      } catch {
        return null;
      }
    })
    .filter((item): item is Apiary => Boolean(item));

const normalizeSingleApiary = (data: any): Apiary | null => {
  const candidate =
    data?.item && !Array.isArray(data.item)
      ? data.item
      : data?.data && !Array.isArray(data.data)
      ? data.data
      : Array.isArray(data?.data) && data.data.length > 0
      ? data.data[0]
      : Array.isArray(data?.items) && data.items.length > 0
      ? data.items[0]
      : data;

  if (!candidate) return null;

  try {
    return applyNameFix(normalizeApiary(candidate));
  } catch {
    return null;
  }
};

// Helper to convert apiRequest calls to unified API client
// Note: apiRequest is kept for backward compatibility but now uses unified client
const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const method = init.method || "GET";
  const includeAuth = init.headers && new Headers(init.headers).has("Authorization");
  
  // Extract body if present
  let body: unknown = undefined;
  if (init.body && typeof init.body === "string") {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }

  // Use unified API client
  if (method === "GET") {
    return publicApi.get<T>(path);
  } else if (method === "POST") {
    if (includeAuth) {
      return api.post<T>(path, body);
    } else {
      return publicApi.post<T>(path, body);
    }
  } else if (method === "PATCH") {
    return api.patch<T>(path, body);
  } else if (method === "PUT") {
    return api.put<T>(path, body);
  } else if (method === "DELETE") {
    return api.delete<T>(path);
  }
  
  // Fallback for other methods
  throw new Error(`Unsupported HTTP method: ${method}`);
};

async function tryGetBrowserCoords(timeoutMs = 2000): Promise<{ lat: number; lng: number } | null> {
  try {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return null;
    let position: GeolocationPosition | null = null;
    try {
      position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const id = setTimeout(() => reject(new Error("geolocation-timeout")), timeoutMs);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            clearTimeout(id);
            resolve(p);
          },
          () => {
            clearTimeout(id);
            reject(new Error("geolocation-error"));
          },
          { enableHighAccuracy: false, maximumAge: 60_000 }
        );
      });
    } catch {
      position = null;
    }
    if (!position) return null;
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    return null;
  }
}

export async function fetchApiaries(params?: {
  region?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
}): Promise<Apiary[]> {
  const qs = new URLSearchParams();
  if (params?.region) qs.set("region", params.region);

  let lat = params?.lat;
  let lng = params?.lng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    const coords = await tryGetBrowserCoords().catch(() => null);
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  if (typeof lat === "number") qs.set("lat", String(lat));
  if (typeof lng === "number") qs.set("lng", String(lng));
  if (typeof params?.radiusKm === "number") qs.set("radiusKm", String(params.radiusKm));
  qs.set("limit", String(params?.limit ?? 50));

  // Convert URLSearchParams to object for unified API client
  const queryParams: Record<string, string | number> = {};
  qs.forEach((value, key) => {
    const numValue = Number(value);
    queryParams[key] = isNaN(numValue) ? value : numValue;
  });

  const data = await publicApi.get<any>(APIARY_LIST_PATH, queryParams);

  return normalizeApiaryList(data);
}

export async function fetchUserApiaries(): Promise<Apiary[]> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("Login required to fetch user apiaries.");
  }

  // Use unified API client - token is automatically included
  const data = await api.get<any>(`${APIARY_LIST_PATH}`, { user: "me" });

  return normalizeApiaryList(data);
}

export async function createApiary(payload: CreateApiaryPayload): Promise<Apiary> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("Login required to add a new apiary.");
  }

  // NOTE: Backend should automatically create/update a beekeeper profile for the authenticated user
  // when an apiary is created. If users are not appearing in the beekeepers list after adding
  // an apiary, check the backend API to ensure it creates the beekeeper profile.
  
  const body = {
    name: payload.name,
    lat: payload.lat,
    lng: payload.lng,
    region: payload.region ?? null,
    city: payload.city ?? null,
    address: payload.address ?? null,
    apiaryNumber: payload.apiaryNumber ?? null,
    apiary_number: payload.apiaryNumber ?? null,
    owner: payload.owner ?? null,
    flora: payload.flora ?? [],
    hiveCount: payload.hiveCount ?? null,
    hive_count: payload.hiveCount ?? null,
  };

  // Use unified API client - token is automatically included
  const data = await api.post<any>(APIARY_CREATE_PATH, body);

  const normalized = normalizeSingleApiary(data);
  if (normalized) {
    return normalized;
  }

  return {
    id: fallbackId(),
    name: payload.name,
    region: payload.region ?? null,
    city: payload.city ?? null,
    address: payload.address ?? null,
    owner: payload.owner ?? null,
    apiaryNumber: payload.apiaryNumber ?? null,
    lat: payload.lat,
    lng: payload.lng,
    updatedAt: new Date().toISOString(),
    flora: payload.flora,
    hiveCount: payload.hiveCount,
  };
}