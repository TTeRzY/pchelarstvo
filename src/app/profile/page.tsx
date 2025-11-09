"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import ChangePasswordModal, { type ChangePasswordData } from "@/components/profile/ChangePasswordModal";
import AddApiaryModal from "@/components/map/AddApiaryModal";
import { authClient } from "@/lib/authClient";
import { userClient } from "@/lib/userClient";
import { createApiary, fetchUserApiaries, type Apiary } from "@/lib/apiaries";
import type { User } from "@/types/user";
import RoleBadge from "@/components/profile/RoleBadge";

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
  const { user, setUser } = useAuth();
  const { open } = useModal();

  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [addApiaryOpen, setAddApiaryOpen] = useState(false);
  const [userApiaries, setUserApiaries] = useState<Apiary[]>([]);
  const [apiariesLoading, setApiariesLoading] = useState(false);

  // Fetch full profile data on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await userClient.getProfile();
        setProfileData(profile);
        
        // Populate form with profile data
        setForm({
          displayName: profile.name || "",
          phone: profile.phone || "",
          region: profile.region || "",
          city: profile.city || "",
          privacy: profile.privacy || "members",
          bio: profile.bio || "",
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Fallback to basic user data
        setProfileData(user);
        setForm((prev) => ({
          ...prev,
          displayName: user.name,
        }));
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Fetch user's apiaries AFTER profile data is loaded
  useEffect(() => {
    async function loadUserApiaries() {
      // Wait for profile to be loaded first
      if (!user || !profileData || loading) {
        return;
      }

      setApiariesLoading(true);
      try {
        const apiaries = await fetchUserApiaries();
        setUserApiaries(apiaries);
      } catch (error) {
        console.error("Failed to load user apiaries:", error);
        setUserApiaries([]);
      } finally {
        setApiariesLoading(false);
      }
    }

    loadUserApiaries();
  }, [user, profileData, loading]);

  const quickSummary = useMemo(() => {
    // Use actual fetched apiaries count instead of backend count
    const apiariesCount = userApiaries.length;
    const listingsCount = profileData?.activeListingsCount ?? 0;
    const trustLevel = profileData?.trustLevel || "bronze";
    const trustLevelLabel = trustLevel === "gold" ? "Златно" : trustLevel === "silver" ? "Сребърно" : "Бронзово";

    return [
      { id: "apiaries", label: "Пчелини", value: String(apiariesCount), hint: "споделени публично" },
      { id: "listings", label: "Активни обяви", value: String(listingsCount), hint: "последни 30 дни" },
      { id: "trust", label: "Ниво на доверие", value: trustLevelLabel, hint: profileData?.verifiedAt ? "верифициран профил" : "неверифициран профил" },
    ];
  }, [profileData, userApiaries]);

  const trustValue = quickSummary.find((item) => item.id === "trust")?.value;
  const trustBadge = resolveTrustBadge(trustValue);

  function updateForm<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatedProfile = await userClient.updateProfile({
        name: form.displayName,
        phone: form.phone,
        region: form.region,
        city: form.city,
        bio: form.bio,
        privacy: form.privacy,
      });

      setProfileData(updatedProfile);
      // Update auth context if name changed
      if (setUser && updatedProfile.name !== user?.name) {
        setUser(updatedProfile);
      }

      const ts = new Date().toISOString();
      setLastSaved(ts);
      setMessage("Промените са запазени успешно.");
      setSaving(false);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setMessage("Грешка при запазване. Опитайте отново.");
      setSaving(false);
    }
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

  async function handleCreateApiary(apiary: Apiary) {
    // Note: The modal already created the apiary on the backend
    // We just need to update our local state
    setAddApiaryOpen(false);
    setMessage("Пчелинът беше добавен успешно!");
    
    // Optimistically add the apiary to the list
    setUserApiaries((prev) => [apiary, ...prev]);
    
    // Update profile data in background
    if (user) {
      try {
        const profile = await userClient.getProfile();
        setProfileData(profile);
      } catch (error) {
        console.error("Failed to reload profile data:", error);
      }
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
                  <p className="text-sm text-gray-600">
                    {profileData?.lastPasswordChange 
                      ? `Последна промяна: ${new Date(profileData.lastPasswordChange).toLocaleDateString('bg-BG')}`
                      : "Не е променяна"}
                  </p>
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
                    {profileData?.twoFactorEnabled 
                      ? "2FA е активирана. Вашият профил е допълнително защитен."
                      : "2FA е изключена. Активирайте я за допълнителна защита."}
                  </p>
                  <button 
                    className={`rounded-xl px-3 py-2 text-sm font-medium text-white ${
                      profileData?.twoFactorEnabled 
                        ? "bg-rose-500 hover:bg-rose-400" 
                        : "bg-emerald-500 hover:bg-emerald-400"
                    }`}
                    disabled
                    title="Функционалността ще бъде добавена скоро"
                  >
                    {profileData?.twoFactorEnabled ? "Деактивирай 2FA" : "Активирай 2FA"}
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
                <h1 className="text-2xl font-extrabold">
                  Здравейте, {profileData?.name || user.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {profileData?.email || user.email}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {profileData?.memberSince 
                    ? `Член от ${new Date(profileData.memberSince).getFullYear()} г.` 
                    : "Нов член"} · {userApiaries.length} регистрирани пчелина
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Виж публичния профил</button>
              <button 
                onClick={() => setAddApiaryOpen(true)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
              >
                Добави пчелин
              </button>
            </div>
          </div>
          {profileData?.role && (
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-sm text-gray-600 font-medium">Роля в системата:</span>
              <RoleBadge role={profileData.role} />
            </div>
          )}
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
                  placeholder="Вашето име"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="+359 ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Регион</label>
                <input
                  value={form.region}
                  onChange={(e) => updateForm("region", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Регион"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Населено място</label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Град/село"
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
                placeholder="Опишете вашата дейност..."
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

        {/* User's Apiaries Section */}
        <section className="rounded-2xl border shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Моите пчелини</h2>
            <button
              onClick={() => setAddApiaryOpen(true)}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + Добави нов
            </button>
          </div>

          {apiariesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Зареждане...
            </div>
          ) : userApiaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">🏺</div>
              <p className="text-sm">Все още нямате добавени пчелини</p>
              <button
                onClick={() => setAddApiaryOpen(true)}
                className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Добави първия си пчелин
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userApiaries.map((apiary) => (
                <div
                  key={apiary.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{apiary.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        {apiary.region && (
                          <span className="flex items-center gap-1">
                            <span>📍</span>
                            {apiary.region}
                            {apiary.city && `, ${apiary.city}`}
                          </span>
                        )}
                        {apiary.hiveCount && (
                          <span className="flex items-center gap-1">
                            <span>🏺</span>
                            {apiary.hiveCount} кошера
                          </span>
                        )}
                        {apiary.visibility && (
                          <span className="flex items-center gap-1">
                            <span>{apiary.visibility === "public" ? "👁️" : "🔒"}</span>
                            {apiary.visibility === "public" ? "Публичен" : "Скрит"}
                          </span>
                        )}
                      </div>
                      {apiary.flora && apiary.flora.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {apiary.flora.map((plant, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                            >
                              {plant}
                            </span>
                          ))}
                        </div>
                      )}
                      {apiary.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">{apiary.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert("Редактиране скоро ще бъде налично!");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
                        title="Редактирай"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Сигурни ли сте, че искате да изтриете пчелина "${apiary.name}"?`)) {
                            // TODO: Implement delete functionality
                            alert("Изтриване скоро ще бъде налично!");
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-900 px-2 py-1"
                        title="Изтрий"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </PageShell>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSubmit={handlePasswordSubmit}
      />

      <AddApiaryModal
        open={addApiaryOpen}
        onClose={() => setAddApiaryOpen(false)}
        onCreate={handleCreateApiary}
        defaultCoords={null}
      />
    </>
  );
}