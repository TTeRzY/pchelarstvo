// components/auth/ForgotPasswordForm.tsx
"use client";
import { useState } from "react";
import { authClient } from "@/lib/authClient";
import { useModal } from "@/components/modal/ModalProvider";

export default function ForgotPasswordForm() {
  const { open } = useModal();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await authClient.requestPasswordReset(email);
      setStatus("sent");
    } catch (err: any) {
      const message = err?.message || "Възникна проблем. Опитайте отново.";
      setError(message);
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-sm text-gray-600">
        Попълнете имейла си и ще ви изпратим инструкции за промяна на паролата.
      </p>
      <div>
        <label className="block text-sm mb-1" htmlFor="forgot-email">Имейл</label>
        <input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="you@example.com"
        />
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      {status === "sent" && (
        <div className="text-sm text-emerald-600">
          Ако имаме този имейл, ще получите съобщение с връзка за промяна на паролата.
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
        >
          {status === "loading" ? "Изпращане..." : "Изпрати"}
        </button>
        <button
          type="button"
          onClick={() => open("login")}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Назад към вход
        </button>
      </div>
    </form>
  );
}
