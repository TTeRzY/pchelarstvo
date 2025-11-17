"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useModal } from "@/components/modal/ModalProvider";
import type { TreatmentReport } from "@/components/treatments/TreatmentTicker";
import dynamic from "next/dynamic";
const ApiariesMapClient = dynamic(() => import("@/components/map/ApiariesMap"), { ssr: false });

export default function TreatmentsPage() {
  const { open } = useModal();
  const t = useTranslations("treatments");
  const locale = useLocale() as "bg" | "en";
  const [reports, setReports] = useState<TreatmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 60_000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => loadReports();
    window.addEventListener("treatment:updated", handler);
    return () => window.removeEventListener("treatment:updated", handler);
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/treatment-reports", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setReports(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Filter by date
    const now = new Date();
    if (filter === "upcoming") {
      filtered = filtered.filter((r) => {
        const date = r.treatmentDate || (r as any).treatment_date;
        if (!date) return false;
        const treatmentDate = new Date(date);
        return treatmentDate >= now;
      });
    } else if (filter === "past") {
      filtered = filtered.filter((r) => {
        const date = r.treatmentDate || (r as any).treatment_date;
        if (!date) return false;
        const treatmentDate = new Date(date);
        return treatmentDate < now;
      });
    }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.location?.toLowerCase().includes(query) ||
            (r.pesticideName || (r as any).pesticide_name)?.toLowerCase().includes(query) ||
            (r.cropType || (r as any).crop_type)?.toLowerCase().includes(query) ||
            r.notes?.toLowerCase().includes(query)
        );
      }

    // Sort by treatment date (upcoming first) or created date
    filtered.sort((a, b) => {
      const dateA = a.treatmentDate || (a as any).treatment_date;
      const dateB = b.treatmentDate || (b as any).treatment_date;
      if (dateA && dateB) {
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [reports, filter, searchQuery]);

  // Extract locations for map (simplified - would need geocoding in real implementation)
  const mapPins = useMemo(() => {
    // For now, we'll just show a placeholder
    // In a real implementation, you'd geocode the location strings to get lat/lng
    return filteredReports
      .filter((r) => r.location)
      .slice(0, 50) // Limit to 50 for performance
      .map((r, idx) => ({
        id: r.id,
        lat: 42.75 + (Math.random() - 0.5) * 0.5, // Placeholder - would use geocoded coords
        lng: 25.0 + (Math.random() - 0.5) * 0.5,
        label: `${r.location}${(r.treatmentDate || (r as any).treatment_date) ? ` - ${r.treatmentDate || (r as any).treatment_date}` : ""}${(r.pesticideName || (r as any).pesticide_name) ? ` (${r.pesticideName || (r as any).pesticide_name})` : ""}`,
        type: "treatment" as const,
      }));
  }, [filteredReports]);

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">{t("loading")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() => open("reportTreatment")}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            ⚠️ {t("reportTreatment")}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 ${
                filter === "all" ? "bg-gray-100" : ""
              }`}
            >
              {t("filterAll")}
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 ${
                filter === "upcoming" ? "bg-gray-100" : ""
              }`}
            >
              {t("filterUpcoming")}
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 ${
                filter === "past" ? "bg-gray-100" : ""
              }`}
            >
              {t("filterPast")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠ {error}
          </div>
        )}

        {/* Map View */}
        {filteredReports.length > 0 && (
          <div className="mb-8 rounded-2xl border shadow-sm overflow-hidden">
            <ApiariesMapClient
              pins={mapPins}
              heightClass="h-96"
              scrollWheelZoom={true}
            />
          </div>
        )}

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("noResults")}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filter !== "all"
                ? t("noResultsFiltered")
                : t("noResultsEmpty")}
            </p>
            <button
              onClick={() => open("reportTreatment")}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              {t("beFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.location}</h3>
                    {(report.treatmentDate || (report as any).treatment_date) && (
                      <div className="text-sm text-gray-600 mt-1">
                        📅 {formatDate(report.treatmentDate || (report as any).treatment_date || "", locale)}
                        {(report.treatmentTime || (report as any).treatment_time) && (locale === "en" ? ` at ${(report.treatmentTime || (report as any).treatment_time || "").substring(0, 5)}` : ` в ${(report.treatmentTime || (report as any).treatment_time || "").substring(0, 5)}`)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                    ⚠️ {t("treatmentBadge")}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {(report.pesticideName || (report as any).pesticide_name) && (
                    <div>
                      <span className="text-gray-500">{t("pesticide")}</span>{" "}
                      <span className="font-medium">{report.pesticideName || (report as any).pesticide_name}</span>
                    </div>
                  )}
                  {(report.cropType || (report as any).crop_type) && (
                    <div>
                      <span className="text-gray-500">{t("crop")}</span>{" "}
                      <span className="font-medium">{report.cropType || (report as any).crop_type}</span>
                    </div>
                  )}
                  {(report as any).reporter_name && (
                    <div>
                      <span className="text-gray-500">{t("reportedBy")}</span> {(report as any).reporter_name}
                    </div>
                  )}
                  {report.notes && (
                    <div className="text-gray-700 mt-2 pt-2 border-t">
                      {report.notes}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {t("published")} {formatRelative(report.createdAt, locale)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {reports.length > 0 && (
          <div className="mt-8 rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">{t("statistics")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                <div className="text-sm text-gray-600">{t("totalReports")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {reports.filter((r) => {
                    const date = r.treatmentDate || (r as any).treatment_date;
                    if (!date) return false;
                    return new Date(date) >= new Date();
                  }).length}
                </div>
                <div className="text-sm text-gray-600">{t("upcomingReports")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {reports.filter((r) => {
                    const date = r.treatmentDate || (r as any).treatment_date;
                    if (!date) return false;
                    return new Date(date) < new Date();
                  }).length}
                </div>
                <div className="text-sm text-gray-600">{t("pastReports")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {new Set(reports.map((r) => r.location).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">{t("locations")}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string, locale: string = "bg") {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(+date)) return dateString;
    return date.toLocaleDateString(locale === "en" ? "en-US" : "bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
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
    return locale === "en" ? `${diffMinutes} min ago` : `преди ${diffMinutes} мин`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return locale === "en" ? `${diffHours} h ago` : `преди ${diffHours} ч`;
  }
  const diffDays = Math.round(diffHours / 24);
  return locale === "en" ? `${diffDays} d ago` : `преди ${diffDays} д`;
}

