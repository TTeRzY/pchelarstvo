"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const REFRESH_INTERVAL = 60_000;
const UPDATE_EVENT = "treatment:updated";
const SPEED_PX_PER_SECOND = 80;

export type TreatmentReport = {
  id: string;
  location: string;
  createdAt: string;
  treatment_date?: string;
  treatment_time?: string;
  treatmentDate?: string; // Alias for treatment_date
  treatmentTime?: string; // Alias for treatment_time
  pesticide_name?: string;
  pesticideName?: string; // Alias
  crop_type?: string;
  cropType?: string; // Alias
  reporter_name?: string;
  reporter_phone?: string;
  status?: string;
  notes?: string;
};

type FetchState = {
  data: TreatmentReport[];
  error: string | null;
  loading: boolean;
};

export default function TreatmentTicker() {
  const t = useTranslations("treatments");
  const locale = useLocale() as "bg" | "en";
  const mountedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const [{ data, error, loading }, setState] = useState<FetchState>({
    data: [],
    error: null,
    loading: true,
  });
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/treatment-reports", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as TreatmentReport[];
      if (!mountedRef.current) return;
      setState({ data: json ?? [], error: null, loading: false });
    } catch (err: any) {
      if (!mountedRef.current) return;
      setState((prev) => ({
        ...prev,
        error: err?.message ?? "Failed to load treatment reports.",
        loading: false,
      }));
    }
  }, []);

  const measure = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = containerRef.current.offsetWidth;
    if (!trackWidth) return;

    trackWidthRef.current = trackWidth;
    containerWidthRef.current = containerWidth;

    // Start from the right edge of the container (after the title)
    const startOffset = containerWidth;
    offsetRef.current = startOffset;
    setOffset(startOffset);
    lastTimeRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener(UPDATE_EVENT, handler);
    return () => window.removeEventListener(UPDATE_EVENT, handler);
  }, [load]);

  const reports = useMemo(
    () => data.filter((item) => item?.location?.trim()),
    [data]
  );

  useEffect(() => {
    measure();
  }, [reports, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (reports.length === 0 || trackWidthRef.current === 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const step = (timestamp: number) => {
      if (!mountedRef.current) return;
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      let nextOffset = offsetRef.current - SPEED_PX_PER_SECOND * deltaSeconds;
      const trackWidth = trackWidthRef.current;
      const containerWidth = containerWidthRef.current;

      if (nextOffset <= -trackWidth) {
        nextOffset = containerWidth;
      }

      offsetRef.current = nextOffset;
      setOffset(nextOffset);

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTimeRef.current = null;
    };
  }, [reports]);

  if (loading || reports.length === 0) {
    return null;
  }

  const trackStyle = {
    transform: `translateX(${offset}px)`,
  } as CSSProperties;

  return (
    <div className="bg-red-100 text-gray-900 border-b border-red-200">
      <div
        ref={containerRef}
        className="max-w-[1400px] mx-auto py-2 overflow-hidden relative flex items-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex-shrink-0 font-bold text-sm uppercase text-red-700 px-4 z-10 bg-red-100">
          ⚠️ {t("tickerTitle")}
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div ref={trackRef} className="ticker-track" style={trackStyle}>
            {reports.map((report) => (
              <div key={report.id} className="ticker-item">
                <span className="font-semibold">⚠️ {report.location}</span>
                <span className="hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                {(report.treatmentDate || report.treatment_date) && (
                  <span className="text-sm sm:text-xs sm:uppercase text-gray-700">
                    {formatDate(report.treatmentDate || report.treatment_date || "", locale)}
                    {(report.treatmentTime || report.treatment_time) && ` ${(report.treatmentTime || report.treatment_time || "").substring(0, 5)}`}
                  </span>
                )}
                {(report.pesticideName || report.pesticide_name) && (
                  <span className="hidden md:inline text-gray-700">
                    {' '}· {report.pesticideName || report.pesticide_name}
                  </span>
                )}
                {(report.cropType || report.crop_type) && (
                  <span className="hidden lg:inline text-gray-700">
                    {' '}· {report.cropType || report.crop_type}
                  </span>
                )}
                <span className="hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                <span className="text-sm sm:text-xs sm:uppercase text-gray-700">
                  {formatRelative(report.createdAt, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {error ? (
        <div className="bg-red-500 px-6 py-2 text-xs text-red-950">
          ⚠ {error}
        </div>
      ) : null}
    </div>
  );
}

function formatRelative(value: string, locale: string = "bg") {
  const date = new Date(value);
  if (Number.isNaN(+date)) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes <= 1) {
    return locale === "en" ? "just now" : "току-що";
  }
  if (diffMinutes < 60) {
    return locale === "en" ? `${diffMinutes} min ago` : `${diffMinutes} мин`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return locale === "en" ? `${diffHours} h ago` : `${diffHours} ч`;
  }
  const diffDays = Math.round(diffHours / 24);
  return locale === "en" ? `${diffDays} d ago` : `${diffDays} д`;
}

function formatDate(dateString: string, locale: string = "bg") {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(+date)) return dateString;
    return date.toLocaleDateString(locale === "en" ? "en-US" : "bg-BG", { day: "2-digit", month: "2-digit" });
  } catch {
    return dateString;
  }
}

