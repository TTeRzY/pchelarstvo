"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons for Next.js bundling
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x as unknown as string,
  iconUrl: marker1x as unknown as string,
  shadowUrl: markerShadow as unknown as string,
});

export type Pin = { id: string; lat: number; lng: number; label?: string };

type Theme = "light" | "dark";
export type ApiariesMapProps = {
  center?: [number, number];
  zoom?: number;
  pins?: Pin[];
  heightClass?: string; // e.g. "h-72" | "h-96"
  scrollWheelZoom?: boolean;
  theme?: Theme;
};

const DEFAULT_CENTER: [number, number] = [42.6977, 23.3219]; // Sofia
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

function FitToPins({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pins?.length) return;
    const valid = pins.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (valid.length === 0) return;
    if (valid.length === 1) {
      const z = Math.max(map.getZoom?.() ?? 7, 10);
      map.setView([valid[0].lat, valid[0].lng], z);
      return;
    }
    const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [pins, map]);
  return null;
}

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const toolbarPlaceholders = [
    "Search location",
    "Region",
    "Filters demo",
  ];

  const markers = useMemo(
    () =>
      (pins ?? [])
        .filter((p): p is Pin => !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            {p.label && <Popup>{p.label}</Popup>}
          </Marker>
        )),
    [pins]
  );

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
              <FitToPins pins={pins ?? []} />
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
