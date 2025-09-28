"use client";

import { useEffect, useRef, useState } from "react";
import { createApiary, type Apiary, type CreateApiaryPayload } from "@/lib/apiaries";

const DEFAULT_CENTER = { lat: 42.6977, lng: 23.3219 };

const parseFloraInput = (value: string): string[] | undefined => {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
};

export default function AddApiaryModal({
  open,
  onClose,
  onCreate,
  defaultCoords,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (a: Apiary) => void;
  defaultCoords?: { lat: number; lng: number } | null;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [lat, setLat] = useState<string>(String(defaultCoords?.lat ?? DEFAULT_CENTER.lat));
  const [lng, setLng] = useState<string>(String(defaultCoords?.lng ?? DEFAULT_CENTER.lng));
  const [region, setRegion] = useState("");
  const [hiveCount, setHiveCount] = useState<string>("");
  const [flora, setFlora] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setLat(String(defaultCoords?.lat ?? DEFAULT_CENTER.lat));
    setLng(String(defaultCoords?.lng ?? DEFAULT_CENTER.lng));
    setRegion("");
    setHiveCount("");
    setFlora("");
    setVisibility("public");
    setNotes("");
    setError(null);
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    setLat(String(defaultCoords?.lat ?? DEFAULT_CENTER.lat));
    setLng(String(defaultCoords?.lng ?? DEFAULT_CENTER.lng));

    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [open, defaultCoords]);

  if (!open) return null;

  const validate = (): string | null => {
    if (!name.trim()) return "Please provide a name for the apiary.";
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return "Latitude and longitude must be valid numbers.";
    }
    if (hiveCount.trim()) {
      const hivesNum = Number(hiveCount);
      if (!Number.isFinite(hivesNum)) {
        return "Hive count must be a valid number.";
      }
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const hiveNum = hiveCount.trim() ? Number(hiveCount) : undefined;

      const payload: CreateApiaryPayload = {
        name: name.trim(),
        lat: latNum,
        lng: lngNum,
        region: region.trim() || undefined,
        visibility,
        notes: notes.trim() || undefined,
        flora: parseFloraInput(flora),
        hiveCount: hiveNum,
      };

      const created = await createApiary(payload);
      onCreate(created);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create apiary. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999]" role="dialog" aria-modal="true" aria-label="Add apiary">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div ref={dialogRef} className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="text-xl font-semibold">Add apiary</h2>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" aria-label="Close">
              x
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="e.g. Vitosha"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">Latitude (lat) *</label>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  type="number"
                  step="0.000001"
                  className="w-full rounded-xl border px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Longitude (lng) *</label>
                <input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  type="number"
                  step="0.000001"
                  className="w-full rounded-xl border px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">Region</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="Region or district"
                />
              </div>
              <div className="w-40">
                <label className="block text-sm mb-1">Hives</label>
                <input
                  value={hiveCount}
                  onChange={(e) => setHiveCount(e.target.value)}
                  type="number"
                  className="w-full rounded-xl border px-3 py-2"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Primary flora</label>
              <input
                value={flora}
                onChange={(e) => setFlora(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Linden, Acacia"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "unlisted")}
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="public">Public (visible to everyone)</option>
                <option value="unlisted">Unlisted (shared via link)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Optional additional details"
              />
            </div>

            {error && <div className="text-sm text-rose-600">{error}</div>}

            <div className="flex items-center gap-2">
              <button
                disabled={submitting}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
