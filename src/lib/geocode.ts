const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export type GeocodeResult = {
  lat: number;
  lng: number;
  display_name?: string | null;
  class?: string | null;
  type?: string | null;
};

export async function geocodeAddress(address: string, city?: string, region?: string, country = "Bulgaria"): Promise<GeocodeResult | null> {
  const params = new URLSearchParams();
  if (address) params.set("address", address);
  if (city) params.set("city", city);
  if (region) params.set("region", region);
  if (country) params.set("country", country);

  try {
    const res = await fetch(`${API_BASE}/api/geocode?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodeResult;
    if (typeof data.lat === "number" && typeof data.lng === "number") return data;
    return null;
  } catch {
    return null;
  }
}

