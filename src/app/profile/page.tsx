"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import ChangePasswordModal, { type ChangePasswordData } from "@/components/profile/ChangePasswordModal";
import { authClient } from "@/lib/authClient";

const quickTips = [
  "Преглеждайте профилните си данни в началото на всеки сезон.",
  "Добавяйте координати на пчелините само след проверка на място.",
  "Кратко представяне и ясно ниво на доверие улесняват партньорите.",
];

type ProfileFormState = {
  displayName: string;
  phone: string;
  region: string;
  city: string;
  privacy: "public" | "members" | "private";
  bio: string;
};

const initialState: ProfileFormState = {
  displayName: "",
  phone: "",
  region: "",
  city: "",
  privacy: "members",
  bio: "",
};

const TRUST_BADGES = {
  bronze: { src: "/bronze-level.png", label: "Бронзово ниво" },
  silver: { src: "/silver-level.png", label: "Сребърно ниво" },
  gold: { src: "/gold-level.png", label: "Златно ниво" },
} as const;

type TrustBadgeKey = keyof typeof TRUST_BADGES;

function resolveTrustBadge(value?: string): (typeof TRUST_BADGES)[TrustBadgeKey] {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("злат") || normalized.includes("gold")) return TRUST_BADGES.gold;
  if (normalized.includes("среб") || normalized.includes("silver")) return TRUST_BADGES.silver;
  return TRUST_BADGES.bronze;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(+d)) return value;
  return d.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { open } = useModal();

  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      displayName: prev.displayName || user.name,
      bio:
        prev.bio ||
        "Пчелар от 2015 г., специализиран в производство на акациев и липов мед.",
    }));
  }, [user]);

  const quickSummary = useMemo(
    () => [
      { id: "apiaries", label: "Пчелини", value: "5", hint: "споделени публично" },
      { id: "listings", label: "Активни обяви", value: "2", hint: "последни 30 дни" },
      { id: "trust", label: "Ниво на доверие", value: "Златно", hint: "верифициран профил" },
    ],
    []
  );

  const trustValue = quickSummary.find((item) => item.id === "trust")?.value;
  const trustBadge = resolveTrustBadge(trustValue);

  function updateForm<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setTimeout(() => {
      setSaving(false);
      const ts = new Date().toISOString();
      setLastSaved(ts);
      setMessage("Промените са записани локално. Интеграция с API предстои.");
    }, 700);
  }

  async function handlePasswordSubmit(data: ChangePasswordData) {
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      await authClient.changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      setPasswordMessage("Паролата беше обновена успешно.");
    } catch (err: any) {
      const raw = err?.message ?? "Възникна грешка. Опитайте отново.";
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.message) {
          setPasswordError(parsed.message);
          return;
        }
        if (parsed?.errors) {
          const first = Object.values(parsed.errors)[0] as string[] | undefined;
          if (first?.[0]) {
            setPasswordError(first[0]);
            return;
          }
        }
      } catch {
        // ignore JSON parse errors
      }
      setPasswordError(raw || "Възникна грешка. Опитайте отново.");
    }
  }

  if (!user) {
    return (
      <PageShell>
        <section className="rounded-2xl border shadow-sm bg-white p-10 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Необходим е вход</h1>
          <p className="text-sm text-gray-600">
            Впишете се, за да видите и редактирате информацията в профила си.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => open("login")}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
            >
              Вход
            </button>
            <button
              onClick={() => open("register")}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Създай профил
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <>
      <PageShell
        left={
          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border shadow-sm bg-white p-5">
              <h2 className="text-lg font-semibold">Бързи съвети</h2>
              <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-gray-700">
                {quickTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border shadow-sm bg-white p-5">
              <h2 className="text-lg font-semibold">Нужда от помощ?</h2>
              <p className="text-sm text-gray-600">
                Пишете ни на support@pchelarstvo.bg или позвънете на +359 88 123 4567, ако имате нужда от съдействие.
              </p>
            </section>
          </aside>
        }
        right={
          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border p-5 bg-white shadow-sm space-y-3">
              <h2 className="text-lg font-semibold">Сигурност</h2>
              <div className="space-y-3">
                <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                  <h3 className="font-semibold">Парола</h3>
                  <p className="text-sm text-gray-600">Последна промяна: 12.08.2025 г.</p>
                  <button
                    onClick={() => setChangePasswordOpen(true)}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Смени паролата
                  </button>
                  {passwordMessage && <p className="text-xs text-emerald-600">{passwordMessage}</p>}
                  {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
                </div>
                <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                  <h3 className="font-semibold">Двуфакторна защита</h3>
                  <p className="text-sm text-gray-600">
                    2FA е изключена. Активирайте я за допълнителна защита.
                  </p>
                  <button className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400">
                    Активирай 2FA
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Пълен списък с активни сесии и управление на устройства планираме за версия 2.
                </p>
              </div>
            </section>
          </aside>
        }
      >
        <section className="rounded-2xl border shadow-sm bg-white p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={trustBadge.src}
                  alt={trustBadge.label}
                  className="h-28 w-28 object-contain"
                />
                <span className="text-xs font-semibold uppercase text-gray-600 tracking-wide">
                  {trustBadge.label}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Здравейте, {user.name}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600 mt-1">Член от 2020 г. · 5 регистрирани пчелина</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Виж публичния профил</button>
              <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400">
                Добави пчелин
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickSummary.map((item) => (
              <div key={item.id} className="rounded-2xl border bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                <div className="text-2xl font-bold mt-1">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.hint}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border shadow-sm bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Данни за профила</h2>
              {lastSaved && (
                <span className="text-xs text-gray-500">Последно записване: {formatDate(lastSaved)}</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1">Име за показване</label>
                <input
                  value={form.displayName}
                  onChange={(e) => updateForm("displayName", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Антон Терзийски"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="+359 88 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Регион</label>
                <input
                  value={form.region}
                  onChange={(e) => updateForm("region", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Югозападен"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Населено място</label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Самоков"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Кратко представяне</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateForm("bio", e.target.value)}
                rows={4}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Разкажете накратко за себе си..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Видимост</label>
              <select
                value={form.privacy}
                onChange={(e) => updateForm("privacy", e.target.value as ProfileFormState["privacy"])}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="public">Публичен</option>
                <option value="members">Само за членове</option>
                <option value="private">Само аз</option>
              </select>
            </div>
            {message && <div className="text-sm text-emerald-600">{message}</div>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Записване..." : "Запази промените"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(initialState);
                  setMessage(null);
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Нулирай
              </button>
            </div>
          </form>
        </section>
      </PageShell>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
}