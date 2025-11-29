"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/authClient";
import { getUserErrorMessage } from "@/lib/errorUtils";

// Force dynamic rendering to prevent static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const t = useTranslations("passwordReset.resetPassword");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(emailParam);
  }, [emailParam]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await authClient.resetPassword({ email, token, password, confirmPassword: confirm });
      setStatus("success");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      // Use error utility to get user-friendly message
      setError(getUserErrorMessage(err, t("error")));
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
            <label className="block text-sm font-medium mb-1" htmlFor="email">{t("emailLabel")}</label>
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

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">{t("newPasswordLabel")}</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="********"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">{t("confirmPasswordLabel")}</label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="********"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {status === "success" && (
            <p className="text-sm text-emerald-600">{t("successMessage")}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
          >
            {status === "loading" ? t("saving") : t("saveNewPassword")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Зареждане...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
