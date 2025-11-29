"use client";

import { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/modal/ModalProvider";
import { getUserErrorMessage } from "@/lib/errorUtils";

export type ReportField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "time" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  min?: string; // For date inputs
  rows?: number; // For textarea
  groupWithNext?: boolean; // Group this field with the next one in a grid
  useLocation?: boolean; // Show "Use my location" button for this field
};

export type ReportConfig = {
  modalType: string;
  title: string;
  description: string;
  apiEndpoint: string;
  updateEvent: string;
  submitButtonText: string;
  submitButtonClass?: string;
  fields: ReportField[];
  validate?: (form: Record<string, string>) => string | null;
  transformPayload?: (form: Record<string, string>) => Record<string, unknown>;
  successMessage?: string;
};

type BaseReportModalProps = {
  config: ReportConfig;
};

export default function BaseReportModal({ config }: BaseReportModalProps) {
  const { type, close } = useModal();
  const t = useTranslations("common.reports");
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach((field) => {
      initial[field.key] = "";
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<string | null>(null); // Track which field is loading location

  if (type !== config.modalType) {
    return null;
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUseLocation(fieldKey: string) {
    if (!navigator.geolocation) {
      setError(t("geolocationNotSupported"));
      return;
    }

    setLoadingLocation(fieldKey);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 10000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeout);
            reject(err);
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
        );
      });

      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      
      // Format as "lat, lng" for the location field
      update(fieldKey, `${lat}, ${lng}`);
    } catch (err: any) {
      if (err.code === 1) {
        setError(t("locationPermissionDenied"));
      } else if (err.message === "timeout") {
        setError(t("locationTimeout"));
      } else {
        setError(t("locationFailed"));
      }
    } finally {
      setLoadingLocation(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Trim all form values
    const trimmedForm: Record<string, string> = {};
    Object.keys(form).forEach((key) => {
      trimmedForm[key] = form[key].trim();
    });

    // Custom validation
    if (config.validate) {
      const validationError = config.validate(trimmedForm);
      if (validationError) {
        setError(validationError);
        setSubmitting(false);
        return;
      }
    }

    // Default validation: check required fields
    const missingRequired = config.fields.find(
      (field) => field.required && !trimmedForm[field.key]
    );
    if (missingRequired) {
      setError(t("fieldRequired", { label: missingRequired.label }));
      setSubmitting(false);
      return;
    }

    try {
      // Transform payload if custom transformer provided
      const payload = config.transformPayload
        ? config.transformPayload(trimmedForm)
        : trimmedForm;

      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        
        // Handle Laravel validation errors (422)
        if (res.status === 422 && body.errors) {
          // Extract first error message from validation errors
          const firstError = Object.values(body.errors as Record<string, string[]>)[0]?.[0];
          const message = firstError || body.message || t("validationError");
          throw new Error(message);
        }
        
        // Handle other errors
        const message = body?.error ?? body?.message ?? t("submitFailed");
        throw new Error(message);
      }

      setSubmitted(true);
      window.dispatchEvent(new Event(config.updateEvent));
      setTimeout(() => handleClose(), 1600);
    } catch (err: any) {
      // Use error utility to get user-friendly message
      setError(getUserErrorMessage(err, t("submitFailed")));
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    close();
    const reset: Record<string, string> = {};
    config.fields.forEach((field) => {
      reset[field.key] = "";
    });
    setForm(reset);
    setSubmitted(false);
    setError(null);
  }

  function renderField(field: ReportField): ReactNode {
    const commonInputClass = "w-full rounded-xl border px-3 py-2 text-sm";
    const fieldId = `${config.modalType}-${field.key}`;

    if (field.type === "textarea") {
      return (
        <textarea
          id={fieldId}
          value={form[field.key] || ""}
          onChange={(e) => update(field.key, e.target.value)}
          rows={field.rows || 4}
          className={commonInputClass}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    }

    return (
      <input
        id={fieldId}
        type={field.type || "text"}
        value={form[field.key] || ""}
        onChange={(e) => update(field.key, e.target.value)}
        className={commonInputClass}
        placeholder={field.placeholder}
        required={field.required}
        min={field.min}
      />
    );
  }

  const submitButtonClass =
    config.submitButtonClass ||
    "rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60";

  return (
    <Modal title={config.title}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-sm text-gray-600">{config.description}</p>

        <div className="grid grid-cols-1 gap-4">
          {config.fields.map((field, index) => {
            // Skip if this field was already rendered as part of a group
            if (
              index > 0 &&
              config.fields[index - 1].groupWithNext
            ) {
              return null;
            }

            // Check if this field should be grouped with the next one
            const nextField = config.fields[index + 1];
            if (field.groupWithNext && nextField) {
              // Render grouped fields (e.g., date/time)
              return (
                <div key={field.key} className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className="block text-sm font-medium"
                        htmlFor={`${config.modalType}-${field.key}`}
                      >
                        {field.label}
                        {field.required && <span className="text-red-500"> *</span>}
                      </label>
                      {field.useLocation && (
                        <button
                          type="button"
                          onClick={() => handleUseLocation(field.key)}
                          disabled={loadingLocation === field.key}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {loadingLocation === field.key ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              <span>{t("gettingLocation")}</span>
                            </>
                          ) : (
                            <>
                              <span>📍</span>
                              <span>{t("useMyLocation")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {renderField(field)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className="block text-sm font-medium"
                        htmlFor={`${config.modalType}-${nextField.key}`}
                      >
                        {nextField.label}
                        {nextField.required && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      {nextField.useLocation && (
                        <button
                          type="button"
                          onClick={() => handleUseLocation(nextField.key)}
                          disabled={loadingLocation === nextField.key}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {loadingLocation === nextField.key ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              <span>{t("gettingLocation")}</span>
                            </>
                          ) : (
                            <>
                              <span>📍</span>
                              <span>{t("useMyLocation")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {renderField(nextField)}
                  </div>
                </div>
              );
            }

            // Render single field
            return (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-sm font-medium"
                    htmlFor={`${config.modalType}-${field.key}`}
                  >
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.useLocation && (
                    <button
                      type="button"
                      onClick={() => handleUseLocation(field.key)}
                      disabled={loadingLocation === field.key}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {loadingLocation === field.key ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>{t("gettingLocation")}</span>
                        </>
                      ) : (
                        <>
                          <span>📍</span>
                          <span>{t("useMyLocation")}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {renderField(field)}
              </div>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {submitted ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {config.successMessage || t("successMessage")}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            disabled={submitting}
          >
            {t("close")}
          </button>
          <button
            type="submit"
            className={submitButtonClass}
            disabled={submitting}
          >
            {submitting ? t("submitting") : config.submitButtonText}
          </button>
        </div>
      </form>
    </Modal>
  );
}

