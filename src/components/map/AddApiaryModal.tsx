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
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [apiaryNumber, setApiaryNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [beekeeperName, setBeekeeperName] = useState("");
  const [hiveCount, setHiveCount] = useState<string>("");
  const [flora, setFlora] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const resetForm = () => {
    setName("");
    setLat("");
    setLng("");
    setRegion("");
    setCity("");
    setAddress("");
    setCode("");
    setApiaryNumber("");
    setOwner("");
    setBeekeeperName("");
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
    setLat("");
    setLng("");

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
    if (!region.trim()) return t('regionRequired');
    if (!city.trim()) return t('cityRequired');
    if (!address.trim()) return t('addressRequired');
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
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        code: code.trim() || undefined,
        apiaryNumber: apiaryNumber.trim() || undefined,
        owner: owner.trim() || undefined,
        beekeeperName: beekeeperName.trim() || undefined,
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
      <div className="absolute inset-0 flex items-center justify-center px-4 py-4">
        <div ref={dialogRef} className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white shadow-lg flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">{t('addApiary')}</h2>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" aria-label={t('close')}>
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('apiaryNumber')}</label>
                <input
                  value={apiaryNumber}
                  onChange={(e) => setApiaryNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('apiaryNumberPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('name')} *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('namePlaceholder')}
                  required
                />
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={loadingLocation}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('latitude')} *</label>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                type="number"
                step="0.000001"
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('longitude')} *</label>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                type="number"
                step="0.000001"
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('region')} *</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('regionPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('city')} *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('cityPlaceholder')}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('address')} *</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('addressPlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('code')}</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('codePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('hives')}</label>
              <input
                value={hiveCount}
                onChange={(e) => setHiveCount(e.target.value)}
                type="number"
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('owner')}</label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('ownerPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('beekeeperName')}</label>
              <input
                value={beekeeperName}
                onChange={(e) => setBeekeeperName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('beekeeperNamePlaceholder')}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('flora')}</label>
            <input
              value={flora}
              onChange={(e) => setFlora(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('floraPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('visibility')}</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "public" | "unlisted")}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="public">{t('visibilityPublic')}</option>
              <option value="unlisted">{t('visibilityUnlisted')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('notesPlaceholder')}
            />
          </div>

              {error && <div className="text-xs text-rose-600 bg-rose-50 px-2 py-1.5 rounded-lg">{error}</div>}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-t bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? t('saving') : t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
