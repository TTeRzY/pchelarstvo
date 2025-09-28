"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordData) => Promise<void> | void;
};

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export default function ChangePasswordModal({ open, onClose, onSubmit }: Props) {
  const mounted = useIsMounted();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const timer = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.currentPassword.trim()) {
      setError("Моля, въведете текущата си парола.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Новата парола трябва да бъде минимум 8 символа.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Потвърждението не съвпада с новата парола.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      const message = err?.message || "Възникна грешка. Опитайте отново.";
      setError(message);
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 id="change-password-title" className="text-lg font-semibold">Смяна на парола</h2>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100">Затвори</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="current-password">Текуща парола</label>
              <input
                id="current-password"
                ref={firstFieldRef}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.currentPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-password">Нова парола</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.newPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirm-password">Потвърди новата парола</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
            <p className="text-xs text-gray-500">
              Използвайте силна и уникална парола, която не споделяте с други сайтове.
            </p>
            {error && <div className="text-sm text-rose-600">{error}</div>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitting ? "Записване..." : "Запази новата парола"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Отказ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
