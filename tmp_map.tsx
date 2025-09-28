"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Load Leaflet CSS once in globals.css:
// @import "leaflet/dist/leaflet.css";

// ---- Fix default marker icons in Next bundling (do this once) ----
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// Next/webpack returns strings for these imports; avoid .src access
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x as unknown as string,
  iconUrl: marker1x as unknown as string,
  shadowUrl: markerShadow as unknown as string,
});

// ---- Types ----
export type Pin = { id: string; lat: number; lng: number; label?: string };

type Props = {
  center?: [number, number];
  zoom?: number;
  pins?: Pin[];
  heightClass?: string;          // e.g. "h-72" | "h-96"
  scrollWheelZoom?: boolean;
  theme?: "light" | "dark";
};

function FitToPins({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pins?.length) return;
    const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [pins, map]);
  return null;
}

export default function ApiariesMapClient({
  center = [42.6977, 23.3219], // Sofia
  zoom = 7,
  pins = [
    { id: "a", lat: 42.7,  lng: 23.32, label: "РЎРѕС„РёСЏ"   },
    { id: "b", lat: 42.15, lng: 24.75, label: "РџР»РѕРІРґРёРІ" },
    { id: "c", lat: 43.21, lng: 27.91, label: "Р’Р°СЂРЅР°"   },
  ],
  heightClass = "h-72",
  scrollWheelZoom = false,
  theme = "light",
}: Props) {

  // Only recreate marker elements if pins change
  const markers = useMemo(
    () =>
      pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          {p.label && <Popup>{p.label}</Popup>}
        </Marker>
      )),
    [pins]
  );

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution =
    theme === "dark"
      ? '&copy; <a href="https://carto.com/attributions">CARTO</a> & OSM'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

  return (
    <section aria-labelledby="map-title">
      <h3 id="map-title" className="text-sm tracking-wide font-extrabold uppercase p-3">
        РљР°СЂС‚Р° РЅР° РџС‡РµР»РёРЅРёС‚Рµ
      </h3>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar (filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border-b border-gray-100">
          <input className="h-9 rounded-md border border-gray-200 px-2 text-sm" placeholder="Р РµРіРёРѕРЅ" />
          <input className="h-9 rounded-md border border-gray-200 px-2 text-sm" placeholder="Р“СЂР°Рґ" />
          <input className="h-9 rounded-md border border-gray-200 px-2 text-sm" placeholder="РРјРµ РЅР° РїС‡РµР»Р°СЂ" />
        </div>

        {/* Map */}
        <div className={heightClass}>
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            scrollWheelZoom={scrollWheelZoom}
          >
            <TileLayer attribution={tileAttribution} url={tileUrl} />
            <FitToPins pins={pins} />
            {markers}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}

