"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import AuthNav from "./AuthNav";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useAuth } from "@/context/AuthProvider";
import { canAccessAdmin } from "@/types/user";

type NavItem = {
  key: "home" | "marketplace" | "map" | "news" | "contacts" | "admin";
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "home", path: "/" },
  { key: "marketplace", path: "/marketplace" },
  { key: "map", path: "/map" },
  { key: "news", path: "/news" },
  { key: "contacts", path: "/contacts" },
];

export default function Header() {
  const t = useTranslations("header.nav");
  const { user } = useAuth();
  const showAdmin = canAccessAdmin(user);

  return (
    <header className="bg-yellow-400 shadow sticky top-0 z-50 text-black">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-6">
        <div className="font-extrabold text-lg">PCHELARSTVO.BG</div>
        <nav className="flex items-center gap-4 text-sm font-bold uppercase">
          {NAV_ITEMS.map((item) => (
            <Link key={item.key} href={item.path} className="hover:underline">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {showAdmin && (
            <Link 
              href="/admin" 
              className="hover:underline flex items-center gap-1 text-purple-700 hover:text-purple-900 text-sm font-bold uppercase"
            >
              ⚙️ {t("admin")}
            </Link>
          )}
          <LanguageSwitcher />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
