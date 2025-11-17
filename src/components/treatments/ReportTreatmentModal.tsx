"use client";

import { useTranslations } from "next-intl";
import BaseReportModal, { type ReportConfig } from "@/components/reports/BaseReportModal";

// Get today's date in YYYY-MM-DD format for date input
const today = new Date().toISOString().split("T")[0];

export default function ReportTreatmentModal() {
  const t = useTranslations("treatments.modal");

  const treatmentConfig: ReportConfig = {
    modalType: "reportTreatment",
    title: t("title"),
    description: t("description"),
    apiEndpoint: "/api/treatment-reports",
    updateEvent: "treatment:updated",
    submitButtonText: t("submitButton"),
    submitButtonClass:
      "rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60",
    fields: [
      {
        key: "name",
        label: t("nameLabel"),
        type: "text",
        placeholder: t("namePlaceholder"),
      },
      {
        key: "phone",
        label: t("phoneLabel"),
        type: "tel",
        placeholder: t("phonePlaceholder"),
      },
      {
        key: "location",
        label: t("locationLabel"),
        type: "text",
        placeholder: t("locationPlaceholder"),
        required: true,
        useLocation: true,
      },
      {
        key: "treatmentDate",
        label: t("treatmentDateLabel"),
        type: "date",
        min: today,
        groupWithNext: true,
      },
      {
        key: "treatmentTime",
        label: t("treatmentTimeLabel"),
        type: "time",
      },
      {
        key: "pesticideName",
        label: t("pesticideLabel"),
        type: "text",
        placeholder: t("pesticidePlaceholder"),
      },
      {
        key: "cropType",
        label: t("cropLabel"),
        type: "text",
        placeholder: t("cropPlaceholder"),
      },
      {
        key: "notes",
        label: t("notesLabel"),
        type: "textarea",
        placeholder: t("notesPlaceholder"),
        rows: 4,
      },
    ],
    transformPayload: (form) => ({
      reporter_name: form.name || null,
      reporter_phone: form.phone || null,
      location: form.location,
      treatment_date: form.treatmentDate || null,
      treatment_time: form.treatmentTime || null,
      pesticide_name: form.pesticideName || null,
      crop_type: form.cropType || null,
      notes: form.notes || null,
    }),
  };

  return <BaseReportModal config={treatmentConfig} />;
}

