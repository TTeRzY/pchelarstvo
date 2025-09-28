// components/modal/ModalProvider.tsx
"use client";
import { createContext, useContext, useCallback, useState, useEffect } from "react";

type ModalType = "login" | "register" | "forgotPassword" | "reportSwarm" | null;
type ModalCtx = {
  open: (type: Exclude<ModalType, null>) => void;
  close: () => void;
  type: ModalType;
};

const Ctx = createContext<ModalCtx | null>(null);

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<ModalType>(null);

  const open = useCallback((t: Exclude<ModalType, null>) => setType(t), []);
  const close = useCallback(() => setType(null), []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return <Ctx.Provider value={{ open, close, type }}>{children}</Ctx.Provider>;
}

export function useModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");
  return ctx;
}

