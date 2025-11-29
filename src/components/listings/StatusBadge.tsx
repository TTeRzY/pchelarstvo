"use client";

import type { Listing } from "@/lib/listings";

type ListingStatus = Listing["status"];

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

const statusConfig: Record<
  NonNullable<ListingStatus>,
  { label: string; className: string; icon: string }
> = {
  pending: {
    label: "В очакване",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "⏳",
  },
  approved: {
    label: "Одобрено",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✅",
  },
  active: {
    label: "Активно",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢",
  },
  completed: {
    label: "Завършено",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "✔️",
  },
  rejected: {
    label: "Отхвърлено",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "❌",
  },
  flagged: {
    label: "Сигнализирано",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🚩",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (!status) {
    return null;
  }

  const config = statusConfig[status];
  if (!config) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

