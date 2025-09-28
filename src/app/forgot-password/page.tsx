"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/authClient";

export default function ForgotPasswordPage() {
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
      const message = err?.message || "Възникна грешка. Опитайте отново.";
      setError(message);
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Забравена парола</h1>
          <p className="text-sm text-gray-600">
            Въведете имейл адреса си и ще ви изпратим инструкции за задаване на нова парола.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Имейл адрес
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {status === "sent" && (
            <p className="text-sm text-emerald-600">
              Ако този имейл съществува в системата, изпратихме инструкции за смяна на паролата.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
          >
            {status === "loading" ? "Изпращане..." : "Изпрати инструкции"}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link href="/login" className="text-amber-600 hover:underline">
            Обратно към вход
          </Link>
        </div>
      </div>
    </div>
  );
}
