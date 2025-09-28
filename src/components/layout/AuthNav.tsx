"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";

export default function AuthNav() {
  const { user, logout } = useAuth();
  const { open } = useModal();
  const t = useTranslations("auth");

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => open("login")}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          {t("login")}
        </button>
        <button
          onClick={() => open("register")}
          className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
        >
          {t("register")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href="/profile"
        className="flex items-center gap-2 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-white"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4 text-gray-900"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5z" />
          <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
        <span>{t("greeting", { name: user.name })}</span>
      </a>
      <button
        onClick={() => logout()}
        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
      >
        {t("logout")}
      </button>
    </div>
  );
}
