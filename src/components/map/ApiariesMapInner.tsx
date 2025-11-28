"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons for Next.js bundling
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Ensure icon URLs are strings (Next.js imports may return objects)
const getIconUrl = (img: any): string => {
  if (typeof img === 'string') return img;
  if (img?.src) return img.src;
  if (img?.default) return img.default;
  return String(img);
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: getIconUrl(marker2x),
  iconUrl: getIconUrl(marker1x),
  shadowUrl: getIconUrl(markerShadow),
});

export type Pin = { 
  id: string; 
  lat: number; 
  lng: number; 
  label?: string;
  type?: "apiary" | "treatment"; // Marker type for different styling
};

type Theme = "light" | "dark";
export type ApiariesMapProps = {
  /**
   * Initial center of the map.
   * Defaults to a country‑level view over Bulgaria.
   */
  center?: [number, number];
  /**
   * Initial zoom level.
   * Defaults to 7 for a national overview (not zoomed into a specific city/region).
   */
  zoom?: number;
  pins?: Pin[];
  heightClass?: string; // e.g. "h-72" | "h-96"
  scrollWheelZoom?: boolean;
  theme?: Theme;
};

// Approximate geographic center of Bulgaria for a country‑level overview
const DEFAULT_CENTER: [number, number] = [42.75, 25.0];
const TILE_LAYERS: Record<Theme, { url: string; attribution: string }> = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> & OSM',
  },
};

// NOTE: We intentionally do NOT auto‑fit to pins anymore.
// This keeps the map at a stable, country‑level zoom so users
// always see Bulgaria as a whole rather than zooming into a specific region.

export default function ApiariesMapInner({
  center = DEFAULT_CENTER,
  zoom = 7,
  pins = [
    { id: "sofia", lat: 42.6977, lng: 23.3219, label: "Sofia" },
    { id: "plovdiv", lat: 42.1354, lng: 24.7453, label: "Plovdiv" },
    { id: "varna", lat: 43.2141, lng: 27.9147, label: "Varna" },
  ],
  heightClass = "h-72",
  scrollWheelZoom = false,
  theme = "light",
}: ApiariesMapProps) {
  const tile = TILE_LAYERS[theme] ?? TILE_LAYERS.light;
  const [mounted, setMounted] = useState(false);
  const [iconReady, setIconReady] = useState(false);
  const treatmentIconRef = useRef<L.Icon | null>(null);

  useEffect(() => {
    setMounted(true);
    // Create treatment icon only after component mounts (when Leaflet is ready)
    if (!treatmentIconRef.current && typeof window !== "undefined") {
      const svgString = `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg"><path fill="#ef4444" stroke="#dc2626" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="6"/><text x="12.5" y="16" font-size="10" fill="#ef4444" text-anchor="middle" font-weight="bold">⚠</text></svg>`;
      treatmentIconRef.current = new L.Icon({
        iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
      });
      setIconReady(true);
    }
  }, []);

  const toolbarPlaceholders = ["Търсене", "Регион", "Филтри"];

  const markers = useMemo(() => {
    return (pins ?? [])
      .filter((p): p is Pin => {
        // Filter out invalid pins
        if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) {
          return false;
        }
        // If it's a treatment marker, only include it if icon is ready
        if (p.type === "treatment" && !treatmentIconRef.current) {
          return false;
        }
        return true;
      })
      .map((p) => {
        // Only pass icon prop if it's defined (for treatment markers)
        // For apiary markers, don't pass icon prop (use default)
        const markerProps: { position: [number, number]; icon?: L.Icon } = {
          position: [p.lat, p.lng],
        };
        
        if (p.type === "treatment" && treatmentIconRef.current) {
          markerProps.icon = treatmentIconRef.current;
        }
        
        return (
          <Marker key={p.id} {...markerProps}>
            {p.label && <Popup>{p.label}</Popup>}
          </Marker>
        );
      });
  }, [pins, iconReady]);

  return (
    <section aria-labelledby="map-title">
      <h3 id="map-title" className="text-sm tracking-wide font-extrabold uppercase p-3">
        Карта на пчелините
      </h3>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar (demo inputs only) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border-b border-gray-100">
          {toolbarPlaceholders.map((ph) => (
            <input key={ph} className="h-9 rounded-md border border-gray-200 px-2 text-sm" placeholder={ph} />
          ))}
        </div>

        {/* Map */}
        <div className={heightClass}>
          {mounted ? (
            <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom={scrollWheelZoom}>
              <TileLayer attribution={tile.attribution} url={tile.url} />
              {markers}
            </MapContainer>
          ) : (
            <div className="h-full w-full bg-gray-100 animate-pulse" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
