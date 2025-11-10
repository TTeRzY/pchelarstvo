"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/authClient";

export default function ForgotPasswordPage() {
  const t = useTranslations("passwordReset.forgotPassword");
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
      const message = err?.message || t("error");
      setError(message);
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-gray-600">
            {t("subtitle")}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {status === "sent" && (
            <p className="text-sm text-emerald-600">
              {t("successMessage")}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
          >
            {status === "loading" ? t("sending") : t("sendInstructions")}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link href="/login" className="text-amber-600 hover:underline">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
