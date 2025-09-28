// components/swarm/SwarmTicker.tsx
"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const REFRESH_INTERVAL = 60_000;
const UPDATE_EVENT = "swarm:updated";
const SPEED_PX_PER_SECOND = 80;

export type SwarmAlert = {
  id: string;
  location: string;
  createdAt: string;
  status?: string;
  notes?: string;
};

type FetchState = {
  data: SwarmAlert[];
  error: string | null;
  loading: boolean;
};

export default function SwarmTicker() {
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
      const res = await fetch("/api/swarm-alerts", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as SwarmAlert[];
      if (!mountedRef.current) return;
      setState({ data: json ?? [], error: null, loading: false });
    } catch (err: any) {
      if (!mountedRef.current) return;
      setState((prev) => ({
        ...prev,
        error: err?.message ?? "Failed to load swarm alerts.",
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

  const alerts = useMemo(
    () => data.filter((item) => item?.location?.trim()),
    [data]
  );

  useEffect(() => {
    measure();
  }, [alerts, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (alerts.length === 0 || trackWidthRef.current === 0) {
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
  }, [alerts]);

  if (loading || alerts.length === 0) {
    return null;
  }

  const trackStyle = {
    transform: `translateX(${offset}px)`,
  } as CSSProperties;

  return (
    <div className="bg-amber-200 text-gray-900 border-b border-amber-300">
      <div
        ref={containerRef}
        className="max-w-[1400px] mx-auto px-6 py-2 overflow-hidden relative"
        role="status"
        aria-live="polite"
      >
        <div ref={trackRef} className="ticker-track" style={trackStyle}>
          {alerts.map((alert) => (
            <div key={alert.id} className="ticker-item">
              <span className="font-semibold">{alert.location}</span>
              <span className="hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-sm sm:text-xs sm:uppercase text-gray-700">
                {formatRelative(alert.createdAt)}
              </span>
              {alert.notes ? (
                <span className="hidden sm:inline text-gray-700">
                  {' '}· {alert.notes}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {error ? (
        <div className="bg-amber-500 px-6 py-2 text-xs text-amber-950">
          ⚠ {error}
        </div>
      ) : null}
    </div>
  );
}

function formatRelative(value: string) {
  const date = new Date(value);
  if (Number.isNaN(+date)) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes <= 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
}