// components/swarm/ReportSwarmModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/modal/ModalProvider";

const initialState = {
  name: "",
  phone: "",
  location: "",
  notes: "",
};

type SwarmFormState = typeof initialState;
const UPDATE_EVENT = "swarm:updated";

export default function ReportSwarmModal() {
  const { type, close } = useModal();
  const [form, setForm] = useState<SwarmFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (type !== "reportSwarm") {
    return null;
  }

  function update<K extends keyof SwarmFormState>(key: K, value: SwarmFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const name = form.name.trim();
    const phone = form.phone.trim();
    const location = form.location.trim();
    const notes = form.notes.trim();

    if (!location) {
      setError("Моля, въведете локация.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: name || null,
        phone: phone || null,
        location,
        notes: notes || null,
      };

      const res = await fetch("/api/swarm-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.error ?? body?.message ?? "Неуспешно изпращане";
        throw new Error(message);
      }

      setSubmitted(true);
      window.dispatchEvent(new Event(UPDATE_EVENT));
      setTimeout(() => handleClose(), 1600);
    } catch (err: any) {
      setError(err?.message ?? "Неуспешно изпращане");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    close();
    setForm(initialState);
    setSubmitted(false);
    setError(null);
  }

  return (
    <Modal title="Съобщи за роеве">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Известете пчеларите за роене или необичайна активност. Добавете колкото можете повече детайли.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="swarm-name">Вашето име</label>
            <input
              id="swarm-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Име и фамилия"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="swarm-phone">Телефон за контакт</label>
            <input
              id="swarm-phone"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="088 123 4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="swarm-location">Локация</label>
            <input
              id="swarm-location"
              value={form.location}
              onChange={(event) => update("location", event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Село, квартал или GPS координати"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="swarm-notes">Допълнителна информация</label>
            <textarea
              id="swarm-notes"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              rows={4}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Опишете ситуацията, приблизителен размер, достъпност и др."
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {submitted ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Благодарим! Сигналът е приет и ще бъде споделен с пчеларите.
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            disabled={submitting}
          >
            Затвори
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Изпращане..." : "Изпрати сигнал"}
          </button>
        </div>
      </form>
    </Modal>
  );
}