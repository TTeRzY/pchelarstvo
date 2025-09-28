"use client";

import { useAuth } from "@/context/AuthProvider";
import { Providers } from "@/store/Providers";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  return (
    <div className="relative min-h-[60vh]">
      {loading && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-gray-800" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" aria-hidden="true" />
            <p className="text-sm font-medium">Зареждане…</p>
          </div>
        </div>
      )}
      <Providers>{children}</Providers>
    </div>
  );
}


