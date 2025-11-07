"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('apiary');
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
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    if (!name.trim()) return t('nameRequired');
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return t('coordsInvalid');
    }
    if (hiveCount.trim()) {
      const hivesNum = Number(hiveCount);
      if (!Number.isFinite(hivesNum)) {
        return t('hivesInvalid');
      }
    }
    return null;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t('geolocationNotSupported'));
      return;
    }

    setLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = t('geolocationNotSupported');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('locationPermissionDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('locationTimeout');
            break;
        }
        
        setError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
      setError(err instanceof Error ? err.message : t('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999]" role="dialog" aria-modal="true" aria-label={t('addApiary')}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div ref={dialogRef} className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="text-xl font-semibold">{t('addApiary')}</h2>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" aria-label={t('close')}>
              x
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1">{t('name')} *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder={t('namePlaceholder')}
                required
              />
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={loadingLocation}
                className="flex items-center gap-2 rounded-xl border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('gettingLocation')}
                  </>
                ) : (
                  <>
                    📍 {t('useMyLocation')}
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">{t('latitude')} *</label>
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
                <label className="block text-sm mb-1">{t('longitude')} *</label>
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
                <label className="block text-sm mb-1">{t('region')}</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder={t('regionPlaceholder')}
                />
              </div>
              <div className="w-40">
                <label className="block text-sm mb-1">{t('hives')}</label>
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
              <label className="block text-sm mb-1">{t('flora')}</label>
              <input
                value={flora}
                onChange={(e) => setFlora(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder={t('floraPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('visibility')}</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "unlisted")}
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="public">{t('visibilityPublic')}</option>
                <option value="unlisted">{t('visibilityUnlisted')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">{t('notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border px-3 py-2"
                placeholder={t('notesPlaceholder')}
              />
            </div>

            {error && <div className="text-sm text-rose-600">{error}</div>}

            <div className="flex items-center gap-2">
              <button
                disabled={submitting}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
              >
                {submitting ? t('saving') : t('save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
