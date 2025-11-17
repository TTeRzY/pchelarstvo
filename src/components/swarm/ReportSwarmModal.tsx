// components/swarm/ReportSwarmModal.tsx
"use client";

import BaseReportModal, { type ReportConfig } from "@/components/reports/BaseReportModal";

const swarmConfig: ReportConfig = {
  modalType: "reportSwarm",
  title: "Съобщи за роеве",
  description:
    "Известете пчеларите за роене или необичайна активност. Добавете колкото можете повече детайли.",
  apiEndpoint: "/api/swarm-alerts",
  updateEvent: "swarm:updated",
  submitButtonText: "Изпрати сигнал",
  submitButtonClass:
    "rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60",
  fields: [
    {
      key: "name",
      label: "Вашето име",
      type: "text",
      placeholder: "Име и фамилия",
    },
    {
      key: "phone",
      label: "Телефон за контакт",
      type: "tel",
      placeholder: "088 123 4567",
    },
    {
      key: "location",
      label: "Локация",
      type: "text",
      placeholder: "Село, квартал или GPS координати",
      required: true,
      useLocation: true,
    },
    {
      key: "notes",
      label: "Допълнителна информация",
      type: "textarea",
      placeholder: "Опишете ситуацията, приблизителен размер, достъпност и др.",
      rows: 4,
    },
  ],
  transformPayload: (form) => ({
    name: form.name || null,
    phone: form.phone || null,
    location: form.location,
    notes: form.notes || null,
  }),
};

export default function ReportSwarmModal() {
  return <BaseReportModal config={swarmConfig} />;
}