// components/auth/AuthForm.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const { close, open } = useModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        if (!email || !pass) throw new Error("Моля, попълнете имейл и парола.");
        await login(email, pass);
      } else {
        if (!name || !email || !pass) throw new Error("Моля, попълнете име, имейл и парола.");
        await register(name, email, pass);
      }
      close();
    } catch (e: any) {
      setErr(e?.message ?? "Възникна проблем. Опитайте отново.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-6">
      <p className="text-sm text-gray-600 mt-1">
        {mode === "login" ? "Влезте в профила си." : "Създайте нов акаунт."}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm mb-1" htmlFor="auth-name">Име</label>
            <input
              id="auth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Име и фамилия"
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1" htmlFor="auth-email">Имейл</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="auth-password">Парола</label>
          <input
            id="auth-password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="********"
          />
        </div>

        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => open("forgotPassword")}
              className="text-sm font-medium text-amber-600 hover:text-amber-500"
            >
              Забравена парола?
            </button>
          </div>
        )}

        {err && <div className="text-sm text-rose-600">{err}</div>}

        <div className="flex items-center gap-2">
          <button
            disabled={submitting}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? "Моля, изчакайте..." : mode === "login" ? "Вход" : "Регистрация"}
          </button>
          <button
            type="button"
            onClick={() => close()}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Затвори
          </button>
        </div>
      </div>
    </form>
  );
}
