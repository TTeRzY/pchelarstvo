"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import { canAccessAdmin } from "@/types/user";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

type NavItem = {
  key: "home" | "marketplace" | "map" | "beekeepers" | "news" | "contacts" | "admin" | "treatments";
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "home", path: "/" },
  { key: "marketplace", path: "/marketplace" },
  { key: "map", path: "/map" },
  { key: "beekeepers", path: "/beekeepers" },
  { key: "treatments", path: "/treatments" },
  // 🚧 NEWS TEMPORARILY HIDDEN - Waiting for Bulgarian RSS sources
  // To re-enable: Uncomment the line below
  // { key: "news", path: "/news" },
  { key: "contacts", path: "/contacts" },
];

type MobileNavMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const t = useTranslations("header.nav");
  const tAuth = useTranslations("auth");
  const { user, logout, loading } = useAuth();
  const { open } = useModal();
  const showAdmin = canAccessAdmin(user);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu when clicking outside or on a link
  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 lg:hidden w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-yellow-400">
          <div className="font-extrabold text-lg text-black">PCHELARSTVO.BG</div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                onClick={handleLinkClick}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-900 hover:bg-yellow-50 transition-colors uppercase"
              >
                {t(item.key)}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-900 hover:bg-yellow-50 transition-colors uppercase"
              >
                ⚙️ {t("admin")}
              </Link>
            )}
          </div>
        </nav>

        {/* Footer with Auth & Language */}
        <div className="border-t px-4 py-6 space-y-4 bg-gray-50">
          {/* Language Switcher */}
          <div className="flex items-center justify-between px-4">
            <span className="text-sm font-medium text-gray-700">Language</span>
            <LanguageSwitcher />
          </div>

          {/* Auth Section */}
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-full rounded-xl border bg-gray-100 animate-pulse" />
              <div className="h-10 w-full rounded-xl border bg-gray-100 animate-pulse" />
            </div>
          ) : !user ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  open("login");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {tAuth("login")}
              </button>
              <button
                onClick={() => {
                  onClose();
                  open("register");
                }}
                className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-amber-400 transition-colors"
              >
                {tAuth("register")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-900"
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
                <span>{tAuth("greeting", { name: user.name })}</span>
              </Link>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {tAuth("logout")}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

