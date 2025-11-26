"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AuthNav from "./AuthNav";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import MobileNavMenu from "./MobileNavMenu";
import { useAuth } from "@/context/AuthProvider";
import { canAccessAdmin } from "@/types/user";

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

export default function Header() {
  const t = useTranslations("header.nav");
  const { user } = useAuth();
  const showAdmin = canAccessAdmin(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-yellow-400 shadow sticky top-0 z-50 text-black">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-6">
          {/* Logo */}
          <Link href="/" className="font-extrabold text-lg hover:opacity-80 transition-opacity">
            PCHELARSTVO.BG
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-bold uppercase">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.path} className="hover:underline">
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3">
            {showAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1 text-sm font-bold uppercase hover:underline"
              >
                ⚙️ {t("admin")}
              </Link>
            )}
            <LanguageSwitcher />
            <AuthNav />
          </div>

          {/* Mobile Burger Menu Button - Visible only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-black/10 transition-colors"
            aria-label="Open menu"
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
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
