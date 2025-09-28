import { authStorage } from "./authClient";

// Apiary shape used across the app, aligned with backend (Laravel) fields
export type Apiary = {
  id: string;
  name: string;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  owner?: string | null;
  code?: string | null;
  lat?: number | null;
  lng?: number | null;
  visibility: "public" | "unlisted";
  updatedAt?: string | null;
  flora?: string[];
  hiveCount?: number;
  contact?: { name?: string; phone?: string; email?: string };
  notes?: string | null;
};

export type CreateApiaryPayload = {
  name: string;
  lat: number;
  lng: number;
  region?: string;
  city?: string;
  address?: string;
  owner?: string;
  code?: string;
  flora?: string[];
  hiveCount?: number;
  visibility: "public" | "unlisted";
  notes?: string;
};

const USE_DIRECT_API =
  process.env.NEXT_PUBLIC_API_DIRECT === "true" ||
  process.env.NEXT_PUBLIC_API_DIRECT === "1" ||
  process.env.NEXT_PUBLIC_AUTH_DIRECT === "true" ||
  process.env.NEXT_PUBLIC_AUTH_DIRECT === "1";

const API_BASE = USE_DIRECT_API ? process.env.NEXT_PUBLIC_API_BASE ?? "" : "";
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
  const trimmed = apiary.name?.trim() ?? "";
  if (!trimmed || !/^[0-9]+$/.test(trimmed)) {
    return apiary;
  }
  const code = apiary.code ?? trimmed;
  const owner = apiary.owner ?? undefined;
  return {
    ...apiary,
    code,
    name: `${owner ?? DEFAULT_FALLBACK_NAME}${code ? ` / ${code}` : ""}`,
  };
};

const normalizeApiary = (raw: any): Apiary => {
  if (!raw) {
    throw new Error("Empty apiary payload");
  }

  const idCandidate = raw.id ?? raw.external_id ?? raw.uuid ?? raw.apiary_id;
  const baseId = idCandidate != null ? String(idCandidate) : fallbackId();

  const owner = coerceString(raw.owner);
  const code = coerceString(raw.code ?? raw.apiary_code);
  const explicitName = coerceString(raw.name);
  const derivedName = explicitName || (owner ? `${owner}${code ? ` / ${code}` : ""}` : DEFAULT_FALLBACK_NAME);

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
    code: code || null,
    lat,
    lng,
    visibility: raw.visibility === "unlisted" ? "unlisted" : "public",
    updatedAt,
    flora,
    hiveCount: typeof hiveCount === "number" && Number.isFinite(hiveCount) ? hiveCount : undefined,
    contact: raw.contact,
    notes: coerceString(raw.notes ?? raw.description) || null,
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

const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers ?? undefined);
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
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
  visibility?: "public" | "unlisted";
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
}): Promise<Apiary[]> {
  const qs = new URLSearchParams();
  if (params?.region) qs.set("region", params.region);
  if (params?.visibility) qs.set("visibility", params.visibility);

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

  const data = await apiRequest<any>(`${APIARY_LIST_PATH}${qs.toString() ? `?${qs}` : ""}`, {
    method: "GET",
    cache: "no-store",
  });

  return normalizeApiaryList(data);
}

export async function createApiary(payload: CreateApiaryPayload): Promise<Apiary> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("Login required to add a new apiary.");
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.set("Authorization", `Bearer ${token}`);

  const body = {
    name: payload.name,
    lat: payload.lat,
    lng: payload.lng,
    region: payload.region ?? null,
    city: payload.city ?? null,
    address: payload.address ?? null,
    code: payload.code ?? null,
    owner: payload.owner ?? null,
    visibility: payload.visibility,
    notes: payload.notes ?? null,
    flora: payload.flora ?? [],
    hiveCount: payload.hiveCount ?? null,
    hive_count: payload.hiveCount ?? null,
  };

  const data = await apiRequest<any>(APIARY_CREATE_PATH, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

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
    code: payload.code ?? null,
    lat: payload.lat,
    lng: payload.lng,
    visibility: payload.visibility,
    updatedAt: new Date().toISOString(),
    flora: payload.flora,
    hiveCount: payload.hiveCount,
    notes: payload.notes ?? null,
  };
}